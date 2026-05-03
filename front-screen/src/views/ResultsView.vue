<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useI18n } from "vue-i18n";
import { useRoute } from "vue-router";

const { t } = useI18n();
import { useSessionFetcher } from "../composables/useSessionFetcher";
import type { PlayerResult } from "../types/results.types";

const route = useRoute();
const code = computed(() => route.params.code as string);

const showScore = computed(() => {
  const q = route.query.showScore;
  return q !== "false" && q !== "0";
});

const topOnly = computed(() => {
  const q = route.query.topOnly;
  return q === "true" || q === "1";
});

const { getResults } = useSessionFetcher();

const isLoading = computed(() => getResults.isLoading.value);
const error = computed(() => getResults.error.value);
const results = computed<PlayerResult[]>(
  () => getResults.data.value?.results ?? [],
);

const fetchResults = () => getResults.execute(code.value);

const displayedResults = computed(() =>
  topOnly.value ? results.value.slice(0, 3) : results.value,
);

const podiumPlaces = computed(() => {
  const top3 = results.value.slice(0, 3);
  // Reorder for podium display: [2nd, 1st, 3rd]
  if (top3.length >= 3) return [top3[1], top3[0], top3[2]];
  if (top3.length === 2) return [top3[1], top3[0]];
  return top3;
});

// ---------------------------------------------------------------------------
// Lifecycle
// ---------------------------------------------------------------------------

onMounted(() => {
  fetchResults();
});
</script>

<template>
  <div class="screen">
    <!-- Header -->
    <header class="header">
      <div>
        <div class="brand">{{ t("screen.brand") }}</div>
        <div class="meta-row">
          <span class="status-pill">{{ t("screen.results.status") }}</span>
          <span>{{ t("screen.header.session", { code }) }}</span>
        </div>
      </div>
    </header>

    <!-- Loading -->
    <div v-if="isLoading" class="results-card results-card--center">
      <div class="loading-spinner" />
      <p class="loading-text">{{ t("screen.results.loading") }}</p>
    </div>

    <!-- Error -->
    <div v-else-if="error" class="results-card results-card--center">
      <p class="error-icon">!</p>
      <p class="error-text">{{ error }}</p>
      <button class="retry-btn" @click="fetchResults">{{ t("screen.results.retry") }}</button>
    </div>

    <!-- Results: empty -->
    <section v-else-if="results.length === 0" class="empty">
      <p>{{ t("screen.results.empty") }}</p>
    </section>

    <!-- Results: podium + list -->
    <template v-else>
      <!-- Podium (top 3) -->
      <div v-if="results.length >= 2" class="podium">
        <div
          v-for="(player, idx) in podiumPlaces"
          :key="player.playerId"
          class="podium-item"
          :class="`podium-item--${player.rank}`"
          :style="{ animationDelay: `${idx * 0.15}s` }"
        >
          <div class="podium-rank">{{ player.rank }}</div>
          <div class="podium-bar" :class="`podium-bar--${player.rank}`" />
          <div class="podium-nickname">{{ player.nickname }}</div>
          <div v-if="showScore" class="podium-score">
            {{ t("screen.results.score", { score: player.score.toLocaleString() }) }}
          </div>
        </div>
      </div>

      <!-- Full list (or top-only based on param) -->
      <div class="results-card">
        <h2 class="results-heading">
          {{ topOnly ? t("screen.results.top3") : t("screen.results.ranking") }}
        </h2>
        <ol class="results-list">
          <li
            v-for="(player, idx) in displayedResults"
            :key="player.playerId"
            class="results-row"
            :style="{ animationDelay: `${idx * 0.08}s` }"
          >
            <span class="results-rank">{{ player.rank }}</span>
            <span class="results-nickname">{{ player.nickname }}</span>
            <span v-if="showScore" class="results-score">
              {{ t("screen.results.score", { score: player.score.toLocaleString() }) }}
            </span>
          </li>
        </ol>
      </div>
    </template>
  </div>
</template>

<style scoped>
/* ------------------------------------------------------------------ */
/* Results card                                                        */
/* ------------------------------------------------------------------ */

.results-card {
  background: #ffffff;
  border-radius: 28px;
  padding: clamp(2rem, 4vw, 3.5rem);
  box-shadow: 0 30px 60px rgba(20, 12, 3, 0.18);
  animation: rise 0.6s ease both;
}

.results-card--center {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 1.2rem;
  min-height: 280px;
}

/* ------------------------------------------------------------------ */
/* Loading                                                             */
/* ------------------------------------------------------------------ */

.loading-spinner {
  width: 48px;
  height: 48px;
  border: 4px solid #e5c7a1;
  border-top-color: #4a3f33;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

.loading-text {
  font-size: 1.1rem;
  color: #6d5a45;
}

/* ------------------------------------------------------------------ */
/* Error                                                               */
/* ------------------------------------------------------------------ */

.error-icon {
  width: 52px;
  height: 52px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8f1e7;
  border: 2px solid #e5c7a1;
  border-radius: 50%;
  font-size: 1.6rem;
  font-weight: 700;
  color: #4a3f33;
  margin: 0;
}

.error-text {
  color: #4a3f33;
  font-size: 1rem;
  max-width: 420px;
}

.retry-btn {
  border: none;
  background: #1b1b1b;
  color: #fff;
  padding: 0.6rem 1.6rem;
  border-radius: 12px;
  font-weight: 600;
  cursor: pointer;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.retry-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
}

/* ------------------------------------------------------------------ */
/* Unavailable state                                                   */
/* ------------------------------------------------------------------ */

.unavailable-icon {
  opacity: 0.7;
}

.unavailable-title {
  font-family: "Newsreader", serif;
  font-size: clamp(1.6rem, 2.5vw, 2.2rem);
  color: #4a3f33;
  margin: 0;
}

.unavailable-text {
  color: #6d5a45;
  font-size: 1.05rem;
  max-width: 460px;
  line-height: 1.6;
  margin: 0;
}

/* ------------------------------------------------------------------ */
/* Podium                                                              */
/* ------------------------------------------------------------------ */

.podium {
  display: flex;
  align-items: flex-end;
  justify-content: center;
  gap: 1.2rem;
  padding: 1rem 0 0;
}

.podium-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  animation: rise 0.6s ease both;
}

.podium-rank {
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #101010;
  color: #f9f1e6;
  border-radius: 50%;
  font-weight: 700;
  font-size: 1.1rem;
}

.podium-bar {
  width: 110px;
  border-radius: 12px 12px 0 0;
  transition: height 0.6s ease;
}

.podium-bar--1 {
  height: 160px;
  background: linear-gradient(180deg, #e5c7a1, #d9c7b0);
}

.podium-bar--2 {
  height: 120px;
  background: linear-gradient(180deg, #f8f1e7, #e5c7a1);
}

.podium-bar--3 {
  height: 90px;
  background: linear-gradient(180deg, #f8f1e7, #d9c7b0);
}

.podium-nickname {
  font-weight: 700;
  font-size: 1rem;
  color: #101010;
  max-width: 120px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.podium-score {
  font-size: 0.9rem;
  color: #6d5a45;
  font-weight: 600;
}

/* ------------------------------------------------------------------ */
/* Results list                                                        */
/* ------------------------------------------------------------------ */

.results-heading {
  font-family: "Newsreader", serif;
  font-size: clamp(1.4rem, 2vw, 1.8rem);
  margin: 0 0 1.2rem;
}

.results-list {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 0.6rem;
}

.results-row {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 0.9rem 1.2rem;
  background: #f8f1e7;
  border: 2px solid #e5c7a1;
  border-radius: 16px;
  animation: rise 0.6s ease both;
}

.results-rank {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #101010;
  color: #f9f1e6;
  border-radius: 50%;
  font-weight: 700;
  font-size: 0.9rem;
  flex-shrink: 0;
}

.results-nickname {
  flex: 1;
  font-weight: 600;
  font-size: 1rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.results-score {
  font-weight: 700;
  color: #4a3f33;
  font-size: 1rem;
  white-space: nowrap;
}

/* ------------------------------------------------------------------ */
/* Responsive                                                          */
/* ------------------------------------------------------------------ */

@media (max-width: 720px) {
  .podium {
    gap: 0.6rem;
  }

  .podium-bar {
    width: 80px;
  }

  .podium-bar--1 {
    height: 120px;
  }

  .podium-bar--2 {
    height: 90px;
  }

  .podium-bar--3 {
    height: 65px;
  }
}
</style>
