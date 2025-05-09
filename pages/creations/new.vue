<template>
  <div class="container py-5">
    <h2 class="sectionTitle mb-4">Create New Recipe or Cocktail</h2>
    <UserCreationMultiStepForm :loading="loading" @submit="handleSubmit" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useUserCreations } from "~/composables/useUserCreations";
import { useSupabaseClient, useSupabaseUser } from "#imports";
import UserCreationMultiStepForm from "~/components/UserCreationMultiStepForm.vue";

const { createUserCreation, updateUserCreation } = useUserCreations();
const router = useRouter();
const toast = useToast();
const loading = ref(false);
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const handleSubmit = async (formData) => {
  loading.value = true;
  try {
    // Extract image and prepare creation data
    const { image, ...creationData } = formData;
    // Insert creation without image_path first
    const { data, error } = await createUserCreation(creationData);
    if (error) {
      toast.error("Failed to create: " + error);
      loading.value = false;
      return;
    }
    let imagePath = null;
    if (image && user.value && data?.id) {
      // Upload image to Supabase Storage
      imagePath = `${user.value.id}/${data.id}.jpg`;
      const { error: uploadError } = await supabase.storage.from("user-creations").upload(imagePath, image, { upsert: true, contentType: image.type });
      if (uploadError) {
        toast.error("Image upload failed: " + uploadError.message);
      } else {
        // Update DB row with image_path
        await updateUserCreation(data.id, { image_path: imagePath });
      }
    }
    toast.success("Created successfully!");
    router.push("/creations/my-creations");
  } catch (e) {
    toast.error("Error: " + e.message);
  } finally {
    loading.value = false;
  }
};
</script>
