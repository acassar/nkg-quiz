import { sessionFetcher } from "@/services/fetcher/session/sessionFetcher";
import type {
  CreateSessionResponse,
  LiveStats,
  Session,
  SessionAction,
  SessionOptions,
  SessionStateResponse,
} from "@nkg-quiz/shared-types";
import { useFetcher } from "../useFetcher";

export function useSessionFetcher() {
  const createSession = useFetcher<CreateSessionResponse, [number, SessionOptions?]>(
    sessionFetcher.createSession,
  );
  const getSessionState = useFetcher<SessionStateResponse, [string]>(
    sessionFetcher.getSessionState,
  );
  const getActiveSessions = useFetcher<Session[], []>(
    sessionFetcher.getActiveSessions,
  );
  const performAction = useFetcher<
    SessionStateResponse,
    [string, SessionAction, Record<string, unknown>?]
  >(sessionFetcher.performAction);
  const getLiveStats = useFetcher<LiveStats, [string]>(
    sessionFetcher.getLiveStats,
  );

  return {
    createSession,
    getSessionState,
    getActiveSessions,
    performAction,
    getLiveStats,
  };
}
