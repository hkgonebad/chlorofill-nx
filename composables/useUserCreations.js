import { ref } from "vue";
import { useSupabaseClient, useSupabaseUser } from "#imports";

export function useUserCreations() {
  const client = useSupabaseClient();
  const user = useSupabaseUser();

  // State
  const creations = ref([]);
  const loading = ref(false);
  const error = ref(null);

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
    const { error: deleteError } = await client.from("user_creations").delete().eq("id", id).eq("user_id", user.value.id);
    if (deleteError) return { error: deleteError.message };
    creations.value = creations.value.filter((c) => c.id !== id);
    return { success: true };
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
      // This should be updated to is_approved once moderation is in place.
      .eq("is_public", true) // TODO: Change to is_approved once moderation is implemented
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
        .eq("is_public", true) // TODO: Change to is_approved once moderation is implemented
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
