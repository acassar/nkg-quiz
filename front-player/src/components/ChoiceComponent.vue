<script setup lang="ts">
import { Choice } from "@nkg-quiz/shared-types";

const emit = defineEmits<{
  click: [number];
}>();

const props = withDefaults(
  defineProps<{
    choice: Choice;
    type?: "normal" | "selected" | "disabled" | "correct" | "incorrect";
  }>(),
  {
    type: "normal",
  },
);

const handleClick = () => {
  if (props.type === "disabled") return;
  emit("click", props.choice.id);
};
</script>

<template>
  <button class="choice" :class="`choice--${type}`" @click="handleClick">
    <span class="choice-text">{{ choice.text }}</span>
  </button>
</template>

<style scoped>
.choice {
  border: 2px solid transparent;
  background: #f3f7ff;
  border-radius: 16px;
  padding: 0.9rem 1.1rem;
  font-weight: 600;
  text-align: left;
  width: 100%;
}

.choice-text {
  color: black;
}

.choice--normal {
  cursor: pointer;
}

.choice--normal:hover {
  background: #e1ecff;
}

.choice--selected {
  border-color: #0b1f2a;
  background: #e1ecff;
}

.choice--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.choice--correct {
  border-color: #1a7f37;
  background: #d4f8d4;
}

.choice--incorrect {
  border-color: #7f1a1a;
  background: #f8d4d4;
}
</style>
