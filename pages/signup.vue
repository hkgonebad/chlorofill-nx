<template>
  <div class="authLayoutContent">
    <img src="/img/cf-logo-light.png" alt="ChloroFill Logo" class="authLogo mb-4" />
    <h2 class="h3 mb-3 fw-normal text-center">Create your account</h2>

    <form @submit.prevent="handleSignup" class="authForm">
      <div class="form-floating mb-3">
        <input type="text" class="form-control" id="username" v-model="username" placeholder="Choose a username" minlength="3" :disabled="loading" />
        <label for="username">Username <span class="text-muted">(Optional, min 3 chars)</span></label>
      </div>

      <div class="form-floating mb-3">
        <input type="email" class="form-control" id="email" v-model="email" required placeholder="your@email.com" :disabled="loading" />
        <label for="email">Email address</label>
      </div>

      <div class="form-floating mb-3">
        <input type="password" class="form-control" id="password" v-model="password" required placeholder="Password (min 8 chars)" minlength="8" :disabled="loading" />
        <label for="password">Password</label>
        <!-- <div class="form-text">Password must be at least 8 characters.</div> Removed, placeholder sufficient -->
      </div>

      <div class="form-floating mb-3">
        <input type="password" class="form-control" id="confirmPassword" v-model="confirmPassword" required placeholder="Confirm Password" :disabled="loading" />
        <label for="confirmPassword">Confirm Password</label>
      </div>

      <div class="form-floating mb-3">
        <input type="text" class="form-control" id="fullName" v-model="fullName" placeholder="John Doe" :disabled="loading" />
        <label for="fullName">Full Name <span class="text-muted">(Optional)</span></label>
      </div>

      <div v-if="error" class="alert alert-danger mt-3 mb-3 p-2 small">
        {{ error }}
      </div>

      <div v-if="successMessage" class="alert alert-success mt-3 mb-3 p-2 small">
        {{ successMessage }}
      </div>

      <div class="d-grid mb-3 mt-4">
        <button type="submit" class="btn btn-primary btn-lg" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ loading ? "Creating account..." : "Create Account" }}
        </button>
      </div>

      <p class="authLinks text-center">Already have an account? <NuxtLink to="/login" class="fw-medium">Login</NuxtLink></p>
      <p class="authLinks text-center mt-3">
        <NuxtLink to="/" class="text-secondary"> <i class="pi pi-arrow-left me-1"></i> Back to Home </NuxtLink>
      </p>
    </form>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useToast } from "vue-toastification";
import { useSupabaseClient, navigateTo, useHead } from "#imports";

// State variables
const email = ref("");
const password = ref("");
const confirmPassword = ref("");
const fullName = ref("");
const username = ref(""); // Added username ref
const loading = ref(false);
const error = ref(null);
const successMessage = ref(null);

// Get Supabase client
const client = useSupabaseClient();
const toast = useToast();

// Handle signup
const handleSignup = async () => {
  error.value = null;
  successMessage.value = null;

  if (password.value !== confirmPassword.value) {
    error.value = "Passwords do not match.";
    toast.error(error.value);
    return;
  }
  // Optional: Add username validation (e.g., check length if provided)
  if (username.value && username.value.length < 3) {
    error.value = "Username must be at least 3 characters long.";
    toast.error(error.value);
    return;
  }

  loading.value = true;

  try {
    // Sign up with email and password
    const { error: signUpError, data } = await client.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          full_name: fullName.value || undefined,
          username: username.value || undefined, // Pass username
        },
      },
    });

    if (signUpError) throw signUpError;

    // Check if confirmation is needed
    // The `data.user.identities` might be empty if email confirmation is required and not yet done.
    // The `data.session` will be null in that case too.
    const needsConfirmation = !data.session;

    if (needsConfirmation) {
      successMessage.value = "Account created! Please check your email to confirm your registration.";
      toast.info(successMessage.value); // Use info for confirmation required
    } else {
      successMessage.value = "Account created successfully!";
      toast.success(successMessage.value);
    }

    // Clear form regardless of confirmation state
    email.value = "";
    password.value = "";
    confirmPassword.value = "";
    fullName.value = "";
    username.value = "";

    // Optional: redirect after a delay or let user click login link
    // Consider redirecting to login even if confirmation needed?
    // setTimeout(() => navigateTo("/login"), 3000);
  } catch (err) {
    console.error("Signup Error:", err);
    error.value = err.message || "Failed to create account. Please try again.";
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

// Page metadata
definePageMeta({
  layout: "auth", // Uses layouts/auth.vue
  middleware: ["auth-redirect"], // Redirect if already logged in
});

useHead({
  title: "Sign Up | ChloroFill 🍴🍹",
});
</script>

<style scoped>
/* Add minor adjustments if needed, but rely on _auth.scss */
.authLayoutContent {
  /* Potential overrides or additions specific to Nuxt if needed */
}
</style>
