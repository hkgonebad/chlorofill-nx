<template>
  <div class="category-carousel-wrapper">
    <!-- Loading State with Placeholders -->
    <div v-if="pending" class="d-flex overflow-hidden placeholder-glow">
      <div v-for="n in 8" :key="'sk-cat-' + n" class="text-center me-3 category-item-placeholder">
        <span class="placeholder category-image-placeholder"></span>
        <span class="placeholder category-name-placeholder"></span>
      </div>
    </div>
    <!-- Error State -->
    <ErrorMessage v-else-if="error" :message="error?.message || 'Failed to load categories'" />
    <!-- Swiper Content -->
    <swiper
      v-else-if="categories && categories.length > 0"
      :slides-per-view="6"
      :space-between="15"
      :free-mode="true"
      :modules="modules"
      class="category-swiper"
      :breakpoints="{
        375: { slidesPerView: 3.5 },
        576: { slidesPerView: 4.5 },
        768: { slidesPerView: 5.5 },
        992: { slidesPerView: 7.5 },
      }"
    >
      <swiper-slide v-for="category in categories" :key="category.idCategory">
        <NuxtLink :to="`/category/${category.strCategory}`" class="category-item text-center text-decoration-none">
          <img :src="category.strCategoryThumb" :alt="category.strCategory" class="category-image img-fluid mb-2" />
          <span class="category-name d-block small fw-medium">{{ category.strCategory }}</span>
        </NuxtLink>
      </swiper-slide>
    </swiper>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
// Remove RouterLink import
// import { RouterLink } from "vue-router";
// Use Nuxt composables
import { useMealApi } from "~/composables/useMealApi";
import { useAsyncData } from "#imports";

// Import Swiper Vue.js components
import { Swiper, SwiperSlide } from "swiper/vue";
// Import Swiper styles
import "swiper/css";
import "swiper/css/free-mode";
// import required modules
import { FreeMode } from "swiper/modules";

// Import reusable components
import ErrorMessage from "./ErrorMessage.vue";

const modules = [FreeMode];

// Use the composable
const { getCategories } = useMealApi();

// --- Fetch Categories with useAsyncData ---
const { data: categories, pending, error } = useAsyncData("carousel-meal-categories", () => getCategories(), { lazy: true, default: () => [] });

// Remove old state and fetch logic
// const categories = ref([]);
// const loading = ref(false);
// const error = ref(null);
// const fetchCategories = async () => { ... };
// onMounted(() => { fetchCategories(); });
</script>

<style scoped>
.category-item-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 70px;
}
.category-image-placeholder {
  display: inline-block;
  width: 60px;
  height: 60px;
  background-color: var(--bs-secondary-bg);
  border-radius: 50%;
  margin-bottom: 0.5rem;
}
.category-name-placeholder {
  display: inline-block;
  height: 0.75rem;
  width: 50px;
}

.category-item {
  display: block;
  color: var(--bs-body-color);
}
</style>
