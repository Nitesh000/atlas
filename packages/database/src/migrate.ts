import { migrate } from "drizzle-orm/postgres-js/migrator";
import { dbClient, queryClient } from "./index.js";

async function main() {
  console.log("Running migrations...");
  try {
    await migrate(dbClient, { migrationsFolder: "./drizzle" });
    console.log("Migrations applied successfully!");
  } catch (error) {
    console.error("Error running migrations:", error);
    process.exit(1);
  } finally {
    await queryClient.end();
  }
}

main();