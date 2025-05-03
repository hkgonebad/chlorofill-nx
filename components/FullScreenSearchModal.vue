<template>
  <div class="modal fade search-modal" id="searchModal" tabindex="-1" aria-labelledby="searchModalLabel" aria-hidden="true" ref="modalRef">
    <div class="modal-dialog modal-fullscreen">
      <div class="modal-content">
        <div class="modal-header">
          <button type="button" class="btn-close" @click="closeModal" aria-label="Close"></button>
        </div>
        <div class="modal-body py-3">
          <h5 class="modal-title mb-3 pt-5 text-center" id="searchModalLabel">Search Recipes & Cocktails</h5>

          <div class="searchBody py-3">
            <div class="input-group mb-3">
              <input type="text" class="form-control form-control-lg" placeholder="Search by name (e.g., chicken, margarita)..." v-model="searchQuery" @input="handleInput" ref="searchInputRef" />
              <span class="input-group-text" v-if="isLoading">
                <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
              </span>
            </div>

            <div class="mb-3">
              <p>Filters (coming soon): Type (Meal/Cocktail), Ingredients, etc.</p>
            </div>

            <div class="search-results-container mt-4 w-100">
              <div v-if="isLoading" class="placeholder-glow">
                <ul class="list-group list-group-flush">
                  <li class="list-group-item">
                    <span class="placeholder col-8"></span>
                  </li>
                  <li class="list-group-item">
                    <span class="placeholder col-6"></span>
                  </li>
                  <li class="list-group-item">
                    <span class="placeholder col-7"></span>
                  </li>
                  <li class="list-group-item">
                    <span class="placeholder col-5"></span>
                  </li>
                </ul>
              </div>

              <div v-else-if="searchQuery.length >= MIN_SEARCH_LENGTH && results.length === 0 && !isLoading" class="alert alert-warning">No results found for "{{ searchQuery }}".</div>

              <div v-else-if="searchQuery.length >= MIN_SEARCH_LENGTH && results.length > 0">
                <h6 class="mb-3">Results for "{{ searchQuery }}":</h6>
                <ul class="list-group list-group-flush">
                  <NuxtLink
                    v-for="item in results"
                    :key="item.idMeal || item.idDrink"
                    :to="item.type === 'meal' ? `/recipe/${item.idMeal}` : `/cocktail/${item.idDrink}`"
                    class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    @click="closeModal"
                  >
                    <span>{{ item.strMeal || item.strDrink }}</span>
                    <span :class="['badge rounded-pill ms-2', item.type === 'meal' ? 'text-bg-primary' : 'text-bg-secondary']">
                      {{ item.type }}
                    </span>
                  </NuxtLink>
                </ul>
              </div>
              <div v-else-if="searchQuery.length > 0 && searchQuery.length < MIN_SEARCH_LENGTH">
                <p class="text-muted text-center mt-3">Please enter at least {{ MIN_SEARCH_LENGTH }} characters.</p>
              </div>
              <div v-else class="text-center text-muted mt-3">
                <p>Enter a search term above to find recipes and cocktails.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted, nextTick } from "vue";
import { useMealApi } from "~/composables/useMealApi";
import { useCocktailApi } from "~/composables/useCocktailApi";
import { debounce } from "lodash-es";

const props = defineProps({
  visible: Boolean,
});
const emit = defineEmits(["update:visible"]);

const { searchRecipes: searchMealsByName } = useMealApi();
const { searchCocktails } = useCocktailApi();

const modalRef = ref(null);
const searchInputRef = ref(null);
const searchQuery = ref("");
const isLoading = ref(false);
const results = ref([]);
const MIN_SEARCH_LENGTH = 3;

watch(
  () => props.visible,
  async (newValue) => {
    if (newValue) {
      await nextTick();
      searchInputRef.value?.focus();
    } else {
      searchQuery.value = "";
      results.value = [];
      isLoading.value = false;
    }
  },
  { immediate: false }
);

const closeModal = () => {
  emit("update:visible", false);
};

const search = debounce(async () => {
  if (searchQuery.value.length < MIN_SEARCH_LENGTH) {
    results.value = [];
    isLoading.value = false;
    return;
  }
  isLoading.value = true;
  results.value = [];
  console.log(`Searching for: "${searchQuery.value}"`);

  try {
    const [mealRes, cocktailRes] = await Promise.allSettled([searchMealsByName(searchQuery.value), searchCocktails(searchQuery.value)]);

    let combinedResults = [];
    if (mealRes.status === "fulfilled" && mealRes.value) {
      combinedResults = combinedResults.concat(mealRes.value.map((item) => ({ ...item, type: "meal" })));
    } else if (mealRes.status === "rejected") {
      console.error("Meal search in modal failed:", mealRes.reason);
    }

    if (cocktailRes.status === "fulfilled" && cocktailRes.value) {
      combinedResults = combinedResults.concat(cocktailRes.value.map((item) => ({ ...item, type: "cocktail" })));
    } else if (cocktailRes.status === "rejected") {
      console.error("Cocktail search in modal failed:", cocktailRes.reason);
    }

    combinedResults.sort((a, b) => (a.strMeal || a.strDrink).localeCompare(b.strMeal || b.strDrink));

    results.value = combinedResults;
  } catch (error) {
    console.error("Overall search error in modal:", error);
    results.value = [];
  } finally {
    isLoading.value = false;
  }
}, 400);

const handleInput = () => {
  search();
};
</script>
