<template>
  <section class="block cocktails-view py-5">
    <div class="container">
      <div class="view-header mb-4 d-flex align-items-center">
        <BackButton class="me-3" />
        <h1 class="section-title mb-0">Explore Cocktails</h1>
      </div>

      <!-- Skeleton Loading State -->
      <div v-if="pending" class="placeholder-glow">
        <!-- Skeleton for Filters -->
        <section v-for="n in 3" :key="`sk-filter-${n}`" class="mb-4 block">
          <h2 class="section-title section-title-sm">
            <span class="placeholder col-3"></span>
          </h2>
          <ul class="list-group">
            <li v-for="m in 3" :key="`sk-item-${n}-${m}`" class="list-group-item">
              <span class="placeholder col-5"></span>
            </li>
          </ul>
        </section>
      </div>

      <!-- Error State -->
      <ErrorMessage v-else-if="error" :message="error?.message || 'Failed to load filters.'" />

      <!-- Filter Lists -->
      <div v-else>
        <!-- Alcoholic Filter -->
        <section v-if="filterLists.alcoholicTypes?.length" class="mb-4 block">
          <h2 class="section-title section-title-sm">By Type</h2>
          <div class="list-group">
            <NuxtLink
              v-for="type in filterLists.alcoholicTypes"
              :key="type.strAlcoholic"
              :to="`/cocktails/filter/a/${encodeURIComponent(type.strAlcoholic)}`"
              class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            >
              {{ type.strAlcoholic }}
              <i class="pi pi-chevron-right"></i>
            </NuxtLink>
          </div>
        </section>

        <!-- Glass Filter -->
        <section v-if="filterLists.glasses?.length" class="mb-4 block">
          <h2 class="section-title section-title-sm">By Glass</h2>
          <div class="list-group">
            <NuxtLink
              v-for="glass in filterLists.glasses"
              :key="glass.strGlass"
              :to="`/cocktails/filter/g/${encodeURIComponent(glass.strGlass)}`"
              class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            >
              {{ glass.strGlass }}
              <i class="pi pi-chevron-right"></i>
            </NuxtLink>
          </div>
        </section>

        <!-- Categories Filter -->
        <section v-if="filterLists.categories?.length" class="mb-4 block">
          <h2 class="section-title section-title-sm">By Category</h2>
          <div class="list-group">
            <NuxtLink
              v-for="cat in filterLists.categories"
              :key="cat.strCategory"
              :to="`/cocktails/filter/c/${encodeURIComponent(cat.strCategory)}`"
              class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
            >
              {{ cat.strCategory }}
              <i class="pi pi-chevron-right"></i>
            </NuxtLink>
          </div>
        </section>
        <!-- Optionally display Ingredients if needed -->
      </div>
    </div>
  </section>
</template>

<script setup>
// Import Nuxt composables & components
import { useAsyncData, useHead } from "#imports"; // Rely on auto-imports
import { useCocktailApi } from "~/composables/useCocktailApi";
import ErrorMessage from "~/components/ErrorMessage.vue";
import BackButton from "~/components/BackButton.vue";
// SkeletonCard could be used if needed, but simpler placeholders are used here
// import SkeletonCard from '~/components/SkeletonCard.vue';

// Use the API composable
const { getCategories, getAlcoholicFilters, getGlassTypes } = useCocktailApi();

// Fetch all filter lists concurrently using useAsyncData
const {
  data: filterLists,
  pending,
  error,
} = await useAsyncData("cocktail-filters", async () => {
  try {
    const [categories, glasses, alcoholicTypes] = await Promise.all([getCategories(), getGlassTypes(), getAlcoholicFilters()]);
    return { categories, glasses, alcoholicTypes };
  } catch (err) {
    console.error("Error fetching cocktail filter lists:", err);
    // Throw the error so useAsyncData captures it
    throw new Error(err.message || "Failed to load cocktail filters.");
  }
});

// Set page head
useHead({
  title: "Browse Cocktails | ChloroFill 🍴🍹",
  meta: [
    {
      name: "description",
      content: "Explore cocktails by filtering through categories, glass types, and alcoholic content on ChloroFill.",
    },
  ],
});
</script>

<style scoped>
.view-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--bs-border-color-translucent);
}
.section-title-sm {
  font-size: 1.1rem; /* Smaller title for filter sections */
  font-weight: 600;
  margin-bottom: 0.75rem;
}
.list-group-item {
  transition: background-color 0.15s ease-in-out;
}
</style>
