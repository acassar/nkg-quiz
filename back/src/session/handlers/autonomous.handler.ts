import { BadRequestException, Injectable } from "@nestjs/common";
import { SessionStatus } from "@prisma/client";
import { S2C_EVENTS } from "@nkg-quiz/shared-socket-types";
import { SessionCrudService } from "../services/session-crud.service";
import { SessionStateStore } from "../state-store";
import { FlowResult } from "../session.types";
import { SessionModeHandler } from "./session-mode.handler";

@Injectable()
export class AutonomousModeHandler extends SessionModeHandler {
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

    await this.crud.updateStatus(session.id, SessionStatus.RUNNING, {
      startedAt: new Date(),
    });

    const state = await this.stateStore.update(code, {
      status: SessionStatus.RUNNING,
      currentQuestionIndex: null,
      nextActionAt: null,
      updatedAt: new Date().toISOString(),
    });

    return {
      state,
      instructions: [{ event: S2C_EVENTS.SESSION_STATE, data: state }],
    };
  }

  advance(_code: string): Promise<FlowResult> {
    return Promise.reject(
      new BadRequestException("Players control their own progression in autonomous mode"),
    );
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
}
