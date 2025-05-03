import { ref, watch, computed, onMounted } from "vue";

const FAVORITES_KEY = "favoriteMealIds";
const FAVORITES_COCKTAIL_KEY = "favoriteCocktailIds";

// Reactive state for favorite IDs
const favoriteMealIds = ref([]);
const favoriteCocktailIds = ref([]);

// --- Load favorites from LocalStorage on client-side mount ---
const loadFavorites = () => {
  if (!process.client) return; // Only run on client

  const storedMealFavorites = localStorage.getItem(FAVORITES_KEY);
  if (storedMealFavorites) {
    try {
      const parsedIds = JSON.parse(storedMealFavorites);
      if (Array.isArray(parsedIds)) {
        favoriteMealIds.value = parsedIds;
      } else {
        console.warn("Invalid meal data found in LocalStorage for favorites, resetting.");
        localStorage.removeItem(FAVORITES_KEY);
      }
    } catch (error) {
      console.error("Error parsing meal favorites from LocalStorage:", error);
      localStorage.removeItem(FAVORITES_KEY);
    }
  }

  const storedCocktailFavorites = localStorage.getItem(FAVORITES_COCKTAIL_KEY);
  if (storedCocktailFavorites) {
    try {
      const parsedIds = JSON.parse(storedCocktailFavorites);
      if (Array.isArray(parsedIds)) {
        favoriteCocktailIds.value = parsedIds;
      } else {
        console.warn("Invalid cocktail data found in LocalStorage for favorites, resetting.");
        localStorage.removeItem(FAVORITES_COCKTAIL_KEY);
      }
    } catch (error) {
      console.error("Error parsing cocktail favorites from LocalStorage:", error);
      localStorage.removeItem(FAVORITES_COCKTAIL_KEY);
    }
  }
};

// Use onMounted to load favorites only on the client
// onMounted(() => {
//   loadFavorites();
// });

// --- Watch for changes and save to LocalStorage (Client-side only) ---
if (process.client) {
  watch(
    favoriteMealIds,
    (newIds) => {
      // console.log("Saving meal favorites to LocalStorage:", newIds);
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(newIds));
    },
    { deep: true }
  );

  watch(
    favoriteCocktailIds,
    (newIds) => {
      // console.log("Saving cocktail favorites to LocalStorage:", newIds);
      localStorage.setItem(FAVORITES_COCKTAIL_KEY, JSON.stringify(newIds));
    },
    { deep: true }
  );
}

// --- Methods to interact with favorites (using unified toggle approach) ---
const toggleMealFavorite = (mealId) => {
  if (!mealId) return;
  const index = favoriteMealIds.value.indexOf(mealId);
  if (index > -1) {
    favoriteMealIds.value.splice(index, 1);
    // console.log(`Removed meal favorite: ${mealId}`);
  } else {
    favoriteMealIds.value.push(mealId);
    // console.log(`Added meal favorite: ${mealId}`);
  }
};

const toggleCocktailFavorite = (cocktailId) => {
  if (!cocktailId) return;
  const index = favoriteCocktailIds.value.indexOf(cocktailId);
  if (index > -1) {
    favoriteCocktailIds.value.splice(index, 1);
    // console.log(`Removed cocktail favorite: ${cocktailId}`);
  } else {
    favoriteCocktailIds.value.push(cocktailId);
    // console.log(`Added cocktail favorite: ${cocktailId}`);
  }
};

// --- Computed properties to check if an item is a favorite ---
const isFavoriteMeal = (mealId) => {
  return favoriteMealIds.value.includes(mealId);
};
const isFavoriteCocktail = (cocktailId) => {
  return favoriteCocktailIds.value.includes(cocktailId);
};

// --- Export the public API of the composable ---
export function useFavorites() {
  onMounted(() => {
    loadFavorites();
  });
  if (process.client) {
    console.log("[useFavorites] useFavorites() called on client");
  }
  return {
    favoriteMealIds,
    favoriteCocktailIds,
    toggleMealFavorite,
    toggleCocktailFavorite,
    isFavoriteMeal,
    isFavoriteCocktail,
    // Combine isFavorite for potential generic use (if needed later)
    isFavorite: (id, type) => (type === "meal" ? isFavoriteMeal(id) : isFavoriteCocktail(id)),
  };
}
