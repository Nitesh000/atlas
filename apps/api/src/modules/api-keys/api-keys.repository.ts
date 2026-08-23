import { dbClient, appSchema } from "@atlas/database";
import { eq } from "drizzle-orm";
import type { CreateApiKeyInput, ApiKey } from "./api-keys.types.js";

export async function insertApiKey(
  input: CreateApiKeyInput & { key: string },
): Promise<ApiKey> {
  const [apiKey] = await dbClient
    .insert(appSchema.apiKey)
    .values({
      name: input.name,
      organizationId: input.organizationId,
      key: input.key,
      allowedDomains: input.allowedDomains,
    })
    .returning();

  if (!apiKey) {
    throw new Error("Failed to insert API key");
  }

  return apiKey;
}

export async function findApiKeysByOrgId(orgId: string): Promise<ApiKey[]> {
  const keys = await dbClient
    .select()
    .from(appSchema.apiKey)
    .where(eq(appSchema.apiKey.organizationId, orgId));

  return keys;
}
