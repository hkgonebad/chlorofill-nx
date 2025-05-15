<template>
  <div class="container py-5">
    <h2 class="sectionTitle mb-4">Create New Recipe or Cocktail</h2>
    <UserCreationMultiStepForm :loading="loading" @submit="handleSubmit" />
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useToast } from "vue-toastification";
import { useUserCreations } from "~/composables/useUserCreations";
import { useSupabaseClient, useSupabaseUser, useRouter, navigateTo } from "#imports";
import UserCreationMultiStepForm from "~/components/UserCreationMultiStepForm.vue";
import { useImageUpload } from "~/composables/useImageUpload";

const { createUserCreation } = useUserCreations();
const { compressAndUploadImage } = useImageUpload();

const router = useRouter();
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
    creationPayload.is_approved = false;

    if (formData.image && formData.image.file && formData.image.name) {
      const mainImageFile = formData.image.file;
      const mainImageName = formData.image.name;
      const mainImageStorageFilePath = `${user.value.id}/main/`;

      const { publicUrl, error: uploadError } = await compressAndUploadImage(mainImageFile, {
        bucketName: BUCKET_NAME,
        filePath: mainImageStorageFilePath,
        fileName: mainImageName,
        compressionOptions: { maxWidthOrHeight: 1920, maxSizeMB: 1.5 },
      });

      if (uploadError) {
        toast.error(`Main image upload failed: ${uploadError.message}`);
        loading.value = false;
        return;
      }
      creationPayload.image_path = publicUrl;
    } else {
      toast.warning("Main image was not provided or had an issue.");
    }

    if (creationPayload.ingredients && creationPayload.ingredients.length > 0) {
      for (let i = 0; i < creationPayload.ingredients.length; i++) {
        const ingredient = creationPayload.ingredients[i];
        if (ingredient.image && ingredient.image.file && ingredient.image.name) {
          const ingImageFile = ingredient.image.file;
          const ingImageName = ingredient.image.name;
          const ingImageStorageFilePath = `${user.value.id}/ingredients/`;

          const { publicUrl: ingPublicUrl, error: ingUploadError } = await compressAndUploadImage(ingImageFile, {
            bucketName: BUCKET_NAME,
            filePath: ingImageStorageFilePath,
            fileName: ingImageName,
            compressionOptions: { maxWidthOrHeight: 500, maxSizeMB: 0.5 },
          });

          if (ingUploadError) {
            toast.warning(`Ingredient '${ingredient.name}' image upload failed: ${ingUploadError.message}. Continuing without this ingredient image.`);
            ingredient.image_url = null;
          } else {
            ingredient.image_url = ingPublicUrl;
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

    toast.success("Creation submitted successfully!");
    if (newCreation && newCreation.id) {
      const typePath = newCreation.type === "cocktail" ? "cocktail" : "recipe";
      navigateTo(`/${typePath}/${newCreation.id}`);
    } else {
      router.push("/creations/my-creations");
    }
  } catch (error) {
    console.error("Error in handleSubmit (new creation):", error);
    toast.error(`An unexpected error occurred: ${error.message}`);
  } finally {
    loading.value = false;
  }
};
</script>
