import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { createOrgHandler } from "./orgs.controller.js";
import { createOrgSchema } from "./orgs.schema.js";
import { requireAuth } from "../../plugins/requireAuth.js";

export async function orgsRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.post(
    "/",
    {
      schema: createOrgSchema,
      preHandler: [requireAuth],
    },
    createOrgHandler,
  );
}
