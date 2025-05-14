<template>
  <div class="container py-5">
    <h2 class="sectionTitle mb-4">Edit: {{ creation?.title || "Recipe or Cocktail" }}</h2>
    <div v-if="loading" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>
    <div v-else-if="error" class="alert alert-danger">{{ error }}</div>
    <div v-else-if="creation">
      <UserCreationMultiStepForm :model="creation" mode="edit" :loading="saving" @submit="handleSubmit" />
    </div>
    <div v-else class="alert alert-warning">Could not load creation data.</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useToast } from "vue-toastification";
import { useUserCreations } from "~/composables/useUserCreations";
import { useSupabaseClient, useSupabaseUser, useRoute, useRouter, navigateTo } from "#imports";
import UserCreationMultiStepForm from "~/components/UserCreationMultiStepForm.vue";
import { useImageUpload } from "~/composables/useImageUpload";

const { creations, fetchUserCreations, updateUserCreation } = useUserCreations();
const { compressAndUploadImage } = useImageUpload();

const route = useRoute();
const router = useRouter();
const toast = useToast();
const loading = ref(true);
const saving = ref(false);
const error = ref("");
const creation = ref(null);

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const BUCKET_NAME = "user-creations";

const getStoragePathFromUrl = (publicUrl) => {
  if (!publicUrl) return null;
  try {
    const url = new URL(publicUrl);
    const pathSegments = url.pathname.split("/");
    const bucketIndex = pathSegments.indexOf(BUCKET_NAME);
    if (bucketIndex !== -1 && bucketIndex + 1 < pathSegments.length) {
      return pathSegments.slice(bucketIndex + 1).join("/");
    }
    return null;
  } catch (e) {
    console.error("Error parsing URL for storage path:", publicUrl, e);
    return null;
  }
};

const fetchCreation = async () => {
  loading.value = true;
  error.value = "";
  creation.value = null;
  await fetchUserCreations();
  const found = creations.value.find((c) => c.id === route.params.id);
  if (!found) {
    error.value = "Creation not found or you do not have access.";
    toast.error(error.value);
  } else {
    creation.value = JSON.parse(JSON.stringify(found));
  }
  loading.value = false;
};

onMounted(fetchCreation);

const handleSubmit = async (formData) => {
  saving.value = true;
  if (!user.value || !creation.value) {
    toast.error("User not authenticated or creation data not loaded.");
    saving.value = false;
    return;
  }

  try {
    const updateData = { ...formData };
    delete updateData.image;

    const originalCreationData = creation.value;

    if (formData.image && formData.image.file && formData.image.name) {
      const mainImageFile = formData.image.file;
      const mainImageName = formData.image.name;
      const mainImageStorageFilePath = `${user.value.id}/main/`;

      const {
        publicUrl,
        error: uploadError,
        path: newStoragePath,
      } = await compressAndUploadImage(mainImageFile, {
        bucketName: BUCKET_NAME,
        filePath: mainImageStorageFilePath,
        fileName: mainImageName,
        compressionOptions: { maxWidthOrHeight: 1920, maxSizeMB: 1.5 },
      });

      if (uploadError) {
        toast.error(`Main image upload failed: ${uploadError.message}. Keeping old image if available.`);
        updateData.image_path = originalCreationData.image_path;
      } else {
        updateData.image_path = publicUrl;
        const oldStoragePath = getStoragePathFromUrl(originalCreationData.image_path);
        if (oldStoragePath && oldStoragePath !== newStoragePath) {
          await supabase.storage.from(BUCKET_NAME).remove([oldStoragePath]);
        }
      }
    } else {
      updateData.image_path = originalCreationData.image_path;
    }

    if (updateData.ingredients && updateData.ingredients.length > 0) {
      for (let i = 0; i < updateData.ingredients.length; i++) {
        const formIngredient = formData.ingredients[i];
        const originalIngredient = originalCreationData.ingredients?.find((oi) => oi.name === formIngredient.name) || (originalCreationData.ingredients && originalCreationData.ingredients[i]);

        const oldIngredientImageUrl = originalIngredient?.image_url || null;

        if (formIngredient.image && formIngredient.image.file && formIngredient.image.name) {
          const ingImageFile = formIngredient.image.file;
          const ingImageName = formIngredient.image.name;
          const ingImageStorageFilePath = `${user.value.id}/ingredients/`;

          const {
            publicUrl: ingPublicUrl,
            error: ingUploadError,
            path: newIngStoragePath,
          } = await compressAndUploadImage(ingImageFile, {
            bucketName: BUCKET_NAME,
            filePath: ingImageStorageFilePath,
            fileName: ingImageName,
            compressionOptions: { maxWidthOrHeight: 500, maxSizeMB: 0.5 },
          });

          if (ingUploadError) {
            toast.warning(`Ingredient '${formIngredient.name}' image upload failed: ${ingUploadError.message}. Keeping old image if available.`);
            updateData.ingredients[i].image_url = oldIngredientImageUrl;
          } else {
            updateData.ingredients[i].image_url = ingPublicUrl;
            const oldIngStoragePath = getStoragePathFromUrl(oldIngredientImageUrl);
            if (oldIngStoragePath && oldIngStoragePath !== newIngStoragePath) {
              await supabase.storage.from(BUCKET_NAME).remove([oldIngStoragePath]);
            }
          }
        } else if (formIngredient.existing_image_url) {
          updateData.ingredients[i].image_url = formIngredient.existing_image_url;
        } else {
          updateData.ingredients[i].image_url = oldIngredientImageUrl;
        }
        if (updateData.ingredients[i].image) delete updateData.ingredients[i].image;
        if (updateData.ingredients[i].existing_image_url) delete updateData.ingredients[i].existing_image_url;
      }
    }

    const { data: updatedCreation, error: updateError } = await updateUserCreation(route.params.id, updateData);

    if (updateError) {
      toast.error(`Failed to update: ${updateError.message}`);
      saving.value = false;
      return;
    }

    toast.success("Creation updated successfully!");
    if (updatedCreation && updatedCreation.id) {
      const typePath = updatedCreation.type === "cocktail" ? "cocktail" : "recipe";
      navigateTo(`/${typePath}/${updatedCreation.id}`);
    } else {
      router.push("/creations/my-creations");
    }
  } catch (error) {
    console.error("Error in handleSubmit (edit creation):", error);
    toast.error(`An unexpected error occurred: ${error.message}`);
  } finally {
    saving.value = false;
  }
};
</script>
