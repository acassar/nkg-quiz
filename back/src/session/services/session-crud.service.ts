import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { Prisma, Session, SessionMode, SessionStatus } from "@prisma/client";
import { nanoid } from "nanoid";
import { PrismaService } from "../../prisma/prisma.service";
import { JoinSessionDto } from "../dto/join-session.dto";
import { SessionOptionsDto } from "../dto/session-options.dto";

export type QuestionWithChoices = Prisma.QuestionGetPayload<{
  include: {
    category: true;
    choices: { select: { id: true; text: true } };
  };
}>;

export type SessionWithOptions = Prisma.SessionGetPayload<{
  include: { options: true };
}>;

@Injectable()
export class SessionCrudService {
  constructor(private readonly prisma: PrismaService) {}

  async findByCodeOrThrow(code: string): Promise<Session> {
    const session = await this.prisma.session.findUnique({ where: { code } });
    if (!session) throw new NotFoundException("Session not found");
    return session;
  }

  async findByCodeWithOptions(code: string): Promise<SessionWithOptions> {
    const session = await this.prisma.session.findUnique({
      where: { code },
      include: { options: true },
    });
    if (!session) throw new NotFoundException("Session not found");
    return session;
  }

  async hasActiveSession(quizId: number): Promise<boolean> {
    const count = await this.prisma.session.count({
      where: {
        quizId,
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
    return count > 0;
  }

  async validateQuizForSession(quizId: number): Promise<void> {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: { _count: { select: { questions: true } } },
    });
    if (!quiz) throw new NotFoundException("Quiz not found");
    if (quiz._count.questions === 0)
      throw new BadRequestException("Quiz has no questions");
  }

  async createWithCode(
    quizId: number,
    options: SessionOptionsDto,
  ): Promise<Session> {
    for (let i = 0; i < 3; i++) {
      const code = nanoid(6).toUpperCase();
      try {
        return await this.prisma.session.create({
          data: {
            quizId,
            code,
            status: SessionStatus.LOBBY,
            options: { create: options },
          },
        });
      } catch {
        if (i === 2) throw new BadRequestException("Failed to generate session code");
      }
    }
    throw new BadRequestException("Failed to generate session code");
  }

  async updateStatus(
    id: number,
    status: SessionStatus,
    extra?: Partial<Pick<Session, "startedAt" | "endedAt">>,
  ): Promise<void> {
    await this.prisma.session.update({ where: { id }, data: { status, ...extra } });
  }

  async findOrCreatePlayer(
    sessionId: number,
    dto: JoinSessionDto,
  ): Promise<{ playerId: number }> {
    if (dto.playerId) {
      const player = await this.prisma.sessionPlayer.findFirst({
        where: { id: parseInt(dto.playerId), sessionId },
      });
      if (!player) throw new NotFoundException("Player not found");
      if (player.nickname !== dto.nickname) {
        await this.prisma.sessionPlayer.update({
          where: { id: player.id },
          data: { nickname: dto.nickname },
        });
      }
      return { playerId: player.id };
    }

    try {
      const player = await this.prisma.sessionPlayer.create({
        data: { sessionId, nickname: dto.nickname },
      });
      return { playerId: player.id };
    } catch {
      throw new BadRequestException("Nickname already taken");
    }
  }

  async getOrderedQuestions(quizId: number): Promise<QuestionWithChoices[]> {
    const quiz = await this.prisma.quiz.findFirst({
      where: { id: quizId },
      include: {
        questions: {
          orderBy: [{ category: { orderIndex: "asc" } }, { orderIndex: "asc" }],
          include: {
            category: true,
            choices: { select: { id: true, text: true } },
          },
        },
      },
    });
    return quiz?.questions ?? [];
  }

  async getFullQuizForPlayer(quizId: number) {
    return this.prisma.quiz.findUnique({
      where: { id: quizId },
      include: {
        categories: {
          orderBy: { orderIndex: "asc" },
          include: {
            questions: {
              orderBy: { orderIndex: "asc" },
              include: { choices: { select: { id: true, text: true } } },
            },
          },
        },
        questions: {
          orderBy: [{ category: { orderIndex: "asc" } }, { orderIndex: "asc" }],
          include: {
            category: true,
            choices: { select: { id: true, text: true } },
          },
        },
      },
    });
  }

  async upsertAnswer(params: {
    sessionId: number;
    playerId: number;
    questionId: number;
    choiceId: number;
  }) {
    return this.prisma.sessionAnswer.upsert({
      where: {
        sessionId_playerId_questionId: {
          sessionId: params.sessionId,
          playerId: params.playerId,
          questionId: params.questionId,
        },
      },
      update: { choiceId: params.choiceId, answeredAt: new Date() },
      create: params,
    });
  }

  async getAnswerResult(
    questionId: number,
    choiceId: number,
  ): Promise<{ isCorrect: boolean; correctChoiceId: number; points: number }> {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
      include: { choices: { select: { id: true, isCorrect: true } } },
    });
    if (!question) throw new NotFoundException("Question not found");
    const isCorrect =
      question.choices.find((c) => c.id === choiceId)?.isCorrect ?? false;
    const correctChoiceId = question.choices.find((c) => c.isCorrect)?.id ?? 0;
    return { isCorrect, correctChoiceId, points: question.points ?? 0 };
  }

  async markPlayerCompleted(playerId: number): Promise<void> {
    await this.prisma.sessionPlayer.update({
      where: { id: playerId },
      data: { completedAt: new Date() },
    });
  }

  async getActiveSessionsByUser(userId: number): Promise<Session[]> {
    return this.prisma.session.findMany({
      where: {
        quiz: { createdById: userId },
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
  }

  async archiveSession(id: number): Promise<Session> {
    return this.prisma.session.update({
      where: { id },
      data: { status: SessionStatus.ARCHIVED },
    });
  }

  async deleteAnswers(sessionId: number): Promise<void> {
    await this.prisma.sessionAnswer.deleteMany({ where: { sessionId } });
  }

  async getDefaultMode(quizId: number): Promise<SessionMode> {
    const options = await this.prisma.quizOptions.findUnique({
      where: { quizId },
    });
    return options?.defaultMode ?? SessionMode.SCREEN;
  }
}
