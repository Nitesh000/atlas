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
