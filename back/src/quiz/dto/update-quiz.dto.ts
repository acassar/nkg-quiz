import { Type } from "class-transformer";
import { IsEnum, IsOptional, IsString, ValidateNested } from "class-validator";
import { QuizStatus } from "@prisma/client";
import { QuizOptionsDto } from "./create-quiz.dto";

export class UpdateQuizDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsEnum(QuizStatus)
  status?: QuizStatus;

  @IsOptional()
  @ValidateNested()
  @Type(() => QuizOptionsDto)
  options?: QuizOptionsDto;
}
