import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import { requireAuth } from "../../plugins/requireAuth.js";
import {
  createWebsiteHandler,
  listWebsitesHandler,
  rescrapeWebsiteHandler,
  websiteEventsHandler,
  deleteWebsiteHandler,
  websitePagesHandler,
} from "./websites.controller.js";
import { createWebsiteSchema, listWebsitesSchema } from "./websites.schema.js";
import { z } from "zod";

export async function websitesRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.addHook("preHandler", requireAuth);

  typedApp.get(
    "/:orgId/websites/events",
    {
      schema: {
        params: z.object({
          orgId: z.string().uuid(),
        }),
      },
    },
    websiteEventsHandler,
  );

  typedApp.post(
    "/:orgId/websites/:id/scrape",
    {
      schema: {
        params: z.object({
          orgId: z.string().uuid(),
          id: z.string().uuid(),
        }),
      },
    },
    rescrapeWebsiteHandler,
  );

  typedApp.delete(
    "/:orgId/websites/:id",
    {
      schema: {
        params: z.object({
          orgId: z.string().uuid(),
          id: z.string().uuid(),
        }),
      },
    },
    deleteWebsiteHandler,
  );

  typedApp.get(
    "/:orgId/websites/:id/pages",
    {
      schema: {
        params: z.object({
          orgId: z.string().uuid(),
          id: z.string().uuid(),
        }),
      },
    },
    websitePagesHandler,
  );

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
