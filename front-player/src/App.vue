<script setup lang="ts">
import QuestionsComponent from "./components/QuestionsComponent.vue";
import SessionJoinHandler from "./components/SessionJoinHandler.vue";
import { useSessionState } from "./composable/useSessionState";
import { socketClient } from "./service/socket.service";
import {
  S2C_EVENTS,
  SOCKET_LIFECYCLE_EVENTS,
  useSocketEvent,
} from "@nkg-quiz/shared-socket";
import type { SessionState } from "@nkg-quiz/shared-types";

const { sessionCode, leaveSession, updateState, setStatus, setPlayerAnswers } =
  useSessionState();

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
useSocketEvent(socketClient, S2C_EVENTS.SESSION_JOINED, (payload) => {
  console.log("Joined session");
  const { playerAnswers, ...state } = payload as SessionState & {
    playerAnswers: Record<string, number>;
  };
  updateState(state as SessionState);
  setPlayerAnswers(playerAnswers ?? {});
  setStatus(state.status === "ENDED" ? "ended" : "connected");
});
useSocketEvent(socketClient, S2C_EVENTS.SESSION_STATE, (payload) => {
  const state = payload as SessionState;
  if (state.status === "RESTARTING") socketClient.rejoin();
  updateState(state);
  setStatus(state.status === "ENDED" ? "ended" : "connected");
});
useSocketEvent(socketClient, S2C_EVENTS.SESSION_END, (payload) => {
  updateState(payload as SessionState);
  setStatus("ended");
});
</script>

<template>
  <div class="app-content">
    <button v-if="sessionCode" @click="leaveSession">Leave session</button>
    <SessionJoinHandler v-if="!sessionCode" />
    <QuestionsComponent />
  </div>
</template>

<style scoped>
.app-content {
  display: grid;
  gap: 1.8rem;
  padding: 2rem 7vw 4rem;
}

@media (max-width: 720px) {
  .app-content {
    padding: 1.6rem 6vw 3rem;
  }
}
</style>
