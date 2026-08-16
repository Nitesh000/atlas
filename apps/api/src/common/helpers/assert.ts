import { AppError } from "../errors/app-error.js";

/**
 * Throws the provided application error when condition is falsy.
 */
export function assert(condition: unknown, error: AppError): asserts condition {
  if (!condition) {
    throw error;
  }
}
