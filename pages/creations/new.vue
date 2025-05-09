<template>
  <div class="container py-5">
    <h2 class="sectionTitle mb-4">Create New Recipe or Cocktail</h2>
    <UserCreationMultiStepForm :loading="loading" @submit="handleSubmit" />
  </div>
</template>

<script setup>
import { ref } from "vue";
// import { useRouter, navigateTo } from "vue-router"; // These are auto-imported by Nuxt 3
import { useToast } from "vue-toastification";
import { useUserCreations } from "~/composables/useUserCreations";
import { useSupabaseClient, useSupabaseUser } from "#imports";
import UserCreationMultiStepForm from "~/components/UserCreationMultiStepForm.vue";

const { createUserCreation } = useUserCreations();
const router = useRouter(); // This is needed, useRouter is auto-imported
const toast = useToast();
const loading = ref(false);
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const BUCKET_NAME = "user-creations";

const handleSubmit = async (formData) => {
  loading.value = true;
  if (!user.value) {
    toast.error("You must be logged in to create content.");
    loading.value = false;
    return;
  }

  try {
    const creationPayload = { ...formData };
    delete creationPayload.image;
    creationPayload.user_id = user.value.id;
    creationPayload.image_path = null;

    if (formData.image && formData.image.file && formData.image.name) {
      const mainImageFile = formData.image.file;
      const mainImageName = formData.image.name;
      const mainImagePathInBucket = `${user.value.id}/main/${mainImageName}`;

      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(mainImagePathInBucket, mainImageFile, {
        upsert: true,
        contentType: mainImageFile.type,
      });

      if (uploadError) {
        toast.error(`Main image upload failed: ${uploadError.message}`);
        loading.value = false;
        return;
      }
      const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(mainImagePathInBucket);
      creationPayload.image_path = publicUrlData.publicUrl;
    } else if (!formData.image_path) {
    }

    if (creationPayload.ingredients && creationPayload.ingredients.length > 0) {
      for (let i = 0; i < creationPayload.ingredients.length; i++) {
        const ingredient = creationPayload.ingredients[i];
        if (ingredient.image && ingredient.image.file && ingredient.image.name) {
          const ingImageFile = ingredient.image.file;
          const ingImageName = ingredient.image.name;
          const ingImagePathInBucket = `${user.value.id}/ingredients/${ingImageName}`;

          const { error: ingUploadError } = await supabase.storage.from(BUCKET_NAME).upload(ingImagePathInBucket, ingImageFile, {
            upsert: true,
            contentType: ingImageFile.type,
          });

          if (ingUploadError) {
            toast.warning(`Ingredient '${ingredient.name}' image upload failed: ${ingUploadError.message}. Continuing without it.`);
            ingredient.image_url = null;
          } else {
            const { data: ingPublicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(ingImagePathInBucket);
            ingredient.image_url = ingPublicUrlData.publicUrl;
          }
        }
        if (ingredient.image) delete ingredient.image;
      }
    }

    const { data: newCreation, error: createError } = await createUserCreation(creationPayload);

    if (createError) {
      toast.error(`Failed to create: ${createError.message}`);
      loading.value = false;
      return;
    }

    toast.success("Created successfully!");
    if (newCreation && newCreation.id) {
      const typePath = newCreation.type === "cocktail" ? "cocktail" : "recipe";
      await navigateTo(`/${typePath}/${newCreation.id}`);
    } else {
      await router.push("/creations/my-creations");
    }
  } catch (e) {
    console.error("Error in handleSubmit:", e);
    toast.error("An unexpected error occurred: " + e.message);
  } finally {
    loading.value = false;
  }
};
</script>
