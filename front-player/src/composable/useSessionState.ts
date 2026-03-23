import { Question, Quiz, SessionState } from "@nkg-quiz/shared-types";
import { computed, reactive, ref } from "vue";
import { disconnectSocket } from "../service/socket.service";

type SessionStatus =
  | "connected"
  | "disconnected"
  | "session not found"
  | "ended"
  | "error"
  | "joining";

const sessionState = ref<SessionState>();
const status = ref<SessionStatus>("disconnected");
const sessionCode = ref<string>();
const sessionQuiz = ref<Quiz>();
/** Stores the player's answer per question (questionId → choiceId). Persists across restarts. */
const playerAnswers = reactive(new Map<number, number>());
export function useSessionState() {
  const questions = computed<Question[]>(() => {
    if (!sessionState.value || !sessionQuiz.value) return [];
    return sessionQuiz.value.categories.flatMap(
      (category) => category.questions,
    );
  });

  const currentQuestion = computed<Question | null>(() => {
    if (
      sessionState.value?.currentQuestionIndex === null ||
      sessionState.value?.currentQuestionIndex === undefined
    )
      return null;
    const currentQuestion =
      questions.value[sessionState.value.currentQuestionIndex];
    return currentQuestion || null;
  });

  function updateState(newState: SessionState) {
    sessionState.value = newState;
  }

  function setStatus(newStatus: SessionStatus) {
    status.value = newStatus;
  }

  function setSessionCode(code: string) {
    sessionCode.value = code;
  }

  function setSessionQuiz(quiz: Quiz) {
    sessionQuiz.value = quiz;
  }

  function leaveSession() {
    sessionState.value = undefined;
    sessionQuiz.value = undefined;
    disconnectSocket();
  }

  function savePlayerAnswer(questionId: number, choiceId: number) {
    playerAnswers.set(questionId, choiceId);
  }

  function getPlayerAnswer(questionId: number): number | null {
    return playerAnswers.get(questionId) ?? null;
  }

  return {
    status,
    sessionCode,
    currentQuestion,
    updateState,
    setStatus,
    setSessionCode,
    setSessionQuiz,
    leaveSession,
    savePlayerAnswer,
    getPlayerAnswer,
  };
}
