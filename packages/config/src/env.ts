import { z } from "zod";

const EnvSchema = z.object({
  PORT: z.coerce
    .number(
      "PORT should be a number so we can assign it a dedicated port for the api",
    )
    .positive()
    .max(65536, "port should be >= 0 and <= 65536")
    .default(3000),
  NODE_ENV: z.enum(["development", "production", "local"]).default("local"),
  REDIS_URL: z.url("Redis url is required for the backend application"),
  DATABASE_URL: z.url("POSTGRES DB url is required for this application"),
  BETTER_AUTH_URL: z
    .url("better auth url is required")
    .default("http://localhost:3001"),
  BETTER_AUTH_SECRET: z.string("Secret is required").default("000000000"),
  FRONTEND_URLS: z
    .string()
    .default("")
    .transform((s) =>
      s
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    ),
  GROQ_API_KEYS: z
    .string()
    .default("")
    .transform((s) =>
      s
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean),
    ),
  DODO_PAYMENTS_API_KEY: z.string().optional(),
  DODO_WEBHOOK_SECRET: z.string().optional(),
  DODO_PRO_PRODUCT_ID: z.string().optional(),
  DODO_PAYMENT_MODE: z.enum(["test_mode", "live_mode"]).default("test_mode"),
});

export const env = EnvSchema.parse(process.env);
