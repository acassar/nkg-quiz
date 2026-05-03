import { Question } from "../question/question.types";

export type SESSION_STATUS =
  | "LOBBY"
  | "RUNNING"
  | "REVEAL"
  | "ENDED"
  | "RESTARTING"
  | "ARCHIVED";

export type Session = {
  id: number;
  quizId: number;
  code: string;
  status: SESSION_STATUS;
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

export type LiveStatsPlayer = {
  playerId: number;
  nickname: string;
  totalAnswers: number;
  score: number;
  answeredCurrentQuestion: boolean;
  rank: number;
};

export type PlayerQuestionResult = {
  id: number;
  prompt: string;
  timeLimitSec: number | null;
  points: number | null;
  choices: { id: number; text: string; isCorrect: boolean }[];
  playerChoiceId: number | null;
};

export type PlayerSessionResults = {
  questions: PlayerQuestionResult[];
};

export type LiveStats = {
  code: string;
  status: SESSION_STATUS;
  currentQuestionIndex: number | null;
  currentQuestion: Question | null;
  totalPlayers: number;
  totalQuestions: number;
  players: LiveStatsPlayer[];
};
