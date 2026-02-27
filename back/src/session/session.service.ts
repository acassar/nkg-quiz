import {
  BadRequestException,
  forwardRef,
  Inject,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateSessionDto } from "./dto/create-session.dto";
import { JoinSessionDto } from "./dto/join-session.dto";
import { SessionStateStore } from "./state-store";
import { nanoid } from "nanoid";
import { Prisma, Session, SessionStatus } from "@prisma/client";
import { SessionGateway } from "./session.gateway";
import { ISessionService } from "./model/sessionService.model";

//TODO make interfaces to create contracts between service and users of the service (controller and gateway).

@Injectable()
export class SessionService implements ISessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stateStore: SessionStateStore,
    @Inject(forwardRef(() => SessionGateway))
    private readonly gateway: SessionGateway,
  ) {}

  async startSession(code: string) {
    return this._startSession(code);
  }

  async restartSession(code: string) {
    return this._startSession(code, true);
  }

  async archiveSession(code: string) {
    const session = await this.getSessionByCode(code);

    if (session.status === SessionStatus.ARCHIVED) {
      throw new BadRequestException("Session already archived");
    }

    return this.prisma.session.update({
      where: { id: session.id },
      data: { status: SessionStatus.ARCHIVED },
    });
  }

  /**
   * Create a session for a quiz. Fails if an active session already exists for the quiz.
   * An active session is a session that is in LOBBY, RUNNING, REVEAL or ENDED status.
   * The session starts in LOBBY status and must be started to move to RUNNING status.
   * Initializes session state in the state store and returns the session and its state.
   */
  async createSession(dto: CreateSessionDto) {
    const existingSession = await this.prisma.session.findFirst({
      where: {
        quizId: dto.quizId,
        status: {
          in: [
            SessionStatus.LOBBY,
            SessionStatus.RUNNING,
            SessionStatus.REVEAL,
            SessionStatus.ENDED,
          ],
        },
      },
    });

    if (existingSession) {
      throw new BadRequestException(
        "An active session already exists for this quiz",
      );
    }

    const quiz = await this.prisma.quiz.findUnique({
      where: { id: dto.quizId },
      include: {
        questions: {
          orderBy: { orderIndex: "asc" },
          include: { choices: true },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException("Quiz not found");
    }

    if (!quiz.questions.length) {
      throw new BadRequestException("Quiz has no questions");
    }

    const session = await this.createSessionWithCode(quiz.id);

    const state = await this.stateStore.set({
      code: session.code,
      status: session.status,
      currentQuestionIndex: null,
      updatedAt: new Date().toISOString(),
    });

    return { session, state };
  }

  /**
   * Get all active sessions for a user
   * @param userId User ID
   * @returns Array of active sessions
   */
  async userActiveSessions(userId: number) {
    const sessions = await this.prisma.session.findMany({
      where: {
        quiz: {
          createdById: userId,
        },
        status: {
          in: [
            SessionStatus.LOBBY,
            SessionStatus.RUNNING,
            SessionStatus.REVEAL,
            SessionStatus.ENDED,
          ],
        },
      },
    });
    return sessions;
  }

  async joinSession(code: string, dto: JoinSessionDto) {
    const session = await this.getSessionByCode(code);

    try {
      const player = await this.prisma.sessionPlayer.create({
        data: {
          sessionId: session.id,
          nickname: dto.nickname,
        },
      });

      return { playerId: player.id };
    } catch {
      throw new BadRequestException("Nickname already taken");
    }
  }

  /**
   * Retrieve session state from the state store. If not found, initialize it from the session data in the database.
   * @param code session code
   * @returns the session state
   */
  async getState(code: string) {
    const session = await this.getSessionByCode(code);
    const state =
      (await this.stateStore.get(code)) ??
      (await this.stateStore.set({
        code: session.code,
        status: session.status,
        currentQuestionIndex: session.currentQuestionIndex ?? null,
        updatedAt: new Date().toISOString(),
      }));

    return { state };
  }

  /**
   * Resets session status to LOBBY and deletes answers for a restart. Used when restarting a session that is already running or ended.
   */
  private async handleRestartSession(session: Session) {
    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        status: SessionStatus.LOBBY,
        currentQuestionIndex: null,
        startedAt: new Date(),
        answers: {
          deleteMany: {
            sessionId: session.id,
          },
        },
      },
    });
  }

  /**
   * Start a session by code
   * @param code Session code
   * @param restart If true, restart the session if already running or ended
   * @returns Session state and the first question
   */
  private async _startSession(code: string, restart = false) {
    const session = await this.getSessionByCode(code);
    const currentQuestionIndex = 0;
    const question = await this.getQuestionByIndex(
      session.quizId,
      currentQuestionIndex,
    );

    if (!question) {
      throw new BadRequestException("No question available");
    }

    if (session.status !== SessionStatus.LOBBY) {
      if (restart) {
        await this.handleRestartSession(session);
      } else {
        throw new BadRequestException("Session already started");
      }
    } else {
      // Update session status and current question index in the database
      await this.prisma.session.update({
        where: { id: session.id },
        data: {
          status: SessionStatus.RUNNING,
          currentQuestionIndex,
          startedAt: new Date(),
        },
      });
    }

    // Update session state in the state store
    const state = await this.stateStore.set({
      code: session.code,
      status: restart ? SessionStatus.LOBBY : SessionStatus.RUNNING,
      currentQuestionIndex,
      updatedAt: new Date().toISOString(),
    });

    // Broadcast session state
    this.gateway?.broadcast(code, "session:state", state);

    return { state, question };
  }

  // ==================== Session Flow Handlers ====================

  /**
   * Move to the next question in the session. If no more questions are available, end the session.
   * @param code session code
   * @returns session state
   */
  async nextQuestion(code: string) {
    const session = await this.getSessionByCode(code);
    const nextIndex = (session.currentQuestionIndex ?? -1) + 1;

    const question = await this.getQuestionByIndex(session.quizId, nextIndex);
    if (!question) {
      return this.endSession(code);
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        status: SessionStatus.RUNNING,
        currentQuestionIndex: nextIndex,
      },
    });

    const state = await this.stateStore.set({
      code: session.code,
      status: SessionStatus.RUNNING,
      currentQuestionIndex: nextIndex,
      updatedAt: new Date().toISOString(),
    });

    this.gateway?.broadcast(code, "session:state", state);

    return { state };
  }

  /**
   * Reveal the answer for the current question by setting session status to REVEAL.
   * Players can submit answers only when the session is in RUNNING status, so this effectively locks answer submission until the next question is shown.
   * @param code session code
   * @returns the session state
   */
  async revealAnswer(code: string) {
    const session = await this.getSessionByCode(code);
    await this.prisma.session.update({
      where: { id: session.id },
      data: { status: SessionStatus.REVEAL },
    });

    const state = await this.stateStore.set({
      code: session.code,
      status: SessionStatus.REVEAL,
      currentQuestionIndex: session.currentQuestionIndex ?? null,
      updatedAt: new Date().toISOString(),
    });

    this.gateway?.broadcast(code, "session:state", state);
    this.gateway?.broadcast(code, "answer:reveal", { ok: true });

    return { state };
  }

  /**
   * End the session by setting status to ENDED. Players can no longer submit answers and the session is effectively closed.
   * @param code session code
   * @returns the session state
   */
  async endSession(code: string) {
    const session = await this.getSessionByCode(code);
    await this.prisma.session.update({
      where: { id: session.id },
      data: { status: SessionStatus.ENDED, endedAt: new Date() },
    });

    const state = await this.stateStore.set({
      code: session.code,
      status: SessionStatus.ENDED,
      currentQuestionIndex: null,
      updatedAt: new Date().toISOString(),
    });

    this.gateway?.broadcast(code, "session:end", state);

    return { state };
  }

  /**
   * Submit an answer for the current question in the session.
   * @param params the parameters for submitting an answer
   * @returns the ID of the submitted answer
   */
  async submitAnswer(params: {
    code: string;
    playerId: number;
    questionId: number;
    choiceId: number;
  }) {
    const session = await this.getSessionByCode(params.code);

    const state = await this.stateStore.get(params.code);
    if (!state || state.status !== SessionStatus.RUNNING) {
      throw new BadRequestException("Session is not accepting answers");
    }

    try {
      const answer = await this.prisma.sessionAnswer.create({
        data: {
          sessionId: session.id,
          playerId: params.playerId,
          questionId: params.questionId,
          choiceId: params.choiceId,
        },
      });

      return { answerId: answer.id };
    } catch {
      throw new BadRequestException("Answer already submitted");
    }
  }

  // ==================== Private Helpers ====================

  private async getSessionByCode(code: string) {
    const session = await this.prisma.session.findUnique({
      where: { code },
    });

    if (!session) {
      throw new NotFoundException("Session not found");
    }

    return session;
  }

  private async getQuestionByIndex(
    quizId: number,
    index: number,
  ): Promise<Prisma.QuestionGetPayload<{ include: { choices: true } }> | null> {
    const question = await this.prisma.question.findFirst({
      where: { quizId, orderIndex: index },
      include: { choices: true },
    });

    if (!question) {
      return null;
    }

    return question;
  }

  private async createSessionWithCode(quizId: number) {
    const attempts = 3;

    for (let i = 0; i < attempts; i += 1) {
      const code = nanoid(6).toUpperCase();
      try {
        return await this.prisma.session.create({
          data: {
            quizId,
            code,
            status: SessionStatus.LOBBY,
          },
        });
      } catch {
        if (i === attempts - 1) {
          throw new BadRequestException("Failed to generate session code");
        }
      }
    }

    throw new BadRequestException("Failed to generate session code");
  }
}
