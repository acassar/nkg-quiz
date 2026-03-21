import { apiFetch } from "@nkg-quiz/shared-fetcher";
import { Quiz, SessionState } from "@nkg-quiz/shared-types";

const sessionEndpoint = "/sessions";

export const sessionFetcher = {
  joinSession: async (code: string, nickname: string, playerId?: string) => {
    return apiFetch<{ playerId: string }>(`${sessionEndpoint}/${code}/join`, {
      method: "POST",
      body: JSON.stringify({ nickname: nickname, playerId: playerId }),
    });
  },
  getQuiz: async (code: string) => {
    return apiFetch<Quiz>(`${sessionEndpoint}/${code}/quiz`);
  },
  getState: async (code: string) => {
    return apiFetch<{ state: SessionState }>(
      `${sessionEndpoint}/${code}/state`,
    );
  },
};
