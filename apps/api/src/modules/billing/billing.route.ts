import type { FastifyInstance } from "fastify";
import { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  createCheckoutHandler,
  createPortalHandler,
  webhookHandler,
} from "./billing.controller.js";
import {
  createCheckoutSessionSchema,
  createPortalSessionSchema,
} from "./billing.schema.js";
import { requireAuth } from "../../plugins/requireAuth.js";

export async function billingRoutes(app: FastifyInstance) {
  const typedApp = app.withTypeProvider<ZodTypeProvider>();

  // Webhook does not require auth, must parse raw body
  typedApp.post(
    "/webhook",
    { config: { rawBody: true } },
    webhookHandler
  );

  typedApp.register(async (authApp) => {
    authApp.addHook("preHandler", requireAuth);

    authApp.post(
      "/checkout",
      { schema: createCheckoutSessionSchema },
      createCheckoutHandler
    );

    authApp.post(
      "/portal",
      { schema: createPortalSessionSchema },
      createPortalHandler
    );
  });
}