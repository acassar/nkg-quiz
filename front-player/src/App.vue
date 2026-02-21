<script setup lang="ts">
import { computed, ref } from "vue";
import { io, Socket } from "socket.io-client";

type Choice = { id: number; text: string };
type Question = {
  id: number;
  prompt: string;
  timeLimitSec?: number | null;
  points?: number | null;
  choices: Choice[];
};

type SessionState = {
  code: string;
  status: string;
  currentQuestionIndex: number | null;
  updatedAt: string;
  currentQuestion?: Question | null;
};

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";
const wsBase = import.meta.env.VITE_WS_URL || apiBase;

const form = ref({ code: "", nickname: "" });
const status = ref("idle");
const playerId = ref<number | null>(null);
const state = ref<SessionState | null>(null);
const question = ref<Question | null>(null);
const selectedChoice = ref<number | null>(null);
const hasAnswered = ref(false);
let socket: Socket | null = null;

const canJoin = computed(
  () =>
    form.value.code.trim().length > 0 && form.value.nickname.trim().length > 1,
);

const joinSession = async () => {
  if (!canJoin.value) return;
  status.value = "joining";

  const response = await fetch(
    `${apiBase}/api/sessions/${form.value.code.trim()}/join`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nickname: form.value.nickname.trim() }),
    },
  );

  if (!response.ok) {
    status.value = "error";
    return;
  }

  const data = (await response.json()) as { playerId: number };
  playerId.value = data.playerId;
  connectSocket();
};

const connectSocket = () => {
  if (socket) socket.disconnect();
  socket = io(wsBase, { transports: ["websocket"] });

  socket.on("connect", () => {
    status.value = "connected";
    socket?.emit("join-session", { code: form.value.code.trim() });
  });

  socket.on("session:state", (payload: SessionState) => {
    state.value = payload;
    question.value = payload.currentQuestion ?? null;
    hasAnswered.value = false;
    selectedChoice.value = null;
  });

  socket.on("question:show", (payload: Question) => {
    question.value = payload;
    hasAnswered.value = false;
    selectedChoice.value = null;
  });

  socket.on("answer:reveal", () => {
    status.value = "reveal";
  });

  socket.on("session:end", () => {
    status.value = "ended";
    question.value = null;
  });

  socket.on("disconnect", () => {
    status.value = "disconnected";
  });
};

const submitAnswer = async (choiceId: number) => {
  if (!question.value || !playerId.value || hasAnswered.value) return;
  selectedChoice.value = choiceId;
  hasAnswered.value = true;

  socket?.emit("player:answer", {
    code: form.value.code.trim(),
    playerId: playerId.value,
    questionId: question.value.id,
    choiceId,
  });
};
</script>

<template>
  <div class="player">
    <section class="hero">
      <span class="badge">Player</span>
      <h1>Join the live quiz</h1>
      <p>Enter the session code and your nickname to play.</p>
    </section>

    <section class="card">
      <div class="form">
        <input v-model.trim="form.code" placeholder="Session code" />
        <input v-model.trim="form.nickname" placeholder="Nickname" />
        <button
          :disabled="!canJoin || status === 'joining'"
          @click="joinSession"
        >
          {{ status === "joining" ? "Joining..." : "Join session" }}
        </button>
      </div>
    </section>

    <section class="card question" v-if="question">
      <h2>{{ question.prompt }}</h2>
      <div class="choices">
        <button
          v-for="choice in question.choices"
          :key="choice.id"
          class="choice"
          :class="{ selected: selectedChoice === choice.id }"
          :disabled="hasAnswered"
          @click="submitAnswer(choice.id)"
        >
          {{ choice.text }}
        </button>
      </div>
    </section>

    <section class="card" v-else>
      <p v-if="status === 'connected'">Waiting for the next question...</p>
      <p v-else-if="status === 'ended'">Session ended. Thanks for playing!</p>
      <p v-else>Connect to a session to see questions here.</p>
    </section>
  </div>
</template>
