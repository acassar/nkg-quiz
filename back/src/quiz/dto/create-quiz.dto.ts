import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from "class-validator";
import { QuizStatus } from "@prisma/client";
import { CreateQuestionDto } from "./create-question.dto";

export class CreateQuizDto {
  @IsString()
  title!: string;

  @IsEnum(QuizStatus)
  @IsOptional()
  status: QuizStatus = QuizStatus.DRAFT;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateQuestionDto)
  questions!: CreateQuestionDto[];
}
