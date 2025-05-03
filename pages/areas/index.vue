<template>
  <div class="areas-view container">
    <div class="d-flex align-items-center mb-4 view-header">
      <BackButton class="me-3" />
      <h2 class="mb-0 flex-grow-1 section-title">Browse Recipes by Area (Cuisine)</h2>
    </div>

    <LoadingSpinner v-if="pending" />
    <ErrorMessage v-else-if="error" :message="error?.message || 'Failed to load areas.'" />

    <!-- Area List -->
    <div v-else-if="areas && areas.length > 0" class="list-group">
      <NuxtLink v-for="area in areas" :key="area.strArea" :to="`/areas/${encodeURIComponent(area.strArea)}`" class="list-group-item list-group-item-action d-flex justify-content-between align-items-center">
        {{ area.strArea }}
        <i class="pi pi-chevron-right"></i>
      </NuxtLink>
    </div>
    <!-- No Areas Found State -->
    <div v-else>
      <p class="alert alert-info">Could not load the list of areas.</p>
    </div>
  </div>
</template>

<script setup>
import { useAsyncData, useHead } from "#imports";
import { fetch } from "ofetch";
import BackButton from "~/components/BackButton.vue";
import LoadingSpinner from "~/components/LoadingSpinner.vue";
import ErrorMessage from "~/components/ErrorMessage.vue";

// Fetch areas using useAsyncData and fetch
const {
  data: areas,
  pending,
  error,
} = useAsyncData(
  "meal-areas", // Cache key
  async () => {
    const API_BASE_URL = "https://www.themealdb.com/api/json/v1/1/";
    const url = `${API_BASE_URL}list.php?a=list`;
    try {
      // Use fetch for universal fetching
      const data = await fetch(url);
      if (!data || !data.meals) {
        console.warn("No areas found in API response.", data);
        // Throw error for useAsyncData to catch
        throw new Error("Could not retrieve the list of areas.");
      }
      // Sort alphabetically
      return data.meals.sort((a, b) => a.strArea.localeCompare(b.strArea));
    } catch (e) {
      console.error("Error fetching areas:", e);
      // Re-throw the error for useAsyncData
      throw new Error(e.message || "Failed to load areas");
    }
  }
);

// Set page head
useHead({
  title: "Browse Recipes by Area | ChloroFill 🍴🍹",
  meta: [
    {
      name: "description",
      content: "Explore recipes based on cuisine or area of origin on ChloroFill.",
    },
  ],
});
</script>
