import { Prisma } from "@prisma/client";

export const categoriesWithRelations: Prisma.CategoryInclude = {
  questions: {
    include: { choices: true },
    orderBy: { orderIndex: "asc" },
  },
};
