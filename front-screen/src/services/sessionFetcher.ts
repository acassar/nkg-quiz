import { apiFetch } from "@nkg-quiz/shared-fetcher";
import { Quiz, SessionState } from "@nkg-quiz/shared-types";
import type { PlayerResult } from "../types/results.types";

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
  getResults: async (code: string) => {
    return apiFetch<{ results: PlayerResult[] }>(
      `${sessionEndpoint}/${code}/results`,
    );
  },
};
