<script setup lang="ts">
import { Choice } from "@nkg-quiz/shared-types";

const emit = defineEmits<{
  click: [number];
}>();

const props = withDefaults(
  defineProps<{
    choice: Choice;
    type?: "normal" | "selected" | "disabled" | "correct" | "incorrect" | "missed";
    labels?: string[];
  }>(),
  {
    type: "normal",
    labels: () => [],
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
    <span v-if="labels.length" class="choice-labels">
      <template v-for="(label, i) in labels" :key="label">
        <span v-if="i > 0" class="choice-label-sep">•</span>
        <span class="choice-label">{{ label }}</span>
      </template>
    </span>
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
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.75rem;
}

.choice-text {
  color: var(--text);
}

.choice-labels {
  display: flex;
  gap: 0.35rem;
  flex-shrink: 0;
}

.choice-label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  color: var(--text);
  opacity: 0.7;
  white-space: nowrap;
}

.choice-label-sep {
  font-size: 0.7rem;
  color: var(--text);
  opacity: 0.4;
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
