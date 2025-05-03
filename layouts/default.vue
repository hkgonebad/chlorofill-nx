<template>
  <div id="app-wrapper">
    <TheHeader />
    <main>
      <!-- Page content will be injected here -->
      <slot />
    </main>
    <TheFooter />
    <!-- Render the search modal, binding its visibility -->
    <FullScreenSearchModal v-model:visible="isSearchModalVisible" />
    <!-- Render the global Share Modal -->
    <ShareModal v-model:visible="isShareModalVisible" :title="shareModalTitle" :share-url="shareModalUrl" :share-text="shareModalText" />
  </div>
</template>

<script setup>
import TheHeader from "~/components/TheHeader.vue"; // Use ~ for root alias in Nuxt
import TheFooter from "~/components/TheFooter.vue";
import FullScreenSearchModal from "~/components/FullScreenSearchModal.vue";
import ShareModal from "~/components/ShareModal.vue";
import { ref, provide, readonly } from "vue";

// Initialize theme using the composable (will be called from app.vue)
// import { useTheme } from '~/composables/useTheme.js';
// const { initTheme } = useTheme();
// initTheme(); // Initialization moved to app.vue

// State for search modal visibility
const isSearchModalVisible = ref(false);
const toggleSearchModal = () => {
  isSearchModalVisible.value = !isSearchModalVisible.value;
};
provide("isSearchModalVisible", readonly(isSearchModalVisible));
provide("toggleSearchModal", toggleSearchModal);

// === Global Share Modal State ===
const isShareModalVisible = ref(false);
const shareModalTitle = ref("");
const shareModalUrl = ref("");
const shareModalText = ref("");
const openShareModal = (payload) => {
  shareModalTitle.value = payload.title ? `Share: ${payload.title}` : "Share";
  shareModalUrl.value = payload.url || "";
  shareModalText.value = payload.text || `Check out this link: ${payload.url}`;
  isShareModalVisible.value = true;
};
provide("isShareModalVisible", readonly(isShareModalVisible));
provide("openShareModal", openShareModal);
// === End Global Share Modal State ===

// --- Nuxt Meta tags integration ---
// Default meta tags are handled in nuxt.config.ts
// Dynamic meta tags will be handled within individual pages using useHead
</script>
