import type { Session, SessionAction } from "@nkg-quiz/shared-types";
import { useSessionFetcher } from "./fetcher/session/useSessionFetcher";
import {
  connectAdminSocket,
  disconnectAdminSocket,
} from "../services/socket.service";
import {
  activeSession,
  activeSessionOptions,
  activeSessions,
  sessionState,
} from "../state/session.state";

export const useSession = () => {
  const {
    getSessionState: getSessionStateFetcher,
    performAction: performActionFetcher,
    getActiveSessions: getActiveSessionsFetcher,
    createSession: createSessionFetcher,
    getOptions: getOptionsFetcher,
  } = useSessionFetcher();

  const changeActiveSession = async (session: Session | null) => {
    activeSession.value = session ?? undefined;
    if (session) {
      const [sessionData, optionsData] = await Promise.all([
        getSessionStateFetcher.execute(session.code),
        getOptionsFetcher.execute(session.code),
      ]);
      sessionState.value = sessionData?.state;
      activeSessionOptions.value = optionsData?.options;
      connectAdminSocket(session.code);
    } else {
      sessionState.value = undefined;
      activeSessionOptions.value = undefined;
      disconnectAdminSocket();
    }
  };

  const createSession = async (quizId: number) => {
    const data = await createSessionFetcher.execute(quizId);
    activeSession.value = data?.session;
    sessionState.value = data?.state;
    if (data?.session) {
      const optionsData = await getOptionsFetcher.execute(data.session.code);
      activeSessionOptions.value = optionsData?.options;
      connectAdminSocket(data.session.code);
    }
    return data;
  };

  const getActiveSessions = async () => {
    const data = await getActiveSessionsFetcher.execute();
    activeSessions.value = data ?? [];
  };

  const performAction = async (action: SessionAction, body?: Record<string, unknown>) => {
    if (!activeSession.value) return;

    const data = await performActionFetcher.execute(
      activeSession.value.code,
      action,
      body,
    );
    sessionState.value = data?.state;

    if (action === "archive") {
      disconnectAdminSocket();
      activeSession.value = undefined;
      sessionState.value = undefined;
      activeSessionOptions.value = undefined;
      getActiveSessions();
    }

    return data;
  };

  return {
    // State
    activeSession,
    activeSessions,
    sessionState,
    activeSessionOptions,
    // Methods
    createSession,
    performAction,
    getActiveSessions,
    changeActiveSession,
  };
};
