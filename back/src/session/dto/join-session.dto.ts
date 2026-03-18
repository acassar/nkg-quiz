import { IsOptional, IsString, MinLength } from "class-validator";

export class JoinSessionDto {
  @IsString()
  @MinLength(2)
  nickname!: string;

  @IsString()
  @IsOptional()
  playerId?: string;
}
