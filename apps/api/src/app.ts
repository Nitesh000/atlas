import Fastify from "fastify";
import cors from "@fastify/cors";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { env } from "@atlas/config";
import { queryClient } from "@atlas/database";
import { createLogger } from "@atlas/logger";
import { redisClient } from "@atlas/queue";
import { authRoutes } from "./modules/auth/auth.route.js";
import { healthRoutes } from "./modules/health/health.route.js";
import { orgsRoutes } from "./modules/orgs/orgs.route.js";
import { apiKeysRoutes } from "./modules/api-keys/api-keys.route.js";
import { websitesRoutes } from "./modules/websites/websites.route.js";
import { chatRoutes } from "./modules/chat/chat.route.js";
import { billingRoutes } from "./modules/billing/billing.route.js";
import { errorHandlerPlugin } from "./plugins/errorHandler.js";
import fastifyRawBody from "fastify-raw-body";

export async function buildApp() {
  const logger = createLogger({
    level: "info",
    isProduction: env.NODE_ENV === "production",
  });

  const app = Fastify({
    loggerInstance: logger,
  }).withTypeProvider<ZodTypeProvider>();

  await app.register(fastifyRawBody, {
    field: "rawBody",
    global: false,
    encoding: "utf8",
    runFirst: true,
  });

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(errorHandlerPlugin);

  await app.register(cors, {
    origin: (origin, cb) => {
      // Allows any origin, reflecting it back to satisfy credentials: true requirements
      cb(null, true);
    },
    credentials: true,
  });

  app.addHook("onClose", async () => {
    await queryClient.end();
    await redisClient.quit();
  });

  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(healthRoutes, { prefix: "/health" });
  await app.register(orgsRoutes, { prefix: "/api/v1/orgs" });
  await app.register(apiKeysRoutes, { prefix: "/api/v1/orgs" });
  await app.register(websitesRoutes, { prefix: "/api/v1/orgs" });
  await app.register(chatRoutes, { prefix: "/api/v1/chat" });
  await app.register(billingRoutes, { prefix: "/api/v1/billing" });

  return app;
}
