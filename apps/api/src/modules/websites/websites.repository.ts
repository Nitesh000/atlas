import { dbClient, appSchema } from "@atlas/database";
import { eq } from "drizzle-orm";
import type { CreateWebsiteInput, Website } from "./websites.types.js";

export async function insertWebsite(
  input: CreateWebsiteInput,
): Promise<Website> {
  const [website] = await dbClient
    .insert(appSchema.website)
    .values({
      url: input.url,
      organizationId: input.organizationId,
      status: "pending",
    })
    .returning();

  if (!website) {
    throw new Error("Failed to insert website");
  }

  return website;
}

export async function findWebsitesByOrgId(orgId: string): Promise<Website[]> {
  const websites = await dbClient
    .select()
    .from(appSchema.website)
    .where(eq(appSchema.website.organizationId, orgId));

  return websites;
}
