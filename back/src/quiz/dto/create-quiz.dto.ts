import { Type } from "class-transformer";
import { IsBoolean, IsEnum, IsOptional, IsString, ValidateNested } from "class-validator";
import { QuizStatus, SessionMode } from "@prisma/client";

export class QuizOptionsDto {
  @IsEnum(SessionMode)
  @IsOptional()
  defaultMode: SessionMode = SessionMode.SCREEN;

  @IsBoolean()
  @IsOptional()
  autoRestart: boolean = false;

  @IsBoolean()
  @IsOptional()
  revealAnswers: boolean = false;

  @IsBoolean()
  @IsOptional()
  showLeaderboard: boolean = true;

  @IsBoolean()
  @IsOptional()
  showScores: boolean = true;

  @IsBoolean()
  @IsOptional()
  showFullRanking: boolean = true;
}

export class CreateQuizDto {
  @IsString()
  title!: string;

  @IsEnum(QuizStatus)
  @IsOptional()
  status: QuizStatus = QuizStatus.DRAFT;

  @ValidateNested()
  @Type(() => QuizOptionsDto)
  options!: QuizOptionsDto;
}

