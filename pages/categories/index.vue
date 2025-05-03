<template>
  <section class="block categories-view py-5">
    <div class="container">
      <div class="view-header mb-4 d-flex align-items-center">
        <BackButton class="me-3" />
        <h1 class="section-title mb-0">ChloroFill Recipe Categories</h1>
      </div>

      <!-- Loading State -->
      <div v-if="loading" class="row row-cols-2 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4 placeholder-glow">
        <SkeletonCard v-for="n in 8" :key="'sk-' + n" />
        <!-- Show ~8 skeletons -->
      </div>
      <!-- Error State -->
      <ErrorMessage v-else-if="error" :message="error" />

      <!-- Categories List -->
      <div v-else-if="categories.length > 0" class="row row-cols-2 row-cols-sm-2 row-cols-md-3 row-cols-lg-4 g-4">
        <ItemCard
          v-for="category in categories"
          :key="category.idCategory"
          :image-url="category.strCategoryThumb"
          :title="category.strCategory"
          :subtitle="category.strCategoryDescription"
          :link-to="{ path: `/category/${category.strCategory}` }"
        >
          <!-- Override default button text using the slot -->
          <template #actions>
            <NuxtLink :to="{ path: `/category/${category.strCategory}` }" class="btn btn-sm btn-outline-primary">View Recipes</NuxtLink>
          </template>
        </ItemCard>
      </div>
      <p v-else class="text-muted">No categories found.</p>
    </div>
  </section>
</template>

<script setup>
import { ref, onMounted } from "vue";
// Import API service using Nuxt alias
import { useMealApi } from "~/composables/useMealApi";
// Import reusable components using Nuxt alias
import ItemCard from "~/components/ItemCard.vue";
import ErrorMessage from "~/components/ErrorMessage.vue";
import SkeletonCard from "~/components/SkeletonCard.vue";
import BackButton from "~/components/BackButton.vue";

// Use the composable
const { getCategories } = useMealApi();

// --- Fetch Categories with useAsyncData ---
const {
  data: categories,
  pending: loading,
  error,
} = useAsyncData(
  "meal-categories",
  () => getCategories(),
  { lazy: true, default: () => [] } // Lazy load and provide default
);

// Set page head
useHead({
  title: "Meal Categories | ChloroFill 🍴🍹",
  meta: [
    {
      name: "description",
      content: "Browse meal recipes by category on ChloroFill. Find inspiration from various culinary categories.",
    },
  ],
});
</script>
