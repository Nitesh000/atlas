import { createAuthClient } from "better-auth/react";

// Safely handle relative URLs for Vercel Rewrites without crashing Better Auth
const rawAuthUrl = import.meta.env.VITE_AUTH_URL || "/api/auth";
const resolvedBaseURL = rawAuthUrl.startsWith("http")
  ? rawAuthUrl
  : typeof window !== "undefined"
    ? `${window.location.origin}${rawAuthUrl}`
    : rawAuthUrl;

export const authClient = createAuthClient({
  baseURL: resolvedBaseURL,
});

export const { signIn, signUp, signOut, useSession } = authClient;
