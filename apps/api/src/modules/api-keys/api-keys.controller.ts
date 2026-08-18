import type { FastifyReply, FastifyRequest } from "fastify";
import type { CreateApiKeyInput } from "./api-keys.types.js";
import { createApiKey, listApiKeys } from "./api-keys.service.js";
import { UnauthorizedError } from "../../common/errors/index.js";
import { dbClient, appSchema } from "@atlas/database";
import { and, eq } from "drizzle-orm";

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

export async function createApiKeyHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = request.params as { orgId: string };
  const body = request.body as Omit<CreateApiKeyInput, "organizationId">;

  await verifyOrgMember(request.user!.id, params.orgId);

  const apiKey = await createApiKey({
    name: body.name,
    allowedDomains: body.allowedDomains,
    organizationId: params.orgId,
  });

  return reply.status(201).send(apiKey);
}

export async function listApiKeysHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = request.params as { orgId: string };

  await verifyOrgMember(request.user!.id, params.orgId);

  const keys = await listApiKeys(params.orgId);

  return reply.status(200).send(keys);
}
