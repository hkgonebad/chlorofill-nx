// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2024-11-01",
  devtools: { enabled: true },

  // Modules
  modules: ["@nuxtjs/supabase", "@pinia/nuxt", "@vueuse/nuxt", "@nuxtjs/google-fonts"],

  // CSS
  css: ["bootstrap/dist/css/bootstrap.min.css", "vue-toastification/dist/index.css", "primeicons/primeicons.css", "@/assets/scss/main.scss"],

  // App configuration
  app: {
    head: {
      title: "ChloroFill 🍴🍹 - A Vue Recipe",
      meta: [
        { charset: "utf-8" },
        { name: "viewport", content: "width=device-width, initial-scale=1" },
        { name: "description", content: "Discover and explore delicious recipes and cocktails with ChloroFill 🍴🍹" },
        { name: "author", content: "Harikrishna Nair" },
        { property: "og:title", content: "ChloroFill 🍴🍹 - A Vue Recipe" },
        { property: "og:description", content: "Discover and explore delicious recipes and cocktails with ChloroFill 🍴🍹" },
        { property: "og:image", content: "https://chlorofill.vercel.app/img/og-default.jpg" },
        { property: "og:url", content: "https://chlorofill.vercel.app" },
        { property: "og:type", content: "website" },
        { property: "og:site_name", content: "ChloroFill" },
        { name: "twitter:card", content: "summary_large_image" },
        { name: "twitter:title", content: "ChloroFill 🍴🍹 - A Vue Recipe" },
        { name: "twitter:description", content: "Discover and explore delicious recipes and cocktails with ChloroFill 🍴🍹" },
        { name: "twitter:image", content: "https://chlorofill.vercel.app/img/og-default.jpg" },
        { name: "google-site-verification", content: "J8XII2yJpqGYwWIrVml_CL7Y2bdRlT_zIKQVagmuq6U" },
      ],
      link: [
        { rel: "icon", type: "image/png", href: "/favicon-96x96.png", sizes: "96x96" },
        { rel: "icon", type: "image/svg+xml", href: "/favicon.svg" },
        { rel: "shortcut icon", href: "/favicon.ico" },
        { rel: "apple-touch-icon", sizes: "180x180", href: "/apple-touch-icon.png" },
        { rel: "manifest", href: "/site.webmanifest" },
        { rel: "preconnect", href: "https://www.themealdb.com" },
        { rel: "preconnect", href: "https://www.thecocktaildb.com" },
        { rel: "preconnect", href: "https://www.googletagmanager.com" },
      ],
      script: [
        {
          src: "https://www.googletagmanager.com/gtag/js?id=G-EXP4CKP0TN",
          async: true,
        },
        {
          innerHTML: `
            window.dataLayer = window.dataLayer || [];
            function gtag() { dataLayer.push(arguments); }
            gtag('js', new Date());
            gtag('config', 'G-EXP4CKP0TN');
          `,
        },
      ],
      noscript: [{ innerHTML: "This website requires JavaScript to function properly." }],
    },
  },

  // Environment variables accessible via useRuntimeConfig()
  runtimeConfig: {
    public: {
      supabaseUrl: process.env.NUXT_PUBLIC_SUPABASE_URL || "",
      supabaseKey: process.env.NUXT_PUBLIC_SUPABASE_KEY || "",
    },
  },

  // Supabase module specific options
  supabase: {
    // URL and Key are automatically picked up from runtimeConfig
    redirectOptions: {
      login: "/login",
      callback: "/confirm", // Changed from /callback to /confirm for Supabase auth flow
      exclude: ["/", "/about", "/categories/**", "/offers", "/cocktails/**", "/recipe/**", "/cocktail/**", "/areas/**", "/browse/**"],
    },
    // Optional: Client options can be added here if needed
    // clientOptions: {
    //   auth: {
    //     persistSession: true
    //   }
    // }
  },

  // Google Fonts
  googleFonts: {
    families: {
      Poppins: [400, 500, 600, 700],
      "Open+Sans": [400, 500, 600],
    },
    display: "swap",
  },

  // Build configuration
  build: {
    transpile: ["vue-toastification"],
  },

  // Optimization for Vercel deployment
  nitro: {
    preset: "vercel",
  },

  // SCSS configuration
  vite: {
    css: {
      preprocessorOptions: {
        scss: {
          // Make sure the path is correct relative to the project root
          additionalData: '@import "@/assets/scss/layout/_variables.scss";',
        },
      },
    },
  },
});
