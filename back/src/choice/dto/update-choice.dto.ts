import { IsBoolean, IsOptional, IsString } from "class-validator";

export class UpdateChoiceDto {
  @IsOptional()
  @IsString()
  text?: string;

  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}
