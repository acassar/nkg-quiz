import { useFetcher } from "@nkg-quiz/shared-fetcher";
import { Quiz, SessionState } from "@nkg-quiz/shared-types";
import { sessionFetcher } from "../services/sessionFetcher";

export const useSessionFetcher = () => {
  const getQuiz = useFetcher<Quiz, [string]>(sessionFetcher.getQuiz);
  const nextQuestion = useFetcher<SessionState, [string]>(
    sessionFetcher.nextQuestion,
  );

  return { getQuiz, nextQuestion };
};
