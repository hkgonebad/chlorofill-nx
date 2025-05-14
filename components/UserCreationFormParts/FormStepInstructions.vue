<template>
  <div>
    <h4 class="step-title">Preparation Steps</h4>
    <p class="text-muted step-description mb-4">Explain how to prepare your creation step by step.</p>
    <div class="preparation-steps mb-3">
      <div v-for="(stepText, idx) in localSteps" :key="idx" class="step-item card mb-3">
        <div class="card-body">
          <div class="d-flex">
            <div class="step-number me-3">
              <span class="badge bg-primary rounded-circle">{{ idx + 1 }}</span>
            </div>
            <div class="step-content flex-grow-1">
              <input :value="stepText" @input="updateStepText(idx, $event.target.value)" type="text" class="form-control" placeholder="Describe this step" required />
            </div>
            <div class="step-actions ms-2">
              <button type="button" class="btn btn-danger btn-sm" @click="$emit('removeStep', idx)" title="Remove step">
                <i class="pi pi-trash"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <button type="button" class="btn btn-outline-primary" @click="$emit('addStep')"><i class="pi pi-plus-circle me-1"></i> Add Step</button>
    <div v-if="errors.length" class="alert alert-danger mt-3">
      <ul class="mb-0">
        <li v-for="err in errors" :key="err">{{ err }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, nextTick } from "vue";

const props = defineProps({
  steps: {
    type: Array,
    required: true,
  },
  errors: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:steps", "addStep", "removeStep"]);

const localSteps = ref(JSON.parse(JSON.stringify(props.steps)));

watch(
  () => props.steps,
  (newVal) => {
    localSteps.value = JSON.parse(JSON.stringify(newVal));
  },
  { deep: true }
);

const updateStepText = (index, newText) => {
  const updatedSteps = [...localSteps.value];
  if (updatedSteps[index] !== undefined) {
    updatedSteps[index] = newText;
    localSteps.value = updatedSteps;
    nextTick(() => {
      emit("update:steps", updatedSteps);
    });
  }
};
</script>

<style scoped>
/* Styles are expected to be global from _creations.scss */
</style>
