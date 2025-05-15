# ChloroFill - A Nuxt Recipe 🍴🍹

[![Powered by Nuxt](https://img.shields.io/badge/Powered_by-Nuxt-00DC82?style=flat-square&logo=nuxt.js&logoColor=white)](https://nuxt.com/)
[![Made with Vue.js](https://img.shields.io/badge/Made_with-Vue.js-4FC08D?style=flat-square&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![Managed with Bun](https://img.shields.io/badge/Managed_with-Bun-FBF0DF?style=flat-square&logo=bun&logoColor=black)](https://bun.sh/)
[![Styled with Bootstrap](https://img.shields.io/badge/Styled_with-Bootstrap-7952B3?style=flat-square&logo=bootstrap&logoColor=white)](https://getbootstrap.com/)
[![Powered by Supabase](https://img.shields.io/badge/Powered_by-Supabase-3ECF8E?style=flat-square&logo=supabase&logoColor=white)](https://supabase.com/)

ChloroFill (Nuxt Edition) is a web application showcasing meal and cocktail recipes, built with Vue 3 and Nuxt 3, leveraging Server-Side Rendering (SSR) for enhanced SEO and performance. It is a migration from the original ChloroFill Vue SPA.

The original Vue 3 SPA version can be found here: [ChloroFill Vue 3 SPA](https://github.com/hkgonebad/chlorofill).

## Project Overview

This project demonstrates migrating a feature-rich Vue 3 SPA to the Nuxt 3 framework to gain the benefits of SSR, file-based routing, and Nuxt's ecosystem.

Key features inherited and adapted from the original SPA:

* **Vue 3 (Composition API):** Utilizing `<script setup>` for clean component development.
* **Nuxt 3:** Providing SSR, file-based routing, auto-imports, and module integration for a modern, performant web application.
* **Supabase Full-Stack Integration:**
    *   **Authentication:** Robust user authentication (Signup, Login with Email/Username, Magic Link, Logout) managed via `@nuxtjs/supabase`.
    *   **Database:** PostgreSQL backend for comprehensive profile management (including usernames, theme preferences), user-generated recipes/cocktails, and favorites.
    *   **Storage:** Securely handles user avatar uploads and all images associated with user-created content (main recipe/cocktail images, individual ingredient images) using Supabase Storage, including deletion of old assets.
    *   **Edge Functions:** Leveraged for backend logic such as sending email notifications to moderators upon new content submission, complete with JWT-based one-click approval links.
* **Advanced User-Generated Content (UGC) System:**
    *   **Create, Read, Update, Delete (CRUD):** Users can create, view, edit, and delete their own recipes and cocktails.
    *   **Rich Content Forms:** Intuitive multi-step forms for content creation, featuring dynamic addition/removal of ingredients and steps, and dedicated image uploads for the main creation and each ingredient.
    *   **Image Processing & Validation:** Client-side image validation (type, dimensions guidance) and compression using a shared `useImageUpload` composable.
    *   **Seamless Integration:** UGC is fully integrated into all site features, including global search (appearing alongside API results), category listings, and dedicated detail pages.
    *   **Content Management:** Users have a dedicated "My Creations" page to manage their content, with visibility of pending submissions.
    *   **Moderation Foundation:** Initial moderation system implemented, including database flags (`is_approved`, `is_flagged`) and automated email notifications to administrators for new content.
* **External APIs:** Fetching recipe data from TheMealDB and TheCocktailDB via composables, with results cached for performance.
* **Unified Search:** Global search functionality (header autocomplete and full-screen modal) seamlessly queries and merges results from both external APIs and approved user-generated content, providing a comprehensive discovery experience.
* **Routing:** File-based routing managed by Nuxt.
* **Styling:** Responsive design using Bootstrap 5 (SCSS) integrated via Nuxt config and global assets.
* **State Management:** Primarily using Vue Composables, potentially enhanced with Pinia (`@pinia/nuxt`).
* **Meta Tags:** Dynamic page titles and meta descriptions managed via Nuxt's built-in `useHead` composable.

## Why Nuxt?

* **Server-Side Rendering (SSR):** Improves initial load performance and SEO.
* **Dynamic Meta Tags:** Enables unique meta tags for dynamic routes, enhancing social sharing.
* **File-Based Routing:** Simplifies route management.
* **Auto Imports:** Reduces boilerplate for importing components and composables.
* **Module Ecosystem:** Leverages modules like `@nuxtjs/supabase`, `@nuxtjs/color-mode`, etc.

## Technology Stack (Nuxt Version)

* **Framework:** Nuxt 3 (using Vue 3 Composition API)
* **Package Manager:** Bun
* **Backend:** Supabase (Auth, Database) via `@nuxtjs/supabase`
* **Routing:** Nuxt File-Based Routing
* **Styling:** Bootstrap 5 (SCSS), PrimeIcons
* **State Management:** Vue Composables (potentially Pinia)
* **APIs:** TheMealDB, TheCocktailDB (via Composables)
* **Libraries & Modules:** `@nuxtjs/google-fonts`, `@pinia/nuxt`, `@vueuse/nuxt`, `vue-toastification`, `lodash-es`, `swiper`, `@nuxtjs/color-mode` (for theme)

## Project Setup

1. **Clone the repository:**

    ```bash
    # Make sure you are in the chlorofill-nuxt directory
    git clone <your-repo-url> chlorofill-nuxt
    cd chlorofill-nuxt
    ```

2. **Install dependencies:**

    ```bash
    bun install
    ```

3. **Environment Setup:**
    * Create a `.env` file in the root directory.
    * Add your Supabase credentials (obtain from your Supabase project settings):

        ```dotenv
        # Required by @nuxtjs/supabase
        SUPABASE_URL=YOUR_SUPABASE_URL
        SUPABASE_KEY=YOUR_SUPABASE_ANON_KEY 
        
        # Optional: For redirect URLs if needed
        # SUPABASE_REDIRECT_URL=http://localhost:3000/confirm 
        ```

4. **Run the development server:**

    ```bash
    bun run dev
    ```

    The application will be available at `http://localhost:3000`.

## Development Notes

* **Composables:** API logic (`useMealApi`, `useCocktailApi`), state management (`useFavorites`, `useTheme`), etc., are located in the `composables/` directory.
* **Components:** Reusable UI components are in `components/`.
* **Pages:** Top-level routes and views are defined by `.vue` files in the `pages/` directory.
* **Layouts:** Define overall page structure (e.g., `default.vue`, `auth.vue`) in the `layouts/` directory.
* **Styling:** Global styles and Bootstrap integration are managed in `assets/scss/main.scss`.
* **Configuration:** Nuxt behavior, modules, and environment variables are configured in `nuxt.config.ts`.

## Deployment (Vercel Example)

1. Push your code to a Git provider.
2. Import the project into Vercel.
3. Configure Vercel settings:
    * **Framework Preset:** Nuxt
    * **Install Command:** `bun install` (or `npm install` if you switch)
    * **Environment Variables:** Add `SUPABASE_URL` and `SUPABASE_KEY` with your Supabase project values.
4. Deploy!

## Future Enhancements

* Advanced User Content Features: Comprehensive admin moderation panel, user reporting system, content rating/commenting, and advanced filtering for UGC.
* Recipe/Cocktail rating system
* Advanced filtering options

## License

[MIT License](LICENSE)

