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
import { useI18n } from "vue-i18n";
import { useLocaleSwitch } from "@nkg-quiz/shared-i18n";
import { ref } from "vue";
import ResultsComponent from "./components/ResultsComponent.vue";

const { t } = useI18n();
const { switchLabel, toggleLocale } = useLocaleSwitch();
const {
  sessionCode,
  leaveSession,
  updateState,
  setStatus,
  setPlayerAnswers,
  status,
} = useSessionState();

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

const showResults = ref(false);

const toggleShowResults = () => {
  if (status.value !== "ended") return;
  showResults.value = !showResults.value;
};

const handleLeaveSession = () => {
  leaveSession();
  showResults.value = false;
};
</script>

<template>
  <div class="app-content">
    <div class="top-bar">
      <button v-if="sessionCode" @click="handleLeaveSession">
        {{ t("player.leaveSession") }}
      </button>
      <button class="locale-btn" @click="toggleLocale">
        {{ switchLabel }}
      </button>
    </div>

    <div class="session" v-if="!showResults">
      <SessionJoinHandler v-if="!sessionCode" />
      <QuestionsComponent @click:results="toggleShowResults" />
    </div>

    <div v-else>
      <ResultsComponent />
    </div>
  </div>
</template>

<style scoped>
.app-content {
  display: flex;
  flex-direction: column;
  gap: 1.8rem;
  padding: 2rem 7vw 4rem;
}

.session {
  display: flex;
  justify-content: center;
  flex-direction: column;
  gap: 2rem;
}

.top-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  min-height: 2.5rem;
}

.locale-btn {
  margin-left: auto;
}

@media (max-width: 720px) {
  .app-content {
    padding: 1.6rem 6vw 3rem;
  }
}
</style>
