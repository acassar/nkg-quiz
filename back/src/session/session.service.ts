import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
} from "@nestjs/common";
import { SessionMode, SessionStatus } from "@prisma/client";
import { S2C_EVENTS } from "@nkg-quiz/shared-socket-types";
import { CreateSessionDto } from "./dto/create-session.dto";
import { JoinSessionDto } from "./dto/join-session.dto";
import { AutonomousModeHandler } from "./handlers/autonomous.handler";
import { SessionModeHandler } from "./handlers/session-mode.handler";
import { SynchronizedModeHandler } from "./handlers/synchronized.handler";
import { SessionCrudService } from "./services/session-crud.service";
import { SessionStatsService } from "./services/session-stats.service";
import { SessionTimerService } from "./services/session-timer.service";
import { FlowResult, NextTimerAction } from "./session.types";
import { SessionStateStore } from "./state-store";
import { SessionGateway } from "./session.gateway";

@Injectable()
export class SessionService {
  private readonly handlers: Record<SessionMode, SessionModeHandler>;

  constructor(
    private readonly crud: SessionCrudService,
    private readonly stats: SessionStatsService,
    private readonly stateStore: SessionStateStore,
    private readonly timer: SessionTimerService,
    synchronized: SynchronizedModeHandler,
    autonomous: AutonomousModeHandler,
    @Inject(forwardRef(() => SessionGateway))
    private readonly gateway: SessionGateway,
  ) {
    this.handlers = {
      [SessionMode.SCREEN]: synchronized,
      [SessionMode.ADMIN]: synchronized,
      [SessionMode.BACK]: synchronized,
      [SessionMode.AUTONOMOUS]: autonomous,
    };
  }

  // ─── Session lifecycle ────────────────────────────────────────────────────────

  async createSession(dto: CreateSessionDto) {
    if (await this.crud.hasActiveSession(dto.quizId)) {
      throw new BadRequestException("An active session already exists for this quiz");
    }
    await this.crud.validateQuizForSession(dto.quizId);

    const options = {
      mode: dto.options?.mode ?? (await this.crud.getDefaultMode(dto.quizId)),
      ...dto.options,
    };
    const session = await this.crud.createWithCode(dto.quizId, options);

    const state = await this.stateStore.set({
      code: session.code,
      status: session.status,
      mode: options.mode,
      currentQuestionIndex: null,
      nextActionAt: null,
      updatedAt: new Date().toISOString(),
    });

    return { session, state };
  }

  async joinSession(code: string, dto: JoinSessionDto) {
    const session = await this.crud.findByCodeOrThrow(code);
    return this.crud.findOrCreatePlayer(session.id, dto);
  }

  async getState(code: string) {
    const cached = await this.stateStore.get(code);
    if (cached) return { state: cached };

    const session = await this.crud.findByCodeWithOptions(code);
    const state = await this.stateStore.set({
      code: session.code,
      status: session.status,
      mode: session.options?.mode ?? SessionMode.SCREEN,
      currentQuestionIndex: null,
      nextActionAt: null,
      updatedAt: new Date().toISOString(),
    });
    return { state };
  }

  async getOptions(code: string) {
    const session = await this.crud.findByCodeWithOptions(code);
    return { options: session.options };
  }

  async getQuiz(code: string) {
    const session = await this.crud.findByCodeOrThrow(code);
    return this.crud.getFullQuizForPlayer(session.quizId);
  }

  async userActiveSessions(userId: number) {
    return this.crud.getActiveSessionsByUser(userId);
  }

  async archiveSession(code: string) {
    const session = await this.crud.findByCodeOrThrow(code);
    if (session.status === SessionStatus.ARCHIVED) {
      throw new BadRequestException("Session already archived");
    }
    return this.crud.archiveSession(session.id);
  }

  // ─── Session flow ─────────────────────────────────────────────────────────────

  async startSession(code: string) {
    const { state } = await this.run(code, (h) => h.start(code));
    return { state };
  }

  async revealAnswer(code: string) {
    const { state } = await this.run(code, (h) => h.reveal(code));
    return { state };
  }

  async nextQuestion(code: string) {
    const { state } = await this.run(code, (h) => h.advance(code));
    return { state };
  }

  async endSession(code: string) {
    const mode = await this.getMode(code);
    this.timer.cancel(code);
    const result = await this.handlers[mode].end(code);
    this.applyBroadcast(code, result);
    return { state: result.state };
  }

  async restartSession(code: string, keepAnswers = false) {
    this.timer.cancel(code);
    const { state } = await this.run(code, (h) => h.restart(code, keepAnswers));
    return { state };
  }

  // ─── Player actions ───────────────────────────────────────────────────────────

  async submitAnswer(params: {
    code: string;
    playerId: number;
    questionId: number;
    choiceId: number;
  }) {
    const session = await this.crud.findByCodeOrThrow(params.code);
    const state = await this.stateStore.get(params.code);

    if (!state || state.status !== SessionStatus.RUNNING) {
      throw new BadRequestException("Session is not accepting answers");
    }

    const answer = await this.crud.upsertAnswer({
      sessionId: session.id,
      playerId: params.playerId,
      questionId: params.questionId,
      choiceId: params.choiceId,
    });

    this.stats
      .getLiveStats(params.code)
      .then((s) => this.gateway.broadcast(params.code, S2C_EVENTS.LIVE_STATS, s))
      .catch(() => undefined);

    if (state.mode === SessionMode.AUTONOMOUS) {
      const result = await this.crud.getAnswerResult(params.questionId, params.choiceId);
      return { answerId: answer.id, ...result };
    }

    return { answerId: answer.id };
  }

  async playerComplete(code: string, playerId: number) {
    await this.crud.findByCodeOrThrow(code);
    await this.crud.markPlayerCompleted(playerId);

    const player = await this.stats
      .getLiveStats(code)
      .then((s) => s.players.find((p) => p.playerId === playerId));

    this.gateway.broadcast(code, S2C_EVENTS.PLAYER_COMPLETED, {
      playerId,
      nickname: player?.nickname ?? "",
    });

    return { ok: true };
  }

  async getPlayerAnswers(code: string, playerId: number) {
    const session = await this.crud.findByCodeOrThrow(code);
    return this.stats.getPlayerAnswerMap(session.id, playerId);
  }

  async getLiveStats(code: string) {
    return this.stats.getLiveStats(code);
  }

  async getResults(code: string) {
    return this.stats.getResults(code);
  }

  async getPlayerResults(code: string, playerId: number) {
    return this.stats.getPlayerResults(code, playerId);
  }

  // ─── Broadcast helper (accessible depuis la gateway) ─────────────────────────

  applyBroadcast(code: string, result: FlowResult): void {
    for (const { event, data } of result.instructions) {
      this.gateway.broadcast(code, event, data);
    }
  }

  // ─── Helpers privés ───────────────────────────────────────────────────────────

  private async getMode(code: string): Promise<SessionMode> {
    const state = await this.stateStore.get(code);
    if (state?.mode) return state.mode as SessionMode;
    const session = await this.crud.findByCodeWithOptions(code);
    return session.options?.mode ?? SessionMode.SCREEN;
  }

  private async run(
    code: string,
    action: (handler: SessionModeHandler) => Promise<FlowResult>,
  ): Promise<FlowResult> {
    const mode = await this.getMode(code);
    const result = await action(this.handlers[mode]);

    this.applyBroadcast(code, result);

    if (mode === SessionMode.BACK && result.timer) {
      this.scheduleBackAction(code, result.timer.delayMs, result.timer.nextAction);
    }

    return result;
  }

  private scheduleBackAction(
    code: string,
    delayMs: number,
    action: NextTimerAction,
  ): void {
    this.timer.schedule(code, delayMs, async () => {
      if (action === "reveal") await this.revealAnswer(code);
      else if (action === "advance") await this.nextQuestion(code);
      else if (action === "restart") await this.restartSession(code, true);
    });
  }
}
