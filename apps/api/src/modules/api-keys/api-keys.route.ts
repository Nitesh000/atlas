import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { requireAuth } from "../../plugins/requireAuth.js";
import { createApiKeyHandler, listApiKeysHandler } from "./api-keys.controller.js";
import { createApiKeySchema, listApiKeysSchema } from "./api-keys.schema.js";

export async function apiKeysRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // Use preHandler on the plugin scope or route scope
  typedApp.post(
    "/:orgId/api-keys",
    {
      schema: createApiKeySchema,
      preHandler: [requireAuth],
    },
    createApiKeyHandler,
  );

  typedApp.get(
    "/:orgId/api-keys",
    {
      schema: listApiKeysSchema,
      preHandler: [requireAuth],
    },
    listApiKeysHandler,
  );
}
