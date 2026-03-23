import {
  createSocketIoClient,
  S2C_EVENTS,
  SOCKET_LIFECYCLE_EVENTS,
} from "@nkg-quiz/shared-socket";
import { useSessionState } from "../composables/useSessionState";
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
  useSessionState().updateState(payload);
  useSessionState().setStatus("connected");
});

socketClient.register(S2C_EVENTS.ANSWER_RECEIVED, () => {
  useSessionState().incrementAnswersCount();
});

socketClient.register(S2C_EVENTS.SESSION_STATE, (payload) => {
  useSessionState().updateState(payload as SessionState);
  useSessionState().setRestartCountdown(null);
});

socketClient.register(S2C_EVENTS.SESSION_END, (payload) => {
  useSessionState().updateState(payload as SessionState);
});

socketClient.register(S2C_EVENTS.SESSION_RESTARTING, (payload) => {
  useSessionState().setRestartCountdown(payload.countdownSec);
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
  useSessionState().setStatus("connecting");
  useSessionState().resetAnswersCount();

  socketClient.connect(sessionCode);
};

export const disconnectSocket = () => {
  socketClient.disconnect();
  useSessionState().sessionCode.value = undefined;
  useSessionState().setStatus("disconnected");
};

export const isConnected = () => {
  return socketClient.isConnected();
};

// Clean up on page change/refresh
window.addEventListener("beforeunload", () => {
  socketClient.disconnect();
});
