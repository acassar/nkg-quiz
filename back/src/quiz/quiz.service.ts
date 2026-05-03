import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateQuizDto } from "./dto/create-quiz.dto";
import { UpdateQuizDto } from "./dto/update-quiz.dto";
import { ImportQuizDto } from "./dto/import-quiz.dto";
import { categoriesWithRelations } from "./prisma/quizPrisma.object";
import { SessionStatus } from "@prisma/client";

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: number) {
    return this.prisma.quiz.findMany({
      where: { createdById: userId },
      include: {
        options: true,
        categories: {
          include: categoriesWithRelations,
        },
        questions: true,
        sessions: {
          where: { NOT: { status: SessionStatus.ARCHIVED } },
        },
        _count: {
          select: { sessions: true, questions: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async get(id: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        options: true,
        categories: {
          include: {
            questions: {
              include: { choices: true },
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException("Quiz not found");
    }

    return quiz;
  }

  async create(dto: CreateQuizDto, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException("Invalid user");
    }

    return this.prisma.quiz.create({
      data: {
        title: dto.title,
        status: dto.status,
        createdById: userId,
        ...(dto.options && {
          options: { create: dto.options },
        }),
      },
      include: {
        options: true,
        categories: {
          include: {
            questions: {
              include: { choices: true },
              orderBy: { orderIndex: "asc" },
            },
          },
        },
      },
    });
  }

  async update(id: number, dto: UpdateQuizDto) {
    const existing = await this.prisma.quiz.findUnique({ where: { id } });
    if (!existing) {
      throw new NotFoundException("Quiz not found");
    }

    return this.prisma.quiz.update({
      where: { id },
      data: {
        title: dto.title ?? existing.title,
        status: dto.status ?? existing.status,
        ...(dto.options && {
          options: {
            upsert: {
              create: dto.options,
              update: dto.options,
            },
          },
        }),
      },
    });
  }

  async remove(id: number) {
    await this.get(id);
    return this.prisma.quiz.delete({ where: { id } });
  }

  async import(dto: ImportQuizDto, userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new BadRequestException("Invalid user");

    return this.prisma.$transaction(async (tx) => {
      const quiz = await tx.quiz.create({
        data: { title: dto.title, createdById: userId },
      });

      for (const [catIdx, cat] of dto.categories.entries()) {
        const category = await tx.category.create({
          data: { name: cat.name, quizId: quiz.id, orderIndex: catIdx },
        });

        for (const [qIdx, q] of cat.questions.entries()) {
          await tx.question.create({
            data: {
              prompt: q.prompt,
              timeLimitSec: q.timeLimitSec ?? null,
              points: q.points ?? 1000,
              orderIndex: qIdx,
              quizId: quiz.id,
              categoryId: category.id,
              choices: {
                create: q.choices.map((c) => ({
                  text: c.text,
                  isCorrect: c.isCorrect,
                })),
              },
            },
          });
        }
      }

      return tx.quiz.findUnique({
        where: { id: quiz.id },
        include: {
          options: true,
          categories: {
            include: {
              questions: {
                include: { choices: true },
                orderBy: { orderIndex: "asc" },
              },
            },
          },
        },
      });
    });
  }
}
