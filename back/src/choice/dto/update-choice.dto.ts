import { IsBoolean, IsNumber, IsOptional, IsString } from "class-validator";

export class UpdateChoiceDto {
  @IsNumber()
  id!: number;

  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}
