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

export const createInviteBodySchema = z.object({
  email: z.string().email(),
  role: z.enum(["owner", "admin", "member"]).default("member"),
});

export const inviteResponseSchema = z.object({
  id: z.string().uuid(),
  email: z.string(),
  role: z.string(),
  token: z.string(),
  expiresAt: z.string().or(z.date()),
});

export const createInviteSchema = {
  params: z.object({ orgId: z.string().uuid() }),
  body: createInviteBodySchema,
  response: {
    201: inviteResponseSchema,
  },
};

export const listInvitesSchema = {
  params: z.object({ orgId: z.string().uuid() }),
  response: {
    200: z.array(inviteResponseSchema),
  },
};

export const acceptInviteBodySchema = z.object({
  token: z.string(),
});

export const acceptInviteSchema = {
  body: acceptInviteBodySchema,
  response: {
    200: z.object({
      success: z.boolean(),
      organizationId: z.string().uuid(),
    }),
  },
};
