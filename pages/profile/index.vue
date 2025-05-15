<template>
  <div class="profileView container py-5">
    <h2 class="sectionTitle mb-4 d-flex justify-content-between align-items-center">
      <span>My Profile</span>
      <NuxtLink to="/creations/my-creations" class="btn btn-primary"> <i class="pi pi-pencil me-1"></i> My Creations </NuxtLink>
    </h2>

    <!-- Tabs Navigation -->
    <ul class="nav nav-tabs profileTabs mb-4" role="tablist">
      <li class="nav-item" role="presentation">
        <button class="nav-link" :class="{ active: activeTab === 'favorites' }" @click="activeTab = 'favorites'" type="button" role="tab">Favorites</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" :class="{ active: activeTab === 'account' }" @click="activeTab = 'account'" type="button" role="tab">Account Info</button>
      </li>
      <li class="nav-item" role="presentation">
        <button class="nav-link" :class="{ active: activeTab === 'security' }" @click="activeTab = 'security'" type="button" role="tab">Security</button>
      </li>
    </ul>

    <!-- Tab Panes -->
    <div class="tab-content profileTabContent">
      <!-- Favorites Tab -->
      <div class="tab-pane fade" :class="{ show: activeTab === 'favorites', active: activeTab === 'favorites' }" role="tabpanel">
        <section class="favoritesSection mt-4">
          <h3 class="sectionTitle mb-4">Your Favorites</h3>
          <div v-if="!favoritesLoaded" class="row row-cols-2 row-cols-md-4 g-4 placeholder-glow">
            <SkeletonCard v-for="n in 4" :key="'sk-fav-' + n" />
          </div>
          <ErrorMessage v-else-if="favoritesError" :message="favoritesError" />
          <div v-else-if="favoriteItems.length > 0" class="row row-cols-2 row-cols-md-4 g-4">
            <ItemCard
              v-for="item in favoriteItems"
              :key="item.type + '-' + (item.idMeal || item.idDrink || item.id)"
              :image-url="item.image_path || (item.type === 'meal' ? item.strMealThumb : item.strDrinkThumb) || '/img/no-recipe.jpg'"
              :title="item.title || (item.type === 'meal' ? item.strMeal : item.strDrink)"
              :link-to="item.type === 'meal' ? { path: `/recipe/${item.idMeal || item.id}` } : { path: `/cocktail/${item.idDrink || item.id}` }"
              :item-id="item.idMeal || item.idDrink || item.id"
              :item-type="item.type"
              :is-favorite="item.type === 'meal' ? isFavoriteMeal(item.idMeal || item.id) : isFavoriteCocktail(item.idDrink || item.id)"
              :show-actions="true"
              @toggle-favorite="handleToggleFavorite"
              @share-item="handleShareItem"
            />
          </div>
          <div v-else class="empty-state">
            <div class="empty-icon">
              <i class="pi pi-heart"></i>
            </div>
            <h4 class="empty-title">No favorites yet</h4>
            <p class="empty-description">Start exploring recipes and cocktails and save your favorites!</p>
            <NuxtLink to="/" class="btn btn-primary"> Explore Recipes </NuxtLink>
          </div>
        </section>
      </div>

      <!-- Account Info Tab -->
      <div class="tab-pane fade" :class="{ show: activeTab === 'account', active: activeTab === 'account' }" role="tabpanel">
        <ClientOnly>
          <!-- Main slot for client-side rendering -->
          <div v-if="pendingProfile" class="text-center py-5">
            <div class="spinner-border" role="status"><span class="visually-hidden">Loading Profile...</span></div>
          </div>
          <div v-else-if="profileError" class="alert alert-danger">Could not load profile data: {{ profileError.message }}</div>
          <div v-else-if="user && profileData" class="row g-4">
            <div class="col-lg-7">
              <div class="card h-100 shadow-sm">
                <div class="card-body">
                  <h5 class="card-title mb-4">Account Information</h5>
                  <div class="row">
                    <div class="col-md-4 text-center mb-3 mb-md-0">
                      <img :src="editableProfile.avatar_url || '/img/avatar-placeholder.png'" alt="User Avatar" class="img-thumbnail rounded-circle profileAvatar mb-2" width="150" height="150" />
                      <input type="file" ref="avatarInput" @change="handleAvatarUpload" style="display: none" :accept="imageAcceptTypes" />
                      <div class="mt-2">
                        <button class="btn btn-sm btn-outline-secondary" @click="triggerAvatarUpload" :disabled="formDisabled || avatarUploading">
                          <span v-if="avatarUploading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          {{ avatarUploading ? "Uploading..." : "Change Avatar" }}
                        </button>
                        <!-- <div class="form-text">Feature coming soon</div> -->
                      </div>
                    </div>
                    <div class="col-md-8">
                      <form @submit.prevent="handleUpdateProfile">
                        <div class="mb-3">
                          <label for="email" class="form-label">Email</label>
                          <input type="email" id="email" class="form-control" :value="user.email" disabled readonly />
                        </div>
                        <div class="mb-3">
                          <label for="username" class="form-label">Username</label>
                          <input type="text" id="username" class="form-control" v-model="editableProfile.username" required minlength="3" :disabled="formDisabled" />
                        </div>
                        <div class="mb-3">
                          <label for="fullName" class="form-label">Full Name</label>
                          <input type="text" id="fullName" class="form-control" v-model="editableProfile.full_name" :disabled="formDisabled" />
                          <div class="form-text">Optional</div>
                        </div>
                        <button type="submit" class="btn btn-primary me-2" :disabled="formDisabled || !isProfileChanged">
                          <span v-if="updateLoading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                          {{ updateLoading ? "Saving..." : "Save Changes" }}
                        </button>
                        <button type="button" @click="resetForm" class="btn btn-secondary me-2" :disabled="formDisabled || !isProfileChanged">Cancel</button>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div v-else-if="user && !profileData" class="alert alert-warning">Could not load profile details. Please try again later or contact support.</div>
          <div v-else class="alert alert-info">Please log in to view your profile.</div>

          <!-- Fallback for server-side rendering and initial client-side before main slot renders -->
          <template #fallback>
            <div class="text-center py-5">
              <div class="spinner-border" role="status">
                <span class="visually-hidden">Loading Account Info...</span>
              </div>
            </div>
          </template>
        </ClientOnly>
      </div>

      <!-- Security Tab -->
      <div class="tab-pane fade" :class="{ show: activeTab === 'security', active: activeTab === 'security' }" role="tabpanel">
        <div class="col-lg-7 col-md-10 mx-auto">
          <div class="card mb-4 shadow-sm">
            <div class="card-body">
              <h5 class="card-title mb-3">Security</h5>
              <form @submit.prevent="handleChangePassword" class="mb-4">
                <h6>Change Password</h6>
                <div class="mb-3">
                  <label for="newPassword" class="form-label">New Password</label>
                  <input type="password" id="newPassword" class="form-control" v-model="newPassword" required minlength="6" placeholder="Enter new password (min 6 chars)" :disabled="formDisabled" />
                </div>
                <div class="mb-3">
                  <label for="confirmPassword" class="form-label">Confirm New Password</label>
                  <input type="password" id="confirmPassword" class="form-control" v-model="confirmPassword" required placeholder="Confirm new password" :disabled="formDisabled" />
                </div>
                <button type="submit" class="btn btn-warning" :disabled="formDisabled || !newPassword || !confirmPassword">
                  <span v-if="passwordChangeLoading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  {{ passwordChangeLoading ? "Updating..." : "Update Password" }}
                </button>
              </form>
              <hr />
              <div class="mt-3">
                <h6>Logout</h6>
                <button @click="handleLogout" class="btn btn-danger" :disabled="formDisabled">
                  <span v-if="logoutLoading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                  Logout
                </button>
              </div>
              <hr />
              <div class="mt-3">
                <h6>Delete Account</h6>
                <p class="text-muted small">Account deletion is currently unavailable. Please contact support if needed.</p>
                <button class="btn btn-outline-danger" disabled>Delete My Account</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch, nextTick } from "vue";
import { useSupabaseUser, useSupabaseClient, useAsyncData, navigateTo, useHead } from "#imports";
import { useToast } from "vue-toastification";
import ItemCard from "~/components/ItemCard.vue";
import SkeletonCard from "~/components/SkeletonCard.vue";
import ErrorMessage from "~/components/ErrorMessage.vue";
import { useFavorites } from "~/composables/useFavorites";
import { useMealApi } from "~/composables/useMealApi";
import { useCocktailApi } from "~/composables/useCocktailApi";
import { inject } from "vue";
import { useUserCreations } from "~/composables/useUserCreations";
import { useImageUpload } from "~/composables/useImageUpload";

const { compressAndUploadImage, ALLOWED_TYPES: allowedAvatarTypes } = useImageUpload();
const imageAcceptTypes = computed(() => allowedAvatarTypes.join(","));

const user = useSupabaseUser();
const client = useSupabaseClient();
const toast = useToast();

const editableProfile = reactive({
  username: "",
  full_name: "",
  avatar_url: "",
});
const originalProfile = reactive({ username: "", full_name: "" });

const newPassword = ref("");
const confirmPassword = ref("");

const {
  data: profileData,
  pending: pendingProfile,
  error: profileError,
  refresh: refreshProfile,
} = useAsyncData(
  "fetch-profile",
  async () => {
    if (!user.value) return null;
    const { data: fetchedData, error: dbError } = await client.from("profiles").select(`username, full_name, avatar_url`).eq("id", user.value.id).single();

    if (dbError) {
      toast.error("Could not load profile: " + dbError.message);
      throw dbError;
    }
    return fetchedData;
  },
  { immediate: true, watch: [user] }
);

watch(
  profileData,
  (newProfileDataValue) => {
    if (newProfileDataValue) {
      editableProfile.username = newProfileDataValue.username;
      editableProfile.full_name = newProfileDataValue.full_name;
      editableProfile.avatar_url = newProfileDataValue.avatar_url;
      originalProfile.username = newProfileDataValue.username;
      originalProfile.full_name = newProfileDataValue.full_name;
    } else {
      editableProfile.username = "";
      editableProfile.full_name = "";
      editableProfile.avatar_url = "";
      originalProfile.username = "";
      originalProfile.full_name = "";
    }
  },
  { immediate: true }
);

const updateLoading = ref(false);
const passwordChangeLoading = ref(false);
const logoutLoading = ref(false);
const avatarUploading = ref(false);
const avatarInput = ref(null);

const isProfileChanged = computed(() => {
  if (!profileData.value) return false;
  return editableProfile.username !== originalProfile.username || editableProfile.full_name !== originalProfile.full_name;
});

const formDisabled = computed(() => {
  return updateLoading.value || passwordChangeLoading.value || logoutLoading.value || avatarUploading.value || pendingProfile.value;
});

const resetForm = () => {
  if (profileData.value) {
    editableProfile.username = profileData.value.username;
    editableProfile.full_name = profileData.value.full_name;
  }
};

const handleUpdateProfile = async () => {
  if (!isProfileChanged.value) return;

  updateLoading.value = true;
  try {
    const updates = {
      id: user.value.id,
      username: editableProfile.username,
      full_name: editableProfile.full_name,
      updated_at: new Date(),
    };

    const { error } = await client.from("profiles").upsert(updates);

    if (error) throw error;

    toast.success("Profile updated successfully!");
    originalProfile.username = editableProfile.username;
    originalProfile.full_name = editableProfile.full_name;
  } catch (error) {
    console.error("Error updating profile:", error);
    toast.error(`Profile update failed: ${error.message}`);
  } finally {
    updateLoading.value = false;
  }
};

const handleChangePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    toast.error("Passwords do not match.");
    return;
  }
  if (newPassword.value.length < 6) {
    toast.error("Password must be at least 6 characters long.");
    return;
  }

  passwordChangeLoading.value = true;
  try {
    const { error } = await client.auth.updateUser({ password: newPassword.value });
    if (error) throw error;
    toast.success("Password updated successfully!");
    newPassword.value = "";
    confirmPassword.value = "";
  } catch (error) {
    console.error("Error updating password:", error);
    toast.error(`Password update failed: ${error.message}`);
  } finally {
    passwordChangeLoading.value = false;
  }
};

const handleLogout = async () => {
  logoutLoading.value = true;
  try {
    const { error } = await client.auth.signOut();
    if (error) throw error;
    toast.info("Logged out successfully.");
    navigateTo("/login");
  } catch (error) {
    console.error("Error logging out:", error);
    toast.error(`Logout failed: ${error.message}`);
  } finally {
    logoutLoading.value = false;
  }
};

const triggerAvatarUpload = () => {
  avatarInput.value?.click();
};

const handleAvatarUpload = async (event) => {
  const file = event.target.files && event.target.files[0];
  if (!file) return;

  avatarUploading.value = true;
  toast.info("Uploading avatar...");

  try {
    const userId = user.value.id;
    // Sanitize username for filename part, or use a generic name like 'avatar'
    const usernamePart = editableProfile.username
      ? editableProfile.username
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, "")
      : "user";
    const fileExtension = file.name.slice(((file.name.lastIndexOf(".") - 1) >>> 0) + 2).toLowerCase() || "png";
    const fileName = `${usernamePart}-avatar-${Date.now()}.${fileExtension}`;

    const {
      publicUrl,
      error: uploadError,
      path: storagePath,
    } = await compressAndUploadImage(file, {
      bucketName: "avatars", // Assuming a separate 'avatars' bucket, or use 'user-creations' with a subfolder
      filePath: `${userId}/`, // Path within the bucket, e.g., USER_ID/
      fileName: fileName,
      compressionOptions: {
        maxSizeMB: 0.5, // Smaller max size for avatars
        maxWidthOrHeight: 250, // Resize to 250x250
      },
      allowedTypes: allowedAvatarTypes, // Use the allowed types from the composable
    });

    if (uploadError) {
      throw uploadError;
    }

    if (publicUrl) {
      // Update the profile in Supabase
      const { error: dbError } = await client.from("profiles").update({ avatar_url: publicUrl, updated_at: new Date() }).eq("id", userId);

      if (dbError) {
        throw dbError;
      }

      // Optimistically update local profile data to reflect change immediately
      editableProfile.avatar_url = publicUrl;
      if (profileData.value) {
        // Also update the source of truth for originalProfile reset
        profileData.value.avatar_url = publicUrl;
        originalProfile.avatar_url = publicUrl; // If originalProfile tracks avatar_url
      }

      toast.success("Avatar updated successfully!");
      await refreshProfile(); // Refresh profile to get the latest state from DB if needed
    } else {
      throw new Error("Upload succeeded but no public URL was returned.");
    }
  } catch (error) {
    console.error("Avatar upload failed:", error);
    toast.error(`Avatar upload failed: ${error.message}`);
  } finally {
    avatarUploading.value = false;
    // Reset file input to allow re-uploading the same file if needed
    if (avatarInput.value) {
      avatarInput.value.value = "";
    }
  }
};

const { favoriteMealIds, favoriteCocktailIds, isFavoriteMeal, isFavoriteCocktail, toggleMealFavorite, toggleCocktailFavorite, favoritesLoaded } = useFavorites();
const { getRecipeById } = useMealApi();
const { getCocktailById } = useCocktailApi();
const openShareModal = inject("openShareModal");

const favoritesError = ref("");
const favoriteItems = ref([]);

const fetchFavoriteItems = async () => {
  favoritesError.value = "";
  favoriteItems.value = [];
  try {
    if (!favoritesLoaded.value) return;
    const mealIds = favoriteMealIds.value;
    const cocktailIds = favoriteCocktailIds.value;

    if (mealIds.length === 0 && cocktailIds.length === 0) {
      favoriteItems.value = [];
      return;
    }

    const mealPromises = mealIds.map(async (id) => {
      const mealData = await getRecipeById(id);
      if (!mealData) return null;
      return {
        id: mealData.idMeal || mealData.id,
        type: "meal",
        title: mealData.strMeal || mealData.title,
        image_path: mealData.image_path || mealData.strMealThumb,
        strMealThumb: mealData.strMealThumb,
        idMeal: mealData.idMeal,
      };
    });
    const cocktailPromises = cocktailIds.map(async (id) => {
      const cocktailData = await getCocktailById(id);
      if (!cocktailData) return null;
      return {
        id: cocktailData.idDrink || cocktailData.id,
        type: "cocktail",
        title: cocktailData.strDrink || cocktailData.title,
        image_path: cocktailData.image_path || cocktailData.strDrinkThumb,
        strDrinkThumb: cocktailData.strDrinkThumb,
        idDrink: cocktailData.idDrink,
      };
    });

    const [mealsSettled, cocktailsSettled] = await Promise.all([Promise.allSettled(mealPromises), Promise.allSettled(cocktailPromises)]);

    const mealResults = mealsSettled.filter((r) => r.status === "fulfilled" && r.value).map((r) => r.value);
    const cocktailResults = cocktailsSettled.filter((r) => r.status === "fulfilled" && r.value).map((r) => r.value);

    favoriteItems.value = [...mealResults, ...cocktailResults].sort((a, b) => {
      const nameA = a.title;
      const nameB = b.title;
      return nameA.localeCompare(nameB);
    });
  } catch (e) {
    console.error("Error loading favorite items in profile:", e);
    favoritesError.value = "Failed to load your favorites. Please try again later.";
  }
};

watch(
  [favoritesLoaded, favoriteMealIds, favoriteCocktailIds],
  ([loaded]) => {
    if (loaded) fetchFavoriteItems();
  },
  { immediate: true }
);

const handleToggleFavorite = ({ id, type }) => {
  if (type === "meal") {
    toggleMealFavorite(id);
  } else if (type === "cocktail") {
    toggleCocktailFavorite(id);
  }
  setTimeout(fetchFavoriteItems, 400);
};

const handleShareItem = ({ title, itemId, itemType }) => {
  if (openShareModal) {
    if (!itemId || !itemType) {
      console.error("Profile Share: Missing itemId or itemType for sharing.");
      alert("Cannot share this item: essential information is missing.");
      return;
    }

    const basePath = itemType === "meal" ? "recipe" : "cocktail"; // Map 'meal' type to 'recipe' path
    const origin = typeof window !== "undefined" ? window.location.origin : "";

    if (!origin && process.client) {
      // Check origin only on client
      console.error("Profile Share: window.location.origin is not available.");
      alert("Cannot generate share link: critical information unavailable.");
      return;
    }
    const shareUrl = `${origin}/${basePath}/${itemId}`;

    openShareModal({
      title,
      url: shareUrl,
      text: `Check out this ${itemType === "meal" ? "recipe" : "cocktail"}: ${title}`,
      type: itemType, // Pass the original itemType ('meal' or 'cocktail') to the modal
    });
  } else {
    console.error("Share modal function not provided in Profile page.");
    alert("Sharing service is currently unavailable.");
  }
};

const { creations, loading: creationsLoading, error: creationsError, fetchUserCreations, deleteUserCreation } = useUserCreations();

const userCreations = creations;

onMounted(() => {
  if (user.value) fetchUserCreations();
});

watch(user, (newUser) => {
  if (newUser) fetchUserCreations();
});

const handleDeleteCreation = async (id) => {
  if (!confirm("Are you sure you want to delete this creation? This cannot be undone.")) return;
  const result = await deleteUserCreation(id);
  if (result && result.error) {
    toast.error("Failed to delete creation: " + result.error);
  } else {
    toast.success("Creation deleted.");
  }
};

definePageMeta({
  middleware: "auth",
});

useHead({
  title: "My Profile | ChloroFill 🍴🍹",
});

const activeTab = ref("favorites");
</script>
