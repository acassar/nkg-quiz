import { apiFetch, Quiz, SessionState } from "@nkg-quiz/shared-fetcher";

const sessionEndpoint = "/sessions";

export const sessionFetcher = {
  getQuiz: async (code: string) => {
    return apiFetch<Quiz>(`${sessionEndpoint}/${code}/quiz`);
  },
  nextQuestion: async (code: string) => {
    return apiFetch<SessionState>(`${sessionEndpoint}/${code}/next`, {
      method: "POST",
    });
  },
};
