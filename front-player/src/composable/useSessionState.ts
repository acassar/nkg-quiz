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
/** Stores the player's answer per question (questionId → choiceId). Persisted in localStorage. */
const playerAnswers = reactive(new Map<number, number>());

function answersStorageKey(code: string) {
  return `playerAnswers_${code}`;
}

function loadAnswersFromStorage(code: string) {
  const raw = localStorage.getItem(answersStorageKey(code));
  if (!raw) return;
  try {
    const parsed: [number, number][] = JSON.parse(raw);
    playerAnswers.clear();
    for (const [qId, cId] of parsed) playerAnswers.set(qId, cId);
  } catch {
    // ignore malformed data
  }
}

function persistAnswers(code: string) {
  localStorage.setItem(
    answersStorageKey(code),
    JSON.stringify([...playerAnswers.entries()]),
  );
}
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
    loadAnswersFromStorage(code);
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
    if (sessionCode.value) persistAnswers(sessionCode.value);
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
