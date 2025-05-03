import { ref, computed, watch } from "vue";

// Unique key for cocktail favorites in localStorage
const LOCAL_STORAGE_KEY = "cocktail_favorites";

// Reactive reference to hold favorite cocktail IDs
const favoriteCocktailIds = ref([]);

// Load favorites from localStorage on initialization
const loadFavorites = () => {
	const storedFavorites = localStorage.getItem(LOCAL_STORAGE_KEY);
	if (storedFavorites) {
		try {
			favoriteCocktailIds.value = JSON.parse(storedFavorites);
		} catch (e) {
			console.error(
				"Error parsing cocktail favorites from localStorage:",
				e
			);
			favoriteCocktailIds.value = []; // Reset if parsing fails
			localStorage.removeItem(LOCAL_STORAGE_KEY); // Clear invalid data
		}
	} else {
		favoriteCocktailIds.value = [];
	}
};

// Save favorites to localStorage whenever the list changes
watch(
	favoriteCocktailIds,
	(newIds) => {
		localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(newIds));
	},
	{ deep: true }
); // Use deep watch as it's an array

// Initial load
loadFavorites();

// Composable function
export function useCocktailFavorites() {
	const addFavorite = (cocktailId) => {
		if (!cocktailId || favoriteCocktailIds.value.includes(cocktailId))
			return;
		favoriteCocktailIds.value.push(cocktailId);
		// console.log(
		// 	`Cocktail favorite added: ${cocktailId}`,
		// 	favoriteCocktailIds.value
		// );
	};

	const removeFavorite = (cocktailId) => {
		favoriteCocktailIds.value = favoriteCocktailIds.value.filter(
			(id) => id !== cocktailId
		);
		// console.log(
		// 	`Cocktail favorite removed: ${cocktailId}`,
		// 	favoriteCocktailIds.value
		// );
	};

	// Returns a computed ref that is true if the ID is favorited
	const isFavorite = (cocktailId) => {
		return favoriteCocktailIds.value.includes(cocktailId);
	};

	return {
		favoriteCocktailIds, // Read-only access to the list (via .value)
		addFavorite,
		removeFavorite,
		isFavorite,
	};
}
