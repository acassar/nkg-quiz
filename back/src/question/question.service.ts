import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateQuestionDto } from "./dto/create-question.dto";
import { UpdateQuestionDto } from "./dto/update-question.dto";

@Injectable()
export class QuestionService {
  constructor(private readonly prisma: PrismaService) {}

  async get(id: number) {
    const question = await this.prisma.question.findUnique({
      where: { id },
      include: { choices: true },
    });

    if (!question) {
      throw new NotFoundException("Question not found");
    }

    return question;
  }

  async listByCategory(categoryId: number) {
    return this.prisma.question.findMany({
      where: { categoryId },
      include: { choices: true },
      orderBy: { orderIndex: "asc" },
    });
  }

  async create(categoryId: number, dto: CreateQuestionDto) {
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
      include: { quiz: true },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    const lastQuestion = await this.prisma.question.findFirst({
      where: { categoryId },
      orderBy: { orderIndex: "desc" },
    });

    const orderIndex =
      dto.orderIndex ?? (lastQuestion ? lastQuestion.orderIndex + 1 : 0);

    return this.prisma.question.create({
      data: {
        prompt: dto.prompt,
        timeLimitSec: dto.timeLimitSec,
        points: dto.points,
        orderIndex,
        categoryId,
        quizId: category.quizId,
        choices: {
          create: dto.choices.map((choice) => ({
            text: choice.text,
            isCorrect: choice.isCorrect ?? false,
          })),
        },
      },
      include: { choices: true },
    });
  }

  async update(id: number, dto: UpdateQuestionDto) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException("Question not found");
    }

    return this.prisma.question.update({
      where: { id },
      data: {
        prompt: dto.prompt,
        timeLimitSec: dto.timeLimitSec,
        points: dto.points,
        orderIndex: dto.orderIndex,
        choices: {
          updateMany: dto.choices?.map((choice) => ({
            where: { id: choice.id },
            data: {
              text: choice.text,
              isCorrect: choice.isCorrect ?? false,
            },
          })),
        },
      },
      include: { choices: true },
    });
  }

  async remove(id: number) {
    const question = await this.prisma.question.findUnique({
      where: { id },
    });

    if (!question) {
      throw new NotFoundException("Question not found");
    }

    return this.prisma.question.delete({
      where: { id },
      include: { choices: true },
    });
  }
}
