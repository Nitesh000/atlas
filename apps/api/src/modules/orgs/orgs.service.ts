import type { CreateOrgInput, Org } from "./orgs.types.js";
import { createOrgRecord } from "./orgs.repository.js";

/**
 * Creates a new organization.
 */
export async function createOrg(input: CreateOrgInput): Promise<Org> {
  const normalizedName = input.name.trim();

  return createOrgRecord({
    name: normalizedName,
    userId: input.userId,
  });
}
