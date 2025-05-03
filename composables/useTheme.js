import { ref, computed, onMounted, onUnmounted } from "vue";

const LOCAL_STORAGE_KEY = "preferred_theme";
// Default to 'light' on server, will be updated on client mount
const currentTheme = ref("light");

// Function to apply the theme to the DOM and save preference
const applyTheme = (theme) => {
  // This function manipulates DOM and localStorage, only run on client
  if (!process.client) return;

  if (theme !== "light" && theme !== "dark") {
    // console.warn(`Invalid theme value: ${theme}. Defaulting to light.`);
    theme = "light";
  }

  document.documentElement.setAttribute("data-bs-theme", theme);
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, theme);
    // console.log(`Theme applied and saved: ${theme}`);
  } catch (e) {
    console.error("Failed to save theme preference to localStorage:", e);
  }
  // Update the ref *after* potentially saving, ensuring reactivity
  currentTheme.value = theme;
};

// Function to determine and apply the initial theme on the client
export const initializeTheme = () => {
  if (!process.client) return;

  let initialTheme = "dark"; // <-- Change default assumption to dark
  try {
    const savedTheme = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (savedTheme === "light" || savedTheme === "dark") {
      initialTheme = savedTheme;
      // console.log(`Loaded theme from localStorage: ${initialTheme}`);
    } else {
      // No valid saved theme, check system preference
      if (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) {
        initialTheme = "dark";
        // console.log("Using system preference: dark");
      } else {
        initialTheme = "light"; // Default light if system is light or preference cannot be determined
        // console.log("Using system preference: light (or default)");
      }
    }
  } catch (e) {
    console.error("Failed to access localStorage or matchMedia:", e);
    // Fallback to default light theme
    initialTheme = "light";
  }
  // Apply the determined theme (which updates currentTheme.value)
  applyTheme(initialTheme);
};

// Function to toggle the theme (implicitly client-side via applyTheme)
const toggleTheme = () => {
  // Ensure currentTheme ref reflects the actual current theme before toggling
  // This relies on initializeTheme having run on the client already.
  const newTheme = currentTheme.value === "dark" ? "light" : "dark";
  applyTheme(newTheme);
};

// Listener for system theme changes (optional but good UX)
let mediaQueryListener = null;
const setupSystemThemeListener = () => {
  if (!process.client || !window.matchMedia) return;

  mediaQueryListener = (e) => {
    try {
      // Only apply system change if no user preference is explicitly saved
      if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
        console.log("System theme changed, applying...");
        applyTheme(e.matches ? "dark" : "light");
      }
    } catch (err) {
      /* Ignore localStorage errors here */
    }
  };
  window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change", mediaQueryListener);
};

const removeSystemThemeListener = () => {
  if (!process.client || !mediaQueryListener || !window.matchMedia) return;
  try {
    window.matchMedia("(prefers-color-scheme: dark)").removeEventListener("change", mediaQueryListener);
    mediaQueryListener = null;
  } catch (err) {
    /* Ignore errors */
  }
};

// Composable function
export function useTheme() {
  // Initialize theme and setup listener on client mount
  onMounted(() => {
    initializeTheme();
    setupSystemThemeListener();
  });

  // Cleanup listener
  onUnmounted(removeSystemThemeListener);

  // Expose theme state and actions
  return {
    // initializeTheme, // Expose only if needed externally, usually called on mount
    toggleTheme,
    currentTheme: computed(() => currentTheme.value), // Read-only computed ref
    isDarkMode: computed(() => currentTheme.value === "dark"),
  };
}
