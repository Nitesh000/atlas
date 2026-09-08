import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

// Force local dev to route through the Vite proxy to bypass Chrome's cross-origin cookie blockers
const isDev = import.meta.env.DEV;
const rawAuthUrl = isDev ? "http://localhost:5173/api/auth" : (import.meta.env.VITE_AUTH_URL || "/api/auth");

const resolvedBaseURL = rawAuthUrl.startsWith("http")
  ? rawAuthUrl
  : typeof window !== "undefined"
    ? `${window.location.origin}${rawAuthUrl}`
    : rawAuthUrl;

export const authClient = createAuthClient({
  baseURL: resolvedBaseURL,
  plugins: [jwtClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
