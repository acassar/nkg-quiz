import { Quiz } from "@/types/Quiz.types";
import { apiFetch } from "../fetcher";

const quizEndpoint = "/quizzes";

export const quizFetcher = {
  getQuizzes: async () => {
    return apiFetch<Quiz[]>(quizEndpoint);
  },
  getQuiz: async (id: string) => {
    return apiFetch<Quiz>(`${quizEndpoint}/${id}`);
  },
  createQuiz: async (quizData: Partial<Quiz>) => {
    return apiFetch<Quiz>(quizEndpoint, {
      method: "POST",
      body: JSON.stringify(quizData),
    });
  },
  updateQuiz: async (id: string, quizData: Partial<Quiz>) => {
    return apiFetch<Quiz>(`${quizEndpoint}/${id}`, {
      method: "PUT",
      body: JSON.stringify(quizData),
    });
  },
  deleteQuiz: async (id: string) => {
    return apiFetch<void>(`${quizEndpoint}/${id}`, {
      method: "DELETE",
    });
  },
};
