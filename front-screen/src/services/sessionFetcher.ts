import { apiFetch, Quiz } from "@nkg-quiz/shared-fetcher";

const sessionEndpoint = "/sessions";

export const sessionFetcher = {
  getQuiz: async (code: string) => {
    return apiFetch<Quiz>(`${sessionEndpoint}/${code}/quiz`);
  },
};
