// Auth middleware
export default defineNuxtRouteMiddleware((to) => {
  // useSupabaseUser() is auto-imported by the Nuxt Supabase module
  const user = useSupabaseUser();

  // Define protected routes (example: profile page)
  const protectedRoutes = ["/profile"]; // Add other protected routes here

  // Check if the target route is protected
  const isProtectedRoute = protectedRoutes.some((path) => to.path.startsWith(path));

  // If it is a protected route and the user is not logged in, redirect to login
  if (isProtectedRoute && !user.value) {
    console.log("Auth Middleware: User not logged in, redirecting to /login");
    return navigateTo("/login");
  }

  // Allow navigation otherwise
  // No return statement means navigation proceeds
});
