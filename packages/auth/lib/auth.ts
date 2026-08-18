import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { dbClient } from "@atlas/database";
import { env } from "@atlas/config";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  trustedOrigins: ["http://localhost:5173", "http://localhost:5174"],
  database: drizzleAdapter(dbClient, {
    provider: "pg",
  }),
  secret: env.BETTER_AUTH_SECRET,
  emailAndPassword: {
    enabled: true,
  },
});
