import { Prisma } from "@prisma/client";

export type QuizExtended = Prisma.QuizGetPayload<{
  include: {
    categories: {
      include: {
        questions: {
          include: { choices: true };
          orderBy: { orderIndex: "asc" };
        };
      };
    };
    questions: {
      include: { choices: true };
      orderBy: { orderIndex: "asc" };
    };
    sessions: {
      orderBy: { createdAt: "desc" };
      where: { status: { not: "ARCHIVED" } };
    };
  };
}>;

export type QuizWithCategories = Omit<QuizExtended, "sessions" | "questions">;
