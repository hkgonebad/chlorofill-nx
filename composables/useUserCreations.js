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

  return {
    creations,
    loading,
    error,
    fetchUserCreations,
    createUserCreation,
    updateUserCreation,
    deleteUserCreation,
  };
}
