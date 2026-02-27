import { IsBoolean, IsOptional, IsString } from "class-validator";

export class CreateChoiceDto {
  @IsString()
  text!: string;

  @IsOptional()
  @IsBoolean()
  isCorrect?: boolean;
}
