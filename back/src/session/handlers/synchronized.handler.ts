import { BadRequestException, Injectable } from "@nestjs/common";
import { SessionStatus } from "@prisma/client";
import { S2C_EVENTS } from "@nkg-quiz/shared-socket-types";
import { SessionCrudService } from "../services/session-crud.service";
import { SessionStateStore } from "../state-store";
import { FlowResult } from "../session.types";
import { SessionModeHandler } from "./session-mode.handler";

const DEFAULT_QUESTION_DURATION_SEC = 30;
const REVEAL_DURATION_MS = 5_000;
const RESTART_COUNTDOWN_MS = 10_000;

@Injectable()
export class SynchronizedModeHandler extends SessionModeHandler {
  constructor(
    private readonly crud: SessionCrudService,
    private readonly stateStore: SessionStateStore,
  ) {
    super();
  }

  async start(code: string): Promise<FlowResult> {
    const session = await this.crud.findByCodeOrThrow(code);

    if (session.status !== SessionStatus.LOBBY) {
      throw new BadRequestException("Session is not in LOBBY status");
    }

    const questions = await this.crud.getOrderedQuestions(session.quizId);
    if (!questions.length) throw new BadRequestException("Quiz has no questions");

    const question = questions[0];

    await this.crud.updateStatus(session.id, SessionStatus.RUNNING, {
      startedAt: new Date(),
    });

    const state = await this.stateStore.update(code, {
      status: SessionStatus.RUNNING,
      currentQuestionIndex: 0,
      nextActionAt: null,
      updatedAt: new Date().toISOString(),
    });

    return {
      state,
      instructions: [
        { event: S2C_EVENTS.SESSION_STATE, data: state },
        { event: S2C_EVENTS.QUESTION_SHOW, data: question },
      ],
      timer: {
        delayMs: (question.timeLimitSec ?? DEFAULT_QUESTION_DURATION_SEC) * 1000,
        nextAction: "reveal",
      },
    };
  }

  async reveal(code: string): Promise<FlowResult> {
    const session = await this.crud.findByCodeOrThrow(code);

    await this.crud.updateStatus(session.id, SessionStatus.REVEAL);

    const state = await this.stateStore.update(code, {
      status: SessionStatus.REVEAL,
      updatedAt: new Date().toISOString(),
    });

    return {
      state,
      instructions: [
        { event: S2C_EVENTS.SESSION_STATE, data: state },
        { event: S2C_EVENTS.ANSWER_REVEAL, data: { ok: true } },
      ],
      timer: { delayMs: REVEAL_DURATION_MS, nextAction: "advance" },
    };
  }

  async advance(code: string): Promise<FlowResult> {
    const session = await this.crud.findByCodeWithOptions(code);
    const currentState = await this.stateStore.get(code);
    const nextIndex = (currentState?.currentQuestionIndex ?? 0) + 1;

    const questions = await this.crud.getOrderedQuestions(session.quizId);
    const nextQuestion = questions[nextIndex];

    if (!nextQuestion) {
      if (session.options?.autoRestart) return this.scheduleRestart(code, session.id);
      return this.end(code);
    }

    await this.crud.updateStatus(session.id, SessionStatus.RUNNING);

    const state = await this.stateStore.update(code, {
      status: SessionStatus.RUNNING,
      currentQuestionIndex: nextIndex,
      updatedAt: new Date().toISOString(),
    });

    return {
      state,
      instructions: [
        { event: S2C_EVENTS.SESSION_STATE, data: state },
        { event: S2C_EVENTS.QUESTION_SHOW, data: nextQuestion },
      ],
      timer: {
        delayMs: (nextQuestion.timeLimitSec ?? DEFAULT_QUESTION_DURATION_SEC) * 1000,
        nextAction: "reveal",
      },
    };
  }

  async end(code: string): Promise<FlowResult> {
    const session = await this.crud.findByCodeOrThrow(code);

    await this.crud.updateStatus(session.id, SessionStatus.ENDED, {
      endedAt: new Date(),
    });

    const state = await this.stateStore.update(code, {
      status: SessionStatus.ENDED,
      currentQuestionIndex: null,
      nextActionAt: null,
      updatedAt: new Date().toISOString(),
    });

    return {
      state,
      instructions: [{ event: S2C_EVENTS.SESSION_END, data: state }],
    };
  }

  async restart(code: string, keepAnswers = false): Promise<FlowResult> {
    const session = await this.crud.findByCodeOrThrow(code);
    if (!keepAnswers) await this.crud.deleteAnswers(session.id);

    await this.crud.updateStatus(session.id, SessionStatus.LOBBY);
    await this.stateStore.update(code, {
      status: SessionStatus.LOBBY,
      currentQuestionIndex: null,
      nextActionAt: null,
      updatedAt: new Date().toISOString(),
    });

    return this.start(code);
  }

  private async scheduleRestart(code: string, sessionId: number): Promise<FlowResult> {
    const nextActionAt = Date.now() + RESTART_COUNTDOWN_MS;

    await this.crud.updateStatus(sessionId, SessionStatus.RESTARTING);

    const state = await this.stateStore.update(code, {
      status: SessionStatus.RESTARTING,
      currentQuestionIndex: null,
      nextActionAt,
      updatedAt: new Date().toISOString(),
    });

    return {
      state,
      instructions: [{ event: S2C_EVENTS.SESSION_STATE, data: state }],
      timer: { delayMs: RESTART_COUNTDOWN_MS, nextAction: "restart" },
    };
  }
}
