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
// import { useRoute, useRouter, navigateTo } from "vue-router"; // These are auto-imported by Nuxt 3
import { useToast } from "vue-toastification";
import { useUserCreations } from "~/composables/useUserCreations";
import { useSupabaseClient, useSupabaseUser } from "#imports";
import UserCreationMultiStepForm from "~/components/UserCreationMultiStepForm.vue";

const { creations, fetchUserCreations, updateUserCreation } = useUserCreations();
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
    const parts = url.pathname.split(`/${BUCKET_NAME}/`);
    return parts[1] || null;
  } catch (e) {
    console.error("Error parsing URL for storage path:", e);
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

    const oldMainImagePath = creation.value.image_path;
    let newMainImagePathInBucket = null;

    if (formData.image && formData.image.file && formData.image.name) {
      const mainImageFile = formData.image.file;
      const mainImageName = formData.image.name;
      newMainImagePathInBucket = `${user.value.id}/main/${mainImageName}`;

      const { error: uploadError } = await supabase.storage.from(BUCKET_NAME).upload(newMainImagePathInBucket, mainImageFile, { upsert: true, contentType: mainImageFile.type });

      if (uploadError) {
        toast.error(`Main image upload failed: ${uploadError.message}`);
      } else {
        const { data: publicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(newMainImagePathInBucket);
        updateData.image_path = publicUrlData.publicUrl;
        const oldStoragePath = getStoragePathFromUrl(oldMainImagePath);
        if (oldStoragePath && oldStoragePath !== newMainImagePathInBucket) {
          await supabase.storage.from(BUCKET_NAME).remove([oldStoragePath]);
        }
      }
    } else {
      updateData.image_path = oldMainImagePath;
    }

    if (updateData.ingredients && updateData.ingredients.length > 0) {
      for (let i = 0; i < updateData.ingredients.length; i++) {
        const formIngredient = formData.ingredients[i];
        const originalIngredient = creation.value.ingredients && creation.value.ingredients[i] ? creation.value.ingredients[i] : {};
        const oldIngredientImageUrl = originalIngredient.image_url;
        let newIngredientImagePathInBucket = null;

        if (formIngredient.image && formIngredient.image.file && formIngredient.image.name) {
          const ingImageFile = formIngredient.image.file;
          const ingImageName = formIngredient.image.name;
          newIngredientImagePathInBucket = `${user.value.id}/ingredients/${ingImageName}`;

          const { error: ingUploadError } = await supabase.storage.from(BUCKET_NAME).upload(newIngredientImagePathInBucket, ingImageFile, { upsert: true, contentType: ingImageFile.type });

          if (ingUploadError) {
            toast.warning(`Ingredient '${formIngredient.name}' image upload failed: ${ingUploadError.message}.`);
            updateData.ingredients[i].image_url = oldIngredientImageUrl;
          } else {
            const { data: ingPublicUrlData } = supabase.storage.from(BUCKET_NAME).getPublicUrl(newIngredientImagePathInBucket);
            updateData.ingredients[i].image_url = ingPublicUrlData.publicUrl;
            const oldIngStoragePath = getStoragePathFromUrl(oldIngredientImageUrl);
            if (oldIngStoragePath && oldIngStoragePath !== newIngredientImagePathInBucket) {
              await supabase.storage.from(BUCKET_NAME).remove([oldIngStoragePath]);
            }
          }
        } else {
          updateData.ingredients[i].image_url = oldIngredientImageUrl;
        }
        if (updateData.ingredients[i].image) delete updateData.ingredients[i].image;
      }
    }

    const creationId = route.params.id;
    const { id, user_id, created_at, ...payloadToUpdate } = updateData;

    const { data: updatedCreation, error: dbUpdateError } = await updateUserCreation(creationId, payloadToUpdate);

    if (dbUpdateError) {
      toast.error(`Failed to update database: ${dbUpdateError.message}`);
    } else {
      toast.success("Updated successfully!");
      if (updatedCreation && updatedCreation.id) {
        const typePath = updatedCreation.type === "cocktail" ? "cocktail" : "recipe";
        creation.value = updatedCreation;
        await navigateTo(`/${typePath}/${updatedCreation.id}`);
      } else {
        await router.push("/creations/my-creations");
      }
    }
  } catch (e) {
    console.error("Error in handleSubmit (edit):", e);
    toast.error("An unexpected error occurred during update: " + e.message);
  } finally {
    saving.value = false;
  }
};
</script>
