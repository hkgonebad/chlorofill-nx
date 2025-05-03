<template>
  <div id="app-wrapper">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>

<script setup>
// This is our main application entrypoint
// We'll initialize things like theme here

// Import the theme initialization function
import { useTheme } from "~/composables/useTheme";

// Initialize theme by calling the composable.
// The composable handles initialization internally via onMounted.
useTheme();

// Create provide/inject keys for global state
// These will be migrated as we add components
</script>

<style lang="scss">
/* Global styles */
html {
  scroll-behavior: smooth;
}

/* Main content area styles */
main:not(.auth-content) {
  /* Push footer down */
  min-height: calc(100vh - var(--header-height, 60px) - var(--footer-height, 50px));
}

/* Auth content specific styles */
main.auth-content {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
}
</style>
