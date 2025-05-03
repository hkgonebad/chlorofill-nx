<template>
  <div>
    <h2 class="text-center mb-4">Create Account</h2>

    <form @submit.prevent="handleSignup">
      <div class="mb-3">
        <label for="email" class="form-label">Email</label>
        <input type="email" class="form-control" id="email" v-model="email" required placeholder="your@email.com" />
      </div>

      <div class="mb-3">
        <label for="password" class="form-label">Password</label>
        <input type="password" class="form-control" id="password" v-model="password" required placeholder="••••••••" minlength="8" />
        <div class="form-text">Password must be at least 8 characters</div>
      </div>

      <div class="mb-4">
        <label for="fullName" class="form-label">Full Name (optional)</label>
        <input type="text" class="form-control" id="fullName" v-model="fullName" placeholder="John Doe" />
      </div>

      <div v-if="error" class="alert alert-danger mb-4">
        {{ error }}
      </div>

      <button type="submit" class="btn btn-primary w-100" :disabled="loading">
        <span v-if="loading" class="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
        Create Account
      </button>

      <div class="text-center mt-4">
        <p>Already have an account? <NuxtLink to="/login">Login</NuxtLink></p>
      </div>
    </form>
  </div>
</template>

<script setup>
// State variables
const email = ref("");
const password = ref("");
const fullName = ref("");
const loading = ref(false);
const error = ref(null);

// Get Supabase client
const client = useSupabaseClient();

// Handle signup
const handleSignup = async () => {
  error.value = null;
  loading.value = true;

  try {
    // Sign up with email and password
    const { error: signUpError, data } = await client.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          full_name: fullName.value,
        },
      },
    });

    if (signUpError) throw signUpError;

    // Insert user profile info
    if (data.user) {
      const { error: profileError } = await client.from("profiles").insert([
        {
          id: data.user.id,
          username: email.value.split("@")[0],
          full_name: fullName.value,
        },
      ]);

      if (profileError) console.error("Error creating profile:", profileError);
    }

    // Show success and redirect
    alert("Account created! Check your email for confirmation.");
    navigateTo("/login");
  } catch (err) {
    error.value = err.message || "Failed to create account";
  } finally {
    loading.value = false;
  }
};

// Page metadata
definePageMeta({
  layout: "auth",
});

useHead({
  title: "Sign Up | ChloroFill",
});
</script>
