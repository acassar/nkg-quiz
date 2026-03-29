import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

interface SeedData {
  user: {
    email: string;
    password: string;
  };
  quizzes: Array<{
    title: string;
    status: "PUBLISHED" | "DRAFT";
    categories: Array<{
      name: string;
      orderIndex: number;
      questions: Array<{
        prompt: string;
        timeLimitSec: number;
        points: number;
        choices: Array<{
          text: string;
          isCorrect: boolean;
        }>;
      }>;
    }>;
  }>;
}

async function loadSeedData(): Promise<SeedData> {
  const seedDataPath = join(__dirname, "seedData.json");
  const seedDataContent = readFileSync(seedDataPath, "utf-8");
  return JSON.parse(seedDataContent);
}

async function createUser(userData: SeedData["user"]) {
  const user = await prisma.user.upsert({
    where: { email: userData.email },
    update: {},
    create: {
      email: userData.email,
      passwordHash: await bcrypt.hash(userData.password, 10),
    },
  });
  console.log(`✅ Upserted user: ${user.email}`);
  return user;
}

async function createQuizWithCategories(
  quizData: SeedData["quizzes"][0],
  userId: number,
) {
  const existing = await prisma.quiz.findFirst({
    where: { title: quizData.title, createdById: userId },
  });
  if (existing) {
    console.log(`⏭️  Quiz already exists, skipping: ${quizData.title}`);
    return existing;
  }

  const quiz = await prisma.quiz.create({
    data: {
      title: quizData.title,
      status: quizData.status,
      createdById: userId,
    },
  });

  console.log(`📚 Creating quiz: ${quiz.title}`);

  for (const categoryData of quizData.categories) {
    const category = await prisma.category.create({
      data: {
        name: categoryData.name,
        quizId: quiz.id,
        orderIndex: categoryData.orderIndex,
      },
    });

    console.log(
      `  📂 Creating category: ${category.name} (${categoryData.questions.length} questions)`,
    );

    for (const [
      questionIndex,
      questionData,
    ] of categoryData.questions.entries()) {
      await prisma.question.create({
        data: {
          prompt: questionData.prompt,
          orderIndex: questionIndex,
          timeLimitSec: questionData.timeLimitSec,
          points: questionData.points,
          quizId: quiz.id,
          categoryId: category.id,
          choices: {
            create: questionData.choices,
          },
        },
      });
    }
  }

  const totalQuestions = quizData.categories.reduce(
    (sum, category) => sum + category.questions.length,
    0,
  );

  console.log(
    `✅ Created quiz: ${quiz.title} (${quizData.categories.length} categories, ${totalQuestions} questions)`,
  );
  return quiz;
}

async function seedCompletedSession(quizId: number) {
  const quiz = await prisma.quiz.findUnique({
    where: { id: quizId },
    include: {
      questions: {
        orderBy: [{ category: { orderIndex: "asc" } }, { orderIndex: "asc" }],
        include: { choices: true },
      },
    },
  });

  if (!quiz || quiz.questions.length === 0) {
    console.warn("⚠️  No questions found, skipping session seed");
    return;
  }

  const questions = quiz.questions;

  const existingSession = await prisma.session.findUnique({ where: { code: "END001" } });
  if (existingSession) {
    console.log("⏭️  Session END001 already exists, skipping");
    return;
  }

  const session = await prisma.session.create({
    data: {
      quizId: quiz.id,
      code: "END001",
      status: "ENDED",
      currentQuestionIndex: questions.length - 1,
      startedAt: new Date("2026-03-29T14:00:00Z"),
      endedAt: new Date("2026-03-29T14:25:00Z"),
    },
  });

  console.log(`🎮 Created session: ${session.code}`);

  // 6 players — varied skill levels
  const playerNames = ["Alice", "Bob", "Charlie", "Diane", "Ethan", "Farah"];
  const players = await Promise.all(
    playerNames.map((nickname) =>
      prisma.sessionPlayer.create({
        data: { sessionId: session.id, nickname },
      }),
    ),
  );

  console.log(`👥 Created ${players.length} players`);

  // Answer patterns per player: true = correct choice, false = wrong choice
  // Alice: all correct | Bob: miss Q3, Q5 | Charlie: miss Q2, Q4, Q5
  // Diane: miss Q1, Q3, Q5 | Ethan: only Q1, Q4 correct | Farah: only Q2 correct
  const patterns: boolean[][] = [
    [true, true, true, true, true],    // Alice
    [true, true, false, true, false],  // Bob
    [true, false, true, false, false], // Charlie
    [false, true, false, true, false], // Diane
    [true, false, false, true, false], // Ethan
    [false, true, false, false, false],// Farah
  ];

  for (const [pi, player] of players.entries()) {
    for (const [qi, question] of questions.slice(0, 5).entries()) {
      const wantCorrect = patterns[pi][qi];
      const choice =
        question.choices.find((c) => c.isCorrect === wantCorrect) ??
        question.choices[0];

      await prisma.sessionAnswer.create({
        data: {
          sessionId: session.id,
          playerId: player.id,
          questionId: question.id,
          choiceId: choice.id,
          answeredAt: new Date(
            new Date("2026-03-29T14:00:00Z").getTime() +
              qi * 5 * 60 * 1000 + // ~5 min per question
              pi * 3000 +          // staggered per player
              Math.random() * 2000,
          ),
        },
      });
    }
  }

  console.log(`✅ Session END001 seeded with answers`);
}

async function main() {
  console.log("🌱 Seeding database...");

  try {
    const seedData = await loadSeedData();

    // Create user
    const user = await createUser(seedData.user);

    // Create quizzes with their categories and questions
    const quizzes: Awaited<ReturnType<typeof createQuizWithCategories>>[] = [];
    for (const quizData of seedData.quizzes) {
      quizzes.push(await createQuizWithCategories(quizData, user.id));
    }

    // Seed a completed session on the first quiz
    if (quizzes[0]) {
      await seedCompletedSession(quizzes[0].id);
    }

    const totalQuizzes = seedData.quizzes.length;
    const totalCategories = seedData.quizzes.reduce(
      (sum, quiz) => sum + quiz.categories.length,
      0,
    );
    const totalQuestions = seedData.quizzes.reduce(
      (sum, quiz) =>
        sum +
        quiz.categories.reduce(
          (catSum, category) => catSum + category.questions.length,
          0,
        ),
      0,
    );

    console.log("\n🎉 Database seeding completed!");
    console.log(
      `📊 Summary: ${totalQuizzes} quizzes, ${totalCategories} categories, ${totalQuestions} questions`,
    );
  } catch (error) {
    console.error("❌ Error during seeding:", error);
    throw error;
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
