import { ref } from "vue";
import { useAuth } from "./useAuth";
import { Quiz, Category } from "../types/Quiz.types";
import { QuestionInput } from "../types/Question.types";

const quizzes = ref<Quiz[]>([]);
const loading = ref(false);
const error = ref("");

export const useQuiz = () => {
  const { apiFetch } = useAuth();

  const loadQuizzes = async () => {
    loading.value = true;
    error.value = "";
    try {
      const data = await apiFetch("/api/quizzes");
      quizzes.value = data as Quiz[];
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to load quizzes";
    } finally {
      loading.value = false;
    }
  };

  const createQuiz = async (formData: {
    title: string;
    status: string;
    questions?: QuestionInput[];
  }) => {
    error.value = "";
    try {
      const result = await apiFetch("/api/quizzes", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      await loadQuizzes();
      return result as Quiz;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create quiz";
      throw err;
    }
  };

  const getQuiz = async (id: number): Promise<Quiz> => {
    error.value = "";
    try {
      const data = await apiFetch(`/api/quizzes/${id}`);
      return data as Quiz;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Failed to load quiz";
      throw err;
    }
  };

  const updateQuiz = async (
    id: number,
    updates: { title?: string; status?: string },
  ) => {
    error.value = "";
    try {
      await apiFetch(`/api/quizzes/${id}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
      await loadQuizzes();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update quiz";
      throw err;
    }
  };

  const createCategory = async (
    quizId: number,
    name: string,
  ): Promise<Category> => {
    error.value = "";
    try {
      const data = await apiFetch(`/api/quizzes/${quizId}/categories`, {
        method: "POST",
        body: JSON.stringify({ name }),
      });
      return data as Category;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create category";
      throw err;
    }
  };

  const deleteCategory = async (quizId: number, categoryId: number) => {
    error.value = "";
    try {
      await apiFetch(`/api/quizzes/${quizId}/categories/${categoryId}`, {
        method: "DELETE",
      });
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete category";
      throw err;
    }
  };

  const updateQuestion = async (
    quizId: number,
    questionId: number,
    updates: { prompt?: string; timeLimitSec?: number; points?: number },
  ) => {
    error.value = "";
    try {
      await apiFetch(`/api/quizzes/${quizId}/questions/${questionId}`, {
        method: "PATCH",
        body: JSON.stringify(updates),
      });
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to update question";
      throw err;
    }
  };

  const deleteQuestion = async (quizId: number, questionId: number) => {
    error.value = "";
    try {
      await apiFetch(`/api/quizzes/${quizId}/questions/${questionId}`, {
        method: "DELETE",
      });
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to delete question";
      throw err;
    }
  };

  return {
    // State
    quizzes,
    loading,
    error,
    // Methods
    loadQuizzes,
    createQuiz,
    getQuiz,
    updateQuiz,
    createCategory,
    deleteCategory,
    updateQuestion,
    deleteQuestion,
  };
};
