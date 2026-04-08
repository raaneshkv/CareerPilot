/**
 * Centralized API configuration.
 *
 * On Vercel:  set VITE_API_URL to your deployed backend URL
 *             (e.g. https://careerpilot-backend.onrender.com)
 * Locally:    falls back to http://localhost:8000
 */
export const API_URL =
  import.meta.env.VITE_API_URL || "http://localhost:8000";
