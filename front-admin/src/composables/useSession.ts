import { ref } from "vue";
import { useAuth } from "./useAuth";
import { Session, SessionState } from "../types/Session.types";

const activeSession = ref<Session | null>(null);
const sessionState = ref<SessionState | null>(null);
const error = ref("");

export const useSession = () => {
  const { apiFetch } = useAuth();

  /*
   * API
   */
  const createSession = async (quizId: number) => {
    error.value = "";
    try {
      const data = await apiFetch("/api/sessions", {
        method: "POST",
        body: JSON.stringify({ quizId }),
      });
      activeSession.value = data.session as Session;
      sessionState.value = data.state as SessionState;
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to create session";
      throw err;
    }
  };

  const getSessionState = async (code: string) => {
    error.value = "";
    try {
      const data = await apiFetch(`/api/sessions/${code}/state`);
      sessionState.value = data.state as SessionState;
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch session state";
      throw err;
    }
  };

  const getActiveSessions = async () => {
    error.value = "";
    try {
      const data = await apiFetch(`/api/sessions/active`);
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Failed to fetch active session";
      throw err;
    }
  };

  /*
   * End API
   */

  const changeActiveSession = (session: Session | null) => {
    activeSession.value = session;
    if (session) {
      getSessionState(session.code);
    } else {
      sessionState.value = null;
    }
  };

  const performAction = async (action: "start" | "next" | "reveal" | "end") => {
    if (!activeSession.value) return;
    error.value = "";
    try {
      const data = await apiFetch(
        `/api/sessions/${activeSession.value.code}/${action}`,
        { method: "POST" },
      );
      sessionState.value = data.state as SessionState;
      if (action === "end") {
        activeSession.value = null;
      }
      return data;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : `Failed to ${action} session`;
      throw err;
    }
  };

  return {
    // State
    activeSession,
    sessionState,
    error,
    // Methods
    createSession,
    performAction,
    getActiveSessions,
    changeActiveSession,
  };
};
