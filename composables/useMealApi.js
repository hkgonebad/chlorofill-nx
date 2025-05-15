import { useUserCreations } from "./useUserCreations"; // Adjust path if necessary

// MealDB API composable
export function useMealApi() {
  // Cache mechanism
  const CACHE_TTL = 3600000; // 1 hour in milliseconds
  const cache = new Map();

  // Base URL for the MealDB API
  const baseUrl = "https://www.themealdb.com/api/json/v1/1";

  const { getUserCreationById } = useUserCreations();

  // Helper to check if ID is UUID (UGC)
  const isUuid = (id) => /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(id);

  // Get from cache or fetch new data
  const fetchWithCache = async (url, cacheKey) => {
    // Check if we have cached data and it's still valid
    if (cache.has(cacheKey)) {
      const { data, timestamp } = cache.get(cacheKey);
      if (Date.now() - timestamp < CACHE_TTL) {
        return data;
      }
    }

    // Fetch new data
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }
      const data = await response.json();
      // Cache the result
      cache.set(cacheKey, {
        data,
        timestamp: Date.now(),
      });
      return data;
    } catch (error) {
      console.error(`[useMealApi] fetchWithCache error for URL: ${url}`, error);
      throw error;
    }
  };

  // API methods

  // Get categories
  const getCategories = async () => {
    const cacheKey = "categories";
    const result = await fetchWithCache(`${baseUrl}/categories.php`, cacheKey);
    return result.categories || [];
  };

  // Get recipes by category
  const getRecipesByCategory = async (category) => {
    const cacheKey = `category_${category}`;
    const result = await fetchWithCache(`${baseUrl}/filter.php?c=${category}`, cacheKey);
    return result.meals || [];
  };

  // Get recipe details by ID
  const getRecipeById = async (id) => {
    if (isUuid(id)) {
      const { data: ugcRecipe, error } = await getUserCreationById(id);
      if (error || !ugcRecipe) {
        console.error(`[useMealApi] UGC recipe not found for ID: ${id}`, error);
        return null;
      }
      // Map UGC fields
      const mappedRecipe = {
        idMeal: ugcRecipe.id,
        id: ugcRecipe.id,
        strMeal: ugcRecipe.title,
        strInstructions: ugcRecipe.steps ? ugcRecipe.steps.join("\n") : ugcRecipe.description,
        strMealThumb: ugcRecipe.image_path,
        strCategory: ugcRecipe.type === "recipe" ? "User Recipe" : "User Creation",
        strArea: "N/A",
        strTags: (ugcRecipe.tags || []).join(","),
        isUgc: true,
        ingredients: ugcRecipe.ingredients || [],
        steps: ugcRecipe.steps || [],
        type: ugcRecipe.type,
        description: ugcRecipe.description,
        image_path: ugcRecipe.image_path,
        title: ugcRecipe.title,
        is_public: ugcRecipe.is_public,
      };
      // Map ingredients to strIngredientX/strMeasureX for broader compatibility (e.g. if some generic component expects it)
      // but ensure the primary `ingredients` array is available for UGC-specific handling on detail pages.
      if (ugcRecipe.ingredients && Array.isArray(ugcRecipe.ingredients)) {
        for (let i = 0; i < 20; i++) {
          if (ugcRecipe.ingredients[i]) {
            mappedRecipe[`strIngredient${i + 1}`] = ugcRecipe.ingredients[i].name || "";
            mappedRecipe[`strMeasure${i + 1}`] = `${ugcRecipe.ingredients[i].amount || ""} ${ugcRecipe.ingredients[i].unit || ""}`.trim();
          } else {
            mappedRecipe[`strIngredient${i + 1}`] = null;
            mappedRecipe[`strMeasure${i + 1}`] = null;
          }
        }
      }
      return mappedRecipe;
    }
    // If not UUID, fetch from MealDB API
    const cacheKey = `recipe_${id}`;
    const result = await fetchWithCache(`${baseUrl}/lookup.php?i=${id}`, cacheKey);
    return result.meals ? { ...result.meals[0], isUgc: false } : null;
  };

  // Get areas (cuisines)
  const getAreas = async () => {
    const cacheKey = "areas";
    const result = await fetchWithCache(`${baseUrl}/list.php?a=list`, cacheKey);
    return result.meals || [];
  };

  // Get recipes by area
  const getRecipesByArea = async (area) => {
    const cacheKey = `area_${area}`;
    const result = await fetchWithCache(`${baseUrl}/filter.php?a=${area}`, cacheKey);
    return result.meals || [];
  };

  // Search recipes
  const searchRecipes = async (query) => {
    // Don't cache search results
    const response = await fetch(`${baseUrl}/search.php?s=${query}`);
    const data = await response.json();
    return data.meals || [];
  };

  // Get random recipe
  const getRandomRecipe = async () => {
    // Don't cache random recipes
    const response = await fetch(`${baseUrl}/random.php`);
    const data = await response.json();
    return data.meals ? data.meals[0] : null;
  };

  // Clear cache (useful for testing or manual refresh)
  const clearCache = () => {
    cache.clear();
  };

  /**
   * Fetches meals filtered by area (cuisine).
   * @param {string} areaName The name of the area.
   * @returns {Promise<Array>} A promise that resolves to an array of meal objects.
   */
  const getMealsByArea = async (areaName) => {
    const url = `${baseUrl}/filter.php?a=${encodeURIComponent(areaName)}`;
    try {
      const data = await fetch(url);
      const result = await data.json();
      return result.meals || []; // Return empty array if no meals
    } catch (error) {
      console.error(`[useMealApi] getMealsByArea error for area: ${areaName}`, error);
      throw new Error("Failed to fetch meals by area");
    }
  };

  // Return the API methods
  return {
    getCategories,
    getRecipesByCategory,
    getRecipeById,
    getAreas,
    getRecipesByArea,
    searchRecipes,
    getRandomRecipe,
    getRandomMeal: getRandomRecipe, // Alias for compatibility
    clearCache,
    getMealsByArea,
  };
}
