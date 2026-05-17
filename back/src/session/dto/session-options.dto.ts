import { IsBoolean, IsOptional } from "class-validator";

export class SessionOptionsDto {
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
