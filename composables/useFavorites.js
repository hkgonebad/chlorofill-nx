import { ref, watch, computed, onMounted } from "vue";
import { useSupabaseClient, useSupabaseUser } from "#imports";

const FAVORITES_KEY = "favoriteMealIds";
const FAVORITES_COCKTAIL_KEY = "favoriteCocktailIds";

// Reactive state for favorite IDs
const favoriteMealIds = ref([]);
const favoriteCocktailIds = ref([]);
const favoritesLoaded = ref(false);
// Per-item loading state for toggling favorites
const togglingFavorites = ref({}); // { 'meal-123': true, 'cocktail-456': false }

// --- Load favorites from LocalStorage on client-side mount ---
const loadFavorites = () => {
  if (typeof window === "undefined") return;
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
  } else {
    favoriteMealIds.value = [];
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
  } else {
    favoriteCocktailIds.value = [];
  }
  favoritesLoaded.value = true;
};

// --- Merge localStorage favorites into DB on login ---
const mergeLocalFavoritesToDB = async (client, user) => {
  if (!user || typeof window === "undefined") return;
  const localMeals = JSON.parse(localStorage.getItem(FAVORITES_KEY) || "[]");
  const localCocktails = JSON.parse(localStorage.getItem(FAVORITES_COCKTAIL_KEY) || "[]");
  const upserts = [];
  localMeals.forEach((id) => {
    upserts.push({ user_id: user.id, item_id: id, item_type: "meal" });
  });
  localCocktails.forEach((id) => {
    upserts.push({ user_id: user.id, item_id: id, item_type: "cocktail" });
  });
  if (upserts.length > 0) {
    const { error } = await client.from("user_favorites").upsert(upserts, { onConflict: ["user_id", "item_id", "item_type"] });
    if (error) {
      console.error("Error merging local favorites to DB:", error);
    } else {
      // Clear localStorage after merging
      localStorage.removeItem(FAVORITES_KEY);
      localStorage.removeItem(FAVORITES_COCKTAIL_KEY);
    }
  }
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
      await mergeLocalFavoritesToDB(client, user.value);
      await fetchUserFavorites();
    } else {
      loadFavorites();
    }
  });

  // Watch for login/logout and sync/merge favorites
  watch(user, async (newUser, oldUser) => {
    if (newUser && !favoritesLoaded.value) {
      await mergeLocalFavoritesToDB(client, newUser);
      await fetchUserFavorites();
    } else if (!newUser) {
      // On logout, clear in-memory and reload from localStorage
      favoriteMealIds.value = [];
      favoriteCocktailIds.value = [];
      favoritesLoaded.value = false;
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
    const key = `meal-${mealId}`;
    if (togglingFavorites.value[key]) return; // Prevent race
    togglingFavorites.value[key] = true;
    try {
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
    } catch (e) {
      console.error("Error toggling meal favorite:", e);
    } finally {
      togglingFavorites.value[key] = false;
    }
  };

  const toggleCocktailFavorite = async (cocktailId) => {
    if (!cocktailId) return;
    const key = `cocktail-${cocktailId}`;
    if (togglingFavorites.value[key]) return; // Prevent race
    togglingFavorites.value[key] = true;
    try {
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
    } catch (e) {
      console.error("Error toggling cocktail favorite:", e);
    } finally {
      togglingFavorites.value[key] = false;
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

  // --- SSR/hydration safety: expose favoritesLoaded and togglingFavorites ---
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
    togglingFavorites,
    isFavorite: (id, type) => (type === "meal" ? isFavoriteMeal(id) : isFavoriteCocktail(id)),
  };
}
