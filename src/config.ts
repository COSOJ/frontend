// Base URL of the COSOJ backend API. Configurable at build time via
// VITE_API_BASE so the same bundle can target dev / staging / production.
export const API_BASE =
  (import.meta.env.VITE_API_BASE as string | undefined) ||
  'http://localhost:3000';
