import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { requireAuth } from "../../plugins/requireAuth.js";
import {
  createWebsiteHandler,
  listWebsitesHandler,
} from "./websites.controller.js";
import { createWebsiteSchema, listWebsitesSchema } from "./websites.schema.js";

export async function websitesRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.addHook("preHandler", requireAuth);

  typedApp.post(
    "/:orgId/websites",
    { schema: createWebsiteSchema },
    createWebsiteHandler,
  );

  typedApp.get(
    "/:orgId/websites",
    { schema: listWebsitesSchema },
    listWebsitesHandler,
  );
}
