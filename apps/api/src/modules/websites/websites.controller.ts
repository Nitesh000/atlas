import type { FastifyReply, FastifyRequest } from "fastify";
import type { CreateWebsiteInput } from "./websites.types.js";
import { createWebsite, listWebsites } from "./websites.service.js";
import { dbClient, appSchema } from "@atlas/database";
import { and, eq } from "drizzle-orm";
import { UnauthorizedError } from "../../common/errors/index.js";

async function verifyOrgMember(userId: string, orgId: string) {
  const [member] = await dbClient
    .select()
    .from(appSchema.organizationMember)
    .where(
      and(
        eq(appSchema.organizationMember.userId, userId),
        eq(appSchema.organizationMember.organizationId, orgId),
      ),
    );

  if (!member) {
    throw new UnauthorizedError("Not a member of this organization");
  }
}

export async function createWebsiteHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = request.params as { orgId: string };
  const body = request.body as Omit<CreateWebsiteInput, "organizationId">;

  await verifyOrgMember(request.user!.id, params.orgId);

  const website = await createWebsite({
    url: body.url,
    organizationId: params.orgId,
  });

  return reply.status(201).send(website);
}

export async function listWebsitesHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = request.params as { orgId: string };

  await verifyOrgMember(request.user!.id, params.orgId);

  const websites = await listWebsites(params.orgId);

  return reply.status(200).send(websites);
}
