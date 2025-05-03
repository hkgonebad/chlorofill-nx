<template>
	<div
		v-if="message"
		class="error-message alert alert-danger my-4"
		role="alert"
	>
		<strong>Error:</strong> {{ message }}
		<!-- Optional: Add retry button or more details -->
	</div>
</template>

<script setup>
const props = defineProps({
	message: {
		type: String,
		default: "An unexpected error occurred.",
	},
});
</script>

<style scoped>
/* Add custom styling if needed */
</style>
