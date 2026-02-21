<script setup lang="ts">
import { computed, ref } from "vue";

type ChoiceInput = { text: string; isCorrect: boolean };
type QuestionInput = {
  prompt: string;
  timeLimitSec: number | null;
  points: number | null;
  choices: ChoiceInput[];
};

type Quiz = {
  id: number;
  title: string;
  status: string;
};

type Session = {
  id: number;
  code: string;
  status: string;
};

type SessionState = {
  code: string;
  status: string;
  currentQuestionIndex: number | null;
};

const apiBase = import.meta.env.VITE_API_URL || "http://localhost:4000";

const token = ref(localStorage.getItem("nkg_token") || "");
const mode = ref<"login" | "register">("login");
const authForm = ref({ email: "", password: "" });
const authError = ref("");

const quizzes = ref<Quiz[]>([]);
const loadingQuizzes = ref(false);

const quizForm = ref({
  title: "",
  status: "DRAFT",
  questions: [
    {
      prompt: "",
      timeLimitSec: 20,
      points: 1000,
      choices: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
      ],
    },
  ] as QuestionInput[],
});

const sessionState = ref<SessionState | null>(null);
const activeSession = ref<Session | null>(null);
const sessionError = ref("");

const isAuthed = computed(() => Boolean(token.value));

const apiFetch = async (path: string, options: RequestInit = {}) => {
  const headers = new Headers(options.headers || {});
  headers.set("Content-Type", "application/json");
  if (token.value) headers.set("Authorization", `Bearer ${token.value}`);

  const response = await fetch(`${apiBase}${path}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(text || "Request failed");
  }

  return response.json();
};

const handleAuth = async () => {
  authError.value = "";
  try {
    const data = await apiFetch(`/api/auth/${mode.value}`, {
      method: "POST",
      body: JSON.stringify(authForm.value),
    });
    token.value = data.token;
    localStorage.setItem("nkg_token", data.token);
    await loadQuizzes();
  } catch (err) {
    authError.value = err instanceof Error ? err.message : "Auth failed";
  }
};

const logout = () => {
  token.value = "";
  localStorage.removeItem("nkg_token");
  quizzes.value = [];
  activeSession.value = null;
};

const loadQuizzes = async () => {
  loadingQuizzes.value = true;
  try {
    const data = await apiFetch("/api/quizzes");
    quizzes.value = data as Quiz[];
  } finally {
    loadingQuizzes.value = false;
  }
};

const addQuestion = () => {
  quizForm.value.questions.push({
    prompt: "",
    timeLimitSec: 20,
    points: 1000,
    choices: [
      { text: "", isCorrect: true },
      { text: "", isCorrect: false },
    ],
  });
};

const addChoice = (question: QuestionInput) => {
  question.choices.push({ text: "", isCorrect: false });
};

const createQuiz = async () => {
  await apiFetch("/api/quizzes", {
    method: "POST",
    body: JSON.stringify(quizForm.value),
  });
  quizForm.value.title = "";
  quizForm.value.questions = [
    {
      prompt: "",
      timeLimitSec: 20,
      points: 1000,
      choices: [
        { text: "", isCorrect: true },
        { text: "", isCorrect: false },
      ],
    },
  ];
  await loadQuizzes();
};

const createSession = async (quizId: number) => {
  sessionError.value = "";
  try {
    const data = await apiFetch("/api/sessions", {
      method: "POST",
      body: JSON.stringify({ quizId }),
    });
    activeSession.value = data.session as Session;
    sessionState.value = data.state as SessionState;
  } catch (err) {
    sessionError.value = err instanceof Error ? err.message : "Session failed";
  }
};

const sessionAction = async (action: "start" | "next" | "reveal" | "end") => {
  if (!activeSession.value) return;
  const data = await apiFetch(
    `/api/sessions/${activeSession.value.code}/${action}`,
    { method: "POST" },
  );
  sessionState.value = data.state as SessionState;
  if (action === "end") activeSession.value = null;
};

if (isAuthed.value) {
  loadQuizzes();
}
</script>

<template>
  <div class="shell">
    <header class="header">
      <div>
        <div class="brand">NKG Backoffice</div>
        <div class="badge">Session control</div>
      </div>
      <button v-if="isAuthed" class="secondary" @click="logout">Logout</button>
    </header>

    <section v-if="!isAuthed" class="card">
      <div class="section-title">Access</div>
      <div class="row">
        <button
          class="secondary"
          :disabled="mode === 'login'"
          @click="mode = 'login'"
        >
          Login
        </button>
        <button
          class="secondary"
          :disabled="mode === 'register'"
          @click="mode = 'register'"
        >
          Register
        </button>
      </div>
      <div class="grid">
        <input v-model.trim="authForm.email" placeholder="Email" />
        <input
          v-model.trim="authForm.password"
          type="password"
          placeholder="Password"
        />
        <button @click="handleAuth">
          {{ mode === "login" ? "Login" : "Register" }}
        </button>
        <p v-if="authError">{{ authError }}</p>
      </div>
    </section>

    <section v-else class="columns">
      <div class="grid">
        <div class="card">
          <div class="section-title">Quizzes</div>
          <button
            class="secondary"
            @click="loadQuizzes"
            :disabled="loadingQuizzes"
          >
            Refresh list
          </button>
          <div class="list">
            <div v-for="quiz in quizzes" :key="quiz.id" class="list-item">
              <div>
                <strong>{{ quiz.title }}</strong>
                <div class="section-title">{{ quiz.status }}</div>
              </div>
              <button @click="createSession(quiz.id)">Create session</button>
            </div>
          </div>
        </div>

        <div class="card">
          <div class="section-title">Create quiz</div>
          <input v-model.trim="quizForm.title" placeholder="Quiz title" />
          <select v-model="quizForm.status">
            <option value="DRAFT">Draft</option>
            <option value="PUBLISHED">Published</option>
          </select>
          <div class="grid">
            <div
              v-for="(question, qIndex) in quizForm.questions"
              :key="qIndex"
              class="card"
            >
              <textarea
                v-model.trim="question.prompt"
                placeholder="Question prompt"
              />
              <div class="row">
                <input
                  v-model.number="question.timeLimitSec"
                  type="number"
                  min="5"
                  placeholder="Time limit"
                />
                <input
                  v-model.number="question.points"
                  type="number"
                  min="0"
                  placeholder="Points"
                />
              </div>
              <div class="grid">
                <div
                  v-for="(choice, cIndex) in question.choices"
                  :key="cIndex"
                  class="row"
                >
                  <input v-model.trim="choice.text" placeholder="Choice" />
                  <select v-model="choice.isCorrect">
                    <option :value="true">Correct</option>
                    <option :value="false">Wrong</option>
                  </select>
                </div>
                <button class="secondary" @click="addChoice(question)">
                  Add choice
                </button>
              </div>
            </div>
          </div>
          <div class="row">
            <button class="secondary" @click="addQuestion">Add question</button>
            <button @click="createQuiz">Create quiz</button>
          </div>
        </div>
      </div>

      <div class="grid">
        <div class="card">
          <div class="section-title">Active session</div>
          <p v-if="!activeSession">No active session yet.</p>
          <div v-else class="grid">
            <div><strong>Code:</strong> {{ activeSession.code }}</div>
            <div><strong>Status:</strong> {{ sessionState?.status }}</div>
            <div class="row">
              <button @click="sessionAction('start')">Start</button>
              <button @click="sessionAction('next')">Next</button>
              <button @click="sessionAction('reveal')">Reveal</button>
              <button class="secondary" @click="sessionAction('end')">
                End
              </button>
            </div>
          </div>
          <p v-if="sessionError">{{ sessionError }}</p>
        </div>
      </div>
    </section>
  </div>
</template>
