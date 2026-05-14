<script setup lang="ts">
import { ref } from "vue";
import { useTheme, type Theme } from "../composables/useTheme";

const props = defineProps<{
  locale: string;
  locales?: Array<{ value: string; label: string }>;
}>();

const emit = defineEmits<{
  "update:locale": [value: string];
}>();

const isOpen = ref(false);
const { theme, setTheme } = useTheme();

const themes: Array<{ value: Theme; label: string }> = [
  { value: "blue", label: "Marine" },
  { value: "black", label: "Classique" },
];

const defaultLocales = [
  { value: "fr", label: "Français" },
  { value: "en", label: "English" },
];

const availableLocales = props.locales ?? defaultLocales;
</script>

<template>
  <div class="sp-root">
    <button
      class="sp-trigger"
      @click="isOpen = true"
      :aria-label="'Paramètres'"
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        stroke-width="2"
        stroke-linecap="round"
        stroke-linejoin="round"
      >
        <circle cx="12" cy="12" r="3" />
        <path
          d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"
        />
      </svg>
    </button>

    <Transition name="sp-backdrop">
      <div v-if="isOpen" class="sp-backdrop" @click="isOpen = false" />
    </Transition>

    <Transition name="sp-panel">
      <div v-if="isOpen" class="sp-panel" role="dialog" aria-modal="true">
        <div class="sp-panel-header">
          <span class="sp-panel-title">Paramètres</span>
          <button class="sp-close" @click="isOpen = false" aria-label="Fermer">
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2.5"
              stroke-linecap="round"
            >
              <path d="M18 6 6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div class="sp-fields">
          <div class="sp-field">
            <label class="sp-label">Thème</label>
            <select
              class="sp-select"
              :value="theme"
              @change="
                setTheme(($event.target as HTMLSelectElement).value as Theme)
              "
            >
              <option v-for="t in themes" :key="t.value" :value="t.value">
                {{ t.label }}
              </option>
            </select>
          </div>

          <div class="sp-field">
            <label class="sp-label">Langue</label>
            <select
              class="sp-select"
              :value="locale"
              @change="
                emit(
                  'update:locale',
                  ($event.target as HTMLSelectElement).value,
                )
              "
            >
              <option
                v-for="l in availableLocales"
                :key="l.value"
                :value="l.value"
              >
                {{ l.label }}
              </option>
            </select>
          </div>
        </div>
      </div>
    </Transition>
  </div>
</template>

<style scoped>
.sp-root {
  position: fixed;
  bottom: 1.5rem;
  right: 1.5rem;
  z-index: 200;
}

.sp-trigger {
  box-sizing: border-box;
  width: 48px;
  height: 48px;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: var(--ds-radius-full);
  background: var(--ds-primary);
  color: var(--ds-text-on-primary);
  font-size: 0;
  line-height: 1;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  box-shadow: var(--ds-shadow-md);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.sp-trigger:hover {
  transform: translateY(-2px);
  box-shadow: var(--ds-shadow-btn);
}

.sp-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.25);
  z-index: 201;
}

.sp-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100dvh;
  width: 280px;
  background: var(--ds-surface);
  box-shadow: var(--ds-shadow-lg);
  z-index: 202;
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  gap: 2rem;
}

.sp-panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.sp-panel-title {
  font-weight: 700;
  font-size: 1.1rem;
  color: var(--ds-text);
}

.sp-close {
  box-sizing: border-box;
  width: 32px;
  height: 32px;
  padding: 0;
  margin: 0;
  border: none;
  border-radius: var(--ds-radius-full);
  background: var(--ds-secondary);
  color: var(--ds-text);
  font-size: 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: background 0.15s ease;
}

.sp-close:hover {
  background: var(--ds-secondary-dark);
}

.sp-fields {
  display: flex;
  flex-direction: column;
  gap: 1.2rem;
}

.sp-field {
  display: flex;
  flex-direction: column;
  gap: 0.4rem;
}

.sp-label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.06em;
  color: var(--ds-text-muted);
}

.sp-select {
  appearance: none;
  background: var(--ds-surface-raised);
  border: 1.5px solid var(--ds-border);
  border-radius: var(--ds-radius-sm);
  padding: 0.6rem 0.8rem;
  font-size: 0.95rem;
  color: var(--ds-text);
  cursor: pointer;
  width: 100%;
  transition: border-color 0.15s ease;
}

.sp-select:focus {
  outline: none;
  border-color: var(--ds-primary);
}

/* Transitions */
.sp-backdrop-enter-active,
.sp-backdrop-leave-active {
  transition: opacity 0.2s ease;
}
.sp-backdrop-enter-from,
.sp-backdrop-leave-to {
  opacity: 0;
}

.sp-panel-enter-active,
.sp-panel-leave-active {
  transition: transform 0.25s ease;
}
.sp-panel-enter-from,
.sp-panel-leave-to {
  transform: translateX(100%);
}
</style>
