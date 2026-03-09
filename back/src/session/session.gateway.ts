import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { forwardRef, Inject } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { SessionService } from "./session.service";
import { SessionState } from "./state-store";
import { Prisma } from "@prisma/client";

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class SessionGateway {
  @WebSocketServer()
  server!: Server;

  constructor(
    @Inject(forwardRef(() => SessionService))
    private readonly sessionService: SessionService,
  ) {}

  @SubscribeMessage("join-session")
  async joinSession(
    @MessageBody() body: { code: string },
    @ConnectedSocket() client: Socket,
  ) {
    if (!body?.code) {
      throw new WsException("Missing session code");
    }

    // Quitter toutes les rooms existantes de session
    const rooms = Array.from(client.rooms);
    rooms.forEach((room) => {
      if (room.startsWith("session:")) {
        client.leave(room);
      }
    });

    client.join(this.room(body.code));
    const { state } = await this.sessionService.getState(body.code);
    if (state) {
      client.emit("session:state", state);
      client.emit("session:joined");
    } else {
      client.emit("session:not-found");
    }

    return { ok: true };
  }

  @SubscribeMessage("screen:update-state")
  async updateState(
    @MessageBody() body: { code: string; state: SessionState },
  ) {
    if (!body?.code || !body?.state) {
      throw new WsException("Missing session code or state");
    }

    // Diffuser le nouvel état à tous les clients connectés
    this.server.to(this.room(body.code)).emit("session:state", body.state);

    return { ok: true };
  }

  @SubscribeMessage("screen:show-question")
  async showQuestion(
    @MessageBody()
    body: {
      code: string;
      question: Prisma.QuestionGetPayload<{ include: { choices: true } }>;
    },
  ) {
    if (!body?.code || !body?.question) {
      throw new WsException("Missing session code or question");
    }

    // Diffuser la nouvelle question à tous les clients
    this.server.to(this.room(body.code)).emit("question:show", body.question);

    return { ok: true };
  }

  @SubscribeMessage("screen:reveal-answer")
  async revealAnswer(@MessageBody() body: { code: string }) {
    if (!body?.code) {
      throw new WsException("Missing session code");
    }

    // Diffuser la révélation de la réponse
    this.server.to(this.room(body.code)).emit("answer:reveal", { ok: true });

    return { ok: true };
  }

  @SubscribeMessage("screen:end-session")
  async endSession(
    @MessageBody() body: { code: string; finalState?: SessionState },
  ) {
    if (!body?.code) {
      throw new WsException("Missing session code");
    }

    // Diffuser la fin de session
    this.server
      .to(this.room(body.code))
      .emit("session:end", body.finalState || {});

    return { ok: true };
  }

  @SubscribeMessage("player:answer")
  async answer(
    @MessageBody()
    body: {
      code: string;
      playerId: number;
      questionId: number;
      choiceId: number;
    },
  ) {
    const result = await this.sessionService.submitAnswer(body);
    this.server
      .to(this.room(body.code))
      .emit("answer:received", { playerId: body.playerId });
    return result;
  }

  broadcast(code: string, event: string, data: unknown) {
    this.server?.to(this.room(code)).emit(event, data);
  }

  private room(code: string) {
    return `session:${code}`;
  }
}
