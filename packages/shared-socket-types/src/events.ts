// ─── Client-to-Server events (C2S) ───────────────────────────────────────────
export const C2S_EVENTS = {
  JOIN_SESSION: "join-session",
  PLAYER_ANSWER: "player:answer",
  PLAYER_COMPLETE: "player:complete",
  // Screen-driven mode
  SCREEN_ADVANCE: "screen:advance",
  SCREEN_REVEAL: "screen:reveal",
  SCREEN_END: "screen:end",
  // Admin-driven mode
  ADMIN_ADVANCE: "admin:advance",
  ADMIN_REVEAL: "admin:reveal",
  ADMIN_END: "admin:end",
} as const;

// ─── Server-to-Client events (S2C) ───────────────────────────────────────────
export const S2C_EVENTS = {
  SESSION_JOINED: "session:joined",
  SESSION_NOT_FOUND: "session:not-found",
  SESSION_STATE: "session:state",
  SESSION_END: "session:end",
  QUESTION_SHOW: "question:show",
  ANSWER_REVEAL: "answer:reveal",
  ANSWER_RECEIVED: "answer:received",
  ANSWER_RESULT: "answer:result",
  PLAYER_COMPLETED: "player:completed",
  LIVE_STATS: "session:live-stats",
} as const;

// ─── Socket.io lifecycle events ───────────────────────────────────────────────
export const SOCKET_LIFECYCLE_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",
} as const;
