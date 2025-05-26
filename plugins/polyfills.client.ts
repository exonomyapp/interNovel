// Client-side polyfills
export default defineNuxtPlugin(() => {
  // Add any necessary client-side polyfills here
  if (typeof window !== 'undefined') {
    // Example: Add any required polyfills
    // window.global = window;
  }
}); 