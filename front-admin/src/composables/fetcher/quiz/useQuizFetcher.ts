import { quizFetcher } from "@/services/fetcher/quiz/quiz.fetcher";
import { Quiz } from "@/types/quiz/quiz.types";
import { useFetcher } from "../useFetcher";

export function useQuizFetcher() {
  const getQuizzes = useFetcher<Quiz[], []>(quizFetcher.getQuizzes);

  const getQuiz = useFetcher<Quiz, [string]>(quizFetcher.getQuiz);
  const createQuiz = useFetcher<Quiz, [Partial<Quiz>]>(quizFetcher.createQuiz);
  const updateQuiz = useFetcher<Quiz, [string, Partial<Quiz>]>(
    quizFetcher.updateQuiz,
  );
  const deleteQuiz = useFetcher<void, [string]>(quizFetcher.deleteQuiz);
  return { getQuizzes, getQuiz, createQuiz, updateQuiz, deleteQuiz };
}
