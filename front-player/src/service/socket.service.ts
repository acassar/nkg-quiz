import {
  createSocketIoClient,
  C2S_EVENTS,
  S2C_EVENTS,
  SOCKET_LIFECYCLE_EVENTS,
} from "@nkg-quiz/shared-socket";
import { useSessionState } from "../composable/useSessionState";
import type { SessionState } from "@nkg-quiz/shared-types";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";
const wsBase = import.meta.env.VITE_WS_URL || apiBase;

const socketClient = createSocketIoClient({
  url: wsBase,
  autoJoinSessionOnConnect: true,
});

socketClient.register(SOCKET_LIFECYCLE_EVENTS.CONNECT, () => {
  console.log("Connected to socket server");
});

socketClient.register(SOCKET_LIFECYCLE_EVENTS.DISCONNECT, () => {
  console.log("Disconnected from socket server");
  useSessionState().setStatus("disconnected");
});

socketClient.register(SOCKET_LIFECYCLE_EVENTS.CONNECT_ERROR, () => {
  console.error("Socket connection error");
  useSessionState().setStatus("error");
});

socketClient.register(S2C_EVENTS.SESSION_NOT_FOUND, () => {
  console.log("Session not found");
  useSessionState().setStatus("session not found");
});

socketClient.register(S2C_EVENTS.SESSION_JOINED, (payload) => {
  console.log("Joined session");
  useSessionState().updateState(payload as SessionState);
  useSessionState().setStatus(
    payload.status === "ENDED" ? "ended" : "connected",
  );
});

socketClient.register(S2C_EVENTS.SESSION_STATE, (payload) => {
  useSessionState().updateState(payload as SessionState);
  useSessionState().setStatus(
    payload.status === "ENDED" ? "ended" : "connected",
  );
});

socketClient.register(S2C_EVENTS.SESSION_END, (payload) => {
  useSessionState().updateState(payload as SessionState);
  useSessionState().setStatus("ended");
});

export const connectSocket = (sessionCode: string) => {
  if (!sessionCode) return;

  // Avoid reconnecting if already connected to the same session
  if (
    socketClient.isConnected() &&
    useSessionState().sessionCode.value === sessionCode
  ) {
    return;
  }

  useSessionState().sessionCode.value = sessionCode;
  useSessionState().setStatus("joining");

  socketClient.connect(sessionCode);
};

export const disconnectSocket = () => {
  socketClient.disconnect();
  useSessionState().sessionCode.value = undefined;
  useSessionState().setStatus("disconnected");
};

export const sendAnswer = (props: {
  questionId: number;
  playerId: number;
  choiceId: number;
  sessionCode: string;
}) => {
  if (!socketClient.isConnected()) {
    console.error("Cannot submit answer: not connected to socket server");
    return;
  }
  socketClient.emit(C2S_EVENTS.PLAYER_ANSWER, {
    code: props.sessionCode,
    playerId: props.playerId,
    questionId: props.questionId,
    choiceId: props.choiceId,
  });
};

// Clean up on page change/refresh
window.addEventListener("beforeunload", () => {
  socketClient.disconnect();
});
