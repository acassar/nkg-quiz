import type {
  AnswerResult,
  LiveStats,
  SessionState,
} from "@nkg-quiz/shared-types";
import type {
  C2S_EVENTS,
  S2C_EVENTS,
  SOCKET_LIFECYCLE_EVENTS,
} from "./events.js";

// ─── Exhaustiveness guards ────────────────────────────────────────────────────
type AssertAllC2SEventsCovered<
  T extends Record<(typeof C2S_EVENTS)[keyof typeof C2S_EVENTS], unknown>,
> = T;
type AssertAllS2CEventsCovered<
  T extends Record<(typeof S2C_EVENTS)[keyof typeof S2C_EVENTS], unknown>,
> = T;
type AssertAllLifecycleEventsCovered<
  T extends Record<
    (typeof SOCKET_LIFECYCLE_EVENTS)[keyof typeof SOCKET_LIFECYCLE_EVENTS],
    unknown
  >,
> = T;

// ─── Payload maps ─────────────────────────────────────────────────────────────

export type ClientToServerEventPayloads = AssertAllC2SEventsCovered<{
  [C2S_EVENTS.JOIN_SESSION]: { code: string; playerId?: number };
  [C2S_EVENTS.PLAYER_ANSWER]: {
    code: string;
    playerId: number;
    questionId: number;
    choiceId: number;
  };
  [C2S_EVENTS.PLAYER_COMPLETE]: { code: string; playerId: number };
  [C2S_EVENTS.SCREEN_ADVANCE]: { code: string };
  [C2S_EVENTS.SCREEN_REVEAL]: { code: string };
  [C2S_EVENTS.SCREEN_END]: { code: string };
  [C2S_EVENTS.ADMIN_ADVANCE]: { code: string };
  [C2S_EVENTS.ADMIN_REVEAL]: { code: string };
  [C2S_EVENTS.ADMIN_END]: { code: string };
}>;

export type ServerToClientEventPayloads = AssertAllS2CEventsCovered<{
  [S2C_EVENTS.SESSION_JOINED]: SessionState & {
    playerAnswers: Record<number, number>;
  };
  [S2C_EVENTS.SESSION_NOT_FOUND]: void;
  [S2C_EVENTS.SESSION_STATE]: SessionState;
  [S2C_EVENTS.SESSION_END]: SessionState;
  [S2C_EVENTS.QUESTION_SHOW]: unknown;
  [S2C_EVENTS.ANSWER_REVEAL]: { ok: true };
  [S2C_EVENTS.ANSWER_RECEIVED]: { playerId: number };
  [S2C_EVENTS.ANSWER_RESULT]: AnswerResult;
  [S2C_EVENTS.PLAYER_COMPLETED]: { playerId: number; nickname: string };
  [S2C_EVENTS.LIVE_STATS]: LiveStats;
}>;

export type LifecycleEventPayloads = AssertAllLifecycleEventsCovered<{
  [SOCKET_LIFECYCLE_EVENTS.CONNECT]: void;
  [SOCKET_LIFECYCLE_EVENTS.DISCONNECT]: string;
  [SOCKET_LIFECYCLE_EVENTS.CONNECT_ERROR]: Error;
}>;

// ─── Derived key unions ───────────────────────────────────────────────────────

export type ClientToServerEvent = keyof ClientToServerEventPayloads;
export type ServerToClientEvent = keyof ServerToClientEventPayloads;
export type LifecycleEvent = keyof LifecycleEventPayloads;

export type RegisterableEvent = ServerToClientEvent | LifecycleEvent;
export type RegisterableEventPayloads = ServerToClientEventPayloads &
  LifecycleEventPayloads;

// ─── Socket abstraction ───────────────────────────────────────────────────────

export type SocketConnectOptions = {
  transports?: string[];
  autoConnect?: boolean;
  query?: Record<string, string | number | boolean>;
};

export interface SocketConnection {
  connected: boolean;
  on(event: string, callback: (...args: unknown[]) => void): SocketConnection;
  emit(event: string, payload?: unknown): SocketConnection;
  disconnect(): SocketConnection;
}

export type SocketConnector = (
  url: string,
  options?: SocketConnectOptions,
) => SocketConnection;

export type SocketClientOptions = {
  url: string;
  connector: SocketConnector;
  connectOptions?: SocketConnectOptions;
  sessionCode?: string;
  autoJoinSessionOnConnect?: boolean;
};

export type SocketIoClientOptions = Omit<SocketClientOptions, "connector">;

export type Unsubscribe = () => void;
