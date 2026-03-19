<script setup lang="ts">
import { onMounted, onUnmounted, ref, watch } from "vue";

const emit = defineEmits<{
  (event: "times-up"): void;
}>();

const props = defineProps<{
  timeLimit: number;
  currentQuestionId: number;
}>();

let intervalId: NodeJS.Timeout;

const remainingTime = ref(0);

onMounted(() => {
  initCounter();
});

onUnmounted(() => {
  clearInterval(intervalId);
});

watch(
  () => props.currentQuestionId,
  () => {
    initCounter();
  },
);

const updateRemainingTime = () => {
  if (remainingTime.value > 0) {
    remainingTime.value -= 1;
  } else {
    emit("times-up");
    clearInterval(intervalId);
  }
};

const initCounter = () => {
  if (intervalId) clearInterval(intervalId);
  remainingTime.value = props.timeLimit;
  intervalId = setInterval(() => {
    updateRemainingTime();
  }, 1000);
};
</script>

<template>
  <div class="counter-container">
    <div class="card">
      <h3>{{ remainingTime }}s</h3>
    </div>
  </div>
</template>

<style scoped>
.counter-container {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
}

.card {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  background-color: white;
  border-radius: 1rem;
  font-size: 1.5rem;
  font-weight: bold;
  width: 200px;
}

.card > span {
}
</style>
