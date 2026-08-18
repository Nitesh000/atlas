import { randomBytes } from "node:crypto";
import type { CreateApiKeyInput, ApiKey } from "./api-keys.types.js";
import { insertApiKey, findApiKeysByOrgId } from "./api-keys.repository.js";

export async function createApiKey(input: CreateApiKeyInput): Promise<ApiKey> {
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
