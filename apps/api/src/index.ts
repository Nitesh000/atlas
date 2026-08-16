import * as dotenv from "dotenv";

dotenv.config();

import { env } from "@atlas/config";
import { buildApp } from "./app.js";

const SHUTDOWN_SIGNALS = ["SIGINT", "SIGTERM"] as const;

async function start() {
  const app = await buildApp();

  const shutdown = async (signal: (typeof SHUTDOWN_SIGNALS)[number]) => {
    app.log.info({ signal }, "Shutdown signal received");
    await app.close();
    process.exit(0);
  };

  for (const signal of SHUTDOWN_SIGNALS) {
    process.on(signal, async () => {
      await shutdown(signal);
    });
  }

  try {
    await app.listen({ port: env.PORT, host: "0.0.0.0" });
    app.log.info(`Server listening at port:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

