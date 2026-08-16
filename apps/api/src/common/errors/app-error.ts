export type AppErrorOptions = {
  statusCode: number;
  code: string;
  details?: unknown;
  retryAfter?: number;
  cause?: unknown;
};

/**
 * Base application error for consistent API error responses.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly status: "fail" | "error";
  public readonly code: string;
  public readonly details?: unknown;
  public readonly isOperational: boolean;
  public readonly retryAfter?: number;
  public override readonly cause?: unknown;

  constructor(message: string, options: AppErrorOptions) {
    super(message);

    this.name = "AppError";
    this.statusCode = options.statusCode;
    this.status = `${options.statusCode}`.startsWith("4") ? "fail" : "error";
    this.code = options.code;
    this.details = options.details;
    this.retryAfter = options.retryAfter;
    this.cause = options.cause;
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}
