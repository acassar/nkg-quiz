import {
  Session,
  SessionAction,
} from "../types/session/session.types";
import { useSessionFetcher } from "./fetcher/session/useSessionFetcher";
import {
  connectAdminSocket,
  disconnectAdminSocket,
} from "../services/socket.service";
import {
  activeSession,
  activeSessions,
  sessionState,
} from "../state/session.state";

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
      connectAdminSocket(session.code);
    } else {
      sessionState.value = undefined;
      disconnectAdminSocket();
    }
  };

  const createSession = async (quizId: number) => {
    const data = await createSessionFetcher.execute(quizId);
    activeSession.value = data?.session;
    sessionState.value = data?.state;
    if (data?.session) {
      connectAdminSocket(data.session.code);
    }
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
      disconnectAdminSocket();
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
