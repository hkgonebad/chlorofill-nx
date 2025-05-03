<template>
	<div class="col">
		<div class="card cocktail-card h-100 text-center shadow-sm">
			<router-link :to="linkTo" class="card-link-wrapper">
				<img
					:src="imageUrl"
					class="card-img-top cocktail-thumb"
					:alt="title"
					loading="lazy"
				/>
			</router-link>
			<div class="card-body d-flex flex-column justify-content-between">
				<h5 class="card-title">{{ title }}</h5>
				<p
					v-if="subtitle"
					class="card-text small text-muted flex-grow-1"
				>
					{{ truncatedSubtitle }}
				</p>
				<!-- Optional slot for buttons or extra info -->
				<div class="mt-auto">
					<slot name="actions">
						<!-- Default action if slot not provided -->
						<router-link
							:to="linkTo"
							class="btn btn-sm btn-outline-secondary"
							>View Cocktail</router-link
						>
					</slot>
				</div>
			</div>
		</div>
	</div>
</template>

<script setup>
import { computed } from "vue";
import { RouterLink } from "vue-router";

const props = defineProps({
	imageUrl: {
		type: String,
		required: true,
	},
	title: {
		type: String,
		required: true,
	},
	subtitle: {
		type: String,
		default: "",
	},
	linkTo: {
		// Can be a string path or a route object
		type: [String, Object],
		required: true,
	},
	subtitleLength: {
		type: Number,
		default: 100, // Max length for subtitle before truncating
	},
});

// Truncate subtitle if it exceeds the specified length
const truncatedSubtitle = computed(() => {
	if (props.subtitle && props.subtitle.length > props.subtitleLength) {
		return props.subtitle.substring(0, props.subtitleLength) + "...";
	}
	return props.subtitle;
});
</script>

<style scoped></style>
