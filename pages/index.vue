<template>
  <div class="home-view py-4">
    <section class="hero">
      <div class="container">
        <div class="welcome-header mb-4 text-md-center">
          <p class="text-muted mb-1">Hello, {{ userGreeting }}</p>
          <!-- Add user name later if implementing auth -->
          <h2>What would you like<br />to cook today?</h2>

          <!-- Search -->
          <RecipeSearch class="mt-3 mb-4" />
        </div>
      </div>
    </section>

    <section class="recipe-section mb-5">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="section-title">Featured Recipes</h4>
          <!-- Optional: Link to Categories view -->
          <NuxtLink :to="{ path: '/categories' }" class="btn btn-sm btn-outline-secondary">See all</NuxtLink>
        </div>

        <!-- Loading State with Skeleton Cards -->
        <div v-if="loadingFeatured" class="row row-cols-2 row-cols-md-4 g-4 placeholder-glow">
          <SkeletonCard v-for="n in 4" :key="'sk-' + n" />
        </div>
        <!-- Error State -->
        <ErrorMessage v-else-if="errorFeatured" :message="errorFeatured?.message || errorFeatured" />
        <!-- Recipe Grid -->
        <div v-else-if="featuredRecipes.length > 0" class="row row-cols-2 row-cols-md-4 g-4">
          <ItemCard
            v-for="recipe in featuredRecipes"
            :key="recipe.idMeal"
            :image-url="recipe.strMealThumb"
            :title="recipe.strMeal"
            :link-to="{ path: `/recipe/${recipe.idMeal}` }"
            :item-id="recipe.idMeal"
            item-type="meal"
            :is-favorite="isFavoriteMeal(recipe.idMeal)"
            @toggle-favorite="handleToggleFavorite"
            @share-item="handleShareItem"
          />
        </div>
        <!-- No Recipes Found -->
        <p v-else>Could not load featured recipes.</p>
      </div>
    </section>

    <!-- === Featured Cocktail Section (Using ItemCard) === -->
    <section class="cocktail-section mb-5">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="section-title">Featured Cocktails</h4>
          <!-- Optional: Link to Cocktails view -->
          <NuxtLink :to="{ path: '/cocktails' }" class="btn btn-sm btn-outline-secondary">Explore More</NuxtLink>
        </div>
        <!-- Loading State -->
        <div v-if="loadingCocktails" class="row row-cols-2 row-cols-md-4 g-4 placeholder-glow">
          <SkeletonCard v-for="n in 4" :key="'sk-cocktail-' + n" />
        </div>
        <!-- Error State -->
        <ErrorMessage v-else-if="errorCocktails" :message="errorCocktails?.message || errorCocktails" />
        <!-- Cocktail Cards Display (Using ItemCard) -->
        <div v-else-if="featuredCocktails.length > 0" class="row row-cols-2 row-cols-md-4 g-4">
          <ItemCard
            v-for="cocktail in featuredCocktails"
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
        <!-- No Cocktails Found -->
        <p v-else>Could not load featured cocktails.</p>
      </div>
    </section>
    <!-- === End Featured Cocktail Section === -->

    <section class="recipe-section mb-5">
      <div class="container">
        <div class="d-flex justify-content-between align-items-center mb-3">
          <h4 class="section-title">Categories</h4>
          <NuxtLink :to="{ path: '/categories' }" class="btn btn-sm btn-outline-secondary">See all</NuxtLink>
        </div>
        <ClientOnly placeholder-tag="div" placeholder="Loading categories...">
          <CategoryCarousel />
        </ClientOnly>
      </div>
    </section>

    <!-- Recommendations Section (Conditional & Using ItemCard) -->
    <template v-if="combinedFavoriteIds.length > 0">
      <section class="recipe-section mb-5">
        <div class="container">
          <div class="d-flex justify-content-between align-items-center mb-3">
            <h4 class="section-title">Recommendations For You</h4>
            <!-- Optional: Link to the source category/area? -->
            <!-- <a href="#" class="btn btn-sm btn-outline-secondary">See all</a> -->
          </div>
          <!-- Loading State -->
          <div v-if="loadingRecommended" class="row row-cols-2 row-cols-md-4 g-4 placeholder-glow">
            <SkeletonCard v-for="n in 4" :key="'sk-rec-' + n" />
          </div>
          <!-- Error State -->
          <ErrorMessage v-else-if="errorRecommended" :message="errorRecommended?.message || errorRecommended" />
          <!-- Combined Grid -->
          <div v-else-if="recommendedItems.length > 0" class="row row-cols-2 row-cols-md-4 g-4">
            <template v-for="item in recommendedItems" :key="item.type + '-' + (item.idMeal || item.idDrink)">
              <ItemCard
                v-if="(item.type === 'meal' && item.idMeal) || (item.type === 'cocktail' && item.idDrink)"
                :image-url="item.type === 'meal' ? item.strMealThumb : item.strDrinkThumb"
                :title="item.type === 'meal' ? item.strMeal : item.strDrink"
                :link-to="item.type === 'meal' ? { path: `/recipe/${item.idMeal}` } : { path: `/cocktail/${item.idDrink}` }"
                :item-id="item.type === 'meal' ? item.idMeal : item.idDrink"
                :item-type="item.type"
                :is-favorite="item.type === 'meal' ? isFavoriteMeal(item.idMeal) : isFavoriteCocktail(item.idDrink)"
                @toggle-favorite="handleToggleFavorite"
                @share-item="handleShareItem"
              />
            </template>
          </div>
          <!-- No Recommendations Found -->
          <p v-else class="text-muted">Could not load recommendations at this time.</p>
        </div>
      </section>
    </template>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, computed, inject } from "vue";
// Import components using Nuxt alias
import ItemCard from "~/components/ItemCard.vue";
import ErrorMessage from "~/components/ErrorMessage.vue";
import CategoryCarousel from "~/components/CategoryCarousel.vue";
import RecipeSearch from "~/components/RecipeSearch.vue";
import SkeletonCard from "~/components/SkeletonCard.vue";
// ShareButtons might not be needed directly here if ShareModal handles it
// import ShareButtons from "~/components/ShareButtons.vue";
// Import composables using Nuxt alias
import { useFavorites } from "~/composables/useFavorites"; // Assuming single favorites composable
// import { useCocktailFavorites } from "~/composables/useCocktailFavorites.js"; // Remove if merged into useFavorites
import { useMealApi } from "~/composables/useMealApi";
import { useCocktailApi } from "~/composables/useCocktailApi";
import { useAsyncData, useHead } from "#imports"; // Add useAsyncData

// Inject the global openShareModal function
const openShareModal = inject("openShareModal");

const userGreeting = ref("");

// Use the single favorites composable
// const { mealFavorites, cocktailFavorites, isFavoriteMeal, isFavoriteCocktail, toggleMealFavorite, toggleCocktailFavorite } = useFavorites();
// Correct destructuring based on useFavorites.js exports:
const { favoriteMealIds, favoriteCocktailIds, isFavoriteMeal, isFavoriteCocktail, toggleMealFavorite, toggleCocktailFavorite } = useFavorites();

// API composables
const { getRecipesByCategory, getRecipeById, getRandomMeal } = useMealApi();
const { getCocktailById, getRandomCocktail } = useCocktailApi(); // Add getCocktailById if needed for recommendations

// --- Fetch Featured Recipes with useAsyncData ---
const {
  data: featuredRecipes,
  pending: loadingFeatured,
  error: errorFeatured,
} = useAsyncData(
  "featured-recipes",
  async () => {
    // Fetch multiple random meals concurrently for variety
    const promises = Array(4)
      .fill(null)
      .map(() => getRandomMeal());
    const results = await Promise.allSettled(promises);
    const meals = results.filter((r) => r.status === "fulfilled" && r.value).map((r) => r.value);
    // Deduplicate based on idMeal
    const uniqueMeals = Array.from(new Map(meals.map((meal) => [meal.idMeal, meal])).values());
    return uniqueMeals.slice(0, 4); // Ensure we have max 4
  },
  { lazy: true, default: () => [] } // Use lazy loading and provide default empty array
);

// --- Fetch Featured Cocktails with useAsyncData ---
const {
  data: featuredCocktails,
  pending: loadingCocktails,
  error: errorCocktails,
} = useAsyncData(
  "featured-cocktails",
  async () => {
    const promises = Array(4)
      .fill(null)
      .map(() => getRandomCocktail());
    const results = await Promise.allSettled(promises);
    const cocktails = results.filter((r) => r.status === "fulfilled" && r.value).map((r) => r.value);
    // Deduplicate based on idDrink
    const uniqueCocktails = Array.from(new Map(cocktails.map((cocktail) => [cocktail.idDrink, cocktail])).values());
    return uniqueCocktails.slice(0, 4);
  },
  { lazy: true, default: () => [] }
);

// Combine meal and cocktail IDs for triggering recommendation fetch
const combinedFavoriteIds = computed(() => [...favoriteMealIds.value, ...favoriteCocktailIds.value]);

// --- Fetch Recommendations with useAsyncData (watching combinedFavoriteIds) ---
const {
  data: recommendedItems,
  pending: loadingRecommended,
  error: errorRecommended,
  refresh: refreshRecommendations,
} = useAsyncData(
  "recommendations",
  async () => {
    if (combinedFavoriteIds.value.length === 0) {
      return []; // Return empty array if no favorites
    }

    let fetchedMeals = [];
    let fetchedCocktails = [];

    try {
      const randomIndex = Math.floor(Math.random() * combinedFavoriteIds.value.length);
      const randomFavId = combinedFavoriteIds.value[randomIndex];
      const isMealFav = favoriteMealIds.value.includes(randomFavId);

      if (isMealFav) {
        const detailData = await getRecipeById(randomFavId);
        if (detailData && detailData.strCategory) {
          const sourceCategory = detailData.strCategory;
          const recommendData = await getRecipesByCategory(sourceCategory);
          const featuredMealIds = featuredRecipes.value?.map((r) => r.idMeal) || []; // Handle potential null featuredRecipes
          fetchedMeals = recommendData
            .filter((r) => r.idMeal && !featuredMealIds.includes(r.idMeal) && r.idMeal !== randomFavId)
            .slice(0, 4)
            .map((meal) => ({ ...meal, type: "meal" }));
        } else {
          console.warn(`Could not get category for favorite meal ${randomFavId}`);
        }
      } else {
        // Fetch Cocktail Recommendations (Simpler: 2 random)
        const cocktailPromises = [getRandomCocktail(), getRandomCocktail()];
        const cocktailResults = await Promise.allSettled(cocktailPromises);
        fetchedCocktails = cocktailResults.filter((r) => r.status === "fulfilled" && r.value && r.value.idDrink !== randomFavId).map((r) => ({ ...r.value, type: "cocktail" }));
        // Deduplicate
        fetchedCocktails = Array.from(new Map(fetchedCocktails.map((c) => [c.idDrink, c])).values()).slice(0, 2);
      }

      // Fetch complementary items (simplified)
      const neededMeals = fetchedMeals.length > 0 ? 0 : Math.min(2, 4 - fetchedCocktails.length);
      const neededCocktails = fetchedCocktails.length > 0 ? 0 : Math.min(2, 4 - fetchedMeals.length);

      const complementaryPromises = [];
      for (let i = 0; i < neededMeals; i++) complementaryPromises.push(getRandomMeal());
      for (let i = 0; i < neededCocktails; i++) complementaryPromises.push(getRandomCocktail());

      if (complementaryPromises.length > 0) {
        const compResults = await Promise.allSettled(complementaryPromises);
        compResults.forEach((r) => {
          if (r.status === "fulfilled" && r.value) {
            if (r.value.idMeal && fetchedMeals.length < 4) {
              // Avoid adding if already featured or is a favorite meal
              if (!featuredRecipes.value?.some((m) => m.idMeal === r.value.idMeal) && !favoriteMealIds.value.includes(r.value.idMeal)) {
                fetchedMeals.push({ ...r.value, type: "meal" });
              }
            } else if (r.value.idDrink && fetchedCocktails.length < 4) {
              // Avoid adding if already featured or is a favorite cocktail
              if (!featuredCocktails.value?.some((c) => c.idDrink === r.value.idDrink) && !favoriteCocktailIds.value.includes(r.value.idDrink)) {
                fetchedCocktails.push({ ...r.value, type: "cocktail" });
              }
            }
          }
        });
      }

      let combined = [...fetchedMeals, ...fetchedCocktails].filter((item) => item.idMeal || item.idDrink);
      combined.sort(() => Math.random() - 0.5); // Shuffle
      return combined.slice(0, 4); // Limit to 4 total
    } catch (e) {
      console.error("Error fetching recommendations:", e);
      // Throw error for useAsyncData to catch
      throw new Error(`Failed to load recommendations: ${e.message}`);
    }
  },
  {
    watch: [combinedFavoriteIds], // Refetch when favorites change
    lazy: true,
    default: () => [], // Provide default empty array
  }
);

// Fetch user greeting based on current time
const fetchUserGreeting = () => {
  // No need for async here
  const currentTime = new Date();
  const hours = currentTime.getHours();

  if (hours < 12) {
    userGreeting.value = "Good Morning";
  } else if (hours < 18) {
    userGreeting.value = "Good Afternoon";
  } else {
    userGreeting.value = "Good Evening";
  }
};

// Call synchronous greeting function on mount
onMounted(() => {
  fetchUserGreeting();
  // Data fetching is now handled by useAsyncData calls
});

// --- Event Handlers ---
const handleToggleFavorite = ({ id, type }) => {
  if (type === "meal") {
    toggleMealFavorite(id);
  } else if (type === "cocktail") {
    toggleCocktailFavorite(id);
  }
  // useAsyncData watching combinedFavoriteIds will trigger refresh automatically
  // refreshRecommendations(); // No longer needed unless manual refresh desired elsewhere
};

const handleShareItem = ({ title, itemId, itemType }) => {
  if (openShareModal) {
    if (!itemId || !itemType) {
      console.error("Homepage Share: Missing itemId or itemType for sharing.");
      alert("Cannot share this item: essential information is missing.");
      return;
    }

    const basePath = itemType === "meal" ? "recipe" : "cocktail"; // Map 'meal' type to 'recipe' path
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    if (!origin && process.client) {
      // Check origin only on client
      console.error("Homepage Share: window.location.origin is not available.");
      alert("Cannot generate share link: critical information unavailable.");
      return;
    }
    const shareUrl = `${origin}/${basePath}/${itemId}`;

    openShareModal({
      title,
      url: shareUrl,
      text: `Check out this ${itemType === "meal" ? "recipe" : "cocktail"}: ${title}`,
      type: itemType, // Pass the original itemType ('meal' or 'cocktail') to the modal
    });
  } else {
    console.error("Share modal function not provided on Homepage.");
    alert("Sharing service is currently unavailable.");
  }
};

// Set page head
useHead({
  title: "ChloroFill 🍴🍹 - Discover Recipes & Cocktails",
  // Keep existing meta tags
});
</script>

<style scoped>
/* No scoped styles needed - use global layout files */
</style>
