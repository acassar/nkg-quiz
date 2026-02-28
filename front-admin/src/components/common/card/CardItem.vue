<script setup lang="ts">
type Action = {
  key: string;
  label: string;
  onClick: () => void;
  color: string;
};
export type CardItemAction = Action;

defineEmits<{
  (e: "click"): void;
}>();

const props = defineProps<{
  title: string;
  bgColor: string;
  selected?: boolean;
  selectedBgColor?: string;
  actions?: Action[];
}>();
</script>

<template>
  <div @click.prevent class="card selectable-card">
    <div class="card-content">
      <div
        @click.prevent="$emit('click')"
        class="section-title"
        :class="{ selected: props.selected }"
      >
        {{ title }}
      </div>
      <div
        v-for="action in actions"
        :key="action.key"
        class="action-wrapper"
        :style="{ 'background-color': action.color }"
      >
        <span class="action" @click="action.onClick">{{ action.label }}</span>
      </div>
    </div>
  </div>
</template>

<style scoped>
.card {
  background-color: v-bind("bgColor");
  padding: 0px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.section-title.selected {
  background-color: v-bind("selectedBgColor");
}

.section-title:hover {
  background-color: v-bind("selectedBgColor");
}

.card-content {
  display: flex;
  align-items: stretch;
  justify-content: space-between;
  height: 100%;
  flex: 1;
}

.section-title {
  padding: 1.6rem;
  flex: 1 0 auto;
}

.action-wrapper {
  opacity: 0.5;
  transition: opacity 0.2s;
}

.action-wrapper:hover {
  opacity: 1;
}

.action {
  padding: 0.8rem;
  cursor: pointer;
  display: flex;
  align-items: center;
  height: 100%;
}
</style>
