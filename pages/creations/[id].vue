<template>
  <div class="container py-5">
    <h2 class="sectionTitle mb-4">Edit Recipe or Cocktail</h2>
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-else>
      <UserCreationForm :model="creation" mode="edit" :loading="saving" @submit="handleSubmit" />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useUserCreations } from "~/composables/useUserCreations";
import UserCreationForm from "~/components/UserCreationForm.vue";

const { creations, fetchUserCreations, updateUserCreation } = useUserCreations();
const route = useRoute();
const router = useRouter();
const toast = useToast();
const loading = ref(true);
const saving = ref(false);
const error = ref("");
const creation = ref(null);

const fetchCreation = async () => {
  loading.value = true;
  error.value = "";
  await fetchUserCreations();
  const found = creations.value.find((c) => c.id === route.params.id);
  if (!found) {
    error.value = "Creation not found or you do not have access.";
  } else {
    creation.value = found;
  }
  loading.value = false;
};

onMounted(fetchCreation);

const handleSubmit = async (formData) => {
  saving.value = true;
  try {
    // TODO: Handle image upload to Supabase Storage if image is present
    // For now, ignore image and just save the rest
    const { image, ...updateData } = formData;
    const { data, error: updateError } = await updateUserCreation(route.params.id, updateData);
    if (updateError) {
      toast.error("Failed to update: " + updateError);
    } else {
      toast.success("Updated successfully!");
      router.push("/profile");
    }
  } catch (e) {
    toast.error("Error: " + e.message);
  } finally {
    saving.value = false;
  }
};
</script>
