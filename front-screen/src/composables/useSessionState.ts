import { Question, Quiz, SessionState } from "@nkg-quiz/shared-types";
import { computed, ref } from "vue";

type SessionStatus =
  | "connected"
  | "disconnected"
  | "session not found"
  | "error"
  | "connecting";

// Global state for the session, shared across components
const state = ref<SessionState>();
const sessionQuiz = ref<Quiz>();
const answersCount = ref(0);
const status = ref<SessionStatus>("disconnected");
const sessionCode = ref<string>();
const restartCountdownSec = ref<number | null>(null);

export function useSessionState() {
  function updateState(newState: SessionState) {
    state.value = newState;
  }

  function setStatus(newStatus: SessionStatus) {
    status.value = newStatus;
  }

  function setSessionQuiz(quiz: Quiz) {
    sessionQuiz.value = quiz;
  }

  function incrementAnswersCount() {
    answersCount.value += 1;
  }

  function resetAnswersCount() {
    answersCount.value = 0;
  }

  const questions = computed<Question[]>(() => {
    if (!state.value || !sessionQuiz.value) return [];
    const quiz = sessionQuiz.value;

    return quiz.categories.flatMap((category) => category.questions);
  });

  const currentQuestion = computed<Question | null>(() => {
    if (
      state.value?.currentQuestionIndex === null ||
      state.value?.currentQuestionIndex === undefined
    )
      return null;
    const currentQuestion = questions.value[state.value.currentQuestionIndex];

    return currentQuestion || null;
  });

  function setRestartCountdown(sec: number | null) {
    restartCountdownSec.value = sec;
  }

  return {
    state,
    currentQuestion,
    answersCount,
    status,
    sessionCode,
    restartCountdownSec,
    setStatus,
    setSessionQuiz,
    updateState,
    incrementAnswersCount,
    resetAnswersCount,
    setRestartCountdown,
  };
}
