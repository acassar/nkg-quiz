import { Quiz, useFetcher } from "@nkg-quiz/shared-fetcher";
import { sessionFetcher } from "../service/session.fetcher";

export function useSessionFetcher() {
  const joinSession = useFetcher<
    { playerId: string },
    [string, string, string?]
  >(sessionFetcher.joinSession);

  const getQuiz = useFetcher<Quiz, [string]>(sessionFetcher.getQuiz);

  return { joinSession, getQuiz };
}
