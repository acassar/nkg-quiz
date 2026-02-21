import { IsEnum, IsOptional, IsString } from "class-validator";
import { QuizStatus } from "@prisma/client";

export class UpdateQuizDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(QuizStatus)
  status?: QuizStatus;
}
