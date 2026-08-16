import { FastifyError, FastifyInstance } from "fastify";
import { AppError } from "../common/errors/index.js";
import { HTTP_STATUS_CODE } from "../config/http.js";

export async function errorHandlerPlugin(app: FastifyInstance) {
  app.setErrorHandler((error: FastifyError, request, reply) => {
    if (error.validation) {
      return reply.status(HTTP_STATUS_CODE.BAD_REQUEST).send({
        status: "fail",
        code: "VALIDATION_ERROR",
        message: "Validation failed",
        details: error.validation,
      });
    }

    if (error instanceof AppError) {
      if (error.retryAfter) {
        reply.header("Retry-After", String(error.retryAfter));
      }

      return reply.status(error.statusCode).send({
        status: error.status,
        code: error.code,
        message: error.message,
        details: error.details,
      });
    }

    app.log.error(
      {
        err: error,
        url: request.url,
        method: request.method,
      },
      "Unhandled application error",
    );

    return reply.status(HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR).send({
      status: "error",
      code: "INTERNAL_SERVER_ERROR",
      message: "Something went wrong",
    });
  });
}
