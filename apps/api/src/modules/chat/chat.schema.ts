import { z } from "zod";

export const chatBodySchema = z.object({
  message: z.string().min(1),
});

export const chatResponseSchema = z.object({
  reply: z.string(),
  sources: z.array(z.string()).optional(),
});

export const chatSchema = {
  headers: z.object({
    "x-atlas-api-key": z.string(),
  }),
  body: chatBodySchema,
  response: {
    200: chatResponseSchema,
  },
};
