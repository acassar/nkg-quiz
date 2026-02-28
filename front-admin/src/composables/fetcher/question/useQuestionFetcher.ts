import { useFetcher } from "../useFetcher";
import { questionFetcher } from "@/services/fetcher/question/question.fetcher.ts";

export function useQuestionFetcher() {
  const createQuestion = useFetcher(questionFetcher.createQuestion);
  const updateQuestion = useFetcher(questionFetcher.updateQuestion);
  const deleteQuestion = useFetcher(questionFetcher.deleteQuestion);

  return {
    createQuestion,
    updateQuestion,
    deleteQuestion,
  };
}
