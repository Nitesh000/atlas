import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { env } from "@atlas/config";
import { fullSchema as schema } from "./db/index.js";

export const name = "@atlas/database";

export const queryClient = postgres(env.DATABASE_URL);
export const dbClient = drizzle(queryClient, { schema });

export * from "./db/index.js";
