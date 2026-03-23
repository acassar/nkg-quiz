import { io } from "socket.io-client";
import { C2S_EVENTS, S2C_EVENTS, SOCKET_LIFECYCLE_EVENTS } from "@nkg-quiz/shared-socket-types";
import type {
  ClientToServerEvent,
  ClientToServerEventPayloads,
  RegisterableEvent,
  RegisterableEventPayloads,
  SocketClientOptions,
  SocketConnection,
  SocketIoClientOptions,
  Unsubscribe,
} from "@nkg-quiz/shared-socket-types";

const REGISTERABLE_EVENTS: RegisterableEvent[] = [
  S2C_EVENTS.SESSION_JOINED,
  S2C_EVENTS.SESSION_NOT_FOUND,
  S2C_EVENTS.SESSION_STATE,
  S2C_EVENTS.SESSION_END,
  S2C_EVENTS.ANSWER_RECEIVED,
  S2C_EVENTS.QUESTION_SHOW,
  S2C_EVENTS.ANSWER_REVEAL,
  SOCKET_LIFECYCLE_EVENTS.CONNECT,
  SOCKET_LIFECYCLE_EVENTS.DISCONNECT,
  SOCKET_LIFECYCLE_EVENTS.CONNECT_ERROR,
];

export class SharedSocketClient {
  private socket: SocketConnection | null = null;
  private sessionCode?: string;
  private readonly listeners = new Map<string, Set<(payload: unknown) => void>>();
  private readonly autoJoinSessionOnConnect: boolean;

  constructor(private readonly options: SocketClientOptions) {
    this.sessionCode = options.sessionCode;
    this.autoJoinSessionOnConnect = options.autoJoinSessionOnConnect ?? true;
  }

  connect(sessionCode?: string): void {
    if (sessionCode) {
      this.sessionCode = sessionCode.trim();
    }

    if (this.socket) {
      this.disconnect();
    }

    this.socket = this.options.connector(
      this.options.url,
      this.options.connectOptions,
    );
    this.attachSocketListeners(this.socket);
  }

  disconnect(): void {
    if (!this.socket) return;
    this.socket.disconnect();
    this.socket = null;
  }

  isConnected(): boolean {
    return this.socket?.connected ?? false;
  }

  setSessionCode(sessionCode?: string): void {
    this.sessionCode = sessionCode?.trim() || undefined;
  }

  register<E extends RegisterableEvent>(
    event: E,
    callback: (payload: RegisterableEventPayloads[E]) => void,
  ): Unsubscribe {
    const callbacks = this.listeners.get(event) ?? new Set();
    callbacks.add(callback as (payload: unknown) => void);
    this.listeners.set(event, callbacks);

    return () => {
      const existingCallbacks = this.listeners.get(event);
      if (!existingCallbacks) return;
      existingCallbacks.delete(callback as (payload: unknown) => void);
      if (existingCallbacks.size === 0) {
        this.listeners.delete(event);
      }
    };
  }

  emit<E extends ClientToServerEvent>(
    event: E,
    payload: ClientToServerEventPayloads[E],
  ): void {
    this.socket?.emit(event, payload);
  }

  private attachSocketListeners(socket: SocketConnection): void {
    for (const event of REGISTERABLE_EVENTS) {
      socket.on(event, (...args: unknown[]) => {
        if (
          event === SOCKET_LIFECYCLE_EVENTS.CONNECT &&
          this.autoJoinSessionOnConnect &&
          this.sessionCode
        ) {
          this.emit(C2S_EVENTS.JOIN_SESSION, { code: this.sessionCode });
        }
        this.notify(event, args[0]);
      });
    }
  }

  private notify(event: string, payload: unknown): void {
    const callbacks = this.listeners.get(event);
    if (!callbacks) return;
    for (const callback of callbacks) {
      callback(payload);
    }
  }
}

export function createSocketIoClient(options: SocketIoClientOptions): SharedSocketClient {
  return new SharedSocketClient({
    ...options,
    connector: (url, connectOptions) =>
      io(url, { transports: ["websocket"], ...connectOptions }) as unknown as SocketConnection,
  });
}
