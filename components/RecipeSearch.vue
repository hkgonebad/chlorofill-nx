<template>
  <div class="recipe-search-component position-relative">
    <div class="input-group input-group-sm">
      <input
        type="search"
        class="form-control form-control-sm search-input"
        placeholder="Start typing to search..."
        v-model="searchQuery"
        @input="onSearchInput"
        @focus="showSuggestionsList"
        @blur="hideSuggestionsWithDelay"
        aria-label="Search Recipes"
      />
      <span v-if="isLoading" class="input-group-text search-loader-addon">
        <i class="pi pi-spin pi-spinner search-loader"></i>
      </span>
    </div>
    <div v-if="showSuggestions" class="suggestions-dropdown position-absolute list-group shadow-sm">
      <div v-if="isLoading" class="list-group-item text-muted small p-2">Loading...</div>
      <ul v-else-if="suggestions.length > 0" class="list-unstyled mb-0">
        <li
          v-for="suggestion in suggestions"
          :key="suggestion.type + '-' + suggestion.id"
          class="list-group-item list-group-item-action p-2 d-flex justify-content-between align-items-center"
          @mousedown.prevent="selectSuggestion(suggestion)"
        >
          <span>{{ suggestion.name }}</span>
          <span
            class="badge rounded-pill ms-2"
            :class="{
              'bg-primary text-white': suggestion.type === 'meal',
              'bg-secondary text-white': suggestion.type === 'cocktail',
            }"
          >
            {{ suggestion.type === "meal" ? "Recipe" : "Cocktail" }}
          </span>
        </li>
      </ul>
      <div v-else-if="searchQuery.length >= MIN_QUERY_LENGTH" class="list-group-item text-muted small p-2">No results found.</div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
// Remove useRouter, import Nuxt composables
// import { useRouter } from "vue-router";
import { navigateTo } from "#imports";
import { useMealApi } from "~/composables/useMealApi";
import { useCocktailApi } from "~/composables/useCocktailApi";
import { useUserCreations } from "~/composables/useUserCreations";

// Use API composables
const { searchRecipes } = useMealApi();
const { searchCocktails } = useCocktailApi();
const { searchUserCreations } = useUserCreations();

// Search Autocomplete State
const searchQuery = ref("");
const suggestions = ref([]);
const isLoading = ref(false);
const showSuggestions = ref(false);
const debounceTimer = ref(null);
const hideTimer = ref(null); // Timer for delayed hide
const MIN_QUERY_LENGTH = 3;
const DEBOUNCE_DELAY = 400; // ms

// Fetch suggestions from APIs
const fetchSuggestions = async (query) => {
  if (query.length < MIN_QUERY_LENGTH) {
    suggestions.value = [];
    showSuggestions.value = false;
    return;
  }

  isLoading.value = true;
  suggestions.value = []; // Clear previous suggestions
  let apiError = null;

  try {
    // Fetch from all APIs concurrently, wait for all results
    const results = await Promise.allSettled([
      searchRecipes(query), // MealDB search
      searchCocktails(query), // CocktailDB search
      searchUserCreations(query), // User Creations search
    ]);

    const combinedSuggestions = [];

    // Process MealDB results
    if (results[0].status === "fulfilled" && results[0].value) {
      results[0].value.forEach((meal) => {
        combinedSuggestions.push({
          id: meal.idMeal,
          name: meal.strMeal,
          type: "meal",
          thumb: meal.strMealThumb, // Added for consistency if needed later
        });
      });
    } else if (results[0].status === "rejected") {
      console.error("Error fetching meal suggestions:", results[0].reason);
      apiError = "Could not load meal suggestions.";
    }

    // Process CocktailDB results
    if (results[1].status === "fulfilled" && results[1].value) {
      results[1].value.forEach((cocktail) => {
        combinedSuggestions.push({
          id: cocktail.idDrink,
          name: cocktail.strDrink,
          type: "cocktail",
          thumb: cocktail.strDrinkThumb, // Added for consistency if needed later
        });
      });
    } else if (results[1].status === "rejected") {
      console.error("Error fetching cocktail suggestions:", results[1].reason);
      apiError = apiError ? apiError + " & cocktail suggestions." : "Could not load cocktail suggestions.";
    }

    // Process User Creations results
    if (results[2].status === "fulfilled" && results[2].value && results[2].value.data) {
      results[2].value.data.forEach((ugcItem) => {
        // ugcItem is already mapped in the composable with id, name, type, isUgc, thumb
        combinedSuggestions.push({
          id: ugcItem.id,
          name: ugcItem.name,
          type: ugcItem.type, // This will be 'meal' or 'cocktail'
          isUgc: ugcItem.isUgc, // True
          thumb: ugcItem.thumb,
        });
      });
    } else if (results[2].status === "rejected" || (results[2].value && results[2].value.error)) {
      const reason = results[2].status === "rejected" ? results[2].reason : results[2].value && results[2].value.error;
      console.error("Error fetching user creation suggestions:", reason);
      apiError = apiError ? apiError + " & user creation suggestions." : "Could not load user creation suggestions.";
    }

    combinedSuggestions.sort((a, b) => a.name.localeCompare(b.name));
    suggestions.value = combinedSuggestions;
  } catch (error) {
    console.error("Error fetching combined suggestions:", error);
    suggestions.value = [];
    apiError = "An unexpected error occurred during search.";
  } finally {
    isLoading.value = false;
    showSuggestions.value = searchQuery.value.length >= MIN_QUERY_LENGTH && suggestions.value.length > 0;
    // Corrected logic for showing suggestions also when no results found but query is long enough
    if (searchQuery.value.length >= MIN_QUERY_LENGTH && suggestions.value.length === 0 && !isLoading.value) {
      showSuggestions.value = true;
    }
    if (apiError) {
      console.warn("API Errors:", apiError); // Consider displaying this
    }
  }
};

// Debounced input handler
const onSearchInput = () => {
  if (process.client) {
    // Ensure timers only run client-side
    clearTimeout(debounceTimer.value);
    debounceTimer.value = setTimeout(() => {
      fetchSuggestions(searchQuery.value);
    }, DEBOUNCE_DELAY);
  }
};

// Show suggestions list
const showSuggestionsList = () => {
  if (process.client) clearTimeout(hideTimer.value); // Cancel pending hide on focus
  if (suggestions.value.length > 0 || (searchQuery.value.length >= MIN_QUERY_LENGTH && !isLoading.value && suggestions.value.length === 0)) {
    showSuggestions.value = true;
  }
};

// Hide suggestions list with a delay
const hideSuggestionsWithDelay = () => {
  if (process.client) {
    // Ensure timers only run client-side
    clearTimeout(hideTimer.value);
    hideTimer.value = setTimeout(() => {
      showSuggestions.value = false;
    }, 150);
  }
};

// Handle suggestion selection
const selectSuggestion = (suggestion) => {
  searchQuery.value = "";
  suggestions.value = [];
  showSuggestions.value = false;

  // Use navigateTo
  if (suggestion.type === "meal") {
    navigateTo(`/recipe/${suggestion.id}`);
  } else if (suggestion.type === "cocktail") {
    navigateTo(`/cocktail/${suggestion.id}`);
  } else {
    console.warn("Unknown suggestion type selected:", suggestion);
  }
};

// Clear timers when component is unmounted (client-side)
onBeforeUnmount(() => {
  if (process.client) {
    clearTimeout(debounceTimer.value);
    clearTimeout(hideTimer.value);
  }
});
</script>
