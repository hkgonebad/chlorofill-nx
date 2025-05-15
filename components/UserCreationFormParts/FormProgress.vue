<template>
  <div class="mb-4">
    <div class="progress progress-thin">
      <div class="progress-bar bg-success" role="progressbar" :style="`width: ${progressPercentage}%`" :aria-valuenow="currentStep" :aria-valuemin="1" :aria-valuemax="totalSteps"></div>
    </div>
    <div class="d-flex justify-content-between mt-1">
      <span v-for="(label, index) in stepLabels" :key="index" class="progress-label" :class="{ 'fw-bold': index + 1 === currentStep }">
        {{ label }}
      </span>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  currentStep: {
    type: Number,
    required: true,
  },
  totalSteps: {
    type: Number,
    required: true,
  },
  stepLabels: {
    type: Array,
    required: true,
    default: () => ["Basic Info", "Ingredients", "Steps", "Images", "Review"],
  },
});

const progressPercentage = computed(() => {
  if (props.totalSteps === 0) return 0;
  return (props.currentStep / props.totalSteps) * 100;
});
</script>

<style scoped>
/* Styles are expected to be global from _creations.scss */
.progress-label {
  font-size: 0.75rem;
  color: var(--bs-secondary-color);
}
.progress-label.fw-bold {
  color: var(--bs-primary); /* Or a more prominent color */
}
.progress-thin {
  height: 0.5rem;
  border-radius: var(--bs-border-radius-pill);
  background-color: var(--bs-tertiary-bg);
}
</style>
