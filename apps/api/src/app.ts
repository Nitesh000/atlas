import Fastify from 'fastify';
import cors from '@fastify/cors';
import { serializerCompiler, validatorCompiler, ZodTypeProvider } from 'fastify-type-provider-zod';
import { logger } from '@atlas/logger';
import { errorHandlerPlugin } from './plugins/errorHandler.js';

import { orgsRoutes } from './modules/orgs/orgs.route.js';

export async function buildApp() {
  const app = Fastify({
    logger: logger as any, // Fastify logger types can be slightly strict
  }).withTypeProvider<ZodTypeProvider>();

  app.setValidatorCompiler(validatorCompiler);
  app.setSerializerCompiler(serializerCompiler);

  await app.register(errorHandlerPlugin);

  await app.register(cors, {
    origin: true,
  });

  app.get('/health', async () => {
    return { status: 'ok', timestamp: new Date().toISOString() };
  });

  // Register domain routes
  await app.register(orgsRoutes, { prefix: '/api/v1/orgs' });

  return app;
}