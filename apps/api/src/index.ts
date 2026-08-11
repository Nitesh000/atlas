import { buildApp } from './app.js';
import * as dotenv from 'dotenv';

dotenv.config();

const port = parseInt(process.env.PORT || '3000', 10);
const host = process.env.HOST || '0.0.0.0';

async function start() {
  const app = await buildApp();
  try {
    await app.listen({ port, host });
    app.log.info(`Server listening at http://${host}:${port}`);
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
}

start();