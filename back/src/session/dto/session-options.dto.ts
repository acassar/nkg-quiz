import { SessionMode } from "@prisma/client";
import { IsBoolean, IsEnum, IsOptional } from "class-validator";

export class SessionOptionsDto {
  @IsEnum(SessionMode)
  @IsOptional()
  mode?: SessionMode;

  @IsBoolean()
  @IsOptional()
  autoRestart?: boolean;

  @IsBoolean()
  @IsOptional()
  revealAnswers?: boolean;

  @IsBoolean()
  @IsOptional()
  showLeaderboard?: boolean;

  @IsBoolean()
  @IsOptional()
  showScores?: boolean;

  @IsBoolean()
  @IsOptional()
  showFullRanking?: boolean;
}
