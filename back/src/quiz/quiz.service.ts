import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateQuizDto } from "./dto/create-quiz.dto";
import { UpdateQuizDto } from "./dto/update-quiz.dto";

@Injectable()
export class QuizService {
  constructor(private readonly prisma: PrismaService) {}

  list(userId: number) {
    return this.prisma.quiz.findMany({
      where: { createdById: userId },
      include: {
        questions: {
          include: { choices: true },
          orderBy: { orderIndex: "asc" },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async get(id: number) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id },
      include: {
        questions: {
          include: { choices: true },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!quiz) {
      throw new NotFoundException("Quiz not found");
    }

    return quiz;
  }

  async create(dto: CreateQuizDto, userId: number) {
    if (!dto.questions.length) {
      throw new BadRequestException("At least one question is required");
    }

    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new BadRequestException("Invalid user");
    }

    return this.prisma.quiz.create({
      data: {
        title: dto.title,
        status: dto.status,
        createdById: userId,
        questions: {
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
        },
      },
      include: {
        questions: {
          include: { choices: true },
          orderBy: { orderIndex: "asc" },
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
      },
    });
  }

  async remove(id: number) {
    await this.get(id);
    return this.prisma.quiz.delete({ where: { id } });
  }
}
