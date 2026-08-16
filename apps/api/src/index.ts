import { buildApp } from "./app.js";
import * as dotenv from "dotenv";
dotenv.config();

import { env } from "@atlas/config";

async function start() {
  const app = await buildApp();
  try {
    await app.listen({ port: env.PORT });
    app.log.info(`Server listening at port:${env.PORT}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();

