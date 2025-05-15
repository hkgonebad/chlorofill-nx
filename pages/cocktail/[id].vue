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
        <p class="small external-product-links" v-if="cocktail.strGlass && cocktail.strGlass !== 'N/A'">
          <a v-if="cocktail.strGlass && cocktail.strGlass !== 'N/A'" :href="getAmazonSearchUrl(cocktail.strGlass + ' glass')" target="_blank" rel="noopener noreferrer nofollow" class="me-2 external-product-link">
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
            <img :src="ingredient.imageUrl" :alt="ingredient.name" class="ingredient-thumbnail me-2" loading="lazy" @error="($event) => ($event.target.style.display = 'none')" />
            <div class="flex-grow-1">
              <!-- Affiliate link for ingredient - Use getAmazonSearchUrl -->
              <a :href="getAmazonSearchUrl(ingredient.name)" target="_blank" rel="noopener noreferrer nofollow" class="external-product-link">{{ ingredient.name }}</a>
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

// Helper: check if ID is UUID (UGC)
const isUuid = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

const {
  data: cocktail,
  pending,
  error,
} = await useAsyncData(
  `cocktail-${cocktailId.value}`,
  () => {
    if (!cocktailId.value) return null;
    // getCocktailById should be able to fetch both API and UGC cocktails
    return getCocktailById(cocktailId.value);
  },
  {
    watch: [cocktailId],
  }
);

// --- Composables and State ---
const { isFavoriteCocktail, toggleCocktailFavorite } = useFavorites();
const openShareModalFunc = inject("openShareModal");

const isCurrentFavorite = computed(() => {
  // For UGC, ID might be in `cocktail.value.id` instead of `idDrink`
  const idToCheck = isUuid(cocktailId.value) ? cocktailId.value : cocktail.value?.idDrink;
  return idToCheck ? isFavoriteCocktail(idToCheck) : false;
});

const ingredientsList = computed(() => {
  if (!cocktail.value) return [];
  const list = [];
  const isUgcCocktail = isUuid(cocktailId.value);

  if (isUgcCocktail && cocktail.value.ingredients && Array.isArray(cocktail.value.ingredients)) {
    cocktail.value.ingredients.forEach((ing) => {
      list.push({
        name: ing.name,
        measure: `${ing.amount || ""} ${ing.unit || ""}`.trim(),
        imageUrl: ing.image_url || `https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(ing.name.trim().replace(/ /g, "_"))}-Small.png`,
      });
    });
  } else if (!isUgcCocktail) {
    for (let i = 1; i <= 15; i++) {
      const ingredientName = cocktail.value[`strIngredient${i}`];
      const measure = cocktail.value[`strMeasure${i}`];
      if (ingredientName && ingredientName.trim() !== "") {
        list.push({
          name: ingredientName.trim(),
          measure: measure ? measure.trim() : "",
          imageUrl: `https://www.thecocktaildb.com/images/ingredients/${encodeURIComponent(ingredientName.trim().replace(/ /g, "_"))}-Small.png`,
        });
      }
    }
  }
  return list;
});

const handleToggleFavorite = ({ id, type }) => {
  // For UGC, the ID might be different from idDrink/idMeal
  const currentId = isUuid(cocktailId.value) ? cocktailId.value : cocktail.value?.idDrink;
  if (currentId && id === currentId) {
    toggleCocktailFavorite(id); // toggleCocktailFavorite should handle UUIDs if it supports UGC favorites
  }
};

const openShareModal = () => {
  if (openShareModalFunc && cocktail.value) {
    const titleToShare = isUuid(cocktailId.value) ? cocktail.value.title : cocktail.value.strDrink;
    openShareModalFunc({
      title: titleToShare,
      url: window.location.href,
      text: `Check out this cocktail: ${titleToShare}`,
      type: "cocktail",
    });
  } else {
    console.error("Share modal function not provided or cocktail details missing.");
  }
};

// --- Head Management (Dynamic Meta Tags) ---
useHead(() => {
  if (!cocktail.value) {
    return { title: "Loading Cocktail... | ChloroFill 🍴🍹" };
  }
  const title = isUuid(cocktailId.value) ? cocktail.value.title : cocktail.value.strDrink;
  const descriptionContent = (isUuid(cocktailId.value) ? cocktail.value.description : cocktail.value.strInstructions) || `Learn how to make a ${title}.`;
  const metaDescription = descriptionContent.substring(0, 160) + (descriptionContent.length > 160 ? "..." : "");
  const image = (isUuid(cocktailId.value) ? cocktail.value.image_path : cocktail.value.strDrinkThumb) || "https://chlorofill.vercel.app/img/og-default.jpg";
  const pageUrl = typeof window !== "undefined" ? window.location.href : `https://chlorofill.vercel.app/cocktail/${cocktailId.value}`;

  return {
    title: `${title} | ChloroFill 🍴🍹`,
    meta: [
      { key: "description", name: "description", content: metaDescription },
      { key: "og:title", property: "og:title", content: title },
      { key: "og:description", property: "og:description", content: metaDescription },
      { key: "og:image", property: "og:image", content: image },
      { key: "og:url", property: "og:url", content: pageUrl },
      { key: "og:type", property: "og:type", content: "article" },
      { key: "twitter:card", name: "twitter:card", content: "summary_large_image" },
      { key: "twitter:title", name: "twitter:title", content: title },
      { key: "twitter:description", name: "twitter:description", content: metaDescription },
      { key: "twitter:image", name: "twitter:image", content: image },
    ],
    link: [{ rel: "canonical", href: pageUrl }],
  };
});

// --- UGC Field Mapping ---
const displayTitle = computed(() => {
  if (!cocktail.value) return "";
  return isUuid(cocktailId.value) ? cocktail.value.title : cocktail.value.strDrink;
});
const displayDescription = computed(() => {
  if (!cocktail.value) return "";
  return isUuid(cocktailId.value) ? cocktail.value.description : cocktail.value.strInstructions;
});
const displayTags = computed(() => {
  if (!cocktail.value) return [];
  if (isUuid(cocktailId.value) && cocktail.value.tags && Array.isArray(cocktail.value.tags)) {
    return cocktail.value.tags;
  }
  if (!isUuid(cocktailId.value) && cocktail.value.strTags) {
    return cocktail.value.strTags.split(",").map((t) => t.trim());
  }
  return [];
});

const getCocktailImageUrl = computed(() => {
  if (!cocktail.value) return "/img/no-recipe.jpg";
  if (isUuid(cocktailId.value)) {
    return cocktail.value.image_path || cocktail.value.strDrinkThumb || "/img/no-recipe.jpg";
  }
  return cocktail.value.strDrinkThumb ? cocktail.value.strDrinkThumb + "/large" : "/img/no-recipe.jpg";
});
const displayImage = getCocktailImageUrl;
</script>

<style scoped lang="scss">
/* SCOPED STYLES HAVE BEEN MOVED TO assets/scss/layout/_recipe-detail.scss */
</style>
