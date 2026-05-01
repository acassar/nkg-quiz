<script setup lang="ts">
import { RouterView } from "vue-router";
import { socketClient } from "./services/socket.service";
import { S2C_EVENTS, SOCKET_LIFECYCLE_EVENTS, useSocketEvent } from "@nkg-quiz/shared-socket";
import { useSessionState } from "./composables/useSessionState";
import type { SessionState } from "@nkg-quiz/shared-types";

const { updateState, setStatus, incrementAnswersCount } = useSessionState();

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
  updateState(payload);
  setStatus("connected");
});
useSocketEvent(socketClient, S2C_EVENTS.ANSWER_RECEIVED, () => {
  incrementAnswersCount();
});
useSocketEvent(socketClient, S2C_EVENTS.SESSION_STATE, (payload) => {
  updateState(payload as SessionState);
});
useSocketEvent(socketClient, S2C_EVENTS.SESSION_END, (payload) => {
  updateState(payload as SessionState);
});
</script>

<template>
  <RouterView />
</template>
