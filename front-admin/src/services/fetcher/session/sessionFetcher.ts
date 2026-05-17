import { apiFetch } from "../fetcher";
import {
  CreateSessionResponse,
  LiveStats,
  Session,
  SessionAction,
  SessionOptions,
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
  createSession: async (quizId: number, options?: SessionOptions) => {
    return apiFetch<CreateSessionResponse>(sessionEndpoint, {
      method: "POST",
      body: JSON.stringify({ quizId, options }),
    });
  },
  performAction: async (
    code: string,
    action: SessionAction,
    body?: Record<string, unknown>,
  ) => {
    return apiFetch<SessionStateResponse>(
      `${sessionEndpoint}/${code}/${action}`,
      {
        method: "POST",
        ...(body ? { body: JSON.stringify(body) } : {}),
      },
    );
  },
  getLiveStats: async (code: string) => {
    return apiFetch<LiveStats>(`${sessionEndpoint}/${code}/live-stats`);
  },
};
