import { FastifyRequest, FastifyReply } from 'fastify';
import { randomUUID } from 'node:crypto';

export async function createOrgHandler(
  request: FastifyRequest<{ Body: { name: string } }>,
  reply: FastifyReply
) {
  const { name } = request.body;
  
  // TODO: Insert into database using @atlas/database
  const newOrg = {
    id: randomUUID(),
    name,
  };

  return reply.status(201).send(newOrg);
}
