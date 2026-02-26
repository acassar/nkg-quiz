import { quizFetcher } from "@/services/fetcher/quiz/quizFetcher";
import { Quiz } from "@/types/Quiz.types";
import { ref } from "vue";

export function useQuizFetcher() {
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const quizzes = ref<Quiz[]>([]);

  const fetchQuizzes = async () => {
    try {
      error.value = null;
      isLoading.value = true;
      const response = await quizFetcher.getQuizzes();
      console.log("Fetched quizzes:", response.data);
      quizzes.value = response.data;
    } catch (e) {
      error.value = e instanceof Error ? e.message : "Failed to fetch quizzes";
    } finally {
      isLoading.value = false;
    }
  };

  return { isLoading, error, fetchQuizzes, quizzes };
}
