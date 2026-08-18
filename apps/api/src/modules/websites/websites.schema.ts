import { z } from "zod";

export const createWebsiteBodySchema = z.object({
  url: z.string().url(),
});

export const websiteResponseSchema = z.object({
  id: z.string().uuid(),
  url: z.string().url(),
  status: z.enum(["pending", "crawling", "completed", "failed"]),
  createdAt: z.string().or(z.date()),
  updatedAt: z.string().or(z.date()),
});

export const createWebsiteSchema = {
  params: z.object({
    orgId: z.string().uuid(),
  }),
  body: createWebsiteBodySchema,
  response: {
    201: websiteResponseSchema,
  },
};

export const listWebsitesSchema = {
  params: z.object({
    orgId: z.string().uuid(),
  }),
  response: {
    200: z.array(websiteResponseSchema),
  },
};
