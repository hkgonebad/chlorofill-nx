// Bootstrap plugin - Client only
export default defineNuxtPlugin({
  name: "bootstrap-client",
  mode: "client", // Explicitly set to client-only
  async setup(nuxtApp) {
    console.log("[Bootstrap Plugin] Attempting to load Bootstrap JS...");
    try {
      // Import Bootstrap JS (bundle includes Popper)
      await import("bootstrap/dist/js/bootstrap.bundle.min.js");
      console.log("[Bootstrap Plugin] Bootstrap JS loaded");
    } catch (err) {
      console.error("[Bootstrap Plugin] Failed to load Bootstrap JS:", err);
    }
  },
});
