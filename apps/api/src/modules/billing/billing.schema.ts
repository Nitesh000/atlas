import { z } from "zod";

export const createCheckoutSessionSchema = {
  body: z.object({
    organizationId: z.string().uuid(),
    successUrl: z.string().url(),
    cancelUrl: z.string().url(),
  }),
  response: {
    200: z.object({
      url: z.string().url(),
    }),
  },
};

export const createPortalSessionSchema = {
  body: z.object({
    organizationId: z.string().uuid(),
    returnUrl: z.string().url(),
  }),
  response: {
    200: z.object({
      url: z.string().url(),
    }),
  },
};