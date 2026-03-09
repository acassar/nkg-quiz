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
  const user = await prisma.user.create({
    data: {
      email: userData.email,
      passwordHash: await bcrypt.hash(userData.password, 10),
    },
  });
  console.log(`✅ Created user: ${user.email}`);
  return user;
}

async function createQuizWithCategories(
  quizData: SeedData["quizzes"][0],
  userId: number,
) {
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

async function main() {
  console.log("🌱 Seeding database...");

  try {
    const seedData = await loadSeedData();

    // Create user
    const user = await createUser(seedData.user);

    // Create quizzes with their categories and questions
    for (const quizData of seedData.quizzes) {
      await createQuizWithCategories(quizData, user.id);
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
