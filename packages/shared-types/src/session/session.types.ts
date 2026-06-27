import { Question } from "../question/question.types";

export type SESSION_STATUS =
  | "LOBBY"
  | "RUNNING"
  | "REVEAL"
  | "ENDED"
  | "RESTARTING"
  | "ARCHIVED";

export type SESSION_MODE = "SCREEN" | "ADMIN" | "BACK" | "AUTONOMOUS";

export type SessionOptions = {
  mode: SESSION_MODE;
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
  mode: SESSION_MODE;
  currentQuestionIndex: number | null;
  nextActionAt: number | null;
};

export type SessionAction = "start" | "next" | "reveal" | "end" | "restart" | "archive";

export type CreateSessionResponse = {
  session: Session;
  state: SessionState;
};

export type AnswerResult = {
  answerId: number;
  isCorrect: boolean;
  correctChoiceId: number;
  points: number;
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
  score: number;
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
