// ─── Client-to-Server events (C2S) ───────────────────────────────────────────
export const C2S_EVENTS = {
  JOIN_SESSION: "join-session",
  PLAYER_ANSWER: "player:answer",
  SCREEN_UPDATE_STATE: "screen:update-state",
  SCREEN_SHOW_QUESTION: "screen:show-question",
  SCREEN_REVEAL_ANSWER: "screen:reveal-answer",
  SCREEN_END_SESSION: "screen:end-session",
} as const;

// ─── Server-to-Client events (S2C) ───────────────────────────────────────────
export const S2C_EVENTS = {
  SESSION_JOINED: "session:joined",
  SESSION_NOT_FOUND: "session:not-found",
  SESSION_STATE: "session:state",
  SESSION_END: "session:end",
  ANSWER_RECEIVED: "answer:received",
  QUESTION_SHOW: "question:show",
  ANSWER_REVEAL: "answer:reveal",
  LIVE_STATS: "session:live-stats",
} as const;

// ─── Socket.io lifecycle events ───────────────────────────────────────────────
export const SOCKET_LIFECYCLE_EVENTS = {
  CONNECT: "connect",
  DISCONNECT: "disconnect",
  CONNECT_ERROR: "connect_error",
} as const;
