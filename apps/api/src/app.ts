import Fastify from "fastify";
import cors from "@fastify/cors";
import {
  serializerCompiler,
  validatorCompiler,
  ZodTypeProvider,
} from "fastify-type-provider-zod";
import { queryClient } from "@atlas/database";
import { logger } from "@atlas/logger";
import { redisClient } from "@atlas/queue";
import { authRoutes } from "./modules/auth/auth.route.js";
import { healthRoutes } from "./modules/health/health.route.js";
import { orgsRoutes } from "./modules/orgs/orgs.route.js";
import { errorHandlerPlugin } from "./plugins/errorHandler.js";

export async function buildApp() {
  const app = Fastify({
    logger: logger as any,
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(errorHandlerPlugin);

  await app.register(cors, {
    origin: true,
    credentials: true,
  });

  app.addHook("onClose", async () => {
    await queryClient.end();
    await redisClient.quit();
  });

  await app.register(authRoutes, { prefix: "/api/auth" });
  await app.register(healthRoutes, { prefix: "/health" });
  await app.register(orgsRoutes, { prefix: "/api/v1/orgs" });

  return app;
}
