import { onUnmounted } from "vue";
import type { SharedSocketClient } from "../socket-client.js";
import type {
  RegisterableEvent,
  RegisterableEventPayloads,
} from "@nkg-quiz/shared-socket-types";

export function useSocketEvent<E extends RegisterableEvent>(
  client: SharedSocketClient,
  event: E,
  callback: (payload: RegisterableEventPayloads[E]) => void,
): void {
  const unsub = client.register(event, callback);
  onUnmounted(unsub);
}
