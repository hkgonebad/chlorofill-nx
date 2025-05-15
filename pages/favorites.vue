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
    <ErrorMessage v-else-if="error" :message="error?.message || error || 'Could not load favorites.'" />

    <!-- Combined List -->
    <div v-else-if="favoritesLoaded && allFavoritesDetails.length > 0" class="row row-cols-2 row-cols-md-4 g-4">
      <template v-for="item in allFavoritesDetails" :key="item.type + '-' + item.id">
        <ItemCard
          v-if="item.id"
          :imageUrl="item.image_url || '/img/no-recipe.jpg'"
          :title="item.title"
          :link-to="item.type === 'meal' ? `/recipe/${item.id}` : `/cocktail/${item.id}`"
          :itemId="item.id"
          :itemType="item.type"
          :is-favorite="true"
          @toggle-favorite="handleToggleFavorite"
          @share-item="handleShareItem"
        />
      </template>
    </div>
    <!-- No Favorites State -->
    <div v-else-if="!favoritesLoaded" class="row row-cols-2 row-cols-md-4 g-4 placeholder-glow">
      <SkeletonCard v-for="n in skeletonCount" :key="'sk-' + n" />
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
const { favoriteMealIds, favoriteCocktailIds, removeMealFavorite, removeCocktailFavorite, favoritesLoaded } = useFavorites();
// const { getMealById } = useRecipeApi();
const { getRecipeById } = useMealApi(); // Corrected usage
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
        const mealData = await getRecipeById(id); // Fetches API or maps UGC
        if (!mealData) return null;
        // Standardize structure for ItemCard
        return {
          id: mealData.idMeal || mealData.id, // Use .id for UGC
          type: "meal",
          title: mealData.strMeal || mealData.title, // Use .title for UGC
          image_url: mealData.image_path || mealData.strMealThumb, // Prioritize image_path for UGC
        };
      });
      const cocktailPromises = combinedCocktailIds.map(async (id) => {
        const cocktailData = await getCocktailById(id); // Fetches API or maps UGC
        if (!cocktailData) return null;
        // Standardize structure for ItemCard
        return {
          id: cocktailData.idDrink || cocktailData.id, // Use .id for UGC
          type: "cocktail",
          title: cocktailData.strDrink || cocktailData.title, // Use .title for UGC
          image_url: cocktailData.image_path || cocktailData.strDrinkThumb, // Prioritize image_path for UGC
        };
      });

      const results = await Promise.allSettled([...mealPromises, ...cocktailPromises]);

      const successfulItems = [];
      let hasActualFetchError = false; // Renamed to be clearer

      results.forEach((result) => {
        if (result.status === "fulfilled") {
          if (result.value) {
            // Check if the fulfilled promise has a non-null value
            successfulItems.push(result.value);
          }
          // If result.value is null, it means the item was not found by getRecipeById/getCocktailById.
          // This is an expected outcome for a missing favorite, so we don't treat it as an error here.
          // We simply don't add it to successfulItems.
        } else {
          // Promise was rejected, meaning an actual error occurred in getRecipeById/getCocktailById
          console.error(`Failed to fetch details for a favorite item:`, result.reason);
          hasActualFetchError = true; // Flag that a real error occurred
        }
      });

      // Optional: Sort combined list (e.g., by name)
      successfulItems.sort((a, b) => {
        const nameA = a.type === "meal" ? a.title : a.title;
        const nameB = b.type === "meal" ? b.title : b.title;
        return nameA.localeCompare(nameB);
      });

      // Throw an error to be caught by useAsyncData's error state ONLY if a real fetch error occurred
      if (hasActualFetchError) {
        throw new Error("Could not load details for some favorites. They may have been removed or an error occurred.");
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
    removeMealFavorite(id);
  } else if (type === "cocktail") {
    removeCocktailFavorite(id);
  }
  // Optimistically remove from UI for instant feedback
  allFavoritesDetails.value = allFavoritesDetails.value.filter((item) => (type === "meal" && item.id !== id) || (type === "cocktail" && item.id !== id));
  // Refetching is handled by the watch on combinedFavoriteIds
};

const handleShareItem = ({ title, itemId, itemType }) => {
  if (openShareModal) {
    if (!itemId || !itemType) {
      console.error("Favorites Share: Missing itemId or itemType for sharing.");
      alert("Cannot share this item: essential information is missing.");
      return;
    }

    const basePath = itemType === "meal" ? "recipe" : "cocktail"; // Map 'meal' type to 'recipe' path
    // Ensure window.location.origin is available (client-side)
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    if (!origin && process.client) {
      console.error("Favorites Share: window.location.origin is not available.");
      alert("Cannot generate share link: critical information unavailable.");
      return;
    }
    const shareUrl = `${origin}/${basePath}/${itemId}`;

    openShareModal({
      title,
      url: shareUrl,
      text: `Check out this favorite: ${title}`,
      type: itemType, // Pass the original itemType ('meal' or 'cocktail') to the modal
    });
  } else {
    console.error("openShareModal function not injected in Favorites page");
    alert("Sharing service is currently unavailable.");
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
