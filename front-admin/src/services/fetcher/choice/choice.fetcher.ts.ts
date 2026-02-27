import { Choice } from "@/types/choice/choice.types";
import { apiFetch } from "../fetcher";

const choiceEndpoint = "/choices";

export const choiceFetcher = {
  getChoices: async (questionId: string) => {
    return apiFetch<Choice[]>(`${choiceEndpoint}?questionId=${questionId}`);
  },
  getChoice: async (id: string) => {
    return apiFetch<Choice>(`${choiceEndpoint}/${id}`);
  },
  createChoice: async (choiceData: Choice) => {
    return apiFetch<Choice>(choiceEndpoint, {
      method: "POST",
      body: JSON.stringify(choiceData),
    });
  },
  updateChoice: async (id: string, choiceData: Partial<Choice>) => {
    return apiFetch<Choice>(`${choiceEndpoint}/${id}`, {
      method: "PUT",
      body: JSON.stringify(choiceData),
    });
  },
  deleteChoice: async (id: string) => {
    return apiFetch<Choice>(`${choiceEndpoint}/${id}`, {
      method: "DELETE",
    });
  },
};
