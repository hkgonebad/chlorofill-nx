<!--
  ItemCard.vue
  - Edit/Delete buttons (owner actions) are at bottom-right, shown if showMenu && isOwner.
  - Card actions (favorites/share) are at top-right.
  - Use showMenu, onEdit, onDelete, isOwner props to control owner actions.
-->
<template>
  <div class="col">
    <div class="card item-card h-100 text-start shadow-sm" @click="navigateToDetail" style="cursor: pointer; position: relative">
      <div class="card-image-wrapper position-relative">
        <img :src="imageUrl" class="card-img-top item-thumb" :alt="title" />
        <!-- Share/Favorite actions (top-right) -->
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
        <!-- Edit/Delete actions for owner (bottom-right) -->
        <div v-if="showMenu && isOwner" class="card-owner-actions position-absolute bottom-0 end-0 p-2">
          <button @click.stop.prevent="onEdit && onEdit()" class="btn btn-sm btn-light rounded-circle me-1 action-icon edit-icon" title="Edit" aria-label="Edit">
            <i class="pi pi-pencil"></i>
          </button>
          <button @click.stop.prevent="onDelete && onDelete()" class="btn btn-sm btn-light rounded-circle action-icon delete-icon text-danger" title="Delete" aria-label="Delete">
            <i class="pi pi-trash"></i>
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
// No need for onMounted or Dropdown import if not using JS-initialized dropdown
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
    type: [String, Object],
    required: true,
  },
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
    default: true,
  },
  showMenu: {
    // Renamed from showOwnerActions or similar for clarity, still controls edit/delete visibility
    type: Boolean,
    default: false,
  },
  onEdit: {
    type: Function,
    default: null,
  },
  onDelete: {
    type: Function,
    default: null,
  },
  isOwner: {
    type: Boolean,
    default: false,
  },
});

const emit = defineEmits(["toggle-favorite", "share-item"]);

const toggleFavorite = () => {
  if (!props.itemId || !props.itemType) return;
  emit("toggle-favorite", { id: props.itemId, type: props.itemType });
};

const shareItem = () => {
  if (!props.itemId || !props.itemType) return;
  emit("share-item", {
    title: props.title,
    itemId: props.itemId,
    itemType: props.itemType,
  });
};

const navigateToDetail = () => {
  if (props.linkTo) {
    navigateTo(props.linkTo);
  }
};
</script>
