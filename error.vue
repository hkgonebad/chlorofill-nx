<script setup>
defineProps({ error: Object });
import { inject } from "vue";

const toggleSearchModal = inject("toggleSearchModal", () => {
  console.warn("toggleSearchModal function not provided in Header");
});
const openSearchModal = () => {
  toggleSearchModal();
};
</script>

<template>
  <section class="notFoundView block py-5 text-center">
    <div class="container">
      <div class="mb-4">
        <!-- Fun SVG: Chef hat and spilled cocktail -->
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
          <!-- Chef Hat -->
          <ellipse cx="60" cy="50" rx="35" ry="20" fill="currentColor" stroke="#bbb" stroke-width="3" />
          <ellipse cx="60" cy="60" rx="28" ry="12" fill="currentColor" stroke="#bbb" stroke-width="2" />
          <rect x="38" y="60" width="44" height="18" rx="8" fill="currentColor" stroke="#bbb" stroke-width="2" />
          <!-- Spilled Cocktail Glass -->
          <rect x="85" y="85" width="10" height="28" rx="5" transform="rotate(-30 85 85)" fill="#e0e0e0" />
          <ellipse cx="95" cy="105" rx="10" ry="4" transform="rotate(-30 95 105)" fill="#b3e0ff" />
          <ellipse cx="95" cy="110" rx="7" ry="2.5" transform="rotate(-30 95 110)" fill="#ffb3c6" />
        </svg>
      </div>
      <template v-if="error.statusCode === 404">
        <h1 class="display-1 mb-2">404</h1>
        <h2 class="mb-3">Recipe Not Found!</h2>
        <p class="lead mb-4">
          Looks like this dish or drink is missing from our cookbook.<br />
          Maybe it got overcooked, shaken, or stirred away!
        </p>
        <div class="d-flex flex-wrap justify-content-center gap-2 mb-3">
          <NuxtLink to="/" class="btn btn-primary">Home</NuxtLink>
          <NuxtLink to="/categories" class="btn btn-outline-secondary">Browse Recipes</NuxtLink>
          <NuxtLink to="/cocktails" class="btn btn-outline-info">Browse Cocktails</NuxtLink>
          <button @click="openSearchModal" class="btn btn-outline-success">Search</button>
        </div>
        <p class="text-muted small mt-3">If you think this is a mistake, let us know and we'll whip up something special!</p>
      </template>
      <template v-else>
        <h1 class="display-1 mb-2">{{ error.statusCode }}</h1>
        <h2 class="mb-3">Something went wrong</h2>
        <p class="lead mb-4">{{ error.message }}</p>
        <div class="d-flex flex-wrap justify-content-center gap-2 mb-3">
          <NuxtLink to="/" class="btn btn-primary">Home</NuxtLink>
          <button @click="openSearchModal" class="btn btn-outline-success">Search</button>
        </div>
      </template>
    </div>
  </section>
</template>
