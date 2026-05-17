import { Type } from "class-transformer";
import { IsInt, IsOptional, Min, ValidateNested } from "class-validator";
import { SessionOptionsDto } from "./session-options.dto";

export class CreateSessionDto {
  @IsInt()
  @Min(1)
  quizId!: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => SessionOptionsDto)
  options?: SessionOptionsDto;
}
