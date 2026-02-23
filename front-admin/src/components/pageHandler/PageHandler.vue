<script setup lang="ts">
import { ref, shallowRef } from "vue";
import Home from "../../pages/Home.vue";
import EditQuiz from "../../views/quiz/EditQuizView.vue";

export type PageHandlerEmits = {
  (e: "open:quizEdit", quizId: number): void;
  (e: "open:home"): void;
};

type ComponentProps = typeof page extends "EditQuiz" ? { quizId: number } : {};

defineEmits<PageHandlerEmits>();

const page = shallowRef<typeof Home | typeof EditQuiz>(Home);
const componentProps = ref<ComponentProps>();

const openQuizEdit = (quizId: number) => {
  page.value = EditQuiz;
  componentProps.value = { quizId } as ComponentProps;
};

const openHome = () => {
  page.value = Home;
  componentProps.value = undefined;
};
</script>

<template>
  <component
    :is="page"
    v-bind="componentProps"
    @open:quizEdit="openQuizEdit"
    @open:home="openHome"
  />
</template>

<style scoped></style>
