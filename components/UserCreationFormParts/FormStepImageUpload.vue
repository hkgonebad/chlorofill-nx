<template>
  <div>
    <h4 class="step-title">Image Upload</h4>
    <p class="text-muted step-description mb-4">Add a beautiful image of your finished creation.</p>
    <div class="image-upload-container">
      <div class="mb-3">
        <label for="image" class="form-label">Select Main Image</label>
        <input type="file" id="image" class="form-control" @change="$emit('handleImageChange', $event)" :disabled="loading" accept="image/*" />
        <div class="form-text">Required. Minimum 1600x500px. This will be the main display image.</div>
      </div>
      <div v-if="mainImage.previewUrl" class="image-preview-container text-center mt-4">
        <h6 class="mb-2">Preview</h6>
        <div class="image-preview-wrapper">
          <img :src="mainImage.previewUrl" alt="Preview" class="img-fluid rounded userCreationImagePreview" />
        </div>
      </div>
      <div v-else class="text-center mt-4 p-5 border rounded image-preview-wrapper">
        <i class="pi pi-image fs-1 text-muted"></i>
        <p class="text-muted mt-2">No image selected</p>
      </div>
    </div>
    <div v-if="errors.length" class="alert alert-danger mt-3">
      <ul class="mb-0">
        <li v-for="err in errors" :key="err">{{ err }}</li>
      </ul>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  mainImage: {
    type: Object,
    required: true,
    default: () => ({ file: null, desiredName: "", previewUrl: "" }),
  },
  loading: {
    type: Boolean,
    default: false,
  },
  errors: {
    type: Array,
    default: () => [],
  },
});

const emit = defineEmits(["handleImageChange"]);
</script>

<style scoped>
/* Styles are expected to be global from _creations.scss */
.userCreationImagePreview {
  max-height: 250px;
  border: 1px solid var(--bs-border-color);
  object-fit: cover;
  box-shadow: var(--bs-box-shadow-sm);
  border-radius: var(--bs-border-radius);
}

.image-preview-wrapper {
  padding: 1rem;
  border: 2px dashed var(--bs-border-color-translucent);
  border-radius: var(--bs-border-radius-lg);
  background-color: var(--bs-tertiary-bg);
  min-height: 150px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
}
</style>
