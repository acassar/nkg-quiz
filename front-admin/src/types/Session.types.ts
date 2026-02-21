export type SESSION_STATUS = "LOBBY" | "RUNNING" | "REVEAL" | "ENDED";

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
};
