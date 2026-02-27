import { Category } from "@/types/category/category.types";
import { apiFetch } from "../fetcher";

const categoryEndpoint = "/categories";

export const categoryFetcher = {
  getCategories: async (quizId: string) => {
    return apiFetch<Category[]>(`${categoryEndpoint}?quizId=${quizId}`);
  },
  getCategory: async (id: string) => {
    return apiFetch<Category>(`${categoryEndpoint}/${id}`);
  },
  createCategory: async (categoryData: Category) => {
    return apiFetch<Category>(categoryEndpoint, {
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
