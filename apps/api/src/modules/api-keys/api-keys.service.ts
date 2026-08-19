import { randomBytes } from "node:crypto";
import type { CreateApiKeyInput, ApiKey } from "./api-keys.types.js";
import { insertApiKey, findApiKeysByOrgId } from "./api-keys.repository.js";
import { dbClient, appSchema } from "@atlas/database";
import { eq } from "drizzle-orm";
import { ConflictError } from "../../common/errors/index.js";

export async function createApiKey(input: CreateApiKeyInput): Promise<ApiKey> {
  const org = await dbClient
    .select({ plan: appSchema.organization.plan })
    .from(appSchema.organization)
    .where(eq(appSchema.organization.id, input.organizationId))
    .then((res) => res[0]);

  if (!org) throw new Error("Organization not found");

  const existingKeys = await findApiKeysByOrgId(input.organizationId);
  const limit = org.plan === "pro" ? 5 : 1;

  if (existingKeys.length >= limit) {
    throw new ConflictError(
      `Plan limit reached. Your ${org.plan} plan allows up to ${limit} API key(s). Upgrade to Pro to create more.`,
    );
  }

  // Generate token: atl_ + 32 bytes hex
  const rawKey = randomBytes(32).toString("hex");
  const keyString = `atl_${rawKey}`;

  return insertApiKey({
    ...input,
    key: keyString,
  });
}

export async function listApiKeys(orgId: string): Promise<ApiKey[]> {
  return findApiKeysByOrgId(orgId);
}
