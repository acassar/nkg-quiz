import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SessionStateStore } from "../state-store";

@Injectable()
export class SessionStatsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly stateStore: SessionStateStore,
  ) {}

  async getLiveStats(code: string) {
    const session = await this.prisma.session.findUniqueOrThrow({
      where: { code },
    });
    const state = await this.stateStore.get(code);

    const [players, allAnswers, quiz] = await Promise.all([
      this.prisma.sessionPlayer.findMany({
        where: { sessionId: session.id, isActive: true },
        orderBy: { joinedAt: "asc" },
      }),
      this.prisma.sessionAnswer.findMany({
        where: { sessionId: session.id },
        include: {
          question: { select: { points: true } },
          choice: { select: { isCorrect: true } },
        },
      }),
      this.prisma.quiz.findUnique({
        where: { id: session.quizId },
        include: {
          questions: {
            orderBy: [{ category: { orderIndex: "asc" } }, { orderIndex: "asc" }],
            include: { category: { select: { name: true } } },
          },
        },
      }),
    ]);

    const currentIndex = state?.currentQuestionIndex;
    const currentQ =
      currentIndex != null ? quiz?.questions[currentIndex] : undefined;

    const currentQuestion = currentQ
      ? {
          id: currentQ.id,
          prompt: currentQ.prompt,
          category: currentQ.category.name,
          points: currentQ.points,
          answersCount: allAnswers.filter((a) => a.questionId === currentQ.id)
            .length,
        }
      : null;

    const playerStats = players.map((player) => {
      const playerAnswers = allAnswers.filter((a) => a.playerId === player.id);
      const score = playerAnswers
        .filter((a) => a.choice.isCorrect)
        .reduce((sum, a) => sum + (a.question.points ?? 0), 0);

      return {
        playerId: player.id,
        nickname: player.nickname,
        totalAnswers: playerAnswers.length,
        score,
        answeredCurrentQuestion: currentQ
          ? playerAnswers.some((a) => a.questionId === currentQ.id)
          : false,
      };
    });

    return {
      code: session.code,
      status: state?.status ?? session.status,
      currentQuestionIndex: state?.currentQuestionIndex ?? null,
      currentQuestion,
      totalPlayers: players.length,
      totalQuestions: quiz?.questions.length ?? 0,
      players: playerStats
        .sort((a, b) => b.score - a.score)
        .map((p, i) => ({ ...p, rank: i + 1 })),
    };
  }

  async getResults(code: string) {
    const session = await this.prisma.session.findUniqueOrThrow({
      where: { code },
    });

    const answers = await this.prisma.sessionAnswer.findMany({
      where: { sessionId: session.id },
      include: {
        player: { select: { id: true, nickname: true } },
        choice: { select: { isCorrect: true } },
        question: { select: { points: true } },
      },
    });

    const scoreMap = new Map<number, { nickname: string; score: number }>();
    for (const a of answers) {
      const current = scoreMap.get(a.playerId) ?? {
        nickname: a.player.nickname,
        score: 0,
      };
      if (a.choice.isCorrect) current.score += a.question.points ?? 0;
      scoreMap.set(a.playerId, current);
    }

    return {
      results: [...scoreMap.entries()]
        .sort((a, b) => b[1].score - a[1].score)
        .map(([playerId, { nickname, score }], i) => ({
          playerId,
          nickname,
          score,
          rank: i + 1,
        })),
    };
  }

  async getPlayerResults(code: string, playerId: number) {
    const session = await this.prisma.session.findUniqueOrThrow({
      where: { code },
      include: {
        quiz: {
          include: {
            questions: {
              orderBy: [
                { category: { orderIndex: "asc" } },
                { orderIndex: "asc" },
              ],
              include: { choices: true },
            },
          },
        },
        answers: {
          where: { playerId },
          select: { questionId: true, choiceId: true },
        },
      },
    });

    const answerMap = new Map(session.answers.map((a) => [a.questionId, a.choiceId]));

    const questions = session.quiz.questions.map((q) => ({
      id: q.id,
      prompt: q.prompt,
      timeLimitSec: q.timeLimitSec,
      points: q.points,
      choices: q.choices.map((c) => ({ id: c.id, text: c.text, isCorrect: c.isCorrect })),
      playerChoiceId: answerMap.get(q.id) ?? null,
    }));

    const score = questions.reduce((total, q) => {
      const choiceId = q.playerChoiceId;
      const isCorrect =
        choiceId != null && q.choices.some((c) => c.id === choiceId && c.isCorrect);
      return total + (isCorrect ? (q.points ?? 0) : 0);
    }, 0);

    return { questions, score };
  }

  async getPlayerAnswerMap(
    sessionId: number,
    playerId: number,
  ): Promise<Record<number, number>> {
    const answers = await this.prisma.sessionAnswer.findMany({
      where: { sessionId, playerId },
      select: { questionId: true, choiceId: true },
    });
    return Object.fromEntries(answers.map((a) => [a.questionId, a.choiceId]));
  }
}
