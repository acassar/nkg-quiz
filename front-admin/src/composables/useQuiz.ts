import { ref } from "vue";
import { useAuth } from "./useAuth";
import { Quiz } from "../types/Quiz.types";
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
    questions: QuestionInput[];
  }) => {
    error.value = "";
    try {
      await apiFetch("/api/quizzes", {
        method: "POST",
        body: JSON.stringify(formData),
      });
      await loadQuizzes();
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create quiz";
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
  };
};
