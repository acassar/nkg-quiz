import { useFetcher } from "@nkg-quiz/shared-fetcher";
import { Quiz, SessionState } from "@nkg-quiz/shared-types";
import { sessionFetcher } from "../services/sessionFetcher";
import type { PlayerResult } from "../types/results.types";

export const useSessionFetcher = () => {
  const getQuiz = useFetcher<Quiz, [string]>(sessionFetcher.getQuiz);
  const nextQuestion = useFetcher<SessionState, [string]>(
    sessionFetcher.nextQuestion,
  );
  const getResults = useFetcher<{ results: PlayerResult[] }, [string]>(
    sessionFetcher.getResults,
  );

  return { getQuiz, nextQuestion, getResults };
};
