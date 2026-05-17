<script setup lang="ts">
import { RouterView } from "vue-router";
import { socketClient } from "./services/socket.service";
import { S2C_EVENTS, SOCKET_LIFECYCLE_EVENTS, useSocketEvent } from "@nkg-quiz/shared-socket";
import { useSessionState } from "./composables/useSessionState";
import { useSessionFetcher } from "./composables/useSessionFetcher";
import type { SessionState } from "@nkg-quiz/shared-types";
import { SettingsPanel } from "@nkg-quiz/design-system";
import { useLocaleSwitch } from "@nkg-quiz/shared-i18n";

const { updateState, setStatus, setSessionOptions, incrementAnswersCount, sessionCode } = useSessionState();
const { getOptions } = useSessionFetcher();
const { locale, setLocale } = useLocaleSwitch();

useSocketEvent(socketClient, SOCKET_LIFECYCLE_EVENTS.CONNECT, () => {
  console.log("Connected to socket server");
});
useSocketEvent(socketClient, SOCKET_LIFECYCLE_EVENTS.DISCONNECT, () => {
  console.log("Disconnected from socket server");
  setStatus("disconnected");
});
useSocketEvent(socketClient, SOCKET_LIFECYCLE_EVENTS.CONNECT_ERROR, () => {
  console.error("Socket connection error");
  setStatus("error");
});
useSocketEvent(socketClient, S2C_EVENTS.SESSION_NOT_FOUND, () => {
  setStatus("session not found");
});
useSocketEvent(socketClient, S2C_EVENTS.SESSION_JOINED, async (payload) => {
  console.log("Joined session");
  const state = payload as SessionState;
  updateState(state);
  setStatus(state.status === "ENDED" ? "ended" : "connected");
  if (sessionCode.value) {
    const data = await getOptions.execute(sessionCode.value);
    setSessionOptions(data?.options ?? null);
  }
});
useSocketEvent(socketClient, S2C_EVENTS.ANSWER_RECEIVED, () => {
  incrementAnswersCount();
});
useSocketEvent(socketClient, S2C_EVENTS.SESSION_STATE, (payload) => {
  updateState(payload as SessionState);
});
useSocketEvent(socketClient, S2C_EVENTS.SESSION_END, (payload) => {
  updateState(payload as SessionState);
  setStatus("ended");
});
</script>

<template>
  <RouterView />
  <SettingsPanel :locale="locale" @update:locale="setLocale" />
</template>
