<script setup lang="ts">
import { computed, onUnmounted, ref } from "vue";
import { io, Socket } from "socket.io-client";
import { Question, SessionState } from "@nkg-quiz/shared-fetcher";
import { useSessionFetcher } from "./composables/useSessionFetcher";

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";
const wsBase = import.meta.env.VITE_WS_URL || apiBase;

const { getQuiz } = useSessionFetcher();

const sessionCode = ref("");
const status = ref("disconnected");
const state = ref<SessionState | null>(null);
const answersCount = ref(0);
let socket: Socket | null = null;

const isConnected = computed(() => status.value === "connected");

const questions = computed<Question[]>(() => {
  if (!state.value || !getQuiz.data.value) return [];
  const quiz = getQuiz.data.value;

  return quiz.categories.flatMap((category) => category.questions);
});

const question = computed<Question | null>(() => {
  if (
    state.value?.currentQuestionIndex === null ||
    state.value?.currentQuestionIndex === undefined
  )
    return null;
  const currentQuestion =
    getQuiz.data.value?.questions?.[state.value.currentQuestionIndex];

  return currentQuestion || null;
});

onUnmounted(() => {
  if (socket) socket.disconnect();
});

// Nettoyer aussi lors des changements de page/refresh
window.addEventListener("beforeunload", () => {
  if (socket) socket.disconnect();
});

const connect = () => {
  if (!sessionCode.value) return;
  if (socket) socket.disconnect();

  socket = io(wsBase, { transports: ["websocket"] });

  socket.on("connect", () => {
    status.value = "connected";
    answersCount.value = 0;
    socket?.emit("join-session", { code: sessionCode.value.trim() });
  });

  socket.on("session:not-found", () => {
    status.value = "session not found";
    socket?.disconnect();
  });

  socket.on("session:joined", () => {
    status.value = "connected";
    fetchQuiz();
  });

  socket.on("disconnect", () => {
    status.value = "disconnected";
  });

  socket.on("session:state", (payload: SessionState) => {
    state.value = payload;
  });

  socket.on("answer:received", () => {
    answersCount.value += 1;
  });

  socket.on("session:end", (payload: SessionState) => {
    state.value = payload;
  });

  socket.on("connect_error", () => {
    status.value = "error";
  });
};

const fetchQuiz = async () => {
  if (!sessionCode.value) return;
  const quiz = await getQuiz.execute(sessionCode.value);
  console.log(quiz);
};
</script>

<template>
  <div class="screen">
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
          v-model.trim="sessionCode"
          placeholder="Session code"
          aria-label="Session code"
        />
        <button @click="connect">Connect</button>
      </div>
    </header>

    <section v-if="question" class="question-card">
      <h1 class="question-title">{{ question.prompt }}</h1>
      <div class="meta-row">
        <span>Answers: {{ answersCount }}</span>
        <span v-if="question.timeLimitSec">
          Timer: {{ question.timeLimitSec }}s
        </span>
        <span v-if="question.points">Points: {{ question.points }}</span>
      </div>
      <div class="choices">
        <div v-for="choice in question.choices" :key="choice.id" class="choice">
          {{ choice.text }}
        </div>
      </div>
    </section>

    <section v-else class="empty">
      <p v-if="!isConnected">Connect to a session to display questions here.</p>
      <p v-else>No active question yet.</p>
    </section>
  </div>
</template>
