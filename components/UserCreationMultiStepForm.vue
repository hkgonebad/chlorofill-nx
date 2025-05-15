<template>
  <form @submit.prevent="handleSubmit" class="userCreationMultiStepForm">
    <FormProgress :currentStep="step" :totalSteps="5" :stepLabels="['Basic Info', 'Ingredients', 'Steps', 'Images', 'Review']" />

    <div class="form-container p-4">
      <FormStepBasicInfo v-if="step === 1" v-model:formData="form" v-model:tagsInput="tagsInput" :loading="loading" :errors="validationErrors" />
      <FormStepIngredients v-else-if="step === 2" v-model:ingredients="form.ingredients" :errors="validationErrors" @addIngredient="addIngredient" @removeIngredient="removeIngredient" @handleIngredientImage="handleIngredientImageChange" />
      <FormStepInstructions v-else-if="step === 3" v-model:steps="form.steps" :errors="validationErrors" @addStep="addStep" @removeStep="removeStep" />
      <FormStepImageUpload v-else-if="step === 4" :main-image="form.main_image" :loading="loading" :errors="validationErrors" @handleImageChange="handleImageChange" />
      <FormStepReview v-else-if="step === 5" :form-data="form" />
    </div>

    <div class="d-flex justify-content-between mt-4">
      <button type="button" class="btn btn-outline-secondary" @click="prevStep" :disabled="step === 1 || loading"><i class="pi pi-arrow-left me-1"></i> Back</button>
      <div>
        <button v-if="step < 5" type="button" class="btn btn-primary" @click="nextStep" :disabled="loading">Next <i class="pi pi-arrow-right ms-1"></i></button>
        <button v-else type="submit" class="btn btn-success btn-lg" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
          Submit Creation
        </button>
      </div>
    </div>
  </form>
</template>

<script setup>
import { ref, watch } from "vue";
import FormProgress from "./UserCreationFormParts/FormProgress.vue";
import FormStepBasicInfo from "./UserCreationFormParts/FormStepBasicInfo.vue";
import FormStepIngredients from "./UserCreationFormParts/FormStepIngredients.vue";
import FormStepInstructions from "./UserCreationFormParts/FormStepInstructions.vue";
import FormStepImageUpload from "./UserCreationFormParts/FormStepImageUpload.vue";
import FormStepReview from "./UserCreationFormParts/FormStepReview.vue";

const props = defineProps({
  model: { type: Object, default: () => ({}) },
  mode: { type: String, default: "create" },
  loading: { type: Boolean, default: false },
});
const emit = defineEmits(["submit"]);

const step = ref(1);
const tagsInput = ref("");
const validationErrors = ref([]);

// Helper function to sanitize filenames
const sanitizeFilename = (name, prefix = "image") => {
  if (!name) return `${prefix}-untitled`;
  const cleanedName = name
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^a-z0-9-]/g, "")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
  return cleanedName.substring(0, 50) || prefix;
};

const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
};

const initialFormState = () => ({
  title: "",
  type: "recipe",
  description: "",
  tags: [],
  ingredients: [],
  steps: [],
  main_image: {
    file: null,
    desiredName: "",
    previewUrl: "",
  },
  is_public: true,
});

const form = ref(initialFormState());

watch(
  () => props.model,
  (newModel) => {
    if (props.mode === "edit" && newModel && Object.keys(newModel).length > 0) {
      form.value.title = newModel.title || "";
      form.value.type = newModel.type || "recipe";
      form.value.description = newModel.description || "";
      tagsInput.value = (newModel.tags || []).join(", ");
      form.value.tags = newModel.tags || [];
      form.value.steps = newModel.steps || [];
      form.value.is_public = newModel.is_public !== undefined ? newModel.is_public : true;
      form.value.main_image.previewUrl = newModel.image_path || "";
      form.value.main_image.file = null;
      form.value.main_image.desiredName = "";
      form.value.ingredients = (newModel.ingredients || []).map((ing) => ({
        name: ing.name || "",
        amount: ing.amount || "",
        unit: ing.unit || "",
        image: { file: null, desiredName: ing.image_url || "" }, // Keep original image_url as desiredName for review, new file will overwrite
      }));
    } else {
      Object.assign(form.value, initialFormState());
      tagsInput.value = "";
      step.value = 1;
    }
  },
  { immediate: true, deep: true }
);

const validateStep = () => {
  validationErrors.value = [];
  if (step.value === 1) {
    if (!form.value.title || form.value.title.length < 3) validationErrors.value.push("Title is required (min 3 characters).");
    if (!form.value.description || form.value.description.length < 10) validationErrors.value.push("Description is required (min 10 characters).");
  } else if (step.value === 2) {
    if (form.value.ingredients.length > 0 && !form.value.ingredients.some((i) => i.name && i.name.trim().length > 0)) {
      validationErrors.value.push("At least one ingredient must have a name if ingredients are added.");
    }
  } else if (step.value === 3) {
    if (form.value.steps.length > 0 && !form.value.steps.some((s) => s && s.trim().length > 0)) {
      validationErrors.value.push("At least one step must have a description if steps are added.");
    }
  } else if (step.value === 4) {
    if (props.mode === "create" && !form.value.main_image.file) {
      validationErrors.value.push("A main image is required for new creations.");
    }
  }
  return validationErrors.value.length === 0;
};

const nextStep = () => {
  if (!validateStep()) return;
  if (step.value === 1) {
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

// Event handlers for child components
const addIngredient = () => form.value.ingredients.push({ name: "", amount: "", unit: "", image: { file: null, desiredName: "" } });
const removeIngredient = (idx) => form.value.ingredients.splice(idx, 1);

const addStep = () => form.value.steps.push("");
const removeStep = (idx) => form.value.steps.splice(idx, 1);

const handleIngredientImageChange = (e, idx) => {
  const file = e.target.files[0];
  if (file) {
    const extension = getFileExtension(file.name);
    const creationTitlePart = sanitizeFilename(form.value.title, "creation");
    const ingredientNamePart = sanitizeFilename(form.value.ingredients[idx].name, `ingredient${idx}`);
    form.value.ingredients[idx].image = {
      file: file,
      desiredName: `${creationTitlePart}_${ingredientNamePart}.${extension}`,
      // previewUrl: URL.createObjectURL(file) // Optional: for immediate preview in ingredient item
    };
  } else {
    // Retain existing image info if no new file selected during edit, clear if new file was staged then removed
    const existingIngredient = props.mode === "edit" && props.model && props.model.ingredients && props.model.ingredients[idx];
    form.value.ingredients[idx].image = {
      file: null,
      desiredName: existingIngredient && existingIngredient.image_url ? existingIngredient.image_url : "",
    };
  }
};

const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const extension = getFileExtension(file.name);
    form.value.main_image.file = file;
    form.value.main_image.desiredName = `${sanitizeFilename(form.value.title)}.${extension}`;
    const reader = new FileReader();
    reader.onload = (ev) => (form.value.main_image.previewUrl = ev.target.result);
    reader.readAsDataURL(file);
  } else {
    form.value.main_image.file = null;
    form.value.main_image.desiredName = "";
    form.value.main_image.previewUrl = props.mode === "edit" && props.model ? props.model.image_path || "" : "";
  }
};

const handleSubmit = () => {
  let allValid = true;
  const originalStep = step.value;
  for (let i = 1; i <= 4; i++) {
    step.value = i;
    if (!validateStep()) {
      allValid = false;
      break;
    }
  }
  step.value = originalStep;
  if (!allValid) return;

  step.value = 5; // Move to review step for visual confirmation if not already there

  const dataToEmit = {
    title: form.value.title,
    type: form.value.type,
    description: form.value.description,
    tags: form.value.tags,
    is_public: form.value.is_public,
    steps: form.value.steps,
    image: form.value.main_image.file ? { file: form.value.main_image.file, name: form.value.main_image.desiredName } : null,
    ingredients: form.value.ingredients.map((ing) => ({
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      image: ing.image && ing.image.file ? { file: ing.image.file, name: ing.image.desiredName } : null,
      // If ing.image.file is null, but ing.image.desiredName has a value (existing image URL),
      // the parent component receiving the submit event should handle this for edit mode.
      // For create mode, it means no image was selected for this ingredient.
      ...(ing.image && !ing.image.file && ing.image.desiredName && props.mode === "edit" && { existing_image_url: ing.image.desiredName }),
    })),
  };
  emit("submit", dataToEmit);
};
</script>

<!-- Styles moved to assets/scss/layout/_creations.scss -->
