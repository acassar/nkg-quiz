export type Session = {
  id: number;
  code: string;
  status: string;
};

export type SessionState = {
  code: string;
  status: string;
  currentQuestionIndex: number | null;
};
