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

    client.join(this.room(body.code));
    const state = await this.sessionService.getState(body.code);
    client.emit("session:state", state);

    return { ok: true };
  }

  @SubscribeMessage("host:start")
  async start(@MessageBody() body: { code: string }) {
    const result = await this.sessionService.startSession(body.code);
    this.server.to(this.room(body.code)).emit("session:state", result.state);
    this.server.to(this.room(body.code)).emit("question:show", result.question);
    return { ok: true };
  }

  @SubscribeMessage("host:next")
  async next(@MessageBody() body: { code: string }) {
    const result = await this.sessionService.nextQuestion(body.code);
    this.server.to(this.room(body.code)).emit("session:state", result.state);

    if (result.question) {
      this.server
        .to(this.room(body.code))
        .emit("question:show", result.question);
    } else {
      this.server.to(this.room(body.code)).emit("session:end", result.state);
    }

    return { ok: true };
  }

  @SubscribeMessage("host:reveal")
  async reveal(@MessageBody() body: { code: string }) {
    const result = await this.sessionService.revealAnswer(body.code);
    this.server.to(this.room(body.code)).emit("session:state", result.state);
    this.server.to(this.room(body.code)).emit("answer:reveal", { ok: true });
    return { ok: true };
  }

  @SubscribeMessage("host:end")
  async end(@MessageBody() body: { code: string }) {
    const result = await this.sessionService.endSession(body.code);
    this.server.to(this.room(body.code)).emit("session:end", result.state);
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

  broadcast(code: string, event: string, data: any) {
    this.server?.to(this.room(code)).emit(event, data);
  }

  private room(code: string) {
    return `session:${code}`;
  }
}
