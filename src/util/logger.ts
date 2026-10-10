import pino from "pino";

const isPrettyLogs =
  process.env.LOG_PRETTY === "true" || process.env.NODE_ENV !== "production";

export const logger = pino({
  level: process.env.LOG_LEVEL ?? "info",
  ...(isPrettyLogs
    ? {
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
            translateTime: "SYS:standard",
          },
        },
      }
    : {}),
});

export const createLogger = (module: string) => logger.child({ module });
