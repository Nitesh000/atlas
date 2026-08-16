import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { env } from "@atlas/config";

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/*",
  dialect: "postgresql",
  dbCredentials: {
    url: env.DATABASE_URL!,
  },
});
