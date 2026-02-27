import { sessionFetcher } from "@/services/fetcher/session/sessionFetcher";
import {
  CreateSessionResponse,
  Session,
  SessionAction,
  SessionState,
} from "@/types/session/session.types";
import { useFetcher } from "../useFetcher";

export function useSessionFetcher() {
  const createSession = useFetcher<CreateSessionResponse, [number]>(
    sessionFetcher.createSession,
  );
  const getSessionState = useFetcher<SessionState, [string]>(
    sessionFetcher.getSessionState,
  );
  const getActiveSessions = useFetcher<Session[], []>(
    sessionFetcher.getActiveSessions,
  );
  const performAction = useFetcher<SessionState, [string, SessionAction]>(
    sessionFetcher.performAction,
  );

  return {
    createSession,
    getSessionState,
    getActiveSessions,
    performAction,
  };
}
