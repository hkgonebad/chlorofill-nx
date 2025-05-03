<template>
  <div class="share-buttons d-flex flex-wrap justify-content-center gap-2">
    <!-- Native Share Button (if available) -->
    <button @click="shareNative" class="btn btn-primary share-btn native-share" title="Share via device options" v-if="canShareNative">
      <i class="pi pi-share-alt me-1"></i>
      <span>Share</span>
    </button>

    <!-- Fallback Links/Buttons (Always present for consistency, hidden if native used potentially?) -->
    <!-- Consider only showing fallbacks if !canShareNative or making native the first button -->
    <a :href="twitterShareUrl" target="_blank" rel="noopener noreferrer" class="btn btn-light share-btn fallback-share" title="Share on Twitter">
      <i class="pi pi-twitter"></i>
      <span class="visually-hidden">Share on Twitter</span>
    </a>
    <a :href="facebookShareUrl" target="_blank" rel="noopener noreferrer" class="btn btn-light share-btn fallback-share" title="Share on Facebook">
      <i class="pi pi-facebook"></i>
      <span class="visually-hidden">Share on Facebook</span>
    </a>
    <a :href="whatsappShareUrl" data-action="share/whatsapp/share" target="_blank" rel="noopener noreferrer" class="btn btn-light share-btn fallback-share" title="Share via WhatsApp">
      <i class="pi pi-whatsapp"></i>
      <span class="visually-hidden">Share via WhatsApp</span>
    </a>
    <button @click="copyLink" class="btn btn-light share-btn fallback-share" :title="copyTitle" :class="{ copied: copied }">
      <i :class="copyIcon"></i>
      <span class="visually-hidden">{{ copyTitle }}</span>
    </button>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from "vue";

const props = defineProps({
  title: {
    type: String,
    required: true,
  },
  text: {
    type: String,
    default: "",
  },
  url: {
    type: String,
    required: true,
  },
});

const canShareNative = ref(false);
const copied = ref(false);
const copyTimeout = ref(null);

onMounted(() => {
  // Check for Web Share API support on client
  if (process.client && navigator.share) {
    canShareNative.value = true;
  }
});

const shareNative = async () => {
  if (!process.client || !navigator.share) return; // Guard clause

  try {
    await navigator.share({
      title: props.title,
      text: props.text,
      url: props.url,
    });
    console.log("Content shared successfully via native share.");
  } catch (error) {
    // Ignore AbortError which happens if user cancels the share sheet
    if (error.name !== "AbortError") {
      console.error("Error using native share:", error);
    }
  }
};

const twitterShareUrl = computed(() => {
  const intentUrl = new URL("https://twitter.com/intent/tweet");
  intentUrl.searchParams.set("url", props.url);
  if (props.text) {
    // Construct text - Twitter counts URLs differently, often good to have text first
    const tweetText = `${props.text.substring(0, 100)}...`; // Keep it concise
    intentUrl.searchParams.set("text", tweetText);
  }
  // Add via handle if desired
  // intentUrl.searchParams.set('via', 'YourTwitterHandle');
  return intentUrl.toString();
});

const facebookShareUrl = computed(() => {
  const fbUrl = new URL("https://www.facebook.com/sharer/sharer.php");
  fbUrl.searchParams.set("u", props.url);
  // Facebook uses the OG tags from the URL, so title/text here aren't usually needed
  return fbUrl.toString();
});

const whatsappShareUrl = computed(() => {
  const waUrl = new URL("https://api.whatsapp.com/send");
  // Include title and URL in the text body
  const shareText = `${props.title}\n${props.text ? props.text.substring(0, 100) + "..." : ""}\n${props.url}`;
  waUrl.searchParams.set("text", shareText);
  return waUrl.toString();
});

const copyLink = async () => {
  if (copied.value || !process.client || !navigator.clipboard) return;

  try {
    await navigator.clipboard.writeText(props.url);
    copied.value = true;
    clearTimeout(copyTimeout.value);
    copyTimeout.value = setTimeout(() => {
      copied.value = false;
    }, 2000);
  } catch (err) {
    console.error("Failed to copy link:", err);
    // Consider using a toast notification instead of alert
    alert("Failed to copy link.");
  }
};

const copyIcon = computed(() => (copied.value ? "pi pi-check" : "pi pi-copy"));
const copyTitle = computed(() => (copied.value ? "Link Copied!" : "Copy Link"));

// Clear timeout on unmount
onBeforeUnmount(() => {
  if (process.client) {
    clearTimeout(copyTimeout.value);
  }
});
</script>
