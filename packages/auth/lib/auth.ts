import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { dbClient } from "@atlas/database";
import { env } from "@atlas/config";

export const auth = betterAuth({
  baseURL: env.BETTER_AUTH_URL,
  basePath: "/api/auth",
  database: drizzleAdapter(dbClient, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
});
