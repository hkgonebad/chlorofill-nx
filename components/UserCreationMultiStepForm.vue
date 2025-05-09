<template>
  <form @submit.prevent="handleSubmit" class="userCreationMultiStepForm">
    <!-- Progress Bar -->
    <div class="mb-4">
      <div class="progress progress-thin">
        <div class="progress-bar bg-success" role="progressbar" :style="`width: ${(step / 5) * 100}%`" :aria-valuenow="step" aria-valuemin="1" aria-valuemax="5"></div>
      </div>
      <div class="d-flex justify-content-between mt-1">
        <span class="progress-label">Basic Info</span>
        <span class="progress-label">Ingredients</span>
        <span class="progress-label">Steps</span>
        <span class="progress-label">Images</span>
        <span class="progress-label">Review</span>
      </div>
    </div>

    <div class="form-container p-4">
      <div v-if="step === 1">
        <h4 class="step-title">Basic Info</h4>
        <p class="text-muted step-description mb-4">Let's start with some basic information about your creation.</p>
        <div class="mb-4">
          <label for="title" class="form-label">Title</label>
          <input v-model="form.title" type="text" id="title" class="form-control form-control-lg" required minlength="3" :disabled="loading" placeholder="Give your creation a name" />
        </div>
        <div class="mb-4">
          <label for="type" class="form-label">Type</label>
          <select v-model="form.type" id="type" class="form-select form-select-lg" required :disabled="loading">
            <option value="recipe">Recipe</option>
            <option value="cocktail">Cocktail</option>
          </select>
        </div>
        <div class="mb-4">
          <label for="description" class="form-label">Description</label>
          <textarea v-model="form.description" id="description" class="form-control" rows="3" :disabled="loading" placeholder="Describe your creation in a few sentences" required minlength="10"></textarea>
        </div>
        <div class="mb-4">
          <label for="tags" class="form-label">Tags</label>
          <input v-model="tagsInput" type="text" id="tags" class="form-control" :disabled="loading" placeholder="e.g. vegan, spicy, summer (comma separated)" />
          <div class="form-text">Separate multiple tags with commas</div>
        </div>
        <div class="form-check form-switch mb-3">
          <input v-model="form.is_public" class="form-check-input" type="checkbox" id="isPublic" :disabled="loading" />
          <label class="form-check-label" for="isPublic">Public (visible to others)</label>
        </div>
        <div v-if="validationErrors.length && step === 1" class="alert alert-danger mt-3">
          <ul class="mb-0">
            <li v-for="err in validationErrors" :key="err">{{ err }}</li>
          </ul>
        </div>
      </div>

      <div v-else-if="step === 2">
        <h4 class="step-title">Ingredients</h4>
        <p class="text-muted step-description mb-4">Add all the ingredients needed for your creation.</p>
        <div class="ingredient-list mb-3">
          <div v-for="(ingredient, idx) in form.ingredients" :key="idx" class="ingredient-item card mb-3">
            <div class="card-body">
              <div class="row g-2 align-items-center">
                <div class="col-md-5 col-sm-12 mb-2 mb-md-0">
                  <label class="form-label small">Ingredient Name</label>
                  <input v-model="ingredient.name" type="text" class="form-control" placeholder="e.g. Flour" required />
                </div>
                <div class="col-md-3 col-sm-6 mb-2 mb-md-0">
                  <label class="form-label small">Amount</label>
                  <input v-model="ingredient.amount" type="text" class="form-control" placeholder="e.g. 2" />
                </div>
                <div class="col-md-3 col-sm-6 mb-2 mb-md-0">
                  <label class="form-label small">Unit</label>
                  <input v-model="ingredient.unit" type="text" class="form-control" placeholder="e.g. cups" />
                </div>
                <div class="col-md-1 col-sm-12 text-end">
                  <button type="button" class="btn btn-danger btn-sm" @click="removeIngredient(idx)" title="Remove ingredient">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </div>
              <div class="mt-2">
                <label class="form-label small d-block">Image (Optional)</label>
                <input type="file" class="form-control form-control-sm" @change="(e) => handleIngredientImageChange(e, idx)" accept="image/*" />
                <div class="form-text">Max 500x500px. (Full functionality for saving ingredient images coming soon)</div>
              </div>
            </div>
          </div>
        </div>
        <button type="button" class="btn btn-outline-primary" @click="addIngredient"><i class="pi pi-plus-circle me-1"></i> Add Ingredient</button>
        <div v-if="validationErrors.length && step === 2" class="alert alert-danger mt-3">
          <ul class="mb-0">
            <li v-for="err in validationErrors" :key="err">{{ err }}</li>
          </ul>
        </div>
      </div>

      <div v-else-if="step === 3">
        <h4 class="step-title">Preparation Steps</h4>
        <p class="text-muted step-description mb-4">Explain how to prepare your creation step by step.</p>
        <div class="preparation-steps mb-3">
          <div v-for="(stepText, idx) in form.steps" :key="idx" class="step-item card mb-3">
            <div class="card-body">
              <div class="d-flex">
                <div class="step-number me-3">
                  <span class="badge bg-primary rounded-circle">{{ idx + 1 }}</span>
                </div>
                <div class="step-content flex-grow-1">
                  <input v-model="form.steps[idx]" type="text" class="form-control" placeholder="Describe this step" required />
                </div>
                <div class="step-actions ms-2">
                  <button type="button" class="btn btn-danger btn-sm" @click="removeStep(idx)" title="Remove step">
                    <i class="pi pi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button type="button" class="btn btn-outline-primary" @click="addStep"><i class="pi pi-plus-circle me-1"></i> Add Step</button>
        <div v-if="validationErrors.length && step === 3" class="alert alert-danger mt-3">
          <ul class="mb-0">
            <li v-for="err in validationErrors" :key="err">{{ err }}</li>
          </ul>
        </div>
      </div>

      <div v-else-if="step === 4">
        <h4 class="step-title">Image Upload</h4>
        <p class="text-muted step-description mb-4">Add a beautiful image of your finished creation.</p>
        <div class="image-upload-container">
          <div class="mb-3">
            <label for="image" class="form-label">Select Main Image</label>
            <input type="file" id="image" class="form-control" @change="handleImageChange" :disabled="loading" accept="image/*" />
            <div class="form-text">Required. Minimum 1600x500px. This will be the main display image.</div>
          </div>
          <div v-if="form.main_image.previewUrl" class="image-preview-container text-center mt-4">
            <h6 class="mb-2">Preview</h6>
            <div class="image-preview-wrapper">
              <img :src="form.main_image.previewUrl" alt="Preview" class="img-fluid rounded userCreationImagePreview" />
            </div>
          </div>
          <div v-else class="text-center mt-4 p-5 border rounded image-preview-wrapper">
            <i class="pi pi-image fs-1 text-muted"></i>
            <p class="text-muted mt-2">No image selected</p>
          </div>
        </div>
        <div v-if="validationErrors.length && step === 4" class="alert alert-danger mt-3">
          <ul class="mb-0">
            <li v-for="err in validationErrors" :key="err">{{ err }}</li>
          </ul>
        </div>
      </div>

      <div v-else-if="step === 5">
        <h4 class="step-title">Review & Submit</h4>
        <p class="text-muted step-description mb-4">Please review your creation before submitting.</p>
        <div class="card mb-4">
          <div class="card-body">
            <div class="row">
              <div class="col-md-8">
                <h5 class="card-title mb-3">{{ form.title }}</h5>
                <div class="mb-3">
                  <span class="badge bg-secondary me-2">{{ form.type === "recipe" ? "Recipe" : "Cocktail" }}</span>
                  <span v-if="form.is_public" class="badge bg-success">Public</span>
                  <span v-else class="badge bg-warning">Private</span>
                </div>
                <p class="card-text">{{ form.description }}</p>
                <div v-if="form.tags.length" class="mb-3">
                  <h6 class="small text-uppercase">Tags</h6>
                  <div>
                    <span v-for="tag in form.tags" :key="tag" class="badge text-dark me-1 mb-1">
                      {{ tag }}
                    </span>
                  </div>
                </div>
              </div>
              <div class="col-md-4">
                <div v-if="form.main_image.previewUrl" class="text-center">
                  <img :src="form.main_image.previewUrl" alt="Preview" class="img-fluid rounded userCreationImagePreview" />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="row g-4">
          <div class="col-md-6">
            <div class="card h-100">
              <div class="card-header">
                <h6 class="mb-0">Ingredients</h6>
              </div>
              <div class="card-body">
                <ul v-if="form.ingredients.length" class="list-group list-group-flush">
                  <li v-for="(ing, idx) in form.ingredients" :key="idx" class="list-group-item border-0">
                    <i class="pi pi-check-circle text-success me-2"></i>
                    {{ ing.amount }} {{ ing.unit }} {{ ing.name }}
                    <small v-if="ing.image && ing.image.file" class="d-block text-muted ps-4"> - Image: {{ ing.image.desiredName }}</small>
                  </li>
                </ul>
                <p v-else class="text-muted">No ingredients added.</p>
              </div>
            </div>
          </div>
          <div class="col-md-6">
            <div class="card h-100">
              <div class="card-header">
                <h6 class="mb-0">Preparation Steps</h6>
              </div>
              <div class="card-body">
                <ol v-if="form.steps.length" class="ps-3">
                  <li v-for="(s, idx) in form.steps" :key="idx" class="mb-2">
                    {{ s }}
                  </li>
                </ol>
                <p v-else class="text-muted">No steps added.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
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
    <!-- General validation error display removed, now per step -->
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

// Helper function to sanitize filenames
const sanitizeFilename = (name, prefix = "image") => {
  if (!name) return `${prefix}-untitled`;
  const cleanedName = name
    .toLowerCase()
    .replace(/\s+/g, "-") // replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, "") // remove special characters except hyphen
    .replace(/-+/g, "-") // replace multiple hyphens with single
    .replace(/^-+|-+$/g, ""); // trim leading/trailing hyphens
  return cleanedName.substring(0, 50) || prefix; // limit length and ensure not empty
};

const getFileExtension = (filename) => {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase();
};

const initialFormState = () => ({
  title: "",
  type: "recipe",
  description: "",
  tags: [],
  ingredients: [], // each ingredient: { name: "", amount: "", unit: "", image: { file: null, desiredName: "" } }
  steps: [],
  main_image: {
    // For main image
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
        image: { file: null, desiredName: "" }, // Ingredient images are not pre-filled for edit yet
      }));
    } else {
      // Reset form for create mode or if model is cleared
      Object.assign(form.value, initialFormState());
      tagsInput.value = ""; // also reset tagsInput
      step.value = 1; // Reset to first step
    }
  },
  { immediate: true, deep: true }
);

const validateStep = () => {
  validationErrors.value = [];
  if (step.value === 1) {
    if (!form.value.title || form.value.title.length < 3) {
      validationErrors.value.push("Title is required (min 3 characters).");
    }
    if (!form.value.description || form.value.description.length < 10) {
      validationErrors.value.push("Description is required (min 10 characters).");
    }
  } else if (step.value === 2) {
    if (form.value.ingredients.length > 0 && !form.value.ingredients.some((i) => i.name && i.name.trim().length > 0)) {
      validationErrors.value.push("At least one ingredient must have a name if ingredients are added.");
    }
    // Requirement: At least one ingredient (can be empty if user intends to remove all)
    // if (!form.value.ingredients.length) {
    //   validationErrors.value.push("At least one ingredient is required.");
    // }
  } else if (step.value === 3) {
    if (form.value.steps.length > 0 && !form.value.steps.some((s) => s && s.trim().length > 0)) {
      validationErrors.value.push("At least one step must have a description if steps are added.");
    }
    // Requirement: At least one step
    // if (!form.value.steps.length) {
    //   validationErrors.value.push("At least one step is required.");
    // }
  } else if (step.value === 4) {
    if (props.mode === "create" && !form.value.main_image.file) {
      validationErrors.value.push("A main image is required for new creations.");
    }
    // Add validation for image dimensions/type if possible client-side, or remind user server will validate
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

const addIngredient = () => {
  form.value.ingredients.push({ name: "", amount: "", unit: "", image: { file: null, desiredName: "" } });
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
    const extension = getFileExtension(file.name);
    const creationTitlePart = sanitizeFilename(form.value.title, "creation");
    const ingredientNamePart = sanitizeFilename(form.value.ingredients[idx].name, `ingredient${idx}`);
    form.value.ingredients[idx].image = {
      file: file,
      desiredName: `${creationTitlePart}_${ingredientNamePart}.${extension}`,
    };
    // TODO: Add preview for ingredient image if needed:
    // const reader = new FileReader();
    // reader.onload = (ev) => { form.value.ingredients[idx].image.previewUrl = ev.target.result; };
    // reader.readAsDataURL(file);
  } else {
    form.value.ingredients[idx].image = { file: null, desiredName: "" };
  }
};

const handleImageChange = (e) => {
  const file = e.target.files[0];
  if (file) {
    const extension = getFileExtension(file.name);
    form.value.main_image.file = file;
    form.value.main_image.desiredName = `${sanitizeFilename(form.value.title)}.${extension}`;
    const reader = new FileReader();
    reader.onload = (ev) => {
      form.value.main_image.previewUrl = ev.target.result;
    };
    reader.readAsDataURL(file);
  } else {
    form.value.main_image.file = null;
    form.value.main_image.desiredName = "";
    form.value.main_image.previewUrl = props.mode === "edit" && props.model ? props.model.image_path || "" : "";
  }
};

const handleSubmit = () => {
  // Final validation before submitting all steps
  // We re-validate the current step, but ideally, we should validate all.
  // For now, let's assume nextStep() has validated previous steps.
  // Or, iterate through all steps and validate.
  let allValid = true;
  for (let i = 1; i <= 4; i++) {
    // Validate steps 1 to 4
    const currentViewingStep = step.value;
    step.value = i; // Temporarily set step to validate
    if (!validateStep()) {
      allValid = false;
      step.value = i; // Stay on the step with error
      break;
    }
    step.value = currentViewingStep; // Restore original step
  }

  if (!allValid) {
    // An error message will be displayed in the respective step's section
    return;
  }
  // Ensure on final step review, step.value is 5 if user directly hits submit
  step.value = 5;
  if (!validateStep()) {
    // Validate step 5 (though it has no specific validation now)
    // if any step 5 specific validation added later
  }

  const dataToEmit = {
    title: form.value.title,
    type: form.value.type,
    description: form.value.description,
    tags: form.value.tags,
    is_public: form.value.is_public,
    steps: form.value.steps,
    image: form.value.main_image.file ? { file: form.value.main_image.file, name: form.value.main_image.desiredName } : null, // If null, parent component might need to check if it's an edit and preserve old image
    ingredients: form.value.ingredients.map((ing) => ({
      name: ing.name,
      amount: ing.amount,
      unit: ing.unit,
      image: ing.image && ing.image.file ? { file: ing.image.file, name: ing.image.desiredName } : null,
    })),
  };
  emit("submit", dataToEmit);
};
</script>

<!-- Styles moved to assets/scss/layout/_creations.scss -->
