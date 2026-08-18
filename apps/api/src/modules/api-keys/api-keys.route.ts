import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { requireAuth } from "../../plugins/requireAuth.js";
import {
  createApiKeyHandler,
  listApiKeysHandler,
} from "./api-keys.controller.js";
import { createApiKeySchema, listApiKeysSchema } from "./api-keys.schema.js";

export async function apiKeysRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.addHook("preHandler", requireAuth);

  typedApp.post(
    "/:orgId/api-keys",
    { schema: createApiKeySchema },
    createApiKeyHandler,
  );

  typedApp.get(
    "/:orgId/api-keys",
    { schema: listApiKeysSchema },
    listApiKeysHandler,
  );
}
