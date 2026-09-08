import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

export const SESSION_TOKEN_KEY = "better-auth.session_token";

// Use the Vite proxy locally. In production the frontend and API are hosted on
// different domains, so the auth client must call the Render URL directly.
const rawAuthUrl = import.meta.env.DEV
  ? "http://localhost:5173/api/auth"
  : (import.meta.env.VITE_AUTH_URL || "https://atlas-1azo.onrender.com/api/auth");

const resolvedBaseURL = rawAuthUrl.startsWith("http")
  ? rawAuthUrl
  : typeof window !== "undefined"
    ? `${window.location.origin}${rawAuthUrl}`
    : rawAuthUrl;

// Better Auth's bearer plugin returns the session token in a response header,
// not in signIn.email().data. Persist that token for the API Axios client.
const storeBearerToken = {
  id: "store-bearer-token",
  name: "Store bearer token",
  hooks: {
    onSuccess({ response }: { response: Response }) {
      const token = response.headers.get("set-auth-token");
      if (token && typeof window !== "undefined") {
        window.localStorage.setItem(SESSION_TOKEN_KEY, token);
      }
    },
  },
};

export const authClient = createAuthClient({
  baseURL: resolvedBaseURL,
  fetchOptions: {
    credentials: "include",
    plugins: [storeBearerToken],
  },
  plugins: [jwtClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
