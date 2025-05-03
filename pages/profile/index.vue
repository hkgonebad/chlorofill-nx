<template>
  <div class="profile-view container py-5">
    <h2 class="section-title mb-4">My Profile</h2>

    <div v-if="pendingProfile && !profileData" class="text-center py-5">
      <div class="spinner-border" role="status">
        <span class="visually-hidden">Loading...</span>
      </div>
    </div>

    <div v-else-if="profileError" class="alert alert-danger">Could not load profile data: {{ profileError.message }}</div>

    <div v-else-if="user && profileData" class="row g-4">
      <!-- User Info & Avatar Card -->
      <div class="col-lg-7">
        <div class="card h-100 shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-4">Account Information</h5>
            <div class="row">
              <div class="col-md-4 text-center mb-3 mb-md-0">
                <img :src="profileData.avatar_url || '/img/avatar-placeholder.png'" alt="User Avatar" class="img-thumbnail rounded-circle profile-avatar mb-2" width="150" height="150" />
                <div class="mt-2">
                  <button class="btn btn-sm btn-outline-secondary" disabled title="Avatar upload coming soon">Change Avatar</button>
                  <div class="form-text">Feature coming soon</div>
                </div>
              </div>
              <div class="col-md-8">
                <!-- Profile Update Form -->
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

      <!-- Other Settings Column -->
      <div class="col-lg-5">
        <!-- Security Card -->
        <div class="card mb-4 shadow-sm">
          <div class="card-body">
            <h5 class="card-title mb-3">Security</h5>

            <!-- Change Password Form -->
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

            <!-- Logout Button -->
            <div class="mt-3">
              <h6>Logout</h6>
              <button @click="handleLogout" class="btn btn-danger" :disabled="formDisabled">
                <span v-if="logoutLoading" class="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                Logout
              </button>
            </div>

            <hr />

            <!-- Account Deletion -->
            <div class="mt-3">
              <h6>Delete Account</h6>
              <p class="text-muted small">Account deletion is currently unavailable. Please contact support if needed.</p>
              <button class="btn btn-outline-danger" disabled>Delete My Account</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <div v-else-if="user && !profileData && !pendingProfile && !profileError" class="alert alert-warning">Could not load profile details. Please try again later or contact support.</div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed, watch } from "vue";
import { useSupabaseUser, useSupabaseClient, useAsyncData, navigateTo, useHead } from "#imports";
import { useToast } from "vue-toastification";

const user = useSupabaseUser();
const client = useSupabaseClient();
const toast = useToast();

const profileData = ref(null);
const editableProfile = reactive({
  username: "",
  full_name: "",
  avatar_url: "",
});
const originalProfile = reactive({ username: "", full_name: "" });

const newPassword = ref("");
const confirmPassword = ref("");

const {
  pending: pendingProfile,
  error: profileError,
  refresh: refreshProfile,
} = useAsyncData(
  "fetch-profile",
  async () => {
    if (!user.value) return null;
    console.log("Fetching profile for user:", user.value.id);
    const { data, error } = await client.from("profiles").select(`username, full_name, avatar_url`).eq("id", user.value.id).single();

    if (error) {
      console.error("Error fetching profile:", error);
      toast.error("Could not load profile: " + error.message);
      throw error;
    }
    if (data) {
      console.log("Profile data received:", data);
      profileData.value = data;
      editableProfile.username = data.username;
      editableProfile.full_name = data.full_name;
      editableProfile.avatar_url = data.avatar_url;
      originalProfile.username = data.username;
      originalProfile.full_name = data.full_name;
    }
    return data;
  },
  { immediate: true, watch: [user] }
);

const updateLoading = ref(false);
const passwordChangeLoading = ref(false);
const logoutLoading = ref(false);
const avatarUploading = ref(false);

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

const handleAvatarUpload = async (event) => {
  toast.info("Avatar upload functionality is not yet implemented.");
};

definePageMeta({
  middleware: "auth",
});

useHead({
  title: "My Profile | ChloroFill 🍴🍹",
});
</script>
