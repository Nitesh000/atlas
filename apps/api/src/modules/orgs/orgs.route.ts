import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  createOrgHandler,
  listOrgsHandler,
  getOrgUsageHandler,
} from "./orgs.controller.js";
import { createOrgSchema, listOrgsSchema } from "./orgs.schema.js";
import { requireAuth } from "../../plugins/requireAuth.js";
import { z } from "zod";

export async function orgsRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.addHook("preHandler", requireAuth);

  typedApp.post("/", { schema: createOrgSchema }, createOrgHandler);
  typedApp.get("/", { schema: listOrgsSchema }, listOrgsHandler);

  typedApp.get(
    "/:orgId/usage",
    {
      schema: {
        params: z.object({
          orgId: z.string().uuid(),
        }),
      },
    },
    getOrgUsageHandler,
  );
}
