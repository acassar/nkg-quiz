import {
  createSocketIoClient,
  S2C_EVENTS,
  SOCKET_LIFECYCLE_EVENTS,
} from "@nkg-quiz/shared-socket";
import type { SessionState } from "../types/session/session.types";
import { ref } from "vue";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";
const wsBase = import.meta.env.VITE_WS_URL || apiBase;

const socketClient = createSocketIoClient({
  url: wsBase,
  autoJoinSessionOnConnect: true,
});

/** Reactive counter of answers received for the current question. */
export const answersCount = ref(0);

/**
 * Holds the external setter injected by useSession so the socket service
 * can update sessionState without importing the composable (avoids circular deps).
 */
let sessionStateSetter: ((state: SessionState) => void) | null = null;

/**
 * Called once by useSession to wire up the state bridge.
 */
export const setAdminSessionStateSetter = (
  setter: (state: SessionState) => void,
) => {
  sessionStateSetter = setter;
};

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
  console.log("[admin-socket] Joined session");
  if (sessionStateSetter) {
    sessionStateSetter(payload as SessionState);
  }
});

socketClient.register(S2C_EVENTS.SESSION_STATE, (payload) => {
  if (sessionStateSetter) {
    sessionStateSetter(payload as SessionState);
  }

  // A SESSION_STATE event means a state transition (new question, status change, etc.)
  // Reset the answers counter so it reflects only the current question
  answersCount.value = 0;
});

socketClient.register(S2C_EVENTS.SESSION_END, (payload) => {
  if (sessionStateSetter) {
    sessionStateSetter(payload as SessionState);
  }
});

socketClient.register(S2C_EVENTS.ANSWER_RECEIVED, () => {
  answersCount.value++;
});

// ─── Public API ──────────────────────────────────────────────────────────────

export const connectAdminSocket = (sessionCode: string) => {
  if (!sessionCode) return;

  // Reset answers count on every new connection
  answersCount.value = 0;

  socketClient.connect(sessionCode);
};

export const disconnectAdminSocket = () => {
  socketClient.disconnect();
  answersCount.value = 0;
};

// Clean up on page change / refresh
window.addEventListener("beforeunload", () => {
  socketClient.disconnect();
});
