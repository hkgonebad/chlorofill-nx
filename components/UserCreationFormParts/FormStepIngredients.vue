<template>
  <div>
    <h4 class="step-title">Ingredients</h4>
    <p class="text-muted step-description mb-4">Add all the ingredients needed for your creation.</p>
    <div class="ingredient-list mb-3">
      <div v-for="(ingredient, idx) in localIngredients" :key="idx" class="ingredient-item card mb-3">
        <div class="card-body">
          <div class="row g-2 align-items-center">
            <div class="col-md-5 col-sm-12 mb-2 mb-md-0">
              <label class="form-label small">Ingredient Name</label>
              <input :value="ingredient.name" @input="updateIngredientField(idx, 'name', $event.target.value)" type="text" class="form-control" placeholder="e.g. Flour" required />
            </div>
            <div class="col-md-3 col-sm-6 mb-2 mb-md-0">
              <label class="form-label small">Amount</label>
              <input :value="ingredient.amount" @input="updateIngredientField(idx, 'amount', $event.target.value)" type="text" class="form-control" placeholder="e.g. 2" />
            </div>
            <div class="col-md-3 col-sm-6 mb-2 mb-md-0">
              <label class="form-label small">Unit</label>
              <input :value="ingredient.unit" @input="updateIngredientField(idx, 'unit', $event.target.value)" type="text" class="form-control" placeholder="e.g. cups" />
            </div>
            <div class="col-md-1 col-sm-12 text-end">
              <button type="button" class="btn btn-danger btn-sm" @click="$emit('removeIngredient', idx)" title="Remove ingredient">
                <i class="pi pi-trash"></i>
              </button>
            </div>
          </div>
          <div class="mt-2">
            <label class="form-label small d-block">Image (Optional)</label>
            <input type="file" class="form-control form-control-sm" @change="(e) => $emit('handleIngredientImage', e, idx)" accept="image/*" />
            <div v-if="ingredient.image && ingredient.image.desiredName && !ingredient.image.file" class="form-text text-muted mt-1">Current: {{ ingredient.image.desiredName }}</div>
            <div v-if="ingredient.image && ingredient.image.file" class="form-text text-success mt-1">New: {{ ingredient.image.desiredName }}</div>
            <div class="form-text">Max 500x500px.</div>
          </div>
        </div>
      </div>
    </div>
    <button type="button" class="btn btn-outline-primary" @click="$emit('addIngredient')"><i class="pi pi-plus-circle me-1"></i> Add Ingredient</button>
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
  ingredients: {
    // Changed from modelValue to ingredients for clarity with v-model:ingredients
    type: Array,
    required: true,
  },
  errors: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["update:ingredients", "addIngredient", "removeIngredient", "handleIngredientImage"]);

// Use a local ref to manage ingredients to avoid directly mutating prop, then emit update
const localIngredients = ref(JSON.parse(JSON.stringify(props.ingredients)));

watch(
  () => props.ingredients,
  (newVal) => {
    localIngredients.value = JSON.parse(JSON.stringify(newVal));
  },
  { deep: true }
);

const updateIngredientField = (index, field, value) => {
  const updatedIngredients = JSON.parse(JSON.stringify(localIngredients.value));
  if (updatedIngredients[index]) {
    updatedIngredients[index][field] = value;
    localIngredients.value = updatedIngredients;
    nextTick(() => {
      // Ensure DOM is updated before emitting, though not strictly necessary for data
      emit("update:ingredients", updatedIngredients);
    });
  }
};

// Add, remove, and handleIngredientImage are emitted directly to parent as they might affect parent state logic beyond just the array.
// Parent (UserCreationMultiStepForm) will handle these actions and update the `form.ingredients` array,
// which will then flow back down to this component via the `ingredients` prop.
</script>

<style scoped>
/* Styles are expected to be global from _creations.scss */
</style>
