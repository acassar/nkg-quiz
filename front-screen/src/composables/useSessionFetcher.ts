import { Quiz, useFetcher } from "@nkg-quiz/shared-fetcher";
import { sessionFetcher } from "../services/sessionFetcher";

export const useSessionFetcher = () => {
  const getQuiz = useFetcher<Quiz, [string]>(sessionFetcher.getQuiz);

  return { getQuiz };
};
