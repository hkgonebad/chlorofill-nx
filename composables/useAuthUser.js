import { ref, onMounted } from "vue";
import { supabase } from "../supabaseClient";

// Reactive state for user and profile
const user = ref(null);
const profile = ref(null);
const loading = ref(true);

export function useAuthUser() {
	// Get current user session and profile
	const fetchSession = async () => {
		loading.value = true;
		try {
			const {
				data: { session },
				error,
			} = await supabase.auth.getSession();
			if (error) throw error;

			user.value = session?.user || null;

			if (user.value) {
				// Fetch profile if user is logged in
				const { data: profileData, error: profileError } =
					await supabase
						.from("profiles")
						.select(`username, full_name, avatar_url`)
						.eq("id", user.value.id)
						.single();

				if (profileError) {
					console.error(
						"Error fetching profile:",
						profileError.message
					);
					profile.value = null;
					// Don't throw, maybe profile creation failed or RLS prevents access
				} else {
					profile.value = profileData;
				}
			} else {
				profile.value = null; // Clear profile if no user
			}
		} catch (e) {
			console.error("Error fetching session:", e.message);
			user.value = null;
			profile.value = null;
		} finally {
			loading.value = false;
		}
	};

	// Listen for auth state changes
	const listenForAuthStateChange = () => {
		supabase.auth.onAuthStateChange((event, session) => {
			console.log("Auth state changed:", event, session);
			// Refetch session and profile details on sign-in or sign-out
			fetchSession();
		});
	};

	// Initial fetch and listener setup
	onMounted(() => {
		fetchSession();
		listenForAuthStateChange();
	});

	return {
		user,
		profile,
		loading, // Expose loading state
		fetchSession, // Expose fetch function if manual refresh needed
	};
}
