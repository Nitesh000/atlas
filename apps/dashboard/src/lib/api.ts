import axios from "axios";

// Force local dev to route through the Vite proxy to bypass Chrome's cross-origin cookie blockers
const isDev = import.meta.env.DEV;
export const api = axios.create({
  baseURL: isDev ? "/api/v1" : import.meta.env.VITE_API_URL,
  withCredentials: true,
});

api.interceptors.request.use(async (config) => {
  try {
    const token = localStorage.getItem("better-auth.session_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error(">> No token found", err);
  }
  return config;
});
