<template>
  <div>
    <h4 class="step-title">Basic Info</h4>
    <p class="text-muted step-description mb-4">Let's start with some basic information about your creation.</p>
    <div class="mb-4">
      <label for="title" class="form-label">Title</label>
      <input
        :value="formData.title"
        @input="$emit('update:formData', { ...formData, title: $event.target.value })"
        type="text"
        id="title"
        class="form-control form-control-lg"
        required
        minlength="3"
        :disabled="loading"
        placeholder="Give your creation a name"
      />
    </div>
    <div class="mb-4">
      <label for="type" class="form-label">Type</label>
      <select :value="formData.type" @change="$emit('update:formData', { ...formData, type: $event.target.value })" id="type" class="form-select form-select-lg" required :disabled="loading">
        <option value="recipe">Recipe</option>
        <option value="cocktail">Cocktail</option>
      </select>
    </div>
    <div class="mb-4">
      <label for="description" class="form-label">Description</label>
      <textarea
        :value="formData.description"
        @input="$emit('update:formData', { ...formData, description: $event.target.value })"
        id="description"
        class="form-control"
        rows="3"
        :disabled="loading"
        placeholder="Describe your creation in a few sentences"
        required
        minlength="10"
      ></textarea>
    </div>
    <div class="mb-4">
      <label for="tags" class="form-label">Tags</label>
      <input :value="tagsInput" @input="$emit('update:tagsInput', $event.target.value)" type="text" id="tags" class="form-control" :disabled="loading" placeholder="e.g. vegan, spicy, summer (comma separated)" />
      <div class="form-text">Separate multiple tags with commas</div>
    </div>
    <div class="form-check form-switch mb-3">
      <input :checked="formData.is_public" @change="$emit('update:formData', { ...formData, is_public: $event.target.checked })" class="form-check-input" type="checkbox" id="isPublic" :disabled="loading" />
      <label class="form-check-label" for="isPublic">Public (visible to others)</label>
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
  formData: {
    type: Object,
    required: true,
  },
  tagsInput: {
    type: String,
    required: true,
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

const emit = defineEmits(["update:formData", "update:tagsInput"]);
</script>

<style scoped>
/* Styles are expected to be global from _creations.scss */
</style>
