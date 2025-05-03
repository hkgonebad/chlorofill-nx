<template>
  <section class="block about-view py-5">
    <div class="container">
      <h1 class="text-center mb-4">About ChloroFill 🌍🥑</h1>

      <div class="row justify-content-center">
        <div class="col-md-8">
          <p class="lead text-center mb-4">Welcome to ChloroFill, your destination for delicious recipes and exciting cocktails!</p>
          <p>
            This website showcases a wide variety of meals sourced from
            <a href="https://www.themealdb.com/" target="_blank" rel="noopener noreferrer">TheMealDB</a>
            API and delightful cocktail recipes from
            <a href="https://www.thecocktaildb.com/" target="_blank" rel="noopener noreferrer">TheCocktailDB</a>
            API.
          </p>
          <p>Our goal is to provide a clean, easy-to-navigate platform for discovering new culinary creations and drinks. Whether you're looking for dinner ideas or planning your next party, we hope you find inspiration here.</p>
          <p>
            This project was built using modern web technologies including Nuxt 3 (migrated from Vue 3/Vite), and Bootstrap, demonstrating how to integrate external APIs into a dynamic web application with Server-Side Rendering. It also
            features light/dark mode theming and uses local storage for saving your favorite recipes and cocktails.
          </p>
          <p class="text-center mt-4">Happy cooking and mixing!</p>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
// Use Nuxt's useHead for managing page metadata
useHead({
  title: "About Us | ChloroFill 🍴🍹",
  meta: [
    {
      name: "description",
      content: "Learn more about ChloroFill, the project showcasing recipes from TheMealDB and cocktails from TheCocktailDB.",
    },
    // Add other meta tags like Open Graph if needed for this specific page
  ],
});
</script>
