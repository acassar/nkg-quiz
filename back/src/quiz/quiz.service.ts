import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateQuizDto } from "./dto/create-quiz.dto";
import { UpdateQuizDto } from "./dto/update-quiz.dto";
import { IQuizService } from "./domain/port/quiz.serive.port";
import { categoriesWithRelations } from "./prisma/quizPrisma.object";

@Injectable()
export class QuizService implements IQuizService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: number) {
    return this.prisma.quiz.findMany({
      where: { createdById: userId },
      include: {
        categories: {
          include: categoriesWithRelations,
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

    // Allow creating quiz without questions initially
    const quizData: any = {
      title: dto.title,
      status: dto.status,
      createdById: userId,
    };

    if (dto.questions && dto.questions.length > 0) {
      quizData.questions = {
        create: dto.questions.map((question, index) => ({
          prompt: question.prompt,
          timeLimitSec: question.timeLimitSec,
          points: question.points,
          orderIndex: question.orderIndex ?? index,
          choices: {
            create: question.choices.map((choice) => ({
              text: choice.text,
              isCorrect: choice.isCorrect ?? false,
            })),
          },
        })),
      };
    }

    return this.prisma.quiz.create({
      data: quizData,
      include: {
        categories: {
          include: {
            questions: {
              include: { choices: true },
              orderBy: { orderIndex: "asc" },
            },
          },
        },
        questions: {
          include: { choices: true },
          orderBy: { orderIndex: "asc" },
        },
      },
    });
  }

  async createCategory(quizId: number, name: string) {
    const quiz = await this.get(quizId);
    if (!quiz) {
      throw new NotFoundException("Quiz not found");
    }

    const existing = await this.prisma.category.findFirst({
      where: { quizId, name },
    });

    if (existing) {
      throw new BadRequestException("Category already exists");
    }

    return this.prisma.category.create({
      data: {
        name,
        quizId,
      },
      include: {
        questions: {
          include: { choices: true },
          orderBy: { orderIndex: "asc" },
        },
      },
    });
  }

  async deleteCategory(categoryId: number) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return this.prisma.category.delete({
      where: { id: categoryId },
    });
  }

  async updateQuestion(questionId: number, updates: any) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException("Question not found");
    }

    return this.prisma.question.update({
      where: { id: questionId },
      data: {
        prompt: updates.prompt ?? question.prompt,
        timeLimitSec: updates.timeLimitSec ?? question.timeLimitSec,
        points: updates.points ?? question.points,
      },
      include: { choices: true },
    });
  }

  async deleteQuestion(questionId: number) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException("Question not found");
    }

    return this.prisma.question.delete({
      where: { id: questionId },
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
      },
    });
  }

  async remove(id: number) {
    await this.get(id);
    return this.prisma.quiz.delete({ where: { id } });
  }
}
