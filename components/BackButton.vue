<template>
	<button
		@click="goBack"
		class="btn btn-light btn-sm rounded-circle me-3 back-button-icon"
	>
		<i class="pi pi-arrow-left me-1"></i>
	</button>
</template>

<script setup>
import { useRouter } from "vue-router";

const router = useRouter();

const goBack = () => {
	router.back();
};
</script>

<style scoped>
/* No scoped styles needed initially, rely on global styles */
/* Add a .back-button class rule to a global scss file if custom styling is needed */
</style>
