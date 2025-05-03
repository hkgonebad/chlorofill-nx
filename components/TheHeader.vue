<template>
  <header class="sticky-top">
    <div class="topHeader">
      <div class="container">
        <nav class="navbar navbar-light">
          <button class="navbar-toggler btn-outline-secondary rounded-circle me-2" type="button" data-bs-toggle="offcanvas" data-bs-target="#offcanvasNavbar" aria-controls="offcanvasNavbar" aria-label="Toggle navigation menu">
            <i class="pi pi-bars"></i>
          </button>
          <div class="offcanvas offcanvas-start" tabindex="-1" id="offcanvasNavbar" aria-labelledby="offcanvasNavbarLabel" ref="offcanvasRef">
            <div class="offcanvas-header">
              <h5 class="offcanvas-title" id="offcanvasNavbarLabel">ChloroFill Menu</h5>
              <button type="button" class="btn-close text-reset" data-bs-dismiss="offcanvas" aria-label="Close" ref="closeButtonRef"></button>
            </div>
            <div class="offcanvas-body">
              <ul class="navbar-nav flex-grow-1">
                <li class="nav-item">
                  <NuxtLink class="nav-link" active-class="active" to="/" @click="closeOffcanvas">
                    <i class="pi pi-home"></i>
                    Home</NuxtLink
                  >
                </li>
                <li class="nav-item">
                  <NuxtLink class="nav-link" active-class="active" to="/about" @click="closeOffcanvas">
                    <i class="pi pi-info-circle"></i>
                    About Us</NuxtLink
                  >
                </li>

                <!-- Recipes Section -->
                <li class="nav-item">
                  <span class="nav-link disabled text-uppercase fw-bold pe-none">
                    <i class="pi pi-list"></i>
                    Recipes</span
                  >
                </li>
                <li class="nav-item">
                  <NuxtLink class="nav-link ps-4" to="/categories" @click="closeOffcanvas">
                    <i class="pi pi-angle-right"></i>
                    All Categories</NuxtLink
                  >
                </li>
                <li class="nav-item">
                  <NuxtLink class="nav-link ps-4" :to="{ path: '/areas' }" @click="closeOffcanvas">
                    <i class="pi pi-angle-right"></i>
                    Browse by Area</NuxtLink
                  >
                </li>
                <li class="nav-item">
                  <a @click.prevent="goToRandomRecipe" class="nav-link ps-4" :class="{ disabled: loadingRandom }" style="cursor: pointer" data-bs-dismiss="offcanvas">
                    <span v-if="loadingRandom" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    <i class="pi pi-angle-right"></i>
                    Random Recipe
                  </a>
                </li>

                <!-- Cocktails Section -->
                <li class="nav-item">
                  <span class="nav-link disabled text-uppercase fw-bold pe-none">
                    <i class="pi pi-filter"></i>
                    Cocktails</span
                  >
                </li>
                <li class="nav-item">
                  <NuxtLink class="nav-link ps-4" :to="{ path: '/cocktails' }" @click="closeOffcanvas">
                    <i class="pi pi-angle-right"></i>
                    Browse Filters</NuxtLink
                  >
                </li>
                <li class="nav-item">
                  <a @click.prevent="goToRandomCocktail" class="nav-link ps-4" :class="{ disabled: loadingRandomCocktail }" style="cursor: pointer" data-bs-dismiss="offcanvas">
                    <span v-if="loadingRandomCocktail" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    <i class="pi pi-angle-right"></i>
                    Random Cocktail
                  </a>
                </li>

                <li class="nav-item">
                  <NuxtLink class="nav-link" active-class="active" to="/offers" @click="closeOffcanvas">
                    <i class="pi pi-tag"></i>
                    Offers</NuxtLink
                  >
                </li>

                <li class="nav-item mt-3 pt-3 border-top">
                  <NuxtLink class="nav-link" to="/favorites" @click="closeOffcanvas">
                    <i class="pi pi-heart"></i>
                    My Favorites</NuxtLink
                  >
                </li>

                <!-- Auth Links (Conditional) -->
                <li v-if="!user && !authLoading" class="nav-item mt-3 pt-3 border-top">
                  <NuxtLink class="nav-link" to="/login" @click="closeOffcanvas">
                    <i class="pi pi-sign-in"></i>
                    Login</NuxtLink
                  >
                </li>
                <li v-if="!user && !authLoading" class="nav-item">
                  <NuxtLink class="nav-link" to="/signup" @click="closeOffcanvas">
                    <i class="pi pi-user-plus"></i>
                    Sign Up</NuxtLink
                  >
                </li>

                <!-- User Info & Logout (Conditional) -->
                <li v-if="user" class="nav-item mt-3 pt-3 border-top">
                  <NuxtLink class="nav-link" to="/profile" @click="closeOffcanvas">
                    <i class="pi pi-user"></i>
                    Profile ({{ profile?.username || user.email }})
                  </NuxtLink>
                </li>
                <li v-if="user" class="nav-item">
                  <a href="#" @click.prevent="handleLogout" class="nav-link text-danger" :class="{ disabled: logoutLoading }" data-bs-dismiss="offcanvas">
                    <span v-if="logoutLoading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                    <i class="pi pi-sign-out"></i>
                    Logout</a
                  >
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <!-- Update logo path and alt text later -->
        <NuxtLink to="/" class="logo">
          <img :src="isDarkMode ? cfLogoDark : cfLogoAlt" alt="ChloroFill Logo" aria-label="Toggle theme" />
        </NuxtLink>
        <div class="extras d-flex align-items-center">
          <!-- Dark Mode Toggle Button -->
          <button @click="toggleTheme" class="btn btn-sm btn-outline-secondary me-2 theme-toggle-btn rounded-circle" :aria-label="isDarkMode ? 'Activate light mode' : 'Activate dark mode'" title="Toggle light & dark theme">
            <!-- Animated SVG Toggle (replace static icons) -->
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="theme-icon">
              <mask id="moon-mask">
                <rect x="0" y="0" width="100%" height="100%" fill="white" />
                <circle cx="12" cy="4" r="9" fill="black" />
              </mask>
              <circle cx="12" cy="12" r="9" mask="url(#moon-mask)" fill="currentColor" />
              <g stroke="currentColor">
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </g>
            </svg>
          </button>

          <!-- Search Trigger Button (conditionally hidden) -->
          <button v-if="!isHomePage" @click="triggerSearchModal" class="btn btn-sm btn-outline-secondary rounded-circle" aria-label="Open search">
            <i class="pi pi-search"></i>
          </button>

          <!-- User Profile Link/Icon -->
          <NuxtLink v-if="user" to="/profile" class="btn btn-sm btn-outline-secondary rounded-circle ms-2" aria-label="View profile">
            <i class="pi pi-user"></i>
          </NuxtLink>
          <NuxtLink v-else-if="!authLoading" to="/login" class="btn btn-sm btn-outline-secondary rounded-circle ms-2">
            <i class="pi pi-sign-in"></i>
          </NuxtLink>
          <div v-else class="ms-2">
            <span class="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
          </div>
        </div>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, inject } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useMealApi } from "~/composables/useMealApi";
import { useCocktailApi } from "~/composables/useCocktailApi";
import { useTheme } from "~/composables/useTheme";

import cfLogoAlt from "/img/cf-logo-alt.png";
import cfLogoDark from "/img/cf-logo-dark.png";

const route = useRoute();
const toast = useToast();

const toggleSearchModal = inject("toggleSearchModal");

const { currentTheme, toggleTheme } = useTheme();
const isDarkMode = computed(() => currentTheme.value === "dark");

const { getRandomRecipe: fetchRandomRecipe } = useMealApi();
const { getRandomCocktail: fetchRandomCocktail } = useCocktailApi();

const loadingRandom = ref(false);
const loadingRandomCocktail = ref(false);

const offcanvasRef = ref(null);
const closeButtonRef = ref(null);

const closeOffcanvas = () => {
  if (closeButtonRef.value) {
    closeButtonRef.value.click();
  }
};

const goToRandomRecipe = async () => {
  loadingRandom.value = true;
  try {
    const recipe = await fetchRandomRecipe();
    if (recipe && recipe.idMeal) {
      navigateTo(`/recipe/${recipe.idMeal}`);
    } else {
      toast.error("Could not fetch a random recipe.");
    }
  } catch (error) {
    console.error("Error fetching random recipe:", error);
    toast.error("Error fetching random recipe.");
  } finally {
    loadingRandom.value = false;
  }
};

const goToRandomCocktail = async () => {
  loadingRandomCocktail.value = true;
  try {
    const cocktail = await fetchRandomCocktail();
    if (cocktail && cocktail.idDrink) {
      navigateTo(`/cocktail/${cocktail.idDrink}`);
    } else {
      toast.error("Could not fetch a random cocktail.");
    }
  } catch (error) {
    console.error("Error fetching random cocktail:", error);
    toast.error("Error fetching random cocktail.");
  } finally {
    loadingRandomCocktail.value = false;
  }
};

const triggerSearchModal = () => {
  if (toggleSearchModal) {
    toggleSearchModal();
  } else {
    console.error("toggleSearchModal function not provided");
  }
};

const isHomePage = computed(() => route.path === "/");

const user = useSupabaseUser();
const client = useSupabaseClient();
const authLoading = ref(true);
const logoutLoading = ref(false);
const profile = ref(null);

const fetchProfile = async () => {
  if (!user.value) return;
  authLoading.value = true;
  try {
    const { data, error } = await client.from("profiles").select("username, full_name, avatar_url").eq("id", user.value.id).single();

    if (error) throw error;
    profile.value = data;
  } catch (err) {
    console.error("Error fetching profile:", err.message);
    toast.error("Could not load profile information.");
  } finally {
    authLoading.value = false;
  }
};

const handleLogout = async () => {
  logoutLoading.value = true;
  try {
    const { error } = await client.auth.signOut();
    if (error) throw error;
    profile.value = null;
    toast.success("Successfully logged out!");
    navigateTo("/");
  } catch (error) {
    console.error("Error logging out:", error.message);
    toast.error("Logout failed. Please try again.");
  } finally {
    logoutLoading.value = false;
    if (closeButtonRef.value) {
      closeButtonRef.value.click();
    }
  }
};

watch(
  user,
  (newUser) => {
    if (newUser) {
      fetchProfile();
    } else {
      profile.value = null;
      authLoading.value = false;
    }
  },
  { immediate: true }
);

onMounted(() => {
  // Any specific on-mount logic for the header can go here
  // e.g., initializing Bootstrap components if needed via JS
  // Note: Bootstrap JS is loaded via plugin, so components should auto-init
});
</script>

<style lang="scss" scoped></style>
