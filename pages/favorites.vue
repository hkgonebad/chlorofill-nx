<template>
  <div class="favorites-view container py-4">
    <div class="view-header mb-4">
      <h2 class="section-title mb-0">My Favorites</h2>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="row row-cols-2 row-cols-md-4 g-4 placeholder-glow">
      <!-- Adapt skeleton count based on total favorites -->
      <SkeletonCard v-for="n in skeletonCount" :key="'sk-' + n" />
    </div>
    <!-- Error State -->
    <ErrorMessage v-else-if="error" :message="error?.message || 'Could not load favorites.'" />

    <!-- Combined List -->
    <div v-else-if="allFavoritesDetails && allFavoritesDetails.length > 0" class="row row-cols-2 row-cols-md-4 g-4">
      <template v-for="item in allFavoritesDetails" :key="item.type + '-' + item.id">
        <ItemCard
          v-if="item.idMeal || item.idDrink"
          :image-url="item.type === 'meal' ? item.strMealThumb : item.strDrinkThumb"
          :title="item.type === 'meal' ? item.strMeal : item.strDrink"
          :link-to="item.type === 'meal' ? `/recipe/${item.idMeal}` : `/cocktail/${item.idDrink}`"
          :item-id="item.type === 'meal' ? item.idMeal : item.idDrink"
          :item-type="item.type"
          :is-favorite="true"
          @toggle-favorite="handleToggleFavorite"
          @share-item="handleShareItem"
        />
      </template>
    </div>
    <!-- No Favorites State -->
    <div v-else>
      <p class="alert alert-info">
        You haven't added any favorites yet.
        <NuxtLink to="/browse" class="alert-link">Browse recipes & cocktails</NuxtLink>
        <!-- Use NuxtLink -->
        to find some!
      </p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from "vue";
// Rely on Nuxt auto-imports for components and composables
// import ItemCard from "~/components/ItemCard.vue"; // Auto-imported
// import ErrorMessage from "~/components/ErrorMessage.vue"; // Auto-imported
// import SkeletonCard from "~/components/SkeletonCard.vue"; // Auto-imported
import { useFavorites } from "~/composables/useFavorites"; // Explicit import might be needed if auto-import fails
import { useMealApi } from "~/composables/useMealApi"; // Corrected import
import { useCocktailApi } from "~/composables/useCocktailApi";
import { useAsyncData, useHead } from "#imports";

// Use the unified favorites composable
const { favoriteMealIds, favoriteCocktailIds, toggleMealFavorite, toggleCocktailFavorite } = useFavorites();
// const { getMealById } = useRecipeApi();
const { getMealById } = useMealApi(); // Corrected usage
const { getCocktailById } = useCocktailApi();

// Compute skeleton count
const skeletonCount = computed(() => Math.max(favoriteMealIds.value.length + favoriteCocktailIds.value.length, 4));

// Inject the global openShareModal function
const openShareModal = inject("openShareModal");

// --- Data Fetching with useAsyncData ---
const {
  data: allFavoritesDetails,
  pending,
  error,
  refresh, // Function to manually trigger refetch
} = await useAsyncData(
  "favorites-details", // Unique key for caching
  async () => {
    const combinedMealIds = favoriteMealIds.value;
    const combinedCocktailIds = favoriteCocktailIds.value;

    if (combinedMealIds.length === 0 && combinedCocktailIds.length === 0) {
      return []; // No favorites, return empty array
    }

    console.log("Fetching details for combined favorites using useAsyncData...");

    try {
      // Fetch details concurrently
      const mealPromises = combinedMealIds.map(async (id) => {
        const meal = await getMealById(id); // Corrected usage
        return meal ? { ...meal, type: "meal", id: meal.idMeal } : null; // Add type and common 'id'
      });
      const cocktailPromises = combinedCocktailIds.map(async (id) => {
        const cocktail = await getCocktailById(id);
        return cocktail ? { ...cocktail, type: "cocktail", id: cocktail.idDrink } : null; // Add type and common 'id'
      });

      const results = await Promise.allSettled([...mealPromises, ...cocktailPromises]);

      const successfulItems = [];
      let fetchError = false;

      results.forEach((result) => {
        if (result.status === "fulfilled" && result.value) {
          successfulItems.push(result.value);
        } else {
          console.error(`Failed to fetch a favorite:`, result.reason);
          fetchError = true;
        }
      });

      // Optional: Sort combined list (e.g., by name)
      successfulItems.sort((a, b) => {
        const nameA = a.type === "meal" ? a.strMeal : a.strDrink;
        const nameB = b.type === "meal" ? b.strMeal : b.strDrink;
        return nameA.localeCompare(nameB);
      });

      if (fetchError) {
        // Throw an error to be caught by useAsyncData's error state
        throw new Error("Could not load details for all favorites.");
      }

      return successfulItems;
    } catch (e) {
      console.error("General error fetching favorite details:", e);
      // Re-throw the error for useAsyncData
      throw new Error(e.message || "An unexpected error occurred while loading favorites.");
    }
  },
  {
    watch: [favoriteMealIds, favoriteCocktailIds], // Watch the refs directly
    // server: false // Optional: Fetch only on client if localStorage is heavily relied upon initially
    // We will need to revisit client-side safety for useFavorites later.
  }
);

// --- Event Handlers ---
const handleToggleFavorite = ({ id, type }) => {
  // In favorites view, toggle always means remove
  if (type === "meal") {
    toggleMealFavorite(id);
  } else if (type === "cocktail") {
    toggleCocktailFavorite(id);
  }
  // Data will automatically refresh due to the watch in useAsyncData
  // Alternatively, could call refresh() manually if needed
};

const handleShareItem = ({ title, url, type, itemId }) => {
  if (openShareModal) {
    // Construct the correct URL for sharing based on item type and ID
    const shareUrl = `${window.location.origin}/${type}/${itemId}`; // Assumes base URL and standard paths
    openShareModal({
      title,
      url: shareUrl, // Use the constructed URL
      text: `Check out this favorite: ${title}`,
      type: type,
    });
  } else {
    console.error("openShareModal function not injected in Favorites page");
  }
};

// Set page head
useHead({
  title: "My Favorites | ChloroFill 🍴🍹",
  meta: [
    {
      name: "description",
      content: "View your saved favorite recipes and cocktails on ChloroFill.",
    },
  ],
});
</script>
