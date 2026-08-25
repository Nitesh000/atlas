import axios from "axios";

const rawApiUrl = import.meta.env.VITE_API_URL || "/api/v1";
const resolvedBaseURL = rawApiUrl.startsWith("http") 
  ? rawApiUrl 
  : typeof window !== "undefined" ? `${window.location.origin}${rawApiUrl}` : rawApiUrl;

export const api = axios.create({
  baseURL: resolvedBaseURL,
  withCredentials: true,
});
