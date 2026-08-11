import { z } from 'zod';

export const createOrgSchema = {
  body: z.object({
    name: z.string().min(2),
  }),
  response: {
    201: z.object({
      id: z.string().uuid(),
      name: z.string(),
    }),
  },
};
