<script setup lang="ts">
import { ref, watch } from "vue";
import { useSessionState } from "../../composables/useSessionState";
import { connectSocket } from "../../services/socket.service";
import { useSessionFetcher } from "../../composables/useSessionFetcher";

const {
  state,
  status,
  sessionCode: currentSessionCode,
  setSessionQuiz,
} = useSessionState();
const { getQuiz } = useSessionFetcher();
const sessionCodeModel = ref(""); // Session code input by the user

watch(status, (newStatus) => {
  if (newStatus === "connected") {
    fetchQuiz();
  }
});

const fetchQuiz = async () => {
  if (!currentSessionCode.value) return;
  const quiz = await getQuiz.execute(currentSessionCode.value);
  if (quiz) {
    setSessionQuiz(quiz);
  }
};

const handleConnectClick = () => {
  if (!sessionCodeModel.value) return;
  connectSocket(sessionCodeModel.value);
};
</script>

<template>
  <header class="header">
    <div>
      <div class="brand">NKG Quiz Live</div>
      <div class="meta-row">
        <span class="status-pill">{{ status }}</span>
        <span v-if="state">Session {{ state.code }}</span>
      </div>
    </div>
    <div class="session-card">
      <input
        v-model.trim="sessionCodeModel"
        placeholder="Session code"
        aria-label="Session code"
      />
      <button @click="handleConnectClick">Connect</button>
    </div>
  </header>
</template>

<style scoped></style>
