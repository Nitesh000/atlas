import { HTTP_STATUS_CODE } from "../../config/http.js";
import { AppError } from "./app-error.js";

export class BadRequestError extends AppError {
  constructor(message = "Bad request", details?: unknown) {
    super(message, {
      statusCode: HTTP_STATUS_CODE.BAD_REQUEST,
      code: "BAD_REQUEST",
      details,
    });
  }
}

export class UnauthorizedError extends AppError {
  constructor(message = "Unauthorized", details?: unknown) {
    super(message, {
      statusCode: HTTP_STATUS_CODE.UNAUTHORIZED,
      code: "UNAUTHORIZED",
      details,
    });
  }
}

export class ForbiddenError extends AppError {
  constructor(message = "Forbidden", details?: unknown) {
    super(message, {
      statusCode: HTTP_STATUS_CODE.FORBIDDEN,
      code: "FORBIDDEN",
      details,
    });
  }
}

export class NotFoundError extends AppError {
  constructor(message = "Resource not found", details?: unknown) {
    super(message, {
      statusCode: HTTP_STATUS_CODE.NOT_FOUND,
      code: "NOT_FOUND",
      details,
    });
  }
}

export class ConflictError extends AppError {
  constructor(message = "Conflict", details?: unknown) {
    super(message, {
      statusCode: HTTP_STATUS_CODE.CONFLICT,
      code: "CONFLICT",
      details,
    });
  }
}

export class RateLimitError extends AppError {
  constructor(
    message = "Too many requests",
    retryAfter?: number,
    details?: unknown,
  ) {
    super(message, {
      statusCode: HTTP_STATUS_CODE.TOO_MANY_REQUESTS,
      code: "RATE_LIMITED",
      retryAfter,
      details,
    });
  }
}

export class InternalServerError extends AppError {
  constructor(message = "Internal server error", cause?: unknown) {
    super(message, {
      statusCode: HTTP_STATUS_CODE.INTERNAL_SERVER_ERROR,
      code: "INTERNAL_SERVER_ERROR",
      cause,
    });
  }
}
