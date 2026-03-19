<script setup lang="ts">
import { computed, ref } from "vue";
import { useSessionState } from "../../composables/useSessionState";
import QuizQuestions from "./QuizQuestions.vue";
import CounterComponent from "../counter/CounterComponent.vue";
import { useSessionFetcher } from "../../composables/useSessionFetcher";

const { currentQuestion, status, sessionCode } = useSessionState();
const { nextQuestion } = useSessionFetcher();

const answersCount = ref(0); //TODO: make the answers count retrieved from the session state api
const isConnected = computed(() => status.value === "connected");
const sessionNotFound = computed(() => status.value === "session not found");

const handleTimesUp = () => {
  if (!sessionCode.value) return;
  nextQuestion.execute(sessionCode.value);
};
</script>

<template>
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

<style scoped></style>
