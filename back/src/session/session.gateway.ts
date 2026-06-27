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
import { SessionMode } from "@prisma/client";
import { C2S_EVENTS, S2C_EVENTS } from "@nkg-quiz/shared-socket-types";
import { SessionService } from "./session.service";

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
    @MessageBody() body: { code: string; playerId?: number },
    @ConnectedSocket() client: Socket,
  ) {
    if (!body?.code) throw new WsException("Missing session code");

    for (const room of client.rooms) {
      if (room.startsWith("session:")) client.leave(room);
    }

    try {
      const { state } = await this.sessionService.getState(body.code);
      client.join(this.room(body.code));

      const playerAnswers = body.playerId
        ? await this.sessionService.getPlayerAnswers(body.code, body.playerId)
        : {};

      const extras: Record<string, unknown> = { playerAnswers };

      if (state.mode === SessionMode.AUTONOMOUS && state.status === "RUNNING") {
        extras.quiz = await this.sessionService.getQuiz(body.code);
      }

      client.emit(S2C_EVENTS.SESSION_JOINED, { ...state, ...extras });
    } catch {
      client.emit(S2C_EVENTS.SESSION_NOT_FOUND);
    }

    return { ok: true };
  }

  // ─── Player events ────────────────────────────────────────────────────────────

  @SubscribeMessage(C2S_EVENTS.PLAYER_ANSWER)
  async answer(
    @MessageBody()
    body: { code: string; playerId: number; questionId: number; choiceId: number },
  ) {
    if (!body?.code || !body?.playerId) throw new WsException("Missing required fields");
    const result = await this.sessionService.submitAnswer(body);
    this.server
      .to(this.room(body.code))
      .emit(S2C_EVENTS.ANSWER_RECEIVED, { playerId: body.playerId });
    return result;
  }

  @SubscribeMessage(C2S_EVENTS.PLAYER_COMPLETE)
  async playerComplete(
    @MessageBody() body: { code: string; playerId: number },
  ) {
    if (!body?.code || !body?.playerId) throw new WsException("Missing required fields");
    return this.sessionService.playerComplete(body.code, body.playerId);
  }

  // ─── Screen events ────────────────────────────────────────────────────────────

  @SubscribeMessage(C2S_EVENTS.SCREEN_ADVANCE)
  async screenAdvance(@MessageBody() body: { code: string }) {
    await this.requireMode(body.code, SessionMode.SCREEN);
    return this.sessionService.nextQuestion(body.code);
  }

  @SubscribeMessage(C2S_EVENTS.SCREEN_REVEAL)
  async screenReveal(@MessageBody() body: { code: string }) {
    await this.requireMode(body.code, SessionMode.SCREEN);
    return this.sessionService.revealAnswer(body.code);
  }

  @SubscribeMessage(C2S_EVENTS.SCREEN_END)
  async screenEnd(@MessageBody() body: { code: string }) {
    await this.requireMode(body.code, SessionMode.SCREEN);
    return this.sessionService.endSession(body.code);
  }

  // ─── Admin events ─────────────────────────────────────────────────────────────

  @SubscribeMessage(C2S_EVENTS.ADMIN_ADVANCE)
  async adminAdvance(@MessageBody() body: { code: string }) {
    await this.requireMode(body.code, SessionMode.ADMIN);
    return this.sessionService.nextQuestion(body.code);
  }

  @SubscribeMessage(C2S_EVENTS.ADMIN_REVEAL)
  async adminReveal(@MessageBody() body: { code: string }) {
    await this.requireMode(body.code, SessionMode.ADMIN);
    return this.sessionService.revealAnswer(body.code);
  }

  @SubscribeMessage(C2S_EVENTS.ADMIN_END)
  async adminEnd(@MessageBody() body: { code: string }) {
    await this.requireMode(body.code, SessionMode.ADMIN);
    return this.sessionService.endSession(body.code);
  }

  // ─── Broadcast helper ─────────────────────────────────────────────────────────

  broadcast(code: string, event: string, data: unknown): void {
    this.server?.to(this.room(code)).emit(event, data);
  }

  // ─── Private helpers ──────────────────────────────────────────────────────────

  private async requireMode(code: string, mode: SessionMode): Promise<void> {
    const { state } = await this.sessionService.getState(code);
    if (state.mode !== mode) {
      throw new WsException(`This action requires ${mode} mode`);
    }
  }

  private room(code: string): string {
    return `session:${code}`;
  }
}
