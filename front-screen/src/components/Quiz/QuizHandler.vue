<script setup lang="ts">
import { computed, onUnmounted, ref, watch } from "vue";
import { useSessionState } from "../../composables/useSessionState";
import QuizQuestions from "./QuizQuestions.vue";
import CounterComponent from "../counter/CounterComponent.vue";
import { useSessionFetcher } from "../../composables/useSessionFetcher";

const { currentQuestion, status, sessionCode, restartRemainingMs } = useSessionState();
const { nextQuestion } = useSessionFetcher();

const answersCount = ref(0); //TODO: make the answers count retrieved from the session state api
const isConnected = computed(() => status.value === "connected");
const sessionNotFound = computed(() => status.value === "session not found");
const displayCountdown = ref<number | null>(null);

let countdownInterval: ReturnType<typeof setInterval> | null = null;

watch(restartRemainingMs, (ms) => {
  if (countdownInterval) clearInterval(countdownInterval);
  if (ms === null) {
    displayCountdown.value = null;
    return;
  }
  displayCountdown.value = Math.ceil(ms / 1000);
  countdownInterval = setInterval(() => {
    const remaining = restartRemainingMs.value;
    if (remaining === null || remaining <= 0) {
      clearInterval(countdownInterval!);
      displayCountdown.value = null;
      return;
    }
    displayCountdown.value = Math.ceil(remaining / 1000);
  }, 500);
});

onUnmounted(() => {
  if (countdownInterval) clearInterval(countdownInterval);
});

const handleTimesUp = () => {
  if (!sessionCode.value) return;
  nextQuestion.execute(sessionCode.value);
};
</script>

<template>
  <div v-if="displayCountdown !== null" class="restart-overlay">
    <p>Le quiz reprend dans {{ displayCountdown }}s...</p>
  </div>

  <CounterComponent
    v-if="currentQuestion?.timeLimitSec"
    :timeLimit="currentQuestion.timeLimitSec"
    :currentQuestionId="currentQuestion.id"
    @times-up="handleTimesUp"
  />

  <QuizQuestions
    v-if="currentQuestion"
    :currentQuestion="currentQuestion"
    :answersCount="answersCount"
  />

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

<style scoped>
.restart-overlay {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.75);
  z-index: 100;
}

.restart-overlay p {
  color: white;
  font-size: clamp(1.5rem, 4vw, 3rem);
  font-weight: 700;
  text-align: center;
}
</style>
