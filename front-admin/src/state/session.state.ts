import { ref } from "vue";
import type { Session, SessionOptions, SessionState } from "@nkg-quiz/shared-types";

export const activeSession = ref<Session | undefined>(undefined);
export const activeSessions = ref<Session[]>([]);
export const sessionState = ref<SessionState | undefined>(undefined);
export const activeSessionOptions = ref<SessionOptions | null | undefined>(undefined);
