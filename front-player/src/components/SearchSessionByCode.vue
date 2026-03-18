<script setup lang="ts">
import { usePlayer } from "../composable/usePlayer";
import { Player } from "../types/player.types";

const emit = defineEmits<{
  (e: "submit", player: Player | undefined): void;
}>();

const { getPlayerForSession } = usePlayer();

const sessionCode = defineModel({ default: "" });

const searchSession = () => {
  const player = getPlayerForSession(sessionCode.value.trim());
  emit("submit", player);
};
</script>

<template>
  <div class="search-session">
    <input v-model.trim="sessionCode" placeholder="Session code" />
    <button @click="searchSession">Search session</button>
  </div>
</template>

<style scoped>
.search-session {
  display: flex;
  gap: 1rem;
}
</style>
