import { ConfigService } from "@nestjs/config";
import { Test, TestingModule } from "@nestjs/testing";
import { S2C_EVENTS } from "@nkg-quiz/shared-socket-types";
import { SessionMode } from "@prisma/client";

import { PrismaService } from "../src/prisma/prisma.service";
import { AutonomousModeHandler } from "../src/session/handlers/autonomous.handler";
import { SynchronizedModeHandler } from "../src/session/handlers/synchronized.handler";
import { SessionCrudService } from "../src/session/services/session-crud.service";
import { SessionStatsService } from "../src/session/services/session-stats.service";
import { SessionTimerService } from "../src/session/services/session-timer.service";
import { SessionGateway } from "../src/session/session.gateway";
import { SessionService } from "../src/session/session.service";
import { SessionStateStore } from "../src/session/state-store";

/**
 * Sème un quiz minimal directement en base et renvoie les ids utiles.
 * 2 questions, 2 choix chacune, le 1er choix étant le bon.
 */
async function seedQuiz(prisma: PrismaService) {
  const user = await prisma.user.create({
    data: { email: `u${Date.now()}@test.fr`, passwordHash: "x" },
  });
  const quiz = await prisma.quiz.create({
    data: { title: "Quiz test", createdById: user.id },
  });
  const category = await prisma.category.create({
    data: { name: "Cat", quizId: quiz.id, orderIndex: 0 },
  });

  const questions = [];
  for (let i = 0; i < 2; i++) {
    const question = await prisma.question.create({
      data: {
        quizId: quiz.id,
        categoryId: category.id,
        prompt: `Question ${i}`,
        points: 10,
        orderIndex: i,
        choices: {
          create: [
            { text: "Bonne réponse", isCorrect: true },
            { text: "Mauvaise réponse", isCorrect: false },
          ],
        },
      },
      include: { choices: true },
    });
    questions.push(question);
  }

  return { quizId: quiz.id, questions };
}

/** Vide toutes les tables entre chaque test (ordre géré par CASCADE). */
async function resetDb(prisma: PrismaService) {
  await prisma.$executeRawUnsafe(
    `TRUNCATE TABLE "User", "Quiz", "Category", "Question", "Choice",
     "QuizOptions", "Session", "SessionOptions", "SessionPlayer",
     "SessionAnswer", "SessionResult" RESTART IDENTITY CASCADE`,
  );
}

describe("Session modes (intégration)", () => {
  let moduleRef: TestingModule;
  let service: SessionService;
  let prisma: PrismaService;
  let timer: SessionTimerService;
  let stateStore: SessionStateStore;
  let gateway: { broadcast: jest.Mock };

  beforeAll(async () => {
    // La gateway est MOCKÉE : on remplace le vrai transport WS par un espion.
    // Possible uniquement parce que les handlers ne dépendent pas du WS (FlowResult).
    gateway = { broadcast: jest.fn() };

    moduleRef = await Test.createTestingModule({
      providers: [
        PrismaService,
        SessionStateStore,
        SessionTimerService,
        SessionCrudService,
        SessionStatsService,
        SynchronizedModeHandler,
        AutonomousModeHandler,
        SessionService,
        { provide: SessionGateway, useValue: gateway },
        // ConfigService renvoie undefined pour REDIS_URL → state store en mémoire
        { provide: ConfigService, useValue: { get: () => undefined } },
      ],
    }).compile();

    service = moduleRef.get(SessionService);
    prisma = moduleRef.get(PrismaService);
    timer = moduleRef.get(SessionTimerService);
    stateStore = moduleRef.get(SessionStateStore);
    await prisma.$connect();
  });

  afterAll(async () => {
    await prisma.$disconnect();
    await moduleRef.close();
  });

  beforeEach(async () => {
    gateway.broadcast.mockClear();
    await resetDb(prisma);
  });

  // ─── Mode SCREEN : flux synchronisé piloté pas à pas ──────────────────────────

  describe("mode SCREEN", () => {
    it("déroule le quiz question par question jusqu'à la fin", async () => {
      const { quizId } = await seedQuiz(prisma);

      const { session, state } = await service.createSession({
        quizId,
        options: { mode: SessionMode.SCREEN },
      });
      expect(state.mode).toBe(SessionMode.SCREEN);
      expect(state.status).toBe("LOBBY");

      // Démarrage → première question
      const started = await service.startSession(session.code);
      expect(started.state.status).toBe("RUNNING");
      expect(started.state.currentQuestionIndex).toBe(0);
      expect(broadcastEvents()).toContain(S2C_EVENTS.QUESTION_SHOW);

      // Révélation
      const revealed = await service.revealAnswer(session.code);
      expect(revealed.state.status).toBe("REVEAL");
      expect(broadcastEvents()).toContain(S2C_EVENTS.ANSWER_REVEAL);

      // Question suivante
      const next = await service.nextQuestion(session.code);
      expect(next.state.currentQuestionIndex).toBe(1);

      // Plus de question → fin de session
      const ended = await service.nextQuestion(session.code);
      expect(ended.state.status).toBe("ENDED");
      expect(broadcastEvents()).toContain(S2C_EVENTS.SESSION_END);
    });
  });

  // ─── Mode AUTONOMOUS : correction immédiate, progression par joueur ────────────

  describe("mode AUTONOMOUS", () => {
    it("corrige chaque réponse à la volée et marque la complétion", async () => {
      const { quizId, questions } = await seedQuiz(prisma);
      const correctChoice = questions[0].choices.find((c) => c.isCorrect)!;
      const wrongChoice = questions[0].choices.find((c) => !c.isCorrect)!;

      const { session } = await service.createSession({
        quizId,
        options: { mode: SessionMode.AUTONOMOUS },
      });
      await service.startSession(session.code);

      const { playerId } = await service.joinSession(session.code, {
        nickname: "Alice",
      });

      // Bonne réponse → correction renvoyée immédiatement
      const good = await service.submitAnswer({
        code: session.code,
        playerId,
        questionId: questions[0].id,
        choiceId: correctChoice.id,
      });
      // `in` prouve à TypeScript qu'on est sur la variante "mode autonome"
      if (!("isCorrect" in good)) throw new Error("résultat de correction attendu");
      expect(good.isCorrect).toBe(true);
      expect(good.points).toBe(10);
      expect(good.correctChoiceId).toBe(correctChoice.id);

      // Mauvaise réponse
      const bad = await service.submitAnswer({
        code: session.code,
        playerId,
        questionId: questions[1].id,
        choiceId: wrongChoice.id,
      });
      if (!("isCorrect" in bad)) throw new Error("résultat de correction attendu");
      expect(bad.isCorrect).toBe(false);

      // Complétion → broadcast PLAYER_COMPLETED + completedAt en base
      await service.playerComplete(session.code, playerId);
      expect(broadcastEvents()).toContain(S2C_EVENTS.PLAYER_COMPLETED);

      const player = await prisma.sessionPlayer.findUnique({
        where: { id: playerId },
      });
      expect(player?.completedAt).not.toBeNull();
    });
  });

  // ─── Mode BACK : le serveur programme la suite tout seul ───────────────────────

  describe("mode BACK", () => {
    it("programme un timer au démarrage (le serveur pilote)", async () => {
      const { quizId } = await seedQuiz(prisma);
      // On espionne le timer pour éviter un vrai setTimeout de 30s dans le test
      const scheduleSpy = jest
        .spyOn(timer, "schedule")
        .mockImplementation(() => undefined);

      const { session } = await service.createSession({
        quizId,
        options: { mode: SessionMode.BACK },
      });
      await service.startSession(session.code);

      // En mode BACK, démarrer doit programmer la prochaine action automatiquement
      expect(scheduleSpy).toHaveBeenCalledTimes(1);
      scheduleSpy.mockRestore();
    });
  });

  // ─── Reprise après perte de cache (redémarrage serveur) ───────────────────────

  describe("reprise après perte de cache", () => {
    it("rabat une session RUNNING sur LOBBY quand l'état n'est plus en cache", async () => {
      const { quizId } = await seedQuiz(prisma);
      const { session } = await service.createSession({
        quizId,
        options: { mode: SessionMode.SCREEN },
      });
      await service.startSession(session.code);

      // Simule le redémarrage serveur : l'état vivant disparaît du store
      await stateStore.cleanup(session.code);

      const { state } = await service.getState(session.code);
      expect(state.status).toBe("LOBBY");
      expect(state.currentQuestionIndex).toBeNull();

      // La DB est rabattue elle aussi (cohérence)
      const inDb = await prisma.session.findUnique({ where: { code: session.code } });
      expect(inDb?.status).toBe("LOBBY");
    });

    it("préserve une session ENDED après perte de cache", async () => {
      const { quizId } = await seedQuiz(prisma);
      const { session } = await service.createSession({
        quizId,
        options: { mode: SessionMode.SCREEN },
      });
      await service.startSession(session.code);
      await service.endSession(session.code);

      await stateStore.cleanup(session.code);

      const { state } = await service.getState(session.code);
      expect(state.status).toBe("ENDED");
    });
  });

  /** Raccourci : liste des events broadcastés depuis le dernier mockClear. */
  function broadcastEvents(): string[] {
    return gateway.broadcast.mock.calls.map((call) => call[1] as string);
  }
});
