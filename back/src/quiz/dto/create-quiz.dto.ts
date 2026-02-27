import { IsEnum, IsOptional, IsString } from "class-validator";
import { QuizStatus } from "@prisma/client";

export class CreateQuizDto {
  @IsString()
  title!: string;

  @IsEnum(QuizStatus)
  @IsOptional()
  status: QuizStatus = QuizStatus.DRAFT;
}
