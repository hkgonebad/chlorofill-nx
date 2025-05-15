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
                    :to="item.type === 'meal' ? `/recipe/${item.idMeal || item.id}` : `/cocktail/${item.idDrink || item.id}`"
                    class="list-group-item list-group-item-action d-flex justify-content-between align-items-center"
                    @click="closeModal"
                  >
                    <span>{{ item.strMeal || item.strDrink || item.name }}</span>
                    <span :class="['badge rounded-pill ms-2', item.type === 'meal' ? 'text-bg-primary' : 'text-bg-secondary']">
                      {{ item.type === "meal" ? "Recipe" : "Cocktail" }}
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
import { ref, watch, onMounted, nextTick, onBeforeUnmount } from "vue";
import { useMealApi } from "~/composables/useMealApi";
import { useCocktailApi } from "~/composables/useCocktailApi";
import { useUserCreations } from "~/composables/useUserCreations";
import { debounce } from "lodash-es";

const props = defineProps({
  visible: Boolean,
});
const emit = defineEmits(["update:visible"]);

const { searchRecipes: searchMealsByName } = useMealApi();
const { searchCocktails } = useCocktailApi();
const { searchUserCreations } = useUserCreations();

const modalRef = ref(null);
const searchInputRef = ref(null);
const bsModal = ref(null);
const searchQuery = ref("");
const isLoading = ref(false);
const results = ref([]);
const MIN_SEARCH_LENGTH = 3;

watch(
  () => props.visible,
  async (newValue) => {
    if (process.client) {
      if (!bsModal.value) {
        console.warn("Bootstrap modal instance not ready yet in watch effect.");
        return;
      }
      if (newValue) {
        bsModal.value?.show();
        await nextTick();
        searchInputRef.value?.focus();
      } else {
        bsModal.value?.hide();
      }
      if (!newValue) {
        searchQuery.value = "";
        results.value = [];
        isLoading.value = false;
      }
    }
  },
  { immediate: false }
);

onMounted(async () => {
  if (process.client && modalRef.value) {
    try {
      const { Modal } = await import("bootstrap");

      bsModal.value = new Modal(modalRef.value);

      modalRef.value.addEventListener("hidden.bs.modal", () => {
        if (modalRef.value) {
          emit("update:visible", false);
        }
      });

      if (props.visible) {
        bsModal.value?.show();
        await nextTick();
        searchInputRef.value?.focus();
      }
    } catch (e) {
      console.error("Failed to dynamically import or initialize Bootstrap modal:", e);
    }
  }
});

onBeforeUnmount(() => {
  if (process.client) {
    bsModal.value?.dispose();
  }
});

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
    const [mealRes, cocktailRes, ugcRes] = await Promise.allSettled([searchMealsByName(searchQuery.value), searchCocktails(searchQuery.value), searchUserCreations(searchQuery.value)]);

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

    if (ugcRes.status === "fulfilled" && ugcRes.value && ugcRes.value.data) {
      combinedResults = combinedResults.concat(
        ugcRes.value.data.map((ugcItem) => ({
          ...ugcItem,
          idMeal: ugcItem.type === "meal" ? ugcItem.id : null,
          idDrink: ugcItem.type === "cocktail" ? ugcItem.id : null,
          strMeal: ugcItem.type === "meal" ? ugcItem.name : null,
          strDrink: ugcItem.type === "cocktail" ? ugcItem.name : null,
        }))
      );
    } else if (ugcRes.status === "rejected" || (ugcRes.value && ugcRes.value.error)) {
      const reason = ugcRes.status === "rejected" ? ugcRes.reason : ugcRes.value && ugcRes.value.error;
      console.error("User Creations search in modal failed:", reason);
    }

    combinedResults.sort((a, b) => (a.strMeal || a.strDrink || a.name).localeCompare(b.strMeal || b.strDrink || b.name));

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
