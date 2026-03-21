import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional, IsString, ValidateNested } from "class-validator";
import { QuizStatus } from "@prisma/client";

export class QuizOptionsDto {
  @IsBoolean()
  @IsOptional()
  autoRestart: boolean = false;

  @IsBoolean()
  @IsOptional()
  revealAnswers: boolean = false;
}

export class CreateQuizDto {
  @IsString()
  title!: string;

  @IsEnum(QuizStatus)
  @IsOptional()
  status: QuizStatus = QuizStatus.DRAFT;

  @IsOptional()
  @ValidateNested()
  @Type(() => QuizOptionsDto)
  options?: QuizOptionsDto;
}

