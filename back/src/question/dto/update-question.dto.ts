import { Type } from "class-transformer";
import {
  IsArray,
  IsInt,
  IsOptional,
  IsString,
  Min,
  ValidateNested,
} from "class-validator";
import { UpdateChoiceDto } from "../../choice/dto/update-choice.dto";

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  prompt?: string;

  @IsArray()
  @Type(() => UpdateChoiceDto)
  @ValidateNested({ each: true })
  @IsOptional()
  choices?: UpdateChoiceDto[];

  @IsOptional()
  @IsInt()
  @Min(1)
  timeLimitSec?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  points?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  orderIndex?: number;
}
