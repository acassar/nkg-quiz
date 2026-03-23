import {
  ConnectedSocket,
  MessageBody,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
  WsException,
} from "@nestjs/websockets";
import { forwardRef, Inject, NotFoundException } from "@nestjs/common";
import { Server, Socket } from "socket.io";
import { SessionService } from "./session.service";
import { SessionState } from "./state-store";
import { Prisma } from "@prisma/client";
import {
  C2S_EVENTS,
  S2C_EVENTS,
  ClientToServerEventPayloads,
} from "@nkg-quiz/shared-socket-types";

@WebSocketGateway({ cors: { origin: true, credentials: true } })
export class SessionGateway {
  @WebSocketServer()
  server!: Server;

  constructor(
    @Inject(forwardRef(() => SessionService))
    private readonly sessionService: SessionService,
  ) {}

  @SubscribeMessage(C2S_EVENTS.JOIN_SESSION)
  async joinSession(
    @MessageBody() body: ClientToServerEventPayloads[typeof C2S_EVENTS.JOIN_SESSION],
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

    try {
      const { state } = await this.sessionService.getState(body.code);
      if (state) {
        client.join(this.room(body.code));
        client.emit(S2C_EVENTS.SESSION_JOINED, state);
      } else throw new NotFoundException("Session not found");
    } catch (error) {
      if (error instanceof NotFoundException) client.emit(S2C_EVENTS.SESSION_NOT_FOUND);
      else throw new WsException("Internal server error");
    }

    return { ok: true };
  }

  @SubscribeMessage(C2S_EVENTS.SCREEN_UPDATE_STATE)
  async updateState(
    @MessageBody() body: { code: string; state: SessionState },
  ) {
    if (!body?.code || !body?.state) {
      throw new WsException("Missing session code or state");
    }

    // Diffuser le nouvel état à tous les clients connectés
    this.server.to(this.room(body.code)).emit(S2C_EVENTS.SESSION_STATE, body.state);

    return { ok: true };
  }

  @SubscribeMessage(C2S_EVENTS.SCREEN_SHOW_QUESTION)
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
    this.server.to(this.room(body.code)).emit(S2C_EVENTS.QUESTION_SHOW, body.question);

    return { ok: true };
  }

  @SubscribeMessage(C2S_EVENTS.SCREEN_REVEAL_ANSWER)
  async revealAnswer(
    @MessageBody() body: ClientToServerEventPayloads[typeof C2S_EVENTS.SCREEN_REVEAL_ANSWER],
  ) {
    if (!body?.code) {
      throw new WsException("Missing session code");
    }

    // Diffuser la révélation de la réponse
    this.server.to(this.room(body.code)).emit(S2C_EVENTS.ANSWER_REVEAL, { ok: true });

    return { ok: true };
  }

  @SubscribeMessage(C2S_EVENTS.SCREEN_END_SESSION)
  async endSession(
    @MessageBody() body: { code: string; finalState?: SessionState },
  ) {
    if (!body?.code) {
      throw new WsException("Missing session code");
    }

    // Diffuser la fin de session
    this.server
      .to(this.room(body.code))
      .emit(S2C_EVENTS.SESSION_END, body.finalState || {});

    return { ok: true };
  }

  @SubscribeMessage(C2S_EVENTS.PLAYER_ANSWER)
  async answer(
    @MessageBody()
    body: ClientToServerEventPayloads[typeof C2S_EVENTS.PLAYER_ANSWER],
  ) {
    const result = await this.sessionService.submitAnswer(body);
    this.server
      .to(this.room(body.code))
      .emit(S2C_EVENTS.ANSWER_RECEIVED, { playerId: body.playerId });
    return result;
  }

  broadcast(code: string, event: string, data: unknown) {
    this.server?.to(this.room(code)).emit(event, data);
  }

  private room(code: string) {
    return `session:${code}`;
  }
}
