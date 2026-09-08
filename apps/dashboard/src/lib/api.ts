import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "/api/v1",
  withCredentials: true,
});

// Intercept all request and attch the session token manually
api.interceptors.request.use(async (config) => {
  try {
    // check if better-auth has stored the token locally
    const token = localStorage.getItem("better-auth.session_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (err) {
    console.error(">> No token found", err);
  }

  return config;
});
