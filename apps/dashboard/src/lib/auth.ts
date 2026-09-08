import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

// Safely handle relative URLs for proxies without crashing Better Auth
const rawAuthUrl = import.meta.env.VITE_AUTH_URL || "/api/auth";
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
