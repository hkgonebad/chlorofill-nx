<template>
  <div class="authLayoutContent">
    <img src="/img/cf-logo-light.png" alt="ChloroFill Logo" class="authLogo mb-4" />
    <h2 class="h3 mb-3 fw-normal text-center">Please sign in</h2>

    <!-- Email/Password Form -->
    <form @submit.prevent="handleLogin" class="authForm">
      <div class="form-floating mb-3">
        <input type="text" class="form-control" id="identifier" v-model="identifier" required placeholder="Email or Username" :disabled="loading" />
        <label for="identifier">Email or Username</label>
      </div>

      <div class="form-floating mb-3">
        <input type="password" class="form-control" id="password" v-model="password" required placeholder="Password" :disabled="loading" />
        <label for="password">Password</label>
      </div>

      <div v-if="error && !loadingMagicLink" class="alert alert-danger mt-3 mb-3 p-2 small">
        {{ error }}
      </div>

      <div class="d-grid mb-3 mt-4">
        <button type="submit" class="btn btn-primary btn-lg" :disabled="loading">
          <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ loading ? "Signing in..." : "Sign in" }}
        </button>
      </div>
    </form>

    <!-- Separator -->
    <div class="my-3 text-center text-muted">
      <span class="small">OR</span>
    </div>

    <!-- Magic Link Form -->
    <form @submit.prevent="handleMagicLinkLogin" class="authForm mb-3">
      <div class="form-floating mb-3">
        <input type="email" class="form-control" id="magicLinkEmail" v-model="magicLinkEmail" required placeholder="your@email.com" :disabled="loadingMagicLink || loading" />
        <label for="magicLinkEmail">Email for Magic Link</label>
      </div>

      <div v-if="error && loadingMagicLink" class="alert alert-danger mt-3 mb-3 p-2 small">
        {{ error }}
      </div>

      <div class="d-grid">
        <button type="submit" class="btn btn-secondary btn-lg" :disabled="loadingMagicLink || loading">
          <span v-if="loadingMagicLink" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
          {{ loadingMagicLink ? "Sending..." : "Email me a Magic Link" }}
        </button>
      </div>
    </form>

    <p class="authLinks text-center">Don't have an account? <NuxtLink to="/signup" class="fw-medium">Sign up</NuxtLink></p>
    <p class="authLinks text-center mt-3">
      <NuxtLink to="/" class="text-secondary"> <i class="pi pi-arrow-left me-1"></i> Back to Home </NuxtLink>
    </p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useToast } from "vue-toastification";
import { useSupabaseClient, navigateTo, useRoute, useHead } from "#imports"; // Use specific imports

// State variables
const identifier = ref(""); // Email or Username
const password = ref("");
const magicLinkEmail = ref("");
const loading = ref(false); // Loading state for password login
const loadingMagicLink = ref(false); // Loading state for magic link
const error = ref(null);

// Get Supabase client & Toast
const client = useSupabaseClient();
const toast = useToast();

// Handle standard login
const handleLogin = async () => {
  error.value = null;
  loading.value = true;
  let loginEmail = identifier.value;

  try {
    // Check if identifier is likely an email or a username
    if (!identifier.value.includes("@")) {
      // Assume it's a username, try to get email via RPC
      const { data: rpcData, error: rpcError } = await client.rpc("get_email_by_username", { p_username: identifier.value });

      if (rpcError || !rpcData) {
        console.error("RPC get_email_by_username error:", rpcError);
        throw new Error(rpcError?.message || "Invalid username or unable to find email for username.");
      }
      loginEmail = rpcData; // Use the email returned from RPC
    }

    const { error: signInError } = await client.auth.signInWithPassword({
      email: loginEmail,
      password: password.value,
    });

    if (signInError) throw signInError;

    toast.success("Successfully logged in!");
    // Redirect to home page on success or intended page
    const redirectPath = useRoute().query.redirectTo || "/";
    navigateTo(redirectPath, { external: false });
  } catch (err) {
    console.error("Login error:", err);
    error.value = "Login failed. Please check your email/username and password.";
    toast.error(error.value);
  } finally {
    loading.value = false;
  }
};

// Handle Magic Link Login
const handleMagicLinkLogin = async () => {
  error.value = null;
  loadingMagicLink.value = true;
  try {
    // Check if window is defined before accessing origin (client-side check)
    const redirectUrl = typeof window !== "undefined" ? `${window.location.origin}/` : "/"; // Fallback if run server-side unexpectedly

    const { error: otpError } = await client.auth.signInWithOtp({
      email: magicLinkEmail.value,
      options: {
        // Ensure this matches a redirect URL in your Supabase Auth settings
        emailRedirectTo: redirectUrl,
      },
    });
    if (otpError) throw otpError;
    toast.info("Magic link sent! Check your email to login.");
    magicLinkEmail.value = ""; // Clear input
  } catch (err) {
    console.error("Magic link error:", err);
    error.value = "Failed to send magic link. Please check the email address and try again.";
    toast.error(error.value);
  } finally {
    loadingMagicLink.value = false;
  }
};

// Page metadata
definePageMeta({
  layout: "auth", // Uses layouts/auth.vue
  middleware: ["auth-redirect"], // Redirect if already logged in
});

useHead({
  title: "Login | ChloroFill 🍴🍹",
});
</script>

<style scoped>
/* Add minor adjustments if needed, but rely on _auth.scss */
</style>
