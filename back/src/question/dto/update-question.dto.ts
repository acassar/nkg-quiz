import { IsInt, IsOptional, IsString, Min } from "class-validator";

export class UpdateQuestionDto {
  @IsOptional()
  @IsString()
  prompt?: string;

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
