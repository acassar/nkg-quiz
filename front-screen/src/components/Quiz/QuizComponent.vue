<script setup lang="ts">
import { computed, ref } from "vue";
import { useSessionState } from "../../composables/useSessionState";

const { currentQuestion, status } = useSessionState();

const answersCount = ref(0);
const isConnected = computed(() => status.value === "connected");
const sessionNotFound = computed(() => status.value === "session not found");
</script>

<template>
  <section v-if="currentQuestion" class="question-card">
    <h1 class="question-title">{{ currentQuestion.prompt }}</h1>
    <div class="meta-row">
      <span>Answers: {{ answersCount }}</span>
      <span v-if="currentQuestion.timeLimitSec">
        Timer: {{ currentQuestion.timeLimitSec }}s
      </span>
      <span v-if="currentQuestion.points"
        >Points: {{ currentQuestion.points }}</span
      >
    </div>
    <div class="choices">
      <div
        v-for="choice in currentQuestion.choices"
        :key="choice.id"
        class="choice"
      >
        {{ choice.text }}
      </div>
    </div>
  </section>

  <section v-else class="empty">
    <p v-if="sessionNotFound">
      Session not found. Please check the session code and try again.
    </p>
    <p v-else-if="!isConnected">
      Connect to a session to display questions here.
    </p>
    <p v-else>No active question yet.</p>
  </section>
</template>

<style scoped></style>
