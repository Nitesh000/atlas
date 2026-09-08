import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { bearer, jwt } from "better-auth/plugins";
import { dbClient } from "@atlas/database";
import { env } from "@atlas/config";

const useCrossSiteCookies =
  env.NODE_ENV === "production" || env.BETTER_AUTH_URL.startsWith("https://");

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  trustedOrigins: [
    "http://localhost:5173",
    "http://localhost:5174",
    "http://localhost:3000",
    ...env.FRONTEND_URLS,
  ],
  plugins: [bearer(), jwt()],
  advanced: {
    trustHost: true,
    defaultCookieAttributes: {
      // Render and Vercel are cross-site in production; local development uses
      // the Vite proxy over HTTP and therefore cannot use Secure cookies.
      sameSite: useCrossSiteCookies ? "none" : "lax",
      secure: useCrossSiteCookies,
      path: "/",
    },
  },
  database: drizzleAdapter(dbClient, {
    provider: "pg",
  }),
  secret: env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
});
