<template>
  <section class="block category-recipes-view py-5">
    <div class="container">
      <!-- Header with Back Button and Title -->
      <div class="d-flex align-items-center mb-4 view-header">
        <BackButton class="me-3" />
        <h2 class="mb-0 flex-grow-1 section-title">{{ pageTitle }} Recipes</h2>
      </div>

      <!-- Loading State -->
      <div v-if="pending" class="row row-cols-2 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 placeholder-glow">
        <SkeletonCard v-for="n in 8" :key="'sk-' + n" />
        <!-- Show ~8 skeletons -->
      </div>
      <!-- Error State -->
      <ErrorMessage v-else-if="error" :message="error?.message || 'Could not load recipes.'" />

      <!-- Recipe List -->
      <div v-else-if="recipes && recipes.length > 0" class="row row-cols-2 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        <ItemCard
          v-for="recipe in recipes"
          :key="recipe.idMeal"
          :image-url="recipe.strMealThumb"
          :title="recipe.strMeal"
          :link-to="{ path: `/recipe/${recipe.idMeal}` }"
          :item-id="recipe.idMeal"
          item-type="meal"
          :is-favorite="isFavorite(recipe.idMeal)"
          @toggle-favorite="handleToggleFavorite"
          @share-item="handleShare"
        />
        <!-- Subtitle is not available in filter.php result -->
        <!-- Button uses the default slot content -->
      </div>
      <!-- No Recipes Found State -->
      <div v-else>
        <p class="alert alert-info">No recipes found for the category "{{ pageTitle }}".</p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref, computed, inject } from "vue";
// Use Nuxt's useRoute to get route parameters
import { useRoute } from "vue-router"; // REMOVE
// Import reusable components using Nuxt alias
import ItemCard from "~/components/ItemCard.vue";
import ErrorMessage from "~/components/ErrorMessage.vue";
import SkeletonCard from "~/components/SkeletonCard.vue";
import BackButton from "~/components/BackButton.vue";
// Import composables using Nuxt alias
import { useFavorites } from "~/composables/useFavorites";
import { useMealApi } from "~/composables/useMealApi";

// Get route information
const route = useRoute();
const categoryName = computed(() => route.params.categoryName || "");
const pageTitle = computed(() => categoryName.value || "Category"); // For display

// Inject the global openShareModal function
const openShareModal = inject("openShareModal");

// Use API composable
const { getRecipesByCategory } = useMealApi();

// Use Favorites composable
const { isFavorite, addFavorite, removeFavorite } = useFavorites();

// Fetch data using useAsyncData for SSR compatibility
const {
  data: recipes,
  pending,
  error,
} = await useAsyncData(
  `category-${categoryName.value}`,
  () => {
    if (!categoryName.value) return []; // Avoid fetching if param is missing
    return getRecipesByCategory(categoryName.value);
  },
  { watch: [categoryName] } // Re-fetch when categoryName changes
);

// Handler for toggling favorite status
const handleToggleFavorite = (payload) => {
  if (isFavorite(payload.id)) {
    removeFavorite(payload.id);
  } else {
    addFavorite(payload.id);
  }
};

// Handler for sharing - Uses injected function to open the global modal
const handleShare = (payload) => {
  if (openShareModal) {
    openShareModal(payload); // Pass the payload (title, url)
  } else {
    console.error("Share modal function not provided/injected.");
    alert(`Sharing (fallback): ${payload.title}\nURL: ${payload.url}`);
  }
};

// Set page head dynamically
useHead({
  title: computed(() => `${pageTitle.value} Recipes | ChloroFill 🍴🍹`),
  meta: [
    {
      name: "description",
      content: computed(() => `Browse meal recipes in the ${pageTitle.value} category on ChloroFill.`),
    },
  ],
});
</script>
