import { sessionFetcher } from "@/services/fetcher/session/sessionFetcher";
import {
  CreateSessionResponse,
  LiveStats,
  Session,
  SessionAction,
  SessionStateResponse,
} from "@/types/session/session.types";
import { useFetcher } from "../useFetcher";

export function useSessionFetcher() {
  const createSession = useFetcher<CreateSessionResponse, [number]>(
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
