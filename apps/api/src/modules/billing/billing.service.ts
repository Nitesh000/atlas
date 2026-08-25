import DodoPayments from "dodopayments";
import { Webhook } from "standardwebhooks";
import { env } from "@atlas/config";
import { dbClient, appSchema } from "@atlas/database";
import { eq, and } from "drizzle-orm";
import { UnauthorizedError, NotFoundError, ConflictError } from "../../common/errors/index.js";
import { ROLES, PLANS } from "@atlas/types";

const dodo = new DodoPayments({
  bearerToken: env.DODO_PAYMENTS_API_KEY || "",
});

export async function verifyOrgAdmin(userId: string, orgId: string) {
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

export async function createCheckout(
  userId: string, 
  userEmail: string, 
  organizationId: string, 
  successUrl: string
) {
  await verifyOrgAdmin(userId, organizationId);

  const [org] = await dbClient
    .select()
    .from(appSchema.organization)
    .where(eq(appSchema.organization.id, organizationId));

  if (!org) throw new NotFoundError("Organization not found");

  if (org.plan === PLANS.PRO) {
    throw new ConflictError("Organization is already on the Pro plan");
  }

  // Find or create customer
  let customerId = org.dodoCustomerId;
  if (!customerId) {
    const customer = await dodo.customers.create({
      name: org.name,
      email: userEmail,
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
    return_url: successUrl,
  });

  return session.checkout_url;
}

export async function createPortal(userId: string, organizationId: string, returnUrl: string) {
  await verifyOrgAdmin(userId, organizationId);

  const [org] = await dbClient
    .select()
    .from(appSchema.organization)
    .where(eq(appSchema.organization.id, organizationId));

  if (!org || !org.dodoCustomerId) {
    throw new NotFoundError("No active billing profile found");
  }

  const session = await dodo.customers.customerPortal.create(org.dodoCustomerId, {
    return_url: returnUrl,
  });

  return session.link;
}

export async function processWebhook(payload: string, headers: { sig: string; id: string; timestamp: string }) {
  const wh = new Webhook(env.DODO_WEBHOOK_SECRET || "");

  const event = wh.verify(payload, {
    "webhook-id": headers.id,
    "webhook-signature": headers.sig,
    "webhook-timestamp": headers.timestamp
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

  return true;
}