import type { FastifyReply, FastifyRequest } from "fastify";
import type { CreateOrgInput } from "./orgs.types.js";
import { createOrg, listOrgs } from "./orgs.service.js";
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

export async function createOrgHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const body = request.body as Omit<CreateOrgInput, "userId">;

  const organization = await createOrg({
    name: body.name,
    userId: request.user!.id,
  });

  return reply.status(201).send(organization);
}

export async function listOrgsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const orgs = await listOrgs(request.user!.id);
  return reply.status(200).send(orgs);
}

export async function getOrgUsageHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = request.params as { orgId: string };
  await verifyOrgMember(request.user!.id, params.orgId);

  const monthYear = new Date().toISOString().slice(0, 7);

  const [usage] = await dbClient
    .select()
    .from(appSchema.apiUsage)
    .where(
      and(
        eq(appSchema.apiUsage.organizationId, params.orgId),
        eq(appSchema.apiUsage.monthYear, monthYear),
      ),
    );

  if (!usage) {
    return reply.status(200).send({
      apiCallCount: 0,
      limit: 5000,
      monthYear,
    });
  }

  return reply.status(200).send(usage);
}
