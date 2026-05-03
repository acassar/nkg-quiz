import { Type } from "class-transformer";
import {
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";

class ImportChoiceDto {
  @IsString()
  text!: string;

  @IsBoolean()
  isCorrect!: boolean;
}

class ImportQuestionDto {
  @IsString()
  prompt!: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitSec?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @IsArray()
  @ArrayMinSize(2)
  @ValidateNested({ each: true })
  @Type(() => ImportChoiceDto)
  choices!: ImportChoiceDto[];
}

class ImportCategoryDto {
  @IsString()
  name!: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ImportQuestionDto)
  questions!: ImportQuestionDto[];
}

export class ImportQuizDto {
  @IsString()
  title!: string;

  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => ImportCategoryDto)
  categories!: ImportCategoryDto[];
}
