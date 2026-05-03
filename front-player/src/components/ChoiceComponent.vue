<script setup lang="ts">
import { Choice } from "@nkg-quiz/shared-types";

const emit = defineEmits<{
  click: [number];
}>();

const props = withDefaults(
  defineProps<{
    choice: Choice;
    type?: "normal" | "selected" | "disabled" | "correct" | "incorrect" | "missed";
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
  background: var(--choice-bg);
  border-radius: var(--radius-md);
  padding: 0.9rem 1.1rem;
  font-weight: 600;
  text-align: left;
  width: 100%;
}

.choice-text {
  color: var(--text);
}

.choice--normal {
  cursor: pointer;
}

.choice--normal:hover {
  background: var(--choice-hover-bg);
}

.choice--selected {
  border-color: var(--choice-selected-border);
  background: var(--choice-hover-bg);
}

.choice--disabled {
  cursor: not-allowed;
  opacity: 0.6;
}

.choice--correct {
  border-color: var(--choice-correct-border);
  background: var(--choice-correct-bg);
}

.choice--incorrect {
  border-color: var(--choice-incorrect-border);
  background: var(--choice-incorrect-bg);
}

.choice--missed {
  border-color: var(--choice-missed-border);
  background: var(--choice-missed-bg);
}
</style>
