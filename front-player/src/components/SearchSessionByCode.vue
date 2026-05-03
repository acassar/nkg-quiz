<script setup lang="ts">
import { useI18n } from "vue-i18n";
import { usePlayer } from "../composable/usePlayer";
import { Player } from "../types/player.types";

const { t } = useI18n();

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
    <input v-model.trim="sessionCode" :placeholder="t('player.search.codePlaceholder')" />
    <button @click="searchSession">{{ t("player.search.submit") }}</button>
  </div>
</template>

<style scoped>
.search-session {
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
}

@media (max-width: 720px) {
  .search-session {
    justify-content: center;
  }
}
</style>
