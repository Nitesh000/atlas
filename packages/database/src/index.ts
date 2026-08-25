import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "@atlas/config";
import { fullSchema as schema, appSchema, authSchema } from "./db/index.js";

export const name = "@atlas/database";

export const queryClient = postgres(
  env.DATABASE_URL || "postgres://localhost:5432/atlas",
);
export const dbClient = drizzle(queryClient, { schema });

export * from "./db/index.js";
export { appSchema, authSchema };
