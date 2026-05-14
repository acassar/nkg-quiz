<script setup lang="ts">
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";
import type { LiveStats } from "@/types/session/session.types";

const props = defineProps<{ stats: LiveStats | null }>();

const { t } = useI18n();

type SortMode = "score" | "completion";
const sortMode = ref<SortMode>("score");

const totalQuestions = computed(() => props.stats?.totalQuestions ?? 0);

const players = computed(() =>
  [...(props.stats?.players ?? [])].sort((a, b) => {
    if (sortMode.value === "completion") {
      const diff = b.totalAnswers - a.totalAnswers;
      return diff !== 0 ? diff : b.score - a.score;
    }
    return b.score - a.score;
  }),
);
</script>

<template>
  <div class="card players-list">
    <div class="list-header">
      <div class="section-title">{{ t("stats.players.sectionTitle") }}</div>
      <div class="sort-buttons">
        <button
          :class="['sort-btn', { active: sortMode === 'score' }]"
          @click="sortMode = 'score'"
        >{{ t("stats.players.sortScore") }}</button>
        <button
          :class="['sort-btn', { active: sortMode === 'completion' }]"
          @click="sortMode = 'completion'"
        >{{ t("stats.players.sortCompletion") }}</button>
      </div>
    </div>

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

.list-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.5rem;
}

.sort-buttons {
  display: flex;
  gap: 0.25rem;
}

.sort-btn {
  padding: 0.2rem 0.6rem;
  font-size: 0.75rem;
  border-radius: var(--radius-sm);
  border: 1px solid var(--border-color);
  background: transparent;
  color: var(--text-muted);
  cursor: pointer;
}

.sort-btn.active {
  background: var(--color-primary, #4f46e5);
  border-color: var(--color-primary, #4f46e5);
  color: #fff;
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
  border-radius: var(--radius-sm);
  background: var(--bg-player-row);
  font-size: 0.88rem;
}

.rank {
  font-family: var(--font-mono);
  font-weight: 700;
  font-size: 0.8rem;
  min-width: 2rem;
  color: var(--text-muted);
}

.nickname {
  flex: 1;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.progress {
  font-family: var(--font-mono);
  font-size: 0.78rem;
  color: var(--text-muted);
  min-width: 3.5rem;
  text-align: right;
}

.sep {
  opacity: 0.5;
  margin: 0 1px;
}

.score {
  font-family: var(--font-mono);
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
  color: var(--text-muted);
  margin: 0;
}
</style>
