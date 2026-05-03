<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import type { LiveStats } from "@/types/session/session.types";

const props = defineProps<{ stats: LiveStats | null }>();

const { t } = useI18n();

const totalQuestions = computed(() => props.stats?.totalQuestions ?? 0);

const players = computed(() =>
  [...(props.stats?.players ?? [])].sort((a, b) => b.score - a.score),
);
</script>

<template>
  <div class="card players-list">
    <div class="section-title">{{ t("stats.players.sectionTitle") }}</div>

    <div v-if="players.length" class="list">
      <div v-for="player in players" :key="player.playerId" class="player-row">
        <span class="rank">#{{ player.rank }}</span>
        <span class="nickname">{{ player.nickname }}</span>
        <span class="progress">
          {{ player.totalAnswers }}<span class="sep">/</span
          >{{ totalQuestions }}
        </span>
        <span class="score"
          >{{ player.score }} <span class="pts">pts</span></span
        >
      </div>
    </div>

    <p v-else class="muted">{{ t("stats.players.none") }}</p>
  </div>
</template>

<style scoped>
.players-list {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.list {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.player-row {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  padding: 0.45rem 0.6rem;
  border-radius: 8px;
  background: #f9f5ef;
  font-size: 0.88rem;
}

.rank {
  font-family: "Space Mono", monospace;
  font-weight: 700;
  font-size: 0.8rem;
  min-width: 2rem;
  color: #7a6a56;
}

.nickname {
  flex: 1;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress {
  font-family: "Space Mono", monospace;
  font-size: 0.78rem;
  color: #7a6a56;
  min-width: 3.5rem;
  text-align: right;
}

.sep {
  opacity: 0.5;
  margin: 0 1px;
}

.score {
  font-family: "Space Mono", monospace;
  font-weight: 700;
  font-size: 0.88rem;
  min-width: 4.5rem;
  text-align: right;
}

.pts {
  font-weight: 400;
  font-size: 0.75rem;
  opacity: 0.6;
}

.muted {
  font-style: italic;
  color: #7a6a56;
  margin: 0;
}
</style>
