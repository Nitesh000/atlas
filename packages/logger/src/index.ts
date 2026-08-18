import pino, { type LoggerOptions } from "pino";

export type CreateLoggerOptions = {
  level?: LoggerOptions["level"];
  isProduction?: boolean;
};

/**
 * Creates a shared pino logger instance for apps/services.
 */
export function createLogger(options: CreateLoggerOptions = {}) {
  const { level = "info", isProduction = false } = options;

  return pino({
    level,
    transport: isProduction
      ? undefined
      : {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        },
  });
}
