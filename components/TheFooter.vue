<template>
  <nav class="bottom-nav fixed-bottom border-top">
    <div class="container-fluid d-flex justify-content-around align-items-center h-100">
      <NuxtLink to="/" class="nav-item" active-class="active">
        <!-- <i class="fas fa-home fa-fw"></i> -->
        <i class="pi pi-home" style="font-size: 1.3rem"></i>
        <span class="nav-text d-none d-sm-block">Home</span>
      </NuxtLink>

      <NuxtLink :to="{ path: '/browse' }" class="nav-item" active-class="active">
        <!-- <i class="fas fa-th-large fa-fw"></i> -->
        <i class="pi pi-th-large" style="font-size: 1.3rem"></i>
        <span class="nav-text d-none d-sm-block">Browse All</span>
      </NuxtLink>

      <!-- 'Add' Link - conditionally navigates based on auth status -->
      <NuxtLink @click.prevent="handleAddClick" to="#" class="nav-item" active-class="active">
        <i class="pi pi-plus-circle" style="font-size: 1.3rem"></i>
        <span class="nav-text d-none d-sm-block">Add</span>
      </NuxtLink>

      <NuxtLink :to="{ path: '/offers' }" class="nav-item" active-class="active">
        <!-- <i class="fas fa-tags fa-fw"></i> -->
        <i class="pi pi-tags" style="font-size: 1.3rem"></i>
        <span class="nav-text d-none d-sm-block">Offers</span>
      </NuxtLink>

      <!-- Conditional Profile/Login Link -->
      <NuxtLink :to="user ? '/profile' : '/login'" class="nav-item" active-class="active" :class="{ 'disabled pe-none': authLoading }" :aria-disabled="authLoading" aria-label="User profile or login">
        <span v-if="authLoading">
          <i class="pi pi-spin pi-spinner" style="font-size: 1.3rem"></i>
          <span class="nav-text d-none d-sm-block">Loading...</span>
        </span>
        <span v-else-if="user">
          <i class="pi pi-user" style="font-size: 1.3rem"></i>
          <span class="nav-text d-none d-sm-block">Profile</span>
        </span>
        <span v-else>
          <i class="pi pi-sign-in" style="font-size: 1.3rem"></i>
          <span class="nav-text d-none d-sm-block">Login</span>
        </span>
      </NuxtLink>

      <!-- Move dark mode toggle elsewhere (e.g., header or settings page) -->
      <!-- <button @click="toggleDarkMode" class="btn btn-sm btn-secondary">Toggle Dark Mode</button> -->
    </div>
  </nav>
</template>

<script setup>
// Use Nuxt composables for auth state
const user = useSupabaseUser(); // Auto-imported
const router = useRouter(); // Auto-imported for navigation

// Simple check for auth loading based on user presence initially
// More sophisticated loading state might be needed depending on app complexity
const authLoading = ref(!user.value);

const handleAddClick = () => {
  if (user.value) {
    router.push("/creations/new");
  } else {
    router.push("/login");
  }
};

// Watch user state to update loading
watch(
  user,
  (currentUser) => {
    authLoading.value = false; // Assume loaded once user state is available or null
  },
  { immediate: true }
);
</script>

<style scoped>
/* Styles are in _footer.scss */
.nav-item.disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
</style>
