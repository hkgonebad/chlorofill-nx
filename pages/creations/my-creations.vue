<template>
  <div class="container py-5">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 class="sectionTitle">My Creations</h2>
      <NuxtLink to="/creations/new" class="btn btn-primary">+ New Creation</NuxtLink>
    </div>
    <div v-if="loading" class="text-center py-5">
      <span class="spinner-border" role="status"></span>
    </div>
    <div v-else-if="creations.length === 0" class="alert alert-info">You haven't created any recipes or cocktails yet.</div>
    <div v-else class="row g-4">
      <div v-for="creation in creations" :key="creation.id" class="col-md-6 col-lg-4">
        <ItemCard
          :imageUrl="creation.image_path || '/img/no-recipe.jpg'"
          :title="creation.title"
          :descriptionText="creation.description"
          :linkTo="creation.type === 'cocktail' ? `/cocktail/${creation.id}` : `/recipe/${creation.id}`"
          :itemId="creation.id"
          :itemType="creation.type === 'cocktail' ? 'cocktail' : 'meal'"
          :isUserCreation="true"
          :showMenu="true"
          :onEdit="() => editCreation(creation)"
          :onDelete="() => deleteCreation(creation)"
          :isOwner="true"
          @toggle-favorite="handleFavorite"
          @share-item="handleShare"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
import { useRouter } from "vue-router";
import { useToast } from "vue-toastification";
import { useUserCreations } from "~/composables/useUserCreations";
import ItemCard from "~/components/ItemCard.vue";

const { creations, loading, fetchUserCreations, deleteUserCreation } = useUserCreations();
const router = useRouter();
const toast = useToast();

onMounted(() => {
  fetchUserCreations();
});

const editCreation = (creation) => {
  router.push(`/creations/${creation.id}`);
};

const deleteCreation = async (creation) => {
  if (!confirm("Are you sure you want to delete this creation? This cannot be undone.")) return;
  const { error } = await deleteUserCreation(creation.id);
  if (error) {
    toast.error("Failed to delete: " + error);
  } else {
    toast.success("Deleted successfully.");
    fetchUserCreations();
  }
};

const handleFavorite = () => {
  toast.info("Favorites are not available for your own creations yet.");
};

const handleShare = (item) => {
  // Use the global share modal if available, or fallback
  const openShareModalFunc = inject("openShareModal");
  if (openShareModalFunc) {
    const itemType = item.itemType === "meal" ? "recipe" : "cocktail";
    const shareUrl = `${window.location.origin}/${itemType}/${item.itemId}`;
    openShareModalFunc({
      title: item.title,
      url: shareUrl,
      text: `Check out this creation: ${item.title}`,
      type: itemType,
    });
  } else {
    toast.info("Share functionality coming soon!");
    console.error("Share modal function not provided.");
  }
};
</script>

<style scoped></style>
