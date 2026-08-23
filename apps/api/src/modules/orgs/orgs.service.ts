import type { CreateOrgInput, Org } from "./orgs.types.js";
import { createOrgRecord, findOrgsByUserId } from "./orgs.repository.js";
import { ConflictError } from "../../common/errors/index.js";

/**
 * Creates a new organization.
 */
export async function createOrg(input: CreateOrgInput): Promise<Org> {
  const existingOrgs = await findOrgsByUserId(input.userId);
  if (existingOrgs.length > 0) {
    throw new ConflictError(
      "Users are limited to 1 organization on this tier.",
    );
  }

  const normalizedName = input.name.trim();

  return createOrgRecord({
    name: normalizedName,
    userId: input.userId,
  });
}

/**
 * Lists all organizations for a user.
 */
export async function listOrgs(userId: string): Promise<Org[]> {
  return findOrgsByUserId(userId);
}
