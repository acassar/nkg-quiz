import { ref } from "vue";
import type { Session, SessionState } from "../types/session/session.types";

export const activeSession = ref<Session | undefined>(undefined);
export const activeSessions = ref<Session[]>([]);
export const sessionState = ref<SessionState | undefined>(undefined);
