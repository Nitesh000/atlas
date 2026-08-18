import { z } from "zod";

export const createOrgBodySchema = z.object({
  name: z.string().trim().min(2),
});

export const orgResponseSchema = z.object({
  id: z.string().uuid(),
  name: z.string(),
});

export const createOrgSchema = {
  body: createOrgBodySchema,
  response: {
    201: orgResponseSchema,
  },
};

export const listOrgsSchema = {
  response: {
    200: z.array(orgResponseSchema),
  },
};
