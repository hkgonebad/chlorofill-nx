import { useUserCreations } from "./useUserCreations"; // Adjust path if necessary

// CocktailDB API composable
export function useCocktailApi() {
  // Cache mechanism
  const CACHE_TTL = 3600000; // 1 hour in milliseconds
  const cache = new Map();

  // Base URL for the CocktailDB API
  const baseUrl = "https://www.thecocktaildb.com/api/json/v1/1";

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
      console.error(`[useCocktailApi] fetchWithCache error for URL: ${url}`, error);
      throw error;
    }
  };

  // API methods

  // Get cocktail categories
  const getCategories = async () => {
    const cacheKey = "cocktail_categories";
    const result = await fetchWithCache(`${baseUrl}/list.php?c=list`, cacheKey);
    return result.drinks || [];
  };

  // Get cocktails by category
  const getCocktailsByCategory = async (category) => {
    const cacheKey = `cocktail_category_${category}`;
    const result = await fetchWithCache(`${baseUrl}/filter.php?c=${category}`, cacheKey);
    return result.drinks || [];
  };

  // Get alcoholic filters
  const getAlcoholicFilters = async () => {
    const cacheKey = "alcoholic_filters";
    const result = await fetchWithCache(`${baseUrl}/list.php?a=list`, cacheKey);
    return result.drinks || [];
  };

  // Get cocktails by alcoholic filter
  const getCocktailsByAlcoholicFilter = async (filter) => {
    const cacheKey = `cocktail_alcoholic_${filter}`;
    const result = await fetchWithCache(`${baseUrl}/filter.php?a=${filter}`, cacheKey);
    return result.drinks || [];
  };

  // Get glass types
  const getGlassTypes = async () => {
    const cacheKey = "glass_types";
    const result = await fetchWithCache(`${baseUrl}/list.php?g=list`, cacheKey);
    return result.drinks || [];
  };

  // Get cocktails by glass type
  const getCocktailsByGlassType = async (glassType) => {
    const cacheKey = `cocktail_glass_${glassType}`;
    const result = await fetchWithCache(`${baseUrl}/filter.php?g=${glassType}`, cacheKey);
    return result.drinks || [];
  };

  // Get cocktails by first letter
  const getCocktailsByFirstLetter = async (letter) => {
    const cacheKey = `cocktail_letter_${letter}`;
    const result = await fetchWithCache(`${baseUrl}/search.php?f=${letter}`, cacheKey);
    return result.drinks || [];
  };

  // Get cocktail details by ID
  const getCocktailById = async (id) => {
    if (isUuid(id)) {
      const { data: ugcCocktail, error: fetchError } = await getUserCreationById(id);

      // If there was an actual error fetching from the DB
      if (fetchError) {
        console.error(`[useCocktailApi] Error fetching UGC cocktail for ID: ${id}`, fetchError);
        return null;
      }
      // If no DB error, but the cocktail was not found (ugcCocktail is null)
      if (!ugcCocktail) {
        // This is a valid "not found" scenario, so we don't log an error, just return null.
        return null;
      }

      // If we have ugcCocktail data, map and return it
      // Map UGC fields
      const mappedCocktail = {
        idDrink: ugcCocktail.id,
        id: ugcCocktail.id,
        strDrink: ugcCocktail.title,
        strInstructions: ugcCocktail.steps ? ugcCocktail.steps.join("\n") : ugcCocktail.description,
        strDrinkThumb: ugcCocktail.image_path,
        strCategory: ugcCocktail.type === "cocktail" ? "User Cocktail" : "User Creation",
        strAlcoholic: "N/A",
        strGlass: "N/A",
        strTags: (ugcCocktail.tags || []).join(","),
        isUgc: true,
        ingredients: ugcCocktail.ingredients || [],
        steps: ugcCocktail.steps || [],
        type: ugcCocktail.type,
        description: ugcCocktail.description,
        image_path: ugcCocktail.image_path,
        title: ugcCocktail.title,
        is_public: ugcCocktail.is_public,
      };
      // Map ingredients to strIngredientX/strMeasureX for broader compatibility
      if (ugcCocktail.ingredients && Array.isArray(ugcCocktail.ingredients)) {
        for (let i = 0; i < 15; i++) {
          if (ugcCocktail.ingredients[i]) {
            mappedCocktail[`strIngredient${i + 1}`] = ugcCocktail.ingredients[i].name || "";
            mappedCocktail[`strMeasure${i + 1}`] = `${ugcCocktail.ingredients[i].amount || ""} ${ugcCocktail.ingredients[i].unit || ""}`.trim();
          } else {
            mappedCocktail[`strIngredient${i + 1}`] = null;
            mappedCocktail[`strMeasure${i + 1}`] = null;
          }
        }
      }
      return mappedCocktail;
    }
    // If not UUID, fetch from CocktailDB API
    const cacheKey = `cocktail_${id}`;
    const result = await fetchWithCache(`${baseUrl}/lookup.php?i=${id}`, cacheKey);
    return result.drinks ? { ...result.drinks[0], isUgc: false } : null;
  };

  // Search cocktails
  const searchCocktails = async (query) => {
    // Don't cache search results
    const response = await fetch(`${baseUrl}/search.php?s=${query}`);
    const data = await response.json();
    return data.drinks || [];
  };

  // Get random cocktail
  const getRandomCocktail = async () => {
    // Don't cache random cocktails
    const response = await fetch(`${baseUrl}/random.php`);
    const data = await response.json();
    return data.drinks ? data.drinks[0] : null;
  };

  // Get cocktails by filter type and value (generic method)
  const getCocktailsByFilter = async (filterType, filterValue) => {
    const cacheKey = `cocktail_filter_${filterType}_${filterValue}`;
    const result = await fetchWithCache(`${baseUrl}/filter.php?${filterType}=${filterValue}`, cacheKey);
    return result.drinks || [];
  };

  // Clear cache (useful for testing or manual refresh)
  const clearCache = () => {
    cache.clear();
  };

  // Return the API methods
  return {
    getCategories,
    getCocktailsByCategory,
    getAlcoholicFilters,
    getCocktailsByAlcoholicFilter,
    getGlassTypes,
    getCocktailsByGlassType,
    getCocktailsByFirstLetter,
    getCocktailById,
    searchCocktails,
    getRandomCocktail,
    getCocktailsByFilter,
    clearCache,
  };
}
