import { ref } from "vue";
import { useSupabaseClient, useSupabaseUser } from "#imports";

export function useUserCreations() {
  const client = useSupabaseClient();
  const user = useSupabaseUser();

  // State
  const creations = ref([]);
  const loading = ref(false);
  const error = ref(null);

  const BUCKET_NAME = "user-creations"; // As defined in your creation/edit logic

  // Helper function to extract storage object path from public URL
  // Example URL: https://<project_ref>.supabase.co/storage/v1/object/public/user-creations/USER_ID/main/FILENAME.EXT
  // Path to extract: USER_ID/main/FILENAME.EXT
  const getStoragePathFromUrl = (url) => {
    if (!url) return null;
    try {
      const urlObject = new URL(url);
      // The path starts after '/public/BUCKET_NAME/'
      // So, split by BUCKET_NAME and take the second part, then remove leading slash if any.
      const pathWithBucket = urlObject.pathname.split(`/public/${BUCKET_NAME}/`)[1];
      return pathWithBucket || null;
    } catch (e) {
      console.error("Error parsing URL for storage path:", e);
      return null;
    }
  };

  // Fetch all creations for the current user
  const fetchUserCreations = async () => {
    if (!user.value) {
      creations.value = [];
      return;
    }
    loading.value = true;
    error.value = null;
    const { data, error: fetchError } = await client.from("user_creations").select("*").eq("user_id", user.value.id).order("created_at", { ascending: false });
    if (fetchError) {
      error.value = fetchError.message;
      creations.value = [];
    } else {
      creations.value = data;
    }
    loading.value = false;
  };

  // Create a new creation
  const createUserCreation = async (creation) => {
    if (!user.value) return { error: "Not authenticated" };
    const { data, error: createError } = await client
      .from("user_creations")
      .insert([{ ...creation, user_id: user.value.id }])
      .select()
      .single();
    if (createError) return { error: createError.message };
    creations.value.unshift(data);
    return { data };
  };

  // Update an existing creation
  const updateUserCreation = async (id, updates) => {
    if (!user.value) return { error: "Not authenticated" };
    const { data, error: updateError } = await client
      .from("user_creations")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", id)
      .eq("user_id", user.value.id)
      .select()
      .single();
    if (updateError) return { error: updateError.message };
    const idx = creations.value.findIndex((c) => c.id === id);
    if (idx !== -1) creations.value[idx] = data;
    return { data };
  };

  // Delete a creation
  const deleteUserCreation = async (id) => {
    if (!user.value) return { error: "Not authenticated" };
    loading.value = true;
    error.value = null;

    try {
      // 1. Fetch the creation record to get image paths
      const { data: creationToDelete, error: fetchError } = await client
        .from("user_creations")
        .select("image_path, ingredients") // Select fields that store image URLs/paths
        .eq("id", id)
        .eq("user_id", user.value.id)
        .single();

      if (fetchError) {
        throw new Error(`Failed to fetch creation details for deletion: ${fetchError.message}`);
      }

      if (!creationToDelete) {
        throw new Error("Creation not found or user not authorized to delete.");
      }

      const filesToDelete = [];

      // 2. Collect main image path
      if (creationToDelete.image_path) {
        const mainImagePath = getStoragePathFromUrl(creationToDelete.image_path);
        if (mainImagePath) {
          filesToDelete.push(mainImagePath);
        } else {
          console.warn(`Could not parse main image path for deletion: ${creationToDelete.image_path}`);
        }
      }

      // 3. Collect ingredient image paths
      if (creationToDelete.ingredients && Array.isArray(creationToDelete.ingredients)) {
        creationToDelete.ingredients.forEach((ingredient) => {
          if (ingredient.image_url) {
            const ingredientImagePath = getStoragePathFromUrl(ingredient.image_url);
            if (ingredientImagePath) {
              filesToDelete.push(ingredientImagePath);
            } else {
              console.warn(`Could not parse ingredient image path for deletion: ${ingredient.image_url}`);
            }
          }
        });
      }

      // 4. Delete files from storage if any were found
      if (filesToDelete.length > 0) {
        console.log("Attempting to delete from storage:", filesToDelete);
        const { error: storageError } = await client.storage.from(BUCKET_NAME).remove(filesToDelete);
        if (storageError) {
          // Log the error but proceed to delete the DB record as a partial success
          console.error("Error deleting files from storage:", storageError.message);
          error.value = `Storage deletion failed: ${storageError.message}. DB record will still be deleted.`;
          // Depending on desired behavior, you could choose to throw and stop here
          // For now, we'll log and continue to ensure DB record is removed
        } else {
          console.log("Successfully deleted files from storage:", filesToDelete);
        }
      }

      // 5. Delete the database record
      const { error: deleteDbError } = await client.from("user_creations").delete().eq("id", id).eq("user_id", user.value.id);

      if (deleteDbError) {
        throw new Error(`Database record deletion failed: ${deleteDbError.message}`);
      }

      // Update local state
      creations.value = creations.value.filter((c) => c.id !== id);
      return { success: true };
    } catch (e) {
      console.error("Error in deleteUserCreation:", e.message);
      error.value = e.message; // Set the main error ref
      return { error: e.message };
    } finally {
      loading.value = false;
    }
  };

  // Fetch a single user creation by ID (publicly accessible if is_public)
  const getUserCreationById = async (id) => {
    const { data, error: fetchError } = await client
      .from("user_creations")
      .select("*")
      .eq("id", id)
      // .eq("is_public", true) // In previous versions, this was used. Now UGC detail pages rely on this.
      // For search, we will rely on is_approved, which will be added with moderation.
      // For now, to allow existing UGC to be searched if public, we'll keep is_public.
      // This was previously updated to is_approved but is now removed to allow owners to see their pending creations.
      // The detail page component should handle displaying a "Pending Review" message if data.is_approved is false.
      .single();

    if (fetchError) return { error: fetchError.message };
    return { data };
  };

  // Search user creations (publicly approved)
  const searchUserCreations = async (query) => {
    if (!query || query.trim() === "") {
      return { data: [], error: null };
    }
    loading.value = true;
    error.value = null;
    try {
      const { data, error: searchError } = await client
        .from("user_creations")
        .select("id, title, type, image_path, description, tags") // Select only needed fields
        .eq("is_approved", true) // MODIFIED: Changed from is_public to is_approved
        .or(`title.ilike.%${query}%,description.ilike.%${query}%,tags.cs.{${query}}`)
        .limit(10);

      if (searchError) {
        throw searchError;
      }

      const processedData = data.map((item) => {
        const itemType = item.type === "recipe" ? "meal" : "cocktail";
        return {
          id: item.id,
          name: item.title,
          type: itemType,
          isUgc: true,
          thumb: item.image_path,
          // Compatibility fields for FullScreenSearchModal and ItemCard
          idMeal: itemType === "meal" ? item.id : null,
          idDrink: itemType === "cocktail" ? item.id : null,
          strMeal: itemType === "meal" ? item.title : null,
          strDrink: itemType === "cocktail" ? item.title : null,
          strMealThumb: itemType === "meal" ? item.image_path : null,
          strDrinkThumb: itemType === "cocktail" ? item.image_path : null,
        };
      });
      return { data: processedData, error: null };
    } catch (e) {
      error.value = e.message;
      console.error("Error searching user creations:", e);
      return { data: [], error: e.message };
    } finally {
      loading.value = false;
    }
  };

  return {
    creations,
    loading,
    error,
    fetchUserCreations,
    createUserCreation,
    updateUserCreation,
    deleteUserCreation,
    getUserCreationById,
    searchUserCreations,
  };
}
