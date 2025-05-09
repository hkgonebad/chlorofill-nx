<template>
  <section class="block recipe-detail-view pt-0">
    <!-- Loading State with Placeholders -->
    <div v-if="pending" class="recipe-detail-placeholder placeholder-glow">
      <!-- Image Placeholder -->
      <div class="placeholder image-header-placeholder mb-3"></div>
      <div class="container recipe-body px-4 py-2">
        <!-- Header Placeholder -->
        <div class="d-flex align-items-center mb-4 view-header">
          <span class="placeholder back-button-placeholder me-3"></span>
          <h2 class="mb-0 flex-grow-1 placeholder col-8"></h2>
          <span class="placeholder favorite-button-placeholder ms-3"></span>
        </div>
        <!-- Meta Placeholder -->
        <p class="placeholder-glow small mb-3">
          <span class="placeholder col-3 me-2"></span>
          <span class="placeholder col-3"></span>
        </p>
        <!-- Tags Placeholder (Optional) -->
        <p class="placeholder-glow mb-3">
          <span class="placeholder col-2 me-1"></span>
          <span class="placeholder col-3 me-1"></span>
        </p>
        <!-- Ingredients Placeholder -->
        <h5 class="mt-4 placeholder col-4"></h5>
        <ul class="list-unstyled ingredients-list mb-4">
          <li v-for="n in 5" :key="'sk-ing-' + n" class="d-flex align-items-center mb-2 placeholder-glow">
            <span class="placeholder ingredient-thumbnail-placeholder me-2"></span>
            <span class="placeholder col-5 me-2"></span>
            <span class="placeholder col-3 ms-auto"></span>
          </li>
        </ul>
        <!-- Instructions Placeholder -->
        <h5 class="mt-4 placeholder col-5"></h5>
        <p class="placeholder-glow">
          <span class="placeholder col-12 mb-1"></span>
          <span class="placeholder col-10"></span>
          <span class="placeholder col-11 mb-1"></span>
          <span class="placeholder col-8"></span>
        </p>
      </div>
    </div>

    <!-- Error State -->
    <div v-else-if="error" class="container p-4">
      <ErrorMessage :message="error?.message || 'Could not load recipe details.'" />
      <BackButton class="mt-3" />
    </div>

    <!-- Content State -->
    <div v-else-if="recipe" class="recipe-content">
      <!-- Image Header -->
      <div class="image-header position-relative mb-3">
        <img :src="displayImage" class="img-fluid recipe-image" :alt="displayTitle" />
      </div>

      <div class="container recipe-body px-4 py-2">
        <!-- Header Row -->
        <div class="d-flex align-items-center mb-4 view-header">
          <BackButton class="btn btn-light btn-sm rounded-circle me-3 back-button-icon" />
          <h2 class="mb-0 flex-grow-1 section-title">
            {{ displayTitle }}
          </h2>
          <!-- Share Icon Button -->
          <button @click="openShareModal" class="btn btn-sm btn-light rounded-circle ms-3 action-icon" title="Share Recipe" aria-label="Share Recipe">
            <i class="pi pi-share-alt"></i>
          </button>
          <!-- Favorite Button -->
          <button
            @click="handleToggleFavorite({ id: recipe.idMeal, type: 'meal' })"
            class="btn btn-outline-danger btn-sm rounded-circle ms-2 favorite-button"
            :class="{ active: isCurrentFavorite }"
            :aria-label="isCurrentFavorite ? 'Remove from favorites' : 'Add to favorites'"
          >
            <i :class="isCurrentFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'"></i>
          </button>
        </div>

        <!-- Meta Info -->
        <p class="text-muted small mb-3">
          <span v-if="recipe.strCategory">
            Category:
            <template v-if="recipe.strCategory !== 'User Recipe' && recipe.strCategory !== 'User Creation'">
              <NuxtLink :to="{ path: `/category/${recipe.strCategory}` }">
                {{ recipe.strCategory }}
              </NuxtLink>
            </template>
            <template v-else>
              {{ recipe.strCategory }}
            </template>
          </span>
          <span v-if="recipe.strArea && recipe.strArea !== 'N/A'">
            | Area:
            <NuxtLink :to="{ path: `/areas/${recipe.strArea}` }">
              {{ recipe.strArea }}
            </NuxtLink>
          </span>
        </p>
        <!-- Affiliate Link for Category/Area -->
        <p class="small affiliate-links" v-if="(recipe.strCategory && recipe.strCategory !== 'User Recipe' && recipe.strCategory !== 'User Creation') || (recipe.strArea && recipe.strArea !== 'N/A')">
          <a
            v-if="recipe.strCategory && recipe.strCategory !== 'User Recipe' && recipe.strCategory !== 'User Creation'"
            :href="getAmazonSearchUrl(recipe.strCategory + ' cookbook')"
            target="_blank"
            rel="noopener noreferrer nofollow"
            class="me-2 affiliate-link"
          >
            <i class="pi pi-amazon"></i> Shop {{ recipe.strCategory }} Cookbooks
          </a>
          <a v-if="recipe.strArea && recipe.strArea !== 'N/A'" :href="getAmazonSearchUrl(recipe.strArea + ' cuisine')" target="_blank" rel="noopener noreferrer nofollow" class="affiliate-link">
            <i class="pi pi-amazon"></i> Shop {{ recipe.strArea }} Cuisine
          </a>
        </p>
        <p v-if="displayTags.length > 0" class="mb-3">
          <span class="badge bg-secondary me-1" v-for="tag in displayTags" :key="tag">{{ tag }}</span>
        </p>

        <!-- Ingredients -->
        <h5 class="mt-4">Ingredients</h5>
        <ul class="list-unstyled ingredients-list mb-4">
          <li class="d-flex align-items-center mb-2" v-for="(ingredient, index) in ingredientsAndMeasures" :key="index">
            <!-- Ingredient Thumbnail -->
            <img :src="getIngredientImageUrl(ingredient.name)" :alt="ingredient.name" class="ingredient-thumbnail me-2" loading="lazy" @error="($event) => ($event.target.style.display = 'none')" />
            <div class="flex-grow-1">
              <!-- Affiliate link for ingredient -->
              <a :href="getAmazonSearchUrl(ingredient.name)" target="_blank" rel="noopener noreferrer nofollow" class="affiliate-link">{{ ingredient.name }}</a>
            </div>
            <div class="text-muted ms-2">
              {{ ingredient.measure }}
            </div>
          </li>
        </ul>

        <!-- Instructions -->
        <h5 class="mt-4">Instructions</h5>
        <p class="instructions-text">
          {{ displayDescription }}
        </p>

        <!-- Source/Video Links -->
        <div class="mt-4">
          <a v-if="recipe.strSource" :href="recipe.strSource" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-secondary me-2">View Source</a>
          <a v-if="recipe.strYoutube" :href="recipe.strYoutube" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-danger">Watch Video</a>
        </div>
      </div>
    </div>
    <!-- State when recipe is not found after fetch -->
    <div v-else class="container p-4">
      <ErrorMessage message="Recipe details could not be loaded." />
      <BackButton class="mt-3" />
    </div>
  </section>
</template>

<script setup>
import { ref, computed, inject } from "vue";
// Import Nuxt composables & components
import { useAsyncData, useRoute, useHead, navigateTo } from "#imports";
import ErrorMessage from "~/components/ErrorMessage.vue";
import BackButton from "~/components/BackButton.vue";
import SkeletonCard from "~/components/SkeletonCard.vue"; // Reuse for placeholder
import { useFavorites } from "~/composables/useFavorites";
import { useMealApi } from "~/composables/useMealApi";
import { getAmazonSearchUrl } from "~/utils/affiliateLinks";

// Get route and API composable
const route = useRoute();
const { getRecipeById } = useMealApi(); // Renamed from getMealDetailsById
const recipeId = computed(() => route.params.id);

// --- Data Fetching with useAsyncData ---
const {
  data: recipe,
  pending,
  error,
} = await useAsyncData(
  `recipe-${recipeId.value}`,
  () => {
    if (!recipeId.value) return null;
    return getRecipeById(recipeId.value);
  },
  {
    watch: [recipeId], // Refetch if ID changes
  }
);

// --- Composables and State ---
const { isFavoriteMeal, toggleMealFavorite } = useFavorites();
const openShareModalFunc = inject("openShareModal");

// Computed favorite status
const isCurrentFavorite = computed(() => {
  return recipe.value ? isFavoriteMeal(recipe.value.idMeal) : false;
});

// --- Ingredient Processing ---
const ingredientsAndMeasures = computed(() => {
  if (!recipe.value) return [];
  const list = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = recipe.value[`strIngredient${i}`];
    const measure = recipe.value[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== "") {
      list.push({ name: ingredient.trim(), measure: measure ? measure.trim() : "" });
    }
  }
  return list;
});

const getIngredientImageUrl = (ingredientName) => {
  if (!ingredientName) return "";
  const formattedName = encodeURIComponent(ingredientName.trim().replace(/ /g, "_"));
  return `https://www.themealdb.com/images/ingredients/${formattedName}-Small.png`;
};

// --- Event Handlers ---
const handleToggleFavorite = ({ id, type }) => {
  if (recipe.value && id === recipe.value.idMeal) {
    toggleMealFavorite(id);
  }
};

const openShareModal = () => {
  if (openShareModalFunc && recipe.value) {
    openShareModalFunc({
      title: recipe.value.strMeal,
      url: window.location.href, // Use current URL for sharing
      text: `Check out this delicious recipe: ${recipe.value.strMeal}`,
      type: "meal",
    });
  } else {
    console.error("Share modal function not provided or recipe details missing.");
    // Fallback or error handling
  }
};

// --- Head Management (Dynamic Meta Tags) ---
useHead(() => {
  // Return default values if recipe hasn't loaded yet
  if (!recipe.value) {
    return {
      title: "Loading Recipe... | ChloroFill 🍴🍹",
    };
  }

  // Dynamically generate title and meta tags
  const pageTitle = `${recipe.value.strMeal} | ChloroFill 🍴🍹`;
  const description = recipe.value.strInstructions
    ? recipe.value.strInstructions.substring(0, 160) + "..." // Truncate for meta description
    : `Learn how to make ${recipe.value.strMeal}. Find ingredients and instructions on ChloroFill.`;
  const imageUrl = recipe.value.strMealThumb || "https://chlorofill.vercel.app/img/og-default.jpg"; // Fallback image
  const pageUrl = typeof window !== "undefined" ? window.location.href : `https://chlorofill.vercel.app/recipe/${recipeId.value}`; // Use window.location if available

  return {
    title: pageTitle,
    meta: [
      { key: "description", name: "description", content: description },
      // Open Graph Tags
      { key: "og:title", property: "og:title", content: pageTitle },
      { key: "og:description", property: "og:description", content: description },
      { key: "og:image", property: "og:image", content: imageUrl },
      { key: "og:url", property: "og:url", content: pageUrl },
      { key: "og:type", property: "og:type", content: "article" }, // Use 'article' for recipe pages
      { key: "article:published_time", property: "article:published_time", content: new Date().toISOString() }, // Add publication time if relevant
      { key: "article:tag", property: "article:tag", content: recipe.value.strCategory }, // Example tag
      // Twitter Card Tags
      { key: "twitter:card", name: "twitter:card", content: "summary_large_image" },
      { key: "twitter:title", name: "twitter:title", content: pageTitle },
      { key: "twitter:description", name: "twitter:description", content: description },
      { key: "twitter:image", name: "twitter:image", content: imageUrl },
    ],
    // Add link rel canonical if needed
    link: [{ rel: "canonical", href: pageUrl }],
  };
});

// Helper: check if ID is UUID (UGC)
const isUuid = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

const getRecipeImageUrl = computed(() => {
  if (!recipe.value) return "";
  // If UGC (UUID), do not append /large
  if (isUuid(recipeId.value)) {
    return recipe.value.strMealThumb || "/img/no-recipe.jpg";
  }
  // API: append /large
  return recipe.value.strMealThumb + "/large";
});

// --- UGC Field Mapping ---
const displayTitle = computed(() => recipe.value?.strMeal || "");
const displayDescription = computed(() => recipe.value?.strInstructions || "");
const displayTags = computed(() => recipe.value?.strTags?.split(",").map((t) => t.trim()) || []);
const displayImage = getRecipeImageUrl;
</script>

<style scoped lang="scss">
.recipe-image {
  width: 100%;
  max-height: 400px; /* Limit image height */
  object-fit: cover;
}

.view-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--bs-border-color-translucent);
  position: relative; /* For potential absolute positioning inside */
}

.ingredients-list li {
  padding: 0.3rem 0;
}

.ingredient-thumbnail {
  width: 40px;
  height: 40px;
  object-fit: contain;
  background-color: var(--bs-tertiary-bg);
  border-radius: 50%;
  padding: 2px;
  vertical-align: middle;
}

.instructions-text {
  white-space: pre-wrap; /* Preserve line breaks */
  line-height: 1.7;
}

.favorite-button {
  transition: transform 0.2s ease, background-color 0.2s ease;
}
.favorite-button.active {
  background-color: var(--bs-danger);
  color: white;
  border-color: var(--bs-danger);
  transform: scale(1.1);
}
.favorite-button:not(.active):hover {
  background-color: var(--bs-danger-bg-subtle);
}

.back-button-icon {
  /* No specific styles needed now */
}

.action-icon {
  transition: background-color 0.2s ease;
}
.action-icon:hover {
  background-color: var(--bs-secondary-bg-subtle);
}

.affiliate-links a {
  font-size: 0.85em;
  text-decoration: none;
  color: var(--bs-secondary-text);
  transition: color 0.2s ease;
  &:hover {
    color: var(--bs-primary);
    text-decoration: underline;
  }
  .pi {
    font-size: 0.9em;
    margin-right: 0.2em;
  }
}

/* Placeholder styles */
.image-header-placeholder {
  width: 100%;
  height: 300px;
  background-color: #e9ecef;
}
.back-button-placeholder {
  width: 32px;
  height: 32px;
  display: inline-block;
  border-radius: 50%;
  background-color: #e9ecef;
}
.favorite-button-placeholder {
  width: 32px;
  height: 32px;
  display: inline-block;
  border-radius: 50%;
  background-color: #e9ecef;
}
.ingredient-thumbnail-placeholder {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background-color: #e9ecef;
}

[data-bs-theme="dark"] .image-header-placeholder,
[data-bs-theme="dark"] .back-button-placeholder,
[data-bs-theme="dark"] .favorite-button-placeholder,
[data-bs-theme="dark"] .ingredient-thumbnail-placeholder {
  background-color: #343a40; /* Darker placeholder background */
}
</style>
