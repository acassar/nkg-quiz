import { Question, QuestionInput } from "@/types/question/question.types";
import { apiFetch } from "../fetcher";

const questionEndpoint = "/questions";

export const questionFetcher = {
  getQuestions: async (categoryId: string) => {
    return apiFetch<Question[]>(`${questionEndpoint}?categoryId=${categoryId}`);
  },
  getQuestion: async (id: string) => {
    return apiFetch<Question>(`${questionEndpoint}/${id}`);
  },
  createQuestion: async (questionData: QuestionInput) => {
    return apiFetch<Question>(questionEndpoint, {
      method: "POST",
      body: JSON.stringify(questionData),
    });
  },
  updateQuestion: async (id: string, questionData: QuestionInput) => {
    return apiFetch<Question>(`${questionEndpoint}/${id}`, {
      method: "PUT",
      body: JSON.stringify(questionData),
    });
  },
  deleteQuestion: async (id: string) => {
    return apiFetch<Question>(`${questionEndpoint}/${id}`, {
      method: "DELETE",
    });
  },
};
