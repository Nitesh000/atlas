import { dbClient, appSchema } from "@atlas/database";
import type { CreateOrgInput, Org } from "./orgs.types.js";

/**
 * Persists organization to database.
 */
export async function createOrgRecord(input: CreateOrgInput): Promise<Org> {
  const org = await dbClient.transaction(async (tx) => {
    const [insertedOrg] = await tx
      .insert(appSchema.organization)
      .values({
        name: input.name,
      })
      .returning({
        id: appSchema.organization.id,
        name: appSchema.organization.name,
      });

    if (!insertedOrg) {
      throw new Error("Failed to create organization");
    }

    await tx.insert(appSchema.organizationMember).values({
      organizationId: insertedOrg.id,
      userId: input.userId,
      role: "owner",
    });

    return insertedOrg;
  });

  return org;
}
