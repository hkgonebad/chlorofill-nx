<template>
  <div class="auth-layout d-flex align-items-center justify-content-center min-vh-100">
    <main class="container py-4 auth-main-container">
      <!-- Render the page content -->
      <slot />
    </main>
  </div>
</template>

<script setup>
// No specific script needed for this simple layout
</script>

<style scoped>
.auth-layout {
  /* Optional: Add background color/image specific to auth pages */
  /* background-color: var(--bs-light); <- Handled by global styles */
}

/* Dark mode adjustments - Handled by global styles */
/* [data-bs-theme="dark"] .auth-layout {
  background-color: var(--bs-dark);
} */

.auth-main-container {
  max-width: 400px; /* Limit width of auth forms */
  width: 100%;
}
</style>
