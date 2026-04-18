import { apiFetch } from "../fetcher";
import {
  CreateSessionResponse,
  Session,
  SessionAction,
  SessionStateResponse,
} from "@/types/session/session.types";

const sessionEndpoint = "/sessions";

export const sessionFetcher = {
  getActiveSessions: async () => {
    return apiFetch<Session[]>(`${sessionEndpoint}/active`);
  },
  getSessionState: async (id: string) => {
    return apiFetch<SessionStateResponse>(`${sessionEndpoint}/${id}/state`);
  },
  createSession: async (quizId: number) => {
    return apiFetch<CreateSessionResponse>(sessionEndpoint, {
      method: "POST",
      body: JSON.stringify({ quizId }),
    });
  },
  performAction: async (code: string, action: SessionAction, body?: Record<string, unknown>) => {
    return apiFetch<SessionStateResponse>(
      `${sessionEndpoint}/${code}/${action}`,
      {
        method: "POST",
        ...(body ? { body: JSON.stringify(body) } : {}),
      },
    );
  },
};
