<script setup lang="ts">
import { ref } from "vue";
import { QuestionInput } from "../types/Question.types";
import { useQuiz } from "../composables/useQuiz";

const { loadQuizzes, createQuiz: createQuizApi } = useQuiz();

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
  await createQuizApi(quizForm.value);
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
</script>

<template>
  <div class="card grid">
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
</template>

<style scoped></style>
