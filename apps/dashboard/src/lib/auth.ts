import { createAuthClient } from "better-auth/react";
import { jwtClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: import.meta.env.VITE_AUTH_URL,
  plugins: [jwtClient()],
});

export const { signIn, signUp, signOut, useSession } = authClient;
