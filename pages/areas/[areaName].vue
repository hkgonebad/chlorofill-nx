<template>
  <div class="area-recipes-view container">
    <!-- Header with Back Button and Title -->
    <div class="d-flex align-items-center mb-4 view-header">
      <BackButton class="me-3" />
      <h2 class="mb-0 flex-grow-1 section-title">
        {{ pageTitle }}
      </h2>
    </div>

    <!-- Loading State -->
    <div v-if="pending" class="row row-cols-2 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 placeholder-glow">
      <SkeletonCard v-for="n in 8" :key="'sk-' + n" />
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
        :link-to="`/recipe/${recipe.idMeal}`"
        :item-id="recipe.idMeal"
        item-type="meal"
        :is-favorite="isFavoriteMeal(recipe.idMeal)"
        @toggle-favorite="handleToggleFavorite"
        @share-item="handleShareItem"
      />
    </div>
    <!-- No Recipes Found State -->
    <div v-else>
      <p class="alert alert-info">No recipes found for the area "{{ areaNameDisplay }}".</p>
    </div>
  </div>
</template>

<script setup>
import { computed, inject } from "vue";
import { useRoute, useAsyncData, useHead } from "#imports";
import { useMealApi } from "~/composables/useMealApi";
import { useFavorites } from "~/composables/useFavorites";
import ItemCard from "../components/ItemCard.vue";
import ErrorMessage from "../components/ErrorMessage.vue";
import SkeletonCard from "../components/SkeletonCard.vue";
import BackButton from "@/components/BackButton.vue";

// Get route and API composables
const route = useRoute();
const { getMealsByArea } = useMealApi();
const { isFavorite: isFavoriteMeal, toggleMealFavorite } = useFavorites();

// Inject share modal function
const openShareModal = inject("openShareModal");

// Get area name from route params
const areaName = computed(() => route.params.areaName);
const areaNameDisplay = computed(() => (areaName.value ? decodeURIComponent(areaName.value) : "Unknown Area"));

// Fetch recipes using useAsyncData
const {
  data: recipes,
  pending,
  error,
} = await useAsyncData(
  `area-recipes-${areaName.value}`, // Dynamic key based on area name
  () => {
    if (!areaName.value) return []; // Don't fetch if no area name
    const decodedAreaName = decodeURIComponent(areaName.value);
    console.log(`Fetching recipes for area: ${decodedAreaName}`);
    return getMealsByArea(decodedAreaName);
  },
  {
    watch: [areaName], // Refetch if areaName changes
  }
);

// Compute page title
const pageTitle = computed(() => `${areaNameDisplay.value} Recipes`);

// --- Event Handlers ---
const handleToggleFavorite = ({ id, type }) => {
  if (type === "meal") {
    toggleMealFavorite(id);
  }
};

const handleShareItem = ({ title, itemId }) => {
  if (openShareModal) {
    const shareUrl = `${window.location.origin}/recipe/${itemId}`;
    openShareModal({
      title,
      url: shareUrl,
      text: `Check out this recipe: ${title}`,
      type: "meal",
    });
  } else {
    console.error("openShareModal function not injected");
  }
};

// Set page head dynamically
useHead(() => ({
  title: `${pageTitle.value} | ChloroFill 🍴🍹`,
  meta: [
    {
      name: "description",
      content: `Browse recipes from the ${areaNameDisplay.value} cuisine on ChloroFill.`,
    },
  ],
}));
</script>
