import type { FastifyReply, FastifyRequest } from "fastify";
import type { CreateOrgInput } from "./orgs.types.js";
import { createOrg } from "./orgs.service.js";

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
