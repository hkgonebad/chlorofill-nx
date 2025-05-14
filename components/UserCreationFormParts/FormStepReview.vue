<template>
  <div>
    <h4 class="step-title">Review & Submit</h4>
    <p class="text-muted step-description mb-4">Please review your creation before submitting.</p>
    <div class="card mb-4">
      <div class="card-body">
        <div class="row">
          <div class="col-md-8">
            <h5 class="card-title mb-3">{{ formData.title }}</h5>
            <div class="mb-3">
              <span class="badge bg-secondary me-2">{{ formData.type === "recipe" ? "Recipe" : "Cocktail" }}</span>
              <span v-if="formData.is_public" class="badge bg-success">Public</span>
              <span v-else class="badge bg-warning">Private</span>
            </div>
            <p class="card-text">{{ formData.description }}</p>
            <div v-if="formData.tags && formData.tags.length" class="mb-3">
              <h6 class="small text-uppercase">Tags</h6>
              <div>
                <span v-for="tag in formData.tags" :key="tag" class="badge text-dark me-1 mb-1">
                  {{ tag }}
                </span>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div v-if="formData.main_image && formData.main_image.previewUrl" class="text-center">
              <img :src="formData.main_image.previewUrl" alt="Preview" class="img-fluid rounded userCreationImagePreview" />
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
            <ul v-if="formData.ingredients && formData.ingredients.length" class="list-group list-group-flush">
              <li v-for="(ing, idx) in formData.ingredients" :key="idx" class="list-group-item border-0">
                <i class="pi pi-check-circle text-success me-2"></i>
                {{ ing.amount }} {{ ing.unit }} {{ ing.name }}
                <small v-if="ing.image && ing.image.desiredName" class="d-block text-muted ps-4"> - Image: {{ ing.image.desiredName }}</small>
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
            <ol v-if="formData.steps && formData.steps.length" class="ps-3">
              <li v-for="(s, idx) in formData.steps" :key="idx" class="mb-2">
                {{ s }}
              </li>
            </ol>
            <p v-else class="text-muted">No steps added.</p>
          </div>
        </div>
      </div>
    </div>
    <!-- No specific errors for review step, validation happens before reaching here -->
  </div>
</template>

<script setup>
const props = defineProps({
  formData: {
    type: Object,
    required: true,
  },
});
</script>

<style scoped>
/* Styles are expected to be global from _creations.scss */
.userCreationImagePreview {
  max-height: 200px; /* Slightly smaller for review section perhaps */
  border: 1px solid var(--bs-border-color);
  object-fit: cover;
  box-shadow: var(--bs-box-shadow-sm);
  border-radius: var(--bs-border-radius);
}
</style>
