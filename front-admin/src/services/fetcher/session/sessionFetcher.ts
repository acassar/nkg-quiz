import { apiFetch } from "../fetcher";
import {
  CreateSessionResponse,
  Session,
  SessionAction,
  SessionState,
} from "@/types/Session.types";

const sessionEndpoint = "/sessions";

export const sessionFetcher = {
  getActiveSessions: async () => {
    return apiFetch<Session[]>(`${sessionEndpoint}/active`);
  },
  getSessionState: async (id: string) => {
    return apiFetch<SessionState>(`${sessionEndpoint}/${id}/state`);
  },
  createSession: async (quizId: number) => {
    return apiFetch<CreateSessionResponse>(sessionEndpoint, {
      method: "POST",
      body: JSON.stringify({ quizId }),
    });
  },
  performAction: async (code: string, action: SessionAction) => {
    return apiFetch<SessionState>(`${sessionEndpoint}/${code}/${action}`, {
      method: "POST",
    });
  },
};
