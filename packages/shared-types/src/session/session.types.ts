export type SESSION_STATUS =
  | "LOBBY"
  | "RUNNING"
  | "REVEAL"
  | "ENDED"
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
