import { PrismaClient } from "@prisma/client";
import * as bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Seeding database...");

  // Create a test user
  const user = await prisma.user.create({
    data: {
      email: "test@example.com",
      passwordHash: await bcrypt.hash("password123", 10),
    },
  });

  console.log(`✅ Created user: ${user.email}`);

  // Create quiz 1: General Knowledge
  const quiz1 = await prisma.quiz.create({
    data: {
      title: "General Knowledge Quiz",
      status: "PUBLISHED",
      createdById: user.id,
    },
  });

  // Create categories for quiz 1
  const geographyCategory = await prisma.category.create({
    data: {
      name: "Geography",
      quizId: quiz1.id,
    },
  });

  const mathCategory = await prisma.category.create({
    data: {
      name: "Mathematics",
      quizId: quiz1.id,
    },
  });

  const astronomyCategory = await prisma.category.create({
    data: {
      name: "Astronomy",
      quizId: quiz1.id,
    },
  });

  // Create questions for quiz 1
  await prisma.question.create({
    data: {
      prompt: "What is the capital of France?",
      orderIndex: 0,
      timeLimitSec: 30,
      points: 100,
      quizId: quiz1.id,
      categoryId: geographyCategory.id,
      choices: {
        create: [
          { text: "London", isCorrect: false },
          { text: "Paris", isCorrect: true },
          { text: "Berlin", isCorrect: false },
          { text: "Madrid", isCorrect: false },
        ],
      },
    },
  });

  await prisma.question.create({
    data: {
      prompt: "What is 2 + 2?",
      orderIndex: 1,
      timeLimitSec: 15,
      points: 50,
      quizId: quiz1.id,
      categoryId: mathCategory.id,
      choices: {
        create: [
          { text: "3", isCorrect: false },
          { text: "4", isCorrect: true },
          { text: "5", isCorrect: false },
          { text: "6", isCorrect: false },
        ],
      },
    },
  });

  await prisma.question.create({
    data: {
      prompt: "What is the largest planet in our solar system?",
      orderIndex: 2,
      timeLimitSec: 30,
      points: 100,
      quizId: quiz1.id,
      categoryId: astronomyCategory.id,
      choices: {
        create: [
          { text: "Saturn", isCorrect: false },
          { text: "Jupiter", isCorrect: true },
          { text: "Neptune", isCorrect: false },
          { text: "Earth", isCorrect: false },
        ],
      },
    },
  });

  console.log(`✅ Created quiz: ${quiz1.title} (${quiz1.id})`);

  // Create quiz 2: Science
  const quiz2 = await prisma.quiz.create({
    data: {
      title: "Science Quiz",
      status: "PUBLISHED",
      createdById: user.id,
    },
  });

  const chemistryCategory = await prisma.category.create({
    data: {
      name: "Chemistry",
      quizId: quiz2.id,
    },
  });

  const physicsCategory = await prisma.category.create({
    data: {
      name: "Physics",
      quizId: quiz2.id,
    },
  });

  const biologyCategory = await prisma.category.create({
    data: {
      name: "Biology",
      quizId: quiz2.id,
    },
  });

  await prisma.question.create({
    data: {
      prompt: "What is the chemical symbol for Gold?",
      orderIndex: 0,
      timeLimitSec: 20,
      points: 75,
      quizId: quiz2.id,
      categoryId: chemistryCategory.id,
      choices: {
        create: [
          { text: "Gd", isCorrect: false },
          { text: "Go", isCorrect: false },
          { text: "Au", isCorrect: true },
          { text: "Ag", isCorrect: false },
        ],
      },
    },
  });

  await prisma.question.create({
    data: {
      prompt: "What is the speed of light?",
      orderIndex: 1,
      timeLimitSec: 30,
      points: 100,
      quizId: quiz2.id,
      categoryId: physicsCategory.id,
      choices: {
        create: [
          { text: "299,792 km/s", isCorrect: true },
          { text: "150,000 km/s", isCorrect: false },
          { text: "500,000 km/s", isCorrect: false },
          { text: "100,000 km/s", isCorrect: false },
        ],
      },
    },
  });

  await prisma.question.create({
    data: {
      prompt: "How many bones does an adult human have?",
      orderIndex: 2,
      timeLimitSec: 25,
      points: 75,
      quizId: quiz2.id,
      categoryId: biologyCategory.id,
      choices: {
        create: [
          { text: "186", isCorrect: false },
          { text: "206", isCorrect: true },
          { text: "250", isCorrect: false },
          { text: "150", isCorrect: false },
        ],
      },
    },
  });

  await prisma.question.create({
    data: {
      prompt: "What is the smallest unit of life?",
      orderIndex: 3,
      timeLimitSec: 20,
      points: 50,
      quizId: quiz2.id,
      categoryId: biologyCategory.id,
      choices: {
        create: [
          { text: "Molecule", isCorrect: false },
          { text: "Atom", isCorrect: false },
          { text: "Cell", isCorrect: true },
          { text: "Organ", isCorrect: false },
        ],
      },
    },
  });

  console.log(`✅ Created quiz: ${quiz2.title} (${quiz2.id})`);

  // Create quiz 3: History (Draft)
  const quiz3 = await prisma.quiz.create({
    data: {
      title: "History Quiz (Draft)",
      status: "DRAFT",
      createdById: user.id,
    },
  });

  const maritimeCategory = await prisma.category.create({
    data: {
      name: "Maritime History",
      quizId: quiz3.id,
    },
  });

  const usHistoryCategory = await prisma.category.create({
    data: {
      name: "US History",
      quizId: quiz3.id,
    },
  });

  await prisma.question.create({
    data: {
      prompt: "In what year did the Titanic sink?",
      orderIndex: 0,
      timeLimitSec: 30,
      points: 100,
      quizId: quiz3.id,
      categoryId: maritimeCategory.id,
      choices: {
        create: [
          { text: "1911", isCorrect: false },
          { text: "1912", isCorrect: true },
          { text: "1913", isCorrect: false },
          { text: "1910", isCorrect: false },
        ],
      },
    },
  });

  await prisma.question.create({
    data: {
      prompt: "Who was the first President of the United States?",
      orderIndex: 1,
      timeLimitSec: 30,
      points: 100,
      quizId: quiz3.id,
      categoryId: usHistoryCategory.id,
      choices: {
        create: [
          { text: "Thomas Jefferson", isCorrect: false },
          { text: "George Washington", isCorrect: true },
          { text: "Benjamin Franklin", isCorrect: false },
          { text: "John Adams", isCorrect: false },
        ],
      },
    },
  });

  console.log("✅ Database seeding completed!");
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
