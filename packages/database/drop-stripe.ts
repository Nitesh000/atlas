import postgres from "postgres";
import { env } from "@atlas/config";

async function run() {
  const sql = postgres(env.DATABASE_URL);
  try {
    await sql`ALTER TABLE "organization" DROP COLUMN IF EXISTS "stripe_customer_id";`;
    await sql`ALTER TABLE "organization" DROP COLUMN IF EXISTS "stripe_subscription_id";`;
    console.log("Dropped stripe columns");
  } catch (err) {
    console.error(err);
  } finally {
    await sql.end();
  }
}
run();