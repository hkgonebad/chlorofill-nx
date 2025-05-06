<template>
  <div class="container py-5">
    <h2 class="sectionTitle mb-4">Create New Recipe or Cocktail</h2>
    <UserCreationForm :loading="loading" @submit="handleSubmit" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useUserCreations } from "~/composables/useUserCreations";
import UserCreationForm from "~/components/UserCreationForm.vue";

const { createUserCreation } = useUserCreations();
const router = useRouter();
const toast = useToast();
const loading = ref(false);

const handleSubmit = async (formData) => {
  loading.value = true;
  try {
    // TODO: Handle image upload to Supabase Storage if image is present
    // For now, ignore image and just save the rest
    const { image, ...creationData } = formData;
    const { data, error } = await createUserCreation(creationData);
    if (error) {
      toast.error("Failed to create: " + error);
    } else {
      toast.success("Created successfully!");
      router.push("/profile");
    }
  } catch (e) {
    toast.error("Error: " + e.message);
  } finally {
    loading.value = false;
  }
};
</script>
