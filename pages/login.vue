<template>
  <div>
    <h2 class="text-center mb-4">Login</h2>

    <form @submit.prevent="handleLogin">
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input type="email" class="form-control" id="email" v-model="email" required placeholder="your@email.com" />
      </div>

      <div class="mb-4">
        <label for="password" class="form-label">Password</label>
        <input type="password" class="form-control" id="password" v-model="password" required placeholder="••••••••" />
      </div>

      <div v-if="error" class="alert alert-danger mb-4">
        {{ error }}
      </div>

      <button type="submit" class="btn btn-primary w-100" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Login
      </button>

      <div class="text-center mt-4">
        <p>Don't have an account? <NuxtLink to="/signup">Sign up</NuxtLink></p>
      </div>
    </form>
  </div>
</template>

<script setup>
// State variables
const email = ref("");
const password = ref("");
const loading = ref(false);
const error = ref(null);

// Get Supabase client
const client = useSupabaseClient();

// Handle login
const handleLogin = async () => {
  error.value = null;
  loading.value = true;

  try {
    const { error: signInError } = await client.auth.signInWithPassword({
      email: email.value,
      password: password.value,
    });

    if (signInError) throw signInError;

    // Redirect to home page on success
    navigateTo("/");
  } catch (err) {
    error.value = err.message || "Failed to sign in";
  } finally {
    loading.value = false;
  }
};

// Page metadata
definePageMeta({
  layout: "auth",
});

useHead({
  title: "Login | ChloroFill",
});
</script>
