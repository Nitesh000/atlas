import { FastifyInstance } from 'fastify';
import { ZodTypeProvider } from 'fastify-type-provider-zod';
import { createOrgSchema } from './orgs.schema.js';
import { createOrgHandler } from './orgs.controller.js';

export async function orgsRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  typedApp.post('/', { schema: createOrgSchema }, createOrgHandler);
}
