<template>
  <section class="block filtered-cocktails-view py-5">
    <div class="container">
      <!-- Header with Back Button and Title -->
      <div class="d-flex align-items-center mb-4 view-header">
        <BackButton class="me-3" />
        <h2 class="mb-0 flex-grow-1 section-title">{{ pageTitle }}</h2>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="row row-cols-2 row-cols-sm-2 row-cols-md-4 g-4 placeholder-glow">
        <SkeletonCard v-for="n in 8" :key="'sk-' + n" />
      </div>

      <!-- Error State -->
      <ErrorMessage v-else-if="error" :message="error?.message || 'Could not load cocktails.'" />

      <!-- No Results State -->
      <div v-else-if="!cocktails || cocktails.length === 0" class="alert alert-info">No cocktails found matching this filter.</div>

      <!-- Cocktails Grid -->
      <div v-else class="row row-cols-2 row-cols-sm-2 row-cols-md-4 g-4">
        <ItemCard
          v-for="cocktail in cocktails"
          :key="cocktail.idDrink"
          :image-url="cocktail.strDrinkThumb"
          :title="cocktail.strDrink"
          :link-to="{ path: `/cocktail/${cocktail.idDrink}` }"
          :item-id="cocktail.idDrink"
          item-type="cocktail"
          :is-favorite="isFavoriteCocktail(cocktail.idDrink)"
          @toggle-favorite="handleToggleFavorite"
          @share-item="handleShareItem"
        />
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, inject } from "vue";
// Use Nuxt composables & components
import { useRoute, useAsyncData, useHead } from "#imports"; // Rely on auto-imports
import { useCocktailApi } from "~/composables/useCocktailApi";
import { useFavorites } from "~/composables/useFavorites";
import ItemCard from "~/components/ItemCard.vue";
import ErrorMessage from "~/components/ErrorMessage.vue";
import SkeletonCard from "~/components/SkeletonCard.vue";
import BackButton from "~/components/BackButton.vue";

// Get route info
const route = useRoute();
const filterType = computed(() => route.params.filterType);
const filterValue = computed(() => route.params.filterValue);

// Use API composable
const { getCocktailsByFilter } = useCocktailApi();

// Use Favorites composable
const { isFavorite: isFavoriteCocktail, toggleCocktailFavorite } = useFavorites();

// Inject share modal function
const openShareModal = inject("openShareModal");

// Fetch data using useAsyncData
const {
  data: cocktails,
  pending,
  error,
} = await useAsyncData(
  `cocktails-${filterType.value}-${filterValue.value}`,
  () => {
    if (!filterType.value || !filterValue.value) return [];
    // Decode the filter value from the URL parameter
    const decodedValue = decodeURIComponent(filterValue.value);
    return getCocktailsByFilter(filterType.value, decodedValue);
  },
  {
    watch: [filterType, filterValue], // Refetch if filter params change
  }
);

// Compute a user-friendly page title
const pageTitle = computed(() => {
  const valueDisplay = filterValue.value ? decodeURIComponent(filterValue.value).replace(/_/g, " ") : "Unknown";
  switch (filterType.value) {
    case "a":
      return `${valueDisplay} Cocktails`;
    case "g":
      return `Cocktails served in a ${valueDisplay}`;
    case "c":
      return `${valueDisplay} Cocktails`;
    case "i":
      return `Cocktails with ${valueDisplay}`;
    default:
      return "Filtered Cocktails";
  }
});

// --- Event Handlers ---
const handleToggleFavorite = ({ id, type }) => {
  if (type === "cocktail") {
    toggleCocktailFavorite(id); // Use unified composable
  }
};

const handleShareItem = ({ title, url }) => {
  if (openShareModal) {
    openShareModal({
      title,
      url,
      text: `Check out this cocktail: ${title}`,
      type: "cocktail",
    });
  } else {
    console.error("openShareModal function not injected");
  }
};

// Set page head dynamically
useHead({
  title: computed(() => `${pageTitle.value} | ChloroFill 🍴🍹`),
  meta: [
    {
      name: "description",
      content: computed(() => `Browse ${pageTitle.value.toLowerCase()} on ChloroFill.`),
    },
  ],
});
</script>

<style scoped>
.view-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--bs-border-color-translucent);
}
</style>
