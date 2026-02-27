import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateCategoryDto } from "./dto/create-category.dto";
import { UpdateCategoryDto } from "./dto/update-category.dto";

@Injectable()
export class CategoryService {
  constructor(private readonly prisma: PrismaService) {}

  async get(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
      include: {
        questions: {
          include: { choices: true },
          orderBy: { orderIndex: "asc" },
        },
      },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return category;
  }

  async listByQuiz(quizId: number) {
    return this.prisma.category.findMany({
      where: { quizId },
      include: {
        questions: {
          include: { choices: true },
          orderBy: { orderIndex: "asc" },
        },
      },
    });
  }

  async create(quizId: number, dto: CreateCategoryDto) {
    const quiz = await this.prisma.quiz.findUnique({
      where: { id: quizId },
    });

    if (!quiz) {
      throw new NotFoundException("Quiz not found");
    }

    const existing = await this.prisma.category.findFirst({
      where: { quizId, name: dto.name },
    });

    if (existing) {
      throw new BadRequestException("Category already exists");
    }

    return this.prisma.category.create({
      data: {
        name: dto.name,
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

  async update(id: number, dto: UpdateCategoryDto) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    if (dto.name) {
      const existing = await this.prisma.category.findFirst({
        where: { quizId: category.quizId, name: dto.name, id: { not: id } },
      });

      if (existing) {
        throw new BadRequestException("Category name already in use");
      }
    }

    return this.prisma.category.update({
      where: { id },
      data: {
        name: dto.name,
      },
      include: {
        questions: {
          include: { choices: true },
          orderBy: { orderIndex: "asc" },
        },
      },
    });
  }

  async remove(id: number) {
    const category = await this.prisma.category.findUnique({
      where: { id },
    });

    if (!category) {
      throw new NotFoundException("Category not found");
    }

    return this.prisma.category.delete({
      where: { id },
    });
  }
}
