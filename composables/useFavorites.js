import { ref, watch, computed, onMounted } from "vue";
import { useSupabaseClient, useSupabaseUser } from "#imports";

const FAVORITES_KEY = "favoriteMealIds";
const FAVORITES_COCKTAIL_KEY = "favoriteCocktailIds";

// Reactive state for favorite IDs
const favoriteMealIds = ref([]);
const favoriteCocktailIds = ref([]);
const favoritesLoaded = ref(false);

// --- Load favorites from LocalStorage on client-side mount ---
const loadFavorites = () => {
  if (typeof window === "undefined") return;
  // ...load from localStorage...
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
  favoritesLoaded.value = true;
};

export function useFavorites() {
  const client = useSupabaseClient();
  const user = useSupabaseUser();

  // --- Supabase DB-backed favorites ---
  const fetchUserFavorites = async () => {
    if (!user.value) return;
    const { data, error } = await client.from("user_favorites").select("item_id, item_type").eq("user_id", user.value.id);
    if (error) {
      console.error("Error fetching user favorites from DB:", error);
      return;
    }
    // Split into meals and cocktails
    favoriteMealIds.value = data.filter((f) => f.item_type === "meal").map((f) => f.item_id);
    favoriteCocktailIds.value = data.filter((f) => f.item_type === "cocktail").map((f) => f.item_id);
    favoritesLoaded.value = true;
  };

  const addUserFavorite = async (itemId, itemType) => {
    if (!user.value) return;
    const { error } = await client.from("user_favorites").upsert({
      user_id: user.value.id,
      item_id: itemId,
      item_type: itemType,
    });
    if (error) {
      console.error("Error adding favorite to DB:", error);
    }
  };

  const removeUserFavorite = async (itemId, itemType) => {
    if (!user.value) return;
    const { error } = await client.from("user_favorites").delete().eq("user_id", user.value.id).eq("item_id", itemId).eq("item_type", itemType);
    if (error) {
      console.error("Error removing favorite from DB:", error);
    }
  };

  onMounted(async () => {
    if (user.value) {
      await fetchUserFavorites();
    } else {
      loadFavorites();
    }
  });

  // Watch for login/logout and sync favorites
  watch(user, async (newUser, oldUser) => {
    if (newUser && !favoritesLoaded.value) {
      await fetchUserFavorites();
    } else if (!newUser) {
      loadFavorites();
    }
  });

  // Watch for changes and save to LocalStorage (Client-side only, if not logged in)
  if (process.client) {
    watch(
      favoriteMealIds,
      (newIds) => {
        if (!user.value) localStorage.setItem("favoriteMealIds", JSON.stringify(newIds));
      },
      { deep: true }
    );
    watch(
      favoriteCocktailIds,
      (newIds) => {
        if (!user.value) localStorage.setItem("favoriteCocktailIds", JSON.stringify(newIds));
      },
      { deep: true }
    );
  }

  // --- Methods to interact with favorites (using unified toggle approach) ---
  const toggleMealFavorite = async (mealId) => {
    if (!mealId) return;
    const index = favoriteMealIds.value.indexOf(mealId);
    if (user.value) {
      if (index > -1) {
        favoriteMealIds.value.splice(index, 1);
        await removeUserFavorite(mealId, "meal");
      } else {
        favoriteMealIds.value.push(mealId);
        await addUserFavorite(mealId, "meal");
      }
    } else {
      if (index > -1) {
        favoriteMealIds.value.splice(index, 1);
      } else {
        favoriteMealIds.value.push(mealId);
      }
    }
  };

  const toggleCocktailFavorite = async (cocktailId) => {
    if (!cocktailId) return;
    const index = favoriteCocktailIds.value.indexOf(cocktailId);
    if (user.value) {
      if (index > -1) {
        favoriteCocktailIds.value.splice(index, 1);
        await removeUserFavorite(cocktailId, "cocktail");
      } else {
        favoriteCocktailIds.value.push(cocktailId);
        await addUserFavorite(cocktailId, "cocktail");
      }
    } else {
      if (index > -1) {
        favoriteCocktailIds.value.splice(index, 1);
      } else {
        favoriteCocktailIds.value.push(cocktailId);
      }
    }
  };

  // --- Remove functions for direct removal ---
  const removeMealFavorite = async (mealId) => {
    const index = favoriteMealIds.value.indexOf(mealId);
    if (index > -1) favoriteMealIds.value.splice(index, 1);
    if (user.value) await removeUserFavorite(mealId, "meal");
  };
  const removeCocktailFavorite = async (cocktailId) => {
    const index = favoriteCocktailIds.value.indexOf(cocktailId);
    if (index > -1) favoriteCocktailIds.value.splice(index, 1);
    if (user.value) await removeUserFavorite(cocktailId, "cocktail");
  };

  // --- Computed properties to check if an item is a favorite ---
  const isFavoriteMeal = (mealId) => {
    return favoriteMealIds.value.includes(mealId);
  };
  const isFavoriteCocktail = (cocktailId) => {
    return favoriteCocktailIds.value.includes(cocktailId);
  };

  return {
    favoriteMealIds,
    favoriteCocktailIds,
    toggleMealFavorite,
    toggleCocktailFavorite,
    isFavoriteMeal,
    isFavoriteCocktail,
    removeMealFavorite,
    removeCocktailFavorite,
    favoritesLoaded,
    fetchUserFavorites,
    addUserFavorite,
    removeUserFavorite,
    // Combine isFavorite for potential generic use (if needed later)
    isFavorite: (id, type) => (type === "meal" ? isFavoriteMeal(id) : isFavoriteCocktail(id)),
  };
}
