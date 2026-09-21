import axios from "axios";
import { SESSION_TOKEN_KEY } from "./auth";

export const API_BASE_URL = import.meta.env.DEV
  ? "/api/v1"
  : (import.meta.env.VITE_API_URL || "https://atlas-1azo.onrender.com/api/v1");

export const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = window.localStorage.getItem(SESSION_TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response?.status === 401 &&
      window.location.pathname !== "/login"
    ) {
      window.localStorage.removeItem(SESSION_TOKEN_KEY);
      window.location.href = "/login";
    }
    return Promise.reject(error);
  },
);
