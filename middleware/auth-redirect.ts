// middleware/auth-redirect.ts
export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();

  // If the user is logged in and trying to access /login or /signup,
  // redirect them to the home page (or profile page, as preferred).
  if (user.value && (to.path === "/login" || to.path === "/signup")) {
    console.log("Auth-Redirect Middleware: User already logged in, redirecting to /");
    return navigateTo("/"); // Or '/profile'
  }

  // Allow navigation otherwise (if user is not logged in, or route is not /login or /signup)
});
