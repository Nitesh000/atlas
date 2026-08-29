import * as dotenv from "dotenv";
import path from "node:path";
import { fileURLToPath } from "node:url";

const currentFilePath = fileURLToPath(import.meta.url);
const currentDirectoryPath = path.dirname(currentFilePath);

dotenv.config({
  path: path.resolve(currentDirectoryPath, "../../../.env"),
});

const SHUTDOWN_SIGNALS = ["SIGINT", "SIGTERM"] as const;

async function start() {
  const [{ env }, { buildApp }] = await Promise.all([
    import("@atlas/config"),
    import("./app.js"),
  ]);

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
    await app.listen({ port: env.PORT });
    app.log.info(`Server listening at port:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();
