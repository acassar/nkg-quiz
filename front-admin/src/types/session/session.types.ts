export type SESSION_STATUS =
  | "LOBBY"
  | "RUNNING"
  | "REVEAL"
  | "ENDED"
  | "RESTARTING"
  | "ARCHIVED";

export type SessionOptions = {
  autoRestart: boolean;
  revealAnswers: boolean;
  showLeaderboard: boolean;
  showScores: boolean;
  showFullRanking: boolean;
};

export type Session = {
  id: number;
  quizId: number;
  code: string;
  status: SESSION_STATUS;
  options?: SessionOptions | null;
};

export type SessionState = {
  code: string;
  status: SESSION_STATUS;
  currentQuestionIndex: number | null;
  restartAt?: string | null;
};

export type SessionAction =
  | "start"
  | "next"
  | "reveal"
  | "end"
  | "restart"
  | "archive";

export type CreateSessionResponse = {
  session: Session;
  state: SessionState;
};

export type SessionStateResponse = {
  state: SessionState;
};

export type { LiveStatsPlayer, LiveStats } from "@nkg-quiz/shared-types";
