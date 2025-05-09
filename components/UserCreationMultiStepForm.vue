<template>
  <form @submit.prevent="handleSubmit" class="userCreationMultiStepForm">
    <div v-if="step === 1">
      <!-- Step 1: Basic Info -->
      <h4>Step 1: Basic Info</h4>
      <div class="mb-3">
        <label for="title" class="form-label">Title</label>
        <input v-model="form.title" type="text" id="title" class="form-control" required minlength="3" :disabled="loading" />
      </div>
      <div class="mb-3">
        <label for="type" class="form-label">Type</label>
        <select v-model="form.type" id="type" class="form-select" required :disabled="loading">
          <option value="recipe">Recipe</option>
          <option value="cocktail">Cocktail</option>
        </select>
      </div>
      <div class="mb-3">
        <label for="description" class="form-label">Description</label>
        <textarea v-model="form.description" id="description" class="form-control" rows="3" :disabled="loading"></textarea>
      </div>
      <div class="mb-3">
        <label for="tags" class="form-label">Tags (comma separated)</label>
        <input v-model="tagsInput" type="text" id="tags" class="form-control" :disabled="loading" placeholder="e.g. vegan, spicy, summer" />
      </div>
      <div class="form-check form-switch mb-3">
        <input v-model="form.is_public" class="form-check-input" type="checkbox" id="isPublic" :disabled="loading" />
        <label class="form-check-label" for="isPublic">Public (visible to others)</label>
      </div>
    </div>

    <div v-else-if="step === 2">
      <!-- Step 2: Ingredients -->
      <h4>Step 2: Ingredients</h4>
      <div v-for="(ingredient, idx) in form.ingredients" :key="idx" class="row mb-2 align-items-end">
        <div class="col-5">
          <input v-model="ingredient.name" type="text" class="form-control" placeholder="Ingredient" required />
        </div>
        <div class="col-3">
          <input v-model="ingredient.amount" type="text" class="form-control" placeholder="Amount" />
        </div>
        <div class="col-3">
          <input v-model="ingredient.unit" type="text" class="form-control" placeholder="Unit" />
        </div>
        <div class="col-1">
          <button type="button" class="btn btn-danger btn-sm" @click="removeIngredient(idx)">&times;</button>
        </div>
        <div class="col-12 mt-1">
          <!-- Ingredient image upload stub -->
          <input type="file" class="form-control form-control-sm" @change="(e) => handleIngredientImageChange(e, idx)" accept="image/*" />
          <small class="text-muted">(Optional) Ingredient image (stub, not yet saved)</small>
        </div>
      </div>
      <button type="button" class="btn btn-secondary btn-sm" @click="addIngredient">Add Ingredient</button>
      <div v-if="validationErrors.length" class="alert alert-danger mt-2">
        <ul class="mb-0">
          <li v-for="err in validationErrors" :key="err">{{ err }}</li>
        </ul>
      </div>
    </div>

    <div v-else-if="step === 3">
      <!-- Step 3: Steps -->
      <h4>Step 3: Steps</h4>
      <div v-for="(stepText, idx) in form.steps" :key="idx" class="mb-2 d-flex align-items-center">
        <span class="me-2">Step {{ idx + 1 }}</span>
        <input v-model="form.steps[idx]" type="text" class="form-control me-2" placeholder="Describe this step" required />
        <button type="button" class="btn btn-danger btn-sm" @click="removeStep(idx)">&times;</button>
      </div>
      <button type="button" class="btn btn-secondary btn-sm" @click="addStep">Add Step</button>
    </div>

    <div v-else-if="step === 4">
      <!-- Step 4: Image Upload -->
      <h4>Step 4: Image Upload</h4>
      <input type="file" id="image" class="form-control" @change="handleImageChange" :disabled="loading" accept="image/*" />
      <div v-if="form.imagePreview" class="mt-2">
        <img :src="form.imagePreview" alt="Preview" class="img-fluid rounded userCreationImagePreview" style="max-height: 180px" />
      </div>
    </div>

    <div v-else-if="step === 5">
      <!-- Step 5: Review & Submit -->
      <h4>Step 5: Review & Submit</h4>
      <div class="mb-2"><strong>Title:</strong> {{ form.title }}</div>
      <div class="mb-2"><strong>Type:</strong> {{ form.type }}</div>
      <div class="mb-2"><strong>Description:</strong> {{ form.description }}</div>
      <div class="mb-2"><strong>Tags:</strong> {{ form.tags.join(", ") }}</div>
      <div class="mb-2">
        <strong>Ingredients:</strong>
        <ul>
          <li v-for="(ing, idx) in form.ingredients" :key="idx">{{ ing.amount }} {{ ing.unit }} {{ ing.name }}</li>
        </ul>
      </div>
      <div class="mb-2">
        <strong>Steps:</strong>
        <ol>
          <li v-for="(s, idx) in form.steps" :key="idx">{{ s }}</li>
        </ol>
      </div>
      <div class="mb-2"><strong>Public:</strong> {{ form.is_public ? "Yes" : "No" }}</div>
      <div v-if="form.imagePreview" class="mb-2">
        <strong>Image Preview:</strong><br />
        <img :src="form.imagePreview" alt="Preview" class="img-fluid rounded userCreationImagePreview" style="max-height: 180px" />
      </div>
    </div>

    <div class="d-flex justify-content-between mt-4">
      <button type="button" class="btn btn-outline-secondary" @click="prevStep" :disabled="step === 1 || loading">Back</button>
      <button v-if="step < 5" type="button" class="btn btn-primary" @click="nextStep" :disabled="loading">Next</button>
      <button v-else type="submit" class="btn btn-success" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        Submit
      </button>
    </div>

    <div v-if="validationErrors.length && (step === 1 || step === 3)" class="alert alert-danger mt-2">
      <ul class="mb-0">
        <li v-for="err in validationErrors" :key="err">{{ err }}</li>
      </ul>
    </div>
  </form>
</template>

<script setup>
import { ref, computed, watch } from "vue";

const props = defineProps({
  model: { type: Object, default: () => ({}) },
  mode: { type: String, default: "create" },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(["submit"]);

const step = ref(1);
const tagsInput = ref("");
const validationErrors = ref([]);

const form = ref({
  title: "",
  type: "recipe",
  description: "",
  tags: [],
  ingredients: [],
  steps: [],
  image: null,
  imagePreview: "",
  is_public: true,
});

watch(
  () => props.model,
  (newModel) => {
    if (props.mode === "edit" && newModel && Object.keys(newModel).length > 0) {
      form.value.title = newModel.title || "";
      form.value.type = newModel.type || "recipe";
      form.value.description = newModel.description || "";
      tagsInput.value = (newModel.tags || []).join(", ");
      form.value.tags = newModel.tags || []; // Keep as array internally
      form.value.ingredients = newModel.ingredients || [];
      form.value.steps = newModel.steps || [];
      form.value.imagePreview = newModel.image_path || ""; // Use image_path for preview in edit mode
      form.value.image = null; // Reset file input
      form.value.is_public = newModel.is_public !== undefined ? newModel.is_public : true;
    }
  },
  { immediate: true, deep: true } // immediate to run on load, deep for nested objects if model changes
);

const validateStep = () => {
  validationErrors.value = [];
  if (step.value === 1) {
    if (!form.value.title || form.value.title.length < 3) {
      validationErrors.value.push("Title is required (min 3 characters)");
    }
    if (!form.value.description || form.value.description.length < 10) {
      validationErrors.value.push("Description is required (min 10 characters)");
    }
  } else if (step.value === 2) {
    if (!form.value.ingredients.length || !form.value.ingredients.some((i) => i.name && i.name.length > 0)) {
      validationErrors.value.push("At least one ingredient with a name is required");
    }
  } else if (step.value === 3) {
    if (!form.value.steps.length || !form.value.steps.some((s) => s && s.length > 0)) {
      validationErrors.value.push("At least one step is required");
    }
  }
  return validationErrors.value.length === 0;
};

const nextStep = () => {
  if (!validateStep()) return;
  if (step.value === 1) {
    // Parse tags
    form.value.tags = tagsInput.value
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);
  }
  step.value = Math.min(step.value + 1, 5);
};
const prevStep = () => {
  step.value = Math.max(step.value - 1, 1);
};

const addIngredient = () => {
  form.value.ingredients.push({ name: "", amount: "", unit: "", image: null });
};
const removeIngredient = (idx) => {
  form.value.ingredients.splice(idx, 1);
};
const addStep = () => {
  form.value.steps.push("");
};
const removeStep = (idx) => {
  form.value.steps.splice(idx, 1);
};

const handleIngredientImageChange = (e, idx) => {
  const file = e.target.files[0];
  if (file) {
    form.value.ingredients[idx].image = file;
  } else {
    form.value.ingredients[idx].image = null;
  }
};

const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    form.value.image = file;
    const reader = new FileReader();
    reader.onload = (ev) => {
      form.value.imagePreview = ev.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    form.value.image = null;
    form.value.imagePreview = "";
  }
};

const handleSubmit = () => {
  if (!validateStep()) return;
  // Don't include imagePreview in submit
  const { imagePreview, ...submitData } = form.value;
  emit("submit", submitData);
};
</script>

<style scoped>
.userCreationMultiStepForm {
  max-width: 600px;
  margin: 0 auto;
}
.userCreationImagePreview {
  border: 1px solid #ccc;
  background: #f8f9fa;
  padding: 4px;
}
</style>
