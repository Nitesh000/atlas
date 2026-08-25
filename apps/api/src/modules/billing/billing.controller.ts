import type { FastifyReply, FastifyRequest } from "fastify";
import DodoPayments from "dodopayments";
import { Webhook } from "standardwebhooks";
import { env } from "@atlas/config";
import { dbClient, appSchema } from "@atlas/database";
import { eq, and } from "drizzle-orm";
import { UnauthorizedError, NotFoundError } from "../../common/errors/index.js";
import { ROLES, PLANS } from "@atlas/types";

const dodo = new DodoPayments({
  bearerToken: env.DODO_PAYMENTS_API_KEY || "",
});

async function verifyOrgAdmin(userId: string, orgId: string) {
  const [member] = await dbClient
    .select()
    .from(appSchema.organizationMember)
    .where(
      and(
        eq(appSchema.organizationMember.userId, userId),
        eq(appSchema.organizationMember.organizationId, orgId),
      ),
    );

  if (!member || (member.role !== ROLES.OWNER && member.role !== ROLES.ADMIN)) {
    throw new UnauthorizedError("Must be an admin or owner to manage billing");
  }
}

export async function createCheckoutHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = request.body as { organizationId: string; successUrl: string; cancelUrl: string };
  await verifyOrgAdmin(request.user!.id, body.organizationId);

  const [org] = await dbClient
    .select()
    .from(appSchema.organization)
    .where(eq(appSchema.organization.id, body.organizationId));

  if (!org) throw new NotFoundError("Organization not found");

  if (org.plan === PLANS.PRO) {
    return reply.status(400).send({ message: "Organization is already on the Pro plan" } as any);
  }

  // Find or create customer
  let customerId = org.dodoCustomerId;
  if (!customerId) {
    const customer = await dodo.customers.create({
      name: org.name,
      email: request.user!.email,
    });
    customerId = customer.customer_id;
    await dbClient
      .update(appSchema.organization)
      .set({ dodoCustomerId: customerId })
      .where(eq(appSchema.organization.id, org.id));
  }

  const session = await dodo.checkoutSessions.create({
    customer: { customer_id: customerId },
    product_cart: [
      { product_id: env.DODO_PRO_PRODUCT_ID || "prd_pro", quantity: 1 },
    ],
    metadata: {
      organizationId: org.id,
    },
    return_url: body.successUrl,
  });

  return reply.send({ url: session.checkout_url! });
}

export async function createPortalHandler(request: FastifyRequest, reply: FastifyReply) {
  const body = request.body as { organizationId: string; returnUrl: string };
  await verifyOrgAdmin(request.user!.id, body.organizationId);

  const [org] = await dbClient
    .select()
    .from(appSchema.organization)
    .where(eq(appSchema.organization.id, body.organizationId));

  if (!org || !org.dodoCustomerId) {
    throw new NotFoundError("No active billing profile found");
  }

  const session = await dodo.customers.customerPortal.create(org.dodoCustomerId, {
    return_url: body.returnUrl,
  });

  return reply.send({ url: session.link });
}

export async function webhookHandler(request: FastifyRequest, reply: FastifyReply) {
  const sig = request.headers["webhook-signature"] as string;
  const webhookId = request.headers["webhook-id"] as string;
  const webhookTimestamp = request.headers["webhook-timestamp"] as string;

  if (!sig || !webhookId || !webhookTimestamp) {
    return reply.status(400).send("Missing webhook headers");
  }

  try {
    const wh = new Webhook(env.DODO_WEBHOOK_SECRET || "");
    const payload = request.rawBody as unknown as string;

    const event = wh.verify(payload, {
      "webhook-id": webhookId,
      "webhook-signature": sig,
      "webhook-timestamp": webhookTimestamp
    }) as any;

    if (event.type === "subscription.active") {
      const metadata = event.data?.metadata || {};
      if (metadata.organizationId) {
        await dbClient.update(appSchema.organization)
          .set({ plan: PLANS.PRO, dodoSubscriptionId: event.data.subscription_id })
          .where(eq(appSchema.organization.id, metadata.organizationId));
      }
    } else if (event.type === "subscription.canceled" || event.type === "subscription.failed") {
      await dbClient.update(appSchema.organization)
        .set({ plan: PLANS.FREE, dodoSubscriptionId: null })
        .where(eq(appSchema.organization.dodoSubscriptionId, event.data.subscription_id));
    }
  } catch (err: any) {
    return reply.status(400).send(`Webhook Error: ${err.message}`);
  }

  return reply.status(200).send({ received: true });
}