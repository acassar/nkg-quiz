import { useFetcher } from "@nkg-quiz/shared-fetcher";
import { sessionFetcher } from "../service/session.fetcher";

export function useSessionFetcher() {
  const joinSession = useFetcher(sessionFetcher.joinSession);

  const getQuiz = useFetcher(sessionFetcher.getQuiz);

  const getState = useFetcher(sessionFetcher.getState);

  const getResults = useFetcher(sessionFetcher.getResults);

  return { joinSession, getQuiz, getState, getResults };
}
