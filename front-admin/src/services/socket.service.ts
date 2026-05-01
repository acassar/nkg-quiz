import {
  createSocketIoClient,
  S2C_EVENTS,
  SOCKET_LIFECYCLE_EVENTS,
} from "@nkg-quiz/shared-socket";
import { sessionState } from "../state/session.state";
import type { SessionState } from "../types/session/session.types";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";
const wsBase = import.meta.env.VITE_WS_URL || apiBase;

export const socketClient = createSocketIoClient({
  url: wsBase,
  autoJoinSessionOnConnect: true,
});

// ─── Lifecycle events ────────────────────────────────────────────────────────

socketClient.register(SOCKET_LIFECYCLE_EVENTS.CONNECT, () => {
  console.log("[admin-socket] Connected to socket server");
});

socketClient.register(SOCKET_LIFECYCLE_EVENTS.DISCONNECT, () => {
  console.log("[admin-socket] Disconnected from socket server");
});

socketClient.register(SOCKET_LIFECYCLE_EVENTS.CONNECT_ERROR, () => {
  console.error("[admin-socket] Socket connection error");
});

// ─── S2C events ──────────────────────────────────────────────────────────────

socketClient.register(S2C_EVENTS.SESSION_JOINED, (payload) => {
  sessionState.value = payload as SessionState;
});

socketClient.register(S2C_EVENTS.SESSION_STATE, (payload) => {
  sessionState.value = payload as SessionState;
});

socketClient.register(S2C_EVENTS.SESSION_END, (payload) => {
  sessionState.value = payload as SessionState;
});

// ─── Public API ──────────────────────────────────────────────────────────────

export const connectAdminSocket = (sessionCode: string) => {
  if (!sessionCode) return;
  socketClient.connect(sessionCode);
};

export const disconnectAdminSocket = () => {
  socketClient.disconnect();
};

// Clean up on page change / refresh
window.addEventListener("beforeunload", () => {
  socketClient.disconnect();
});
