import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  createOrgHandler,
  listOrgsHandler,
  getOrgUsageHandler,
  createInviteHandler,
  listInvitesHandler,
  acceptInviteHandler,
} from "./orgs.controller.js";
import { 
  createOrgSchema, 
  listOrgsSchema, 
  createInviteSchema, 
  listInvitesSchema,
  acceptInviteSchema 
} from "./orgs.schema.js";
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

  typedApp.post("/:orgId/invites", { schema: createInviteSchema }, createInviteHandler);
  typedApp.get("/:orgId/invites", { schema: listInvitesSchema }, listInvitesHandler);
  
  // We can put accept invite here, though strictly it might not need orgId if token is globally unique
  typedApp.post("/invites/accept", { schema: acceptInviteSchema }, acceptInviteHandler);
}
