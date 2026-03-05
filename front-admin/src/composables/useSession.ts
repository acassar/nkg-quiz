import { ref } from "vue";
import {
  Session,
  SessionAction,
  SessionState,
} from "../types/session/session.types";
import { useSessionFetcher } from "./fetcher/session/useSessionFetcher";

const activeSession = ref<Session | undefined>(undefined);
const activeSessions = ref<Session[]>([]);
const sessionState = ref<SessionState | undefined>(undefined);

export const useSession = () => {
  const {
    getSessionState: getSessionStateFetcher,
    performAction: performActionFetcher,
    getActiveSessions: getActiveSessionsFetcher,
    createSession: createSessionFetcher,
  } = useSessionFetcher();

  const changeActiveSession = async (session: Session | null) => {
    activeSession.value = session ?? undefined;
    if (session) {
      const sessionData = await getSessionStateFetcher.execute(session?.code);
      sessionState.value = sessionData?.state;
    } else {
      sessionState.value = undefined;
    }
  };

  const createSession = async (quizId: number) => {
    const data = await createSessionFetcher.execute(quizId);
    activeSession.value = data?.session;
    sessionState.value = data?.state;
    return data;
  };

  const getActiveSessions = async () => {
    const data = await getActiveSessionsFetcher.execute();
    activeSessions.value = data ?? [];
  };

  const performAction = async (action: SessionAction) => {
    if (!activeSession.value) return;

    const data = await performActionFetcher.execute(
      activeSession.value.code,
      action,
    );
    sessionState.value = data?.state;

    if (action === "archive") {
      activeSession.value = undefined;
      sessionState.value = undefined;
      getActiveSessions();
    }

    return data;
  };

  return {
    // State
    activeSession,
    activeSessions,
    sessionState,
    // Methods
    createSession,
    performAction,
    getActiveSessions,
    changeActiveSession,
  };
};
