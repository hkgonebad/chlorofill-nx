<template>
  <div class="col">
    <div class="card item-card h-100 text-start shadow-sm" @click="navigateToDetail" style="cursor: pointer">
      <div class="card-image-wrapper position-relative">
        <img :src="imageUrl" class="card-img-top item-thumb" :alt="title" />
        <div v-if="showActions" class="card-actions-overlay position-absolute top-0 end-0 p-2">
          <button
            v-if="itemId"
            @click.stop.prevent="toggleFavorite"
            class="btn btn-sm btn-light rounded-circle me-1 action-icon favorite-icon"
            :class="{ active: isFavorite }"
            :title="isFavorite ? 'Remove from Favorites' : 'Add to Favorites'"
            :aria-label="isFavorite ? 'Remove from Favorites' : 'Add to Favorites'"
          >
            <i :class="isFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'"></i>
          </button>
          <button v-if="itemId" @click.stop.prevent="shareItem" class="btn btn-sm btn-light rounded-circle action-icon share-icon" title="Share" aria-label="Share">
            <i class="pi pi-share-alt"></i>
          </button>
        </div>
      </div>
      <div class="card-body d-flex flex-column">
        <h5 class="card-title mb-1">{{ title }}</h5>
        <p v-if="descriptionText" class="card-description small text-muted mb-0">
          {{ descriptionText }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, ref } from "vue";
import { navigateTo } from "#imports";

const props = defineProps({
  imageUrl: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  descriptionText: {
    type: String,
    default: "",
  },
  linkTo: {
    // Can be a string path or a route object
    type: [String, Object],
    required: true,
  },
  // New props for actions
  itemId: {
    type: String,
    default: null,
  },
  itemType: {
    type: String,
    validator: (value) => ["meal", "cocktail", null, ""].includes(value),
    default: null,
  },
  isFavorite: {
    type: Boolean,
    default: false,
  },
  showActions: {
    type: Boolean,
    default: true, // Show actions by default
  },
});

const emit = defineEmits(["toggle-favorite", "share-item"]);

// --- Event Handlers ---
const toggleFavorite = () => {
  if (!props.itemId || !props.itemType) {
    return;
  }
  emit("toggle-favorite", { id: props.itemId, type: props.itemType });
};

const shareItem = () => {
  if (!props.itemId || !props.itemType) {
    return;
  }
  // Emit item details, let parent construct URL
  emit("share-item", {
    title: props.title,
    itemId: props.itemId,
    itemType: props.itemType,
  });
};

// --- Navigation Handler ---
const navigateToDetail = () => {
  if (props.linkTo) {
    // Use Nuxt's navigateTo
    navigateTo(props.linkTo);
  }
};
</script>
