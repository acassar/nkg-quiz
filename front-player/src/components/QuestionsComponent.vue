<script setup lang="ts">
import { ref } from "vue";
import { useSessionState } from "../composable/useSessionState";
import { sendAnswer } from "../service/socket.service";
import { usePlayer } from "../composable/usePlayer";

const { sessionCode, currentQuestion: question, status } = useSessionState();
const { currentPlayerId: playerId } = usePlayer();

const selectedChoice = ref<number | null>(null);

const submitAnswer = async (choiceId: number) => {
  if (!question.value || !playerId.value || !sessionCode.value) return;
  selectedChoice.value = choiceId;

  sendAnswer({
    questionId: question.value.id,
    choiceId,
    playerId: parseInt(playerId.value),
    sessionCode: sessionCode.value,
  });
};
</script>

<template>
  <section class="card question" v-if="question">
    <h2>{{ question.prompt }}</h2>
    <div class="choices">
      <button
        v-for="choice in question.choices"
        :key="choice.id"
        class="choice"
        :class="{ selected: selectedChoice === choice.id }"
        @click="submitAnswer(choice.id)"
      >
        <span class="choice-text">{{ choice.text }}</span>
      </button>
    </div>
  </section>

  <section class="card" v-else>
    <p v-if="status === 'connected'">Waiting for the next question...</p>
    <p v-else-if="status === 'ended'">Session ended. Thanks for playing!</p>
    <p v-else>Connect to a session to see questions here.</p>
  </section>
</template>

<style scoped>
.choice-text {
  color: black;
}
</style>
