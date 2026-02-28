import { Category, CategoryInput } from "@/types/category/category.types";
import { apiFetch } from "../fetcher";

const categoryEndpoint = "/categories";

export const categoryFetcher = {
  getCategories: async (quizId: string) => {
    return apiFetch<Category[]>(`${categoryEndpoint}/quiz/${quizId}`);
  },
  getCategory: async (id: string) => {
    return apiFetch<Category>(`${categoryEndpoint}/${id}`);
  },
  createCategory: async (quizId: string, categoryData: CategoryInput) => {
    return apiFetch<Category>(`${categoryEndpoint}/quiz/${quizId}`, {
      method: "POST",
      body: JSON.stringify(categoryData),
    });
  },
  updateCategory: async (id: string, categoryData: Partial<Category>) => {
    return apiFetch<Category>(`${categoryEndpoint}/${id}`, {
      method: "PUT",
      body: JSON.stringify(categoryData),
    });
  },
  deleteCategory: async (id: string) => {
    return apiFetch<Category>(`${categoryEndpoint}/${id}`, {
      method: "DELETE",
    });
  },
};
