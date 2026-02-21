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
import { SessionStatus } from "@prisma/client";
import { SessionGateway } from "./session.gateway";

@Injectable()
export class SessionService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stateStore: SessionStateStore,
    @Inject(forwardRef(() => SessionGateway))
    private readonly gateway: SessionGateway,
  ) {}

  async createSession(dto: CreateSessionDto) {
    const existingSession = await this.prisma.session.findFirst({
      where: {
        quizId: dto.quizId,
        status: {
          in: [
            SessionStatus.LOBBY,
            SessionStatus.RUNNING,
            SessionStatus.REVEAL,
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

      return { sessionCode: code, playerId: player.id };
    } catch {
      throw new BadRequestException("Nickname already taken");
    }
  }

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

    const currentQuestion =
      state.currentQuestionIndex !== null
        ? await this.getQuestionByIndex(
            session.quizId,
            state.currentQuestionIndex,
          )
        : null;

    return {
      ...state,
      currentQuestion,
    };
  }

  async startSession(code: string) {
    const session = await this.getSessionByCode(code);
    const currentQuestionIndex = 0;
    const question = await this.getQuestionByIndex(
      session.quizId,
      currentQuestionIndex,
    );

    if (!question) {
      throw new BadRequestException("No question available");
    }

    await this.prisma.session.update({
      where: { id: session.id },
      data: {
        status: SessionStatus.RUNNING,
        currentQuestionIndex,
        startedAt: session.startedAt ?? new Date(),
      },
    });

    const state = await this.stateStore.set({
      code: session.code,
      status: SessionStatus.RUNNING,
      currentQuestionIndex,
      updatedAt: new Date().toISOString(),
    });

    this.gateway?.broadcast(code, "session:state", state);
    this.gateway?.broadcast(code, "question:show", question);

    return { state, question };
  }

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
    if (question) {
      this.gateway?.broadcast(code, "question:show", question);
    }

    return { state, question };
  }

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

  async submitAnswer(params: {
    code: string;
    playerId: number;
    questionId: number;
    choiceId: number;
  }) {
    const session = await this.getSessionByCode(params.code);

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

  private async getSessionByCode(code: string) {
    const session = await this.prisma.session.findUnique({
      where: { code },
    });

    if (!session) {
      throw new NotFoundException("Session not found");
    }

    return session;
  }

  private async getQuestionByIndex(quizId: number, index: number) {
    const question = await this.prisma.question.findFirst({
      where: { quizId, orderIndex: index },
      include: { choices: true },
    });

    if (!question) {
      return null;
    }

    return {
      id: question.id,
      prompt: question.prompt,
      timeLimitSec: question.timeLimitSec,
      points: question.points,
      choices: question.choices.map((choice) => ({
        id: choice.id,
        text: choice.text,
      })),
    };
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
