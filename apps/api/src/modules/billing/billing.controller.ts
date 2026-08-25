import type { FastifyReply, FastifyRequest } from "fastify";
import { createCheckout, createPortal, processWebhook } from "./billing.service.js";

export async function createCheckoutHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = request.body as { organizationId: string; successUrl: string; cancelUrl: string };
  
  const url = await createCheckout(
    request.user!.id,
    request.user!.email,
    body.organizationId,
    body.successUrl
  );

  return reply.send({ url });
}

export async function createPortalHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = request.body as { organizationId: string; returnUrl: string };
  
  const url = await createPortal(
    request.user!.id,
    body.organizationId,
    body.returnUrl
  );

  return reply.send({ url });
}

export async function webhookHandler(request: FastifyRequest, reply: FastifyReply) {
  const sig = request.headers["webhook-signature"] as string;
  const webhookId = request.headers["webhook-id"] as string;
  const webhookTimestamp = request.headers["webhook-timestamp"] as string;

  if (!sig || !webhookId || !webhookTimestamp) {
    return reply.status(400).send("Missing webhook headers");
  }

  try {
    const payload = request.rawBody as unknown as string;
    await processWebhook(payload, { sig, id: webhookId, timestamp: webhookTimestamp });
  } catch (err: any) {
    return reply.status(400).send(`Webhook Error: ${err.message}`);
  }

  return reply.status(200).send({ received: true });
}