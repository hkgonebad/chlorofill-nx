<template>
  <div class="modal fade share-modal" tabindex="-1" ref="modalRef" aria-hidden="true" aria-labelledby="shareModalTitleLabel">
    <div class="modal-dialog modal-dialog-centered">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" id="shareModalTitleLabel">{{ title || "Share" }}</h5>
          <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
        </div>
        <div class="modal-body text-center">
          <ShareButtons v-if="shareUrl" :title="title" :text="shareText" :url="shareUrl" />
          <p v-else class="text-muted small">Missing share information.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, watch } from "vue";
// Rely on auto-imports for ShareButtons
// import ShareButtons from "./ShareButtons.vue";
// Bootstrap Modal JS is handled by plugin, we only need type for hinting potentially
// import { Modal } from "bootstrap";

const props = defineProps({
  visible: {
    type: Boolean,
    required: true,
  },
  title: {
    type: String,
    default: "Share Item",
  },
  shareUrl: {
    type: String,
    required: true,
  },
  shareText: {
    type: String,
    default: "",
  },
});
const emit = defineEmits(["update:visible"]);

const modalRef = ref(null);
const bsModal = ref(null);
const elementFocusedBeforeModal = ref(null);

// --- Client-side Modal Handling ---
onMounted(() => {
  if (process.client && modalRef.value) {
    // Initialize Bootstrap modal instance on client
    import("bootstrap")
      .then(({ Modal }) => {
        if (modalRef.value) {
          // Check ref again inside async callback
          bsModal.value = new Modal(modalRef.value);

          // Event listeners for Bootstrap modal
          modalRef.value.addEventListener("show.bs.modal", () => {
            elementFocusedBeforeModal.value = document.activeElement;
          });

          modalRef.value.addEventListener("hidden.bs.modal", () => {
            // Emit update only if modal was hidden externally (not via prop change)
            if (props.visible) {
              emit("update:visible", false);
            }
            // Restore focus only if an element was focused before
            if (elementFocusedBeforeModal.value && typeof elementFocusedBeforeModal.value.focus === "function") {
              elementFocusedBeforeModal.value.focus();
            }
            elementFocusedBeforeModal.value = null; // Clear ref
          });

          // Initial state check on mount
          if (props.visible) {
            bsModal.value.show();
          }
        }
      })
      .catch((err) => console.error("Failed to load Bootstrap JS for Modal:", err));
  }
});

// Watch prop changes to control the modal
watch(
  () => props.visible,
  (newValue) => {
    if (process.client && bsModal.value) {
      // Ensure modal instance exists
      if (newValue) {
        bsModal.value.show();
      } else {
        bsModal.value.hide();
      }
    }
  }
);

// Cleanup on unmount
onBeforeUnmount(() => {
  if (process.client && bsModal.value) {
    // Remove specific listeners if references were stored, otherwise rely on dispose
    bsModal.value.dispose();
    bsModal.value = null; // Clear ref
  }
});

// Method to close modal and emit event
const closeModal = () => {
  emit("update:visible", false);
};
</script>
