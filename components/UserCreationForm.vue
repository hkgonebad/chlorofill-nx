<template>
  <form @submit.prevent="handleSubmit" class="userCreationForm">
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
    <div class="row">
      <div class="col-md-4 mb-3">
        <label for="prepTime" class="form-label">Prep Time (min)</label>
        <input v-model.number="form.prep_time_minutes" type="number" id="prepTime" class="form-control" min="0" :disabled="loading" />
      </div>
      <div class="col-md-4 mb-3">
        <label for="cookTime" class="form-label">Cook Time (min)</label>
        <input v-model.number="form.cook_time_minutes" type="number" id="cookTime" class="form-control" min="0" :disabled="loading || form.type === 'cocktail'" :readonly="form.type === 'cocktail'" />
      </div>
      <div class="col-md-4 mb-3">
        <label for="servings" class="form-label">Servings</label>
        <input v-model.number="form.servings" type="number" id="servings" class="form-control" min="1" :disabled="loading" />
      </div>
    </div>
    <div class="mb-3">
      <label for="image" class="form-label">Image (optional)</label>
      <input type="file" id="image" class="form-control" @change="handleImageChange" :disabled="loading" accept="image/*" />
      <div v-if="form.imagePreview" class="mt-2">
        <img :src="form.imagePreview" alt="Preview" class="img-fluid rounded userCreationImagePreview" style="max-height: 180px" />
      </div>
    </div>
    <div class="form-check form-switch mb-3">
      <input v-model="form.is_public" class="form-check-input" type="checkbox" id="isPublic" :disabled="loading" />
      <label class="form-check-label" for="isPublic">Public (visible to others)</label>
    </div>
    <div class="d-flex justify-content-end">
      <button type="submit" class="btn btn-primary" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
        {{ mode === "edit" ? "Save Changes" : "Create" }}
      </button>
    </div>
  </form>
</template>

<script setup>
import { ref, watch, computed } from "vue";

const props = defineProps({
  model: {
    type: Object,
    default: () => ({}),
  },
  mode: {
    type: String,
    default: "create", // or 'edit'
  },
  loading: {
    type: Boolean,
    default: false,
  },
});
const emit = defineEmits(["submit"]);

const form = ref({
  title: "",
  type: "recipe",
  description: "",
  image: null, // File object
  imagePreview: "",
  prep_time_minutes: null,
  cook_time_minutes: null,
  servings: null,
  is_public: true,
});

// Prefill form if editing
watch(
  () => props.model,
  (val) => {
    if (val) {
      form.value = {
        title: val.title || "",
        type: val.type || "recipe",
        description: val.description || "",
        image: null,
        imagePreview: val.image_path || "",
        prep_time_minutes: val.prep_time_minutes ?? null,
        cook_time_minutes: val.cook_time_minutes ?? null,
        servings: val.servings ?? null,
        is_public: val.is_public !== undefined ? val.is_public : true,
      };
    }
  },
  { immediate: true }
);

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
  // Don't include imagePreview in submit
  const { imagePreview, ...submitData } = form.value;
  emit("submit", submitData);
};
</script>
