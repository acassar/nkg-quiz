import type { Question, SessionState } from "@nkg-quiz/shared-types";
import type {
  C2S_EVENTS,
  S2C_EVENTS,
  SOCKET_LIFECYCLE_EVENTS,
} from "./events.js";

// ─── Exhaustiveness guards ────────────────────────────────────────────────────
// These helper types enforce that every event defined in the event constants
// has a corresponding payload entry. Adding an event to C2S_EVENTS / S2C_EVENTS
// without updating the payload map will produce a compile-time error.

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
  [C2S_EVENTS.SCREEN_UPDATE_STATE]: {
    code: string;
    state: SessionState;
  };
  [C2S_EVENTS.SCREEN_SHOW_QUESTION]: {
    code: string;
    question: Question;
  };
  [C2S_EVENTS.SCREEN_REVEAL_ANSWER]: { code: string };
  [C2S_EVENTS.SCREEN_END_SESSION]: {
    code: string;
    finalState?: SessionState;
  };
}>;

export type ServerToClientEventPayloads = AssertAllS2CEventsCovered<{
  [S2C_EVENTS.SESSION_JOINED]: SessionState & { playerAnswers: Record<number, number> };
  [S2C_EVENTS.SESSION_NOT_FOUND]: void;
  [S2C_EVENTS.SESSION_STATE]: SessionState;
  [S2C_EVENTS.SESSION_END]: SessionState | Record<string, unknown>;
  [S2C_EVENTS.ANSWER_RECEIVED]: { playerId: number };
  [S2C_EVENTS.QUESTION_SHOW]: Question;
  [S2C_EVENTS.ANSWER_REVEAL]: { ok: true };
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

/** All events a client can listen to (S2C + socket.io lifecycle). */
export type RegisterableEvent = ServerToClientEvent | LifecycleEvent;

/** Combined payload map for all registerable events. */
export type RegisterableEventPayloads = ServerToClientEventPayloads &
  LifecycleEventPayloads;

// ─── Socket abstraction ───────────────────────────────────────────────────────

export type SocketConnectOptions = {
  transports?: string[];
  autoConnect?: boolean;
  query?: Record<string, string | number | boolean>;
};

/**
 * Minimal interface over a socket.io Socket instance.
 * Kept narrow so the client implementation can be swapped or mocked easily.
 */
export interface SocketConnection {
  connected: boolean;
  on(event: string, callback: (...args: unknown[]) => void): SocketConnection;
  emit(event: string, payload?: unknown): SocketConnection;
  disconnect(): SocketConnection;
}

/** Factory function that creates a SocketConnection from a URL and options. */
export type SocketConnector = (
  url: string,
  options?: SocketConnectOptions,
) => SocketConnection;

export type SocketClientOptions = {
  url: string;
  connector: SocketConnector;
  connectOptions?: SocketConnectOptions;
  sessionCode?: string;
  /** When true, emits join-session automatically on socket connect. */
  autoJoinSessionOnConnect?: boolean;
};

/** Same as SocketClientOptions but without the connector (provided by the factory). */
export type SocketIoClientOptions = Omit<SocketClientOptions, "connector">;

/** Function returned by `register()` to remove the listener. */
export type Unsubscribe = () => void;
