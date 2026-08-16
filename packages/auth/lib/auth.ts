import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { dbClient } from "@atlas/database";

export const auth = betterAuth({
  database: drizzleAdapter(dbClient, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
  },
});
