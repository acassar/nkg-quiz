import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateChoiceDto } from "./dto/create-choice.dto";
import { UpdateChoiceDto } from "./dto/update-choice.dto";

@Injectable()
export class ChoiceService {
  constructor(private readonly prisma: PrismaService) {}

  async get(id: number) {
    const choice = await this.prisma.choice.findUnique({
      where: { id },
    });

    if (!choice) {
      throw new NotFoundException("Choice not found");
    }

    return choice;
  }

  async listByQuestion(questionId: number) {
    return this.prisma.choice.findMany({
      where: { questionId },
    });
  }

  async create(questionId: number, dto: CreateChoiceDto) {
    const question = await this.prisma.question.findUnique({
      where: { id: questionId },
    });

    if (!question) {
      throw new NotFoundException("Question not found");
    }

    return this.prisma.choice.create({
      data: {
        text: dto.text,
        isCorrect: dto.isCorrect ?? false,
        questionId,
      },
    });
  }

  async update(id: number, dto: UpdateChoiceDto) {
    const choice = await this.prisma.choice.findUnique({
      where: { id },
    });

    if (!choice) {
      throw new NotFoundException("Choice not found");
    }

    return this.prisma.choice.update({
      where: { id },
      data: {
        text: dto.text,
        isCorrect: dto.isCorrect,
      },
    });
  }

  async remove(id: number) {
    const choice = await this.prisma.choice.findUnique({
      where: { id },
    });

    if (!choice) {
      throw new NotFoundException("Choice not found");
    }

    return this.prisma.choice.delete({
      where: { id },
    });
  }
}
