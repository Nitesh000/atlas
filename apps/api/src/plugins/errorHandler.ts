import { FastifyInstance, FastifyError } from 'fastify';

export async function errorHandlerPlugin(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error.validation) {
      reply.status(400).send({
        error: 'Bad Request',
        message: 'Validation failed',
        details: error.validation,
      });
      return;
    }

    app.log.error(error);
    reply.status(500).send({
      error: 'Internal Server Error',
      message: 'Something went wrong',
    });
  });
}