<template>
  <section class="block cocktail-detail-view pt-0">
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
      <ErrorMessage :message="error?.message || 'Could not load cocktail details.'" />
      <BackButton class="mt-3" />
    </div>

    <!-- Content State -->
    <div v-else-if="cocktail" class="recipe-content">
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
          <button @click="openShareModal" class="btn btn-sm btn-light rounded-circle ms-3 action-icon" title="Share Cocktail" aria-label="Share Cocktail">
            <i class="pi pi-share-alt"></i>
          </button>
          <!-- Favorite Button -->
          <button
            @click="handleToggleFavorite({ id: cocktail.idDrink, type: 'cocktail' })"
            class="btn btn-outline-danger btn-sm rounded-circle ms-2 favorite-button"
            :class="{ active: isCurrentFavorite }"
            :aria-label="isCurrentFavorite ? 'Remove from favorites' : 'Add to favorites'"
          >
            <i :class="isCurrentFavorite ? 'pi pi-heart-fill' : 'pi pi-heart'"></i>
          </button>
        </div>

        <!-- Meta Info -->
        <p class="text-muted small mb-3">
          <span v-if="cocktail.strCategory">
            Category:
            <template v-if="cocktail.strCategory !== 'User Cocktail' && cocktail.strCategory !== 'User Creation'">
              <NuxtLink :to="`/cocktails/filter/c/${encodeURIComponent(cocktail.strCategory)}`">
                {{ cocktail.strCategory }}
              </NuxtLink>
            </template>
            <template v-else>
              {{ cocktail.strCategory }}
            </template>
          </span>
          <span v-if="cocktail.strAlcoholic && cocktail.strAlcoholic !== 'N/A'">
            | Type:
            <NuxtLink :to="`/cocktails/filter/a/${encodeURIComponent(cocktail.strAlcoholic)}`">
              {{ cocktail.strAlcoholic }}
            </NuxtLink>
          </span>
          <span v-if="cocktail.strGlass && cocktail.strGlass !== 'N/A'">
            | Glass:
            <NuxtLink :to="`/cocktails/filter/g/${encodeURIComponent(cocktail.strGlass)}`">
              {{ cocktail.strGlass }}
            </NuxtLink>
          </span>
        </p>
        <!-- Affiliate Link for Glass -->
        <p class="small affiliate-links" v-if="cocktail.strGlass && cocktail.strGlass !== 'N/A'">
          <a v-if="cocktail.strGlass && cocktail.strGlass !== 'N/A'" :href="getAmazonSearchUrl(cocktail.strGlass + ' glass')" target="_blank" rel="noopener noreferrer nofollow" class="me-2 affiliate-link">
            <i class="pi pi-amazon"></i> Shop for {{ cocktail.strGlass }} glasses
          </a>
        </p>
        <p v-if="displayTags.length > 0" class="mb-3">
          <span class="badge bg-secondary me-1" v-for="tag in displayTags" :key="tag">{{ tag }}</span>
        </p>

        <!-- Ingredients -->
        <h5 class="mt-4">Ingredients</h5>
        <ul class="list-unstyled ingredients-list mb-4">
          <li class="d-flex align-items-center mb-2" v-for="(ingredient, index) in ingredientsList" :key="index">
            <!-- Ingredient Thumbnail -->
            <img :src="getIngredientImageUrl(ingredient.name)" :alt="ingredient.name" class="ingredient-thumbnail me-2" loading="lazy" @error="($event) => ($event.target.style.display = 'none')" />
            <div class="flex-grow-1">
              <!-- Affiliate link for ingredient - Use getAmazonSearchUrl -->
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
          <!-- No direct source or video usually provided by cocktailDB -->
          <a :href="`https://www.google.com/search?q=${encodeURIComponent(displayTitle + ' cocktail recipe')}`" target="_blank" rel="noopener noreferrer" class="btn btn-sm btn-outline-secondary me-2">Search for Recipe Variations</a>
        </div>
      </div>
    </div>

    <!-- Not Found State -->
    <div v-else class="container p-4">
      <ErrorMessage message="Cocktail details could not be loaded." />
      <BackButton class="mt-3" />
    </div>
  </section>
</template>

<script setup>
import { ref, computed, inject } from "vue";
// Import Nuxt composables & components
import { useAsyncData, useRoute, useHead, navigateTo } from "#imports"; // Rely on auto-imports
import ErrorMessage from "~/components/ErrorMessage.vue";
import BackButton from "~/components/BackButton.vue";
import { useFavorites } from "~/composables/useFavorites";
import { useCocktailApi } from "~/composables/useCocktailApi";
import { getAmazonSearchUrl } from "~/utils/affiliateLinks";

// Get route and API composable
const route = useRoute();
const { getCocktailById } = useCocktailApi();
const cocktailId = computed(() => route.params.id);

// --- Data Fetching with useAsyncData ---
const {
  data: cocktail,
  pending,
  error,
} = await useAsyncData(
  `cocktail-${cocktailId.value}`,
  () => {
    if (!cocktailId.value) return null;
    return getCocktailById(cocktailId.value);
  },
  {
    watch: [cocktailId], // Refetch if ID changes
  }
);

// --- Composables and State ---
const { isFavoriteCocktail, toggleCocktailFavorite } = useFavorites();
const openShareModalFunc = inject("openShareModal");

// Computed favorite status
const isCurrentFavorite = computed(() => {
  return cocktail.value ? isFavoriteCocktail(cocktail.value.idDrink) : false;
});

// --- Ingredient Processing ---
const ingredientsList = computed(() => {
  if (!cocktail.value) return [];
  const list = [];
  for (let i = 1; i <= 15; i++) {
    // Cocktails use up to 15 ingredients
    const ingredient = cocktail.value[`strIngredient${i}`];
    const measure = cocktail.value[`strMeasure${i}`];
    if (ingredient && ingredient.trim() !== "") {
      list.push({ name: ingredient.trim(), measure: measure ? measure.trim() : "" });
    }
  }
  return list;
});

const getIngredientImageUrl = (ingredientName) => {
  if (!ingredientName) return "";
  const formattedName = encodeURIComponent(ingredientName.trim().replace(/ /g, "_"));
  // CocktailDB image URL format
  return `https://www.thecocktaildb.com/images/ingredients/${formattedName}-Small.png`;
};

// --- Event Handlers ---
const handleToggleFavorite = ({ id, type }) => {
  if (cocktail.value && id === cocktail.value.idDrink) {
    toggleCocktailFavorite(id);
  }
};

const openShareModal = () => {
  if (openShareModalFunc && cocktail.value) {
    openShareModalFunc({
      title: cocktail.value.strDrink,
      url: window.location.href, // Use current URL
      text: `Check out this cocktail: ${cocktail.value.strDrink}`,
      type: "cocktail",
    });
  } else {
    console.error("Share modal function not provided or cocktail details missing.");
  }
};

// --- Head Management (Dynamic Meta Tags) ---
useHead(() => {
  // Default values if cocktail hasn't loaded
  if (!cocktail.value) {
    return {
      title: "Loading Cocktail... | ChloroFill 🍴🍹",
    };
  }

  // Dynamic values
  const pageTitle = `${cocktail.value.strDrink} | ChloroFill 🍴🍹`;
  const description = cocktail.value.strInstructions ? cocktail.value.strInstructions.substring(0, 160) + "..." : `Learn how to make a ${cocktail.value.strDrink}. Find ingredients and instructions on ChloroFill.`;
  const imageUrl = cocktail.value.strDrinkThumb || "https://chlorofill.vercel.app/img/og-default.jpg";
  const pageUrl = typeof window !== "undefined" ? window.location.href : `https://chlorofill.vercel.app/cocktail/${cocktailId.value}`;

  return {
    title: pageTitle,
    meta: [
      { key: "description", name: "description", content: description },
      // Open Graph
      { key: "og:title", property: "og:title", content: pageTitle },
      { key: "og:description", property: "og:description", content: description },
      { key: "og:image", property: "og:image", content: imageUrl },
      { key: "og:url", property: "og:url", content: pageUrl },
      { key: "og:type", property: "og:type", content: "article" }, // Treat as article
      // Twitter Card
      { key: "twitter:card", name: "twitter:card", content: "summary_large_image" },
      { key: "twitter:title", name: "twitter:title", content: pageTitle },
      { key: "twitter:description", name: "twitter:description", content: description },
      { key: "twitter:image", name: "twitter:image", content: imageUrl },
    ],
    link: [{ rel: "canonical", href: pageUrl }],
  };
});

// Helper: check if ID is UUID (UGC)
const isUuid = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

// --- UGC Field Mapping ---
const displayTitle = computed(() => cocktail.value?.strDrink || "");
const displayDescription = computed(() => cocktail.value?.strInstructions || "");
const displayTags = computed(() => cocktail.value?.strTags?.split(",").map((t) => t.trim()) || []);
const displayImage = getCocktailImageUrl;

const getCocktailImageUrl = computed(() => {
  if (!cocktail.value) return "";
  // If UGC (UUID), do not append /large
  if (isUuid(cocktailId.value)) {
    return cocktail.value.strDrinkThumb || "/img/no-recipe.jpg";
  }
  // API: append /large
  return cocktail.value.strDrinkThumb + "/large";
});
</script>

<style scoped lang="scss">
/* Styles should target common classes like .recipe-detail-view, .recipe-body, etc. */
/* Add specific rules to scss/layout/_cocktail-detail.scss or _recipe-detail.scss if needed */
.recipe-image {
  width: 100%;
  max-height: 400px;
  object-fit: cover;
}

.view-header {
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--bs-border-color-translucent);
  position: relative;
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
  white-space: pre-wrap;
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
  /* Styles if needed */
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
  background-color: #343a40;
}
</style>
