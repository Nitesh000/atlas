import { z } from "zod";

export const createApiKeyBodySchema = z.object({
  name: z.string().trim().min(2),
  allowedDomains: z.array(z.string()).nullable().default(null),
});

export const apiKeyResponseSchema = z.object({
  id: z.uuid(),
  key: z.string(),
  name: z.string(),
  allowedDomains: z.array(z.string()).nullable(),
  createdAt: z.string().or(z.date()),
});

export const createApiKeySchema = {
  params: z.object({
    orgId: z.uuid(),
  }),
  body: createApiKeyBodySchema,
  response: {
    201: apiKeyResponseSchema,
  },
};

export const listApiKeysSchema = {
  params: z.object({
    orgId: z.uuid(),
  }),
  response: {
    200: z.array(apiKeyResponseSchema),
  },
};
