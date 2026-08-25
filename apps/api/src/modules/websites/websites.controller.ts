import type { FastifyReply, FastifyRequest } from "fastify";
import type { CreateWebsiteInput } from "./websites.types.js";
import { createWebsite, listWebsites } from "./websites.service.js";
import { dbClient, appSchema } from "@atlas/database";
import { and, eq, sql } from "drizzle-orm";
import { UnauthorizedError } from "../../common/errors/index.js";
import { redisClient, crawlQueue } from "@atlas/queue";

async function verifyOrgMember(userId: string, orgId: string) {
  const [member] = await dbClient
    .select()
    .from(appSchema.organizationMember)
    .where(
      and(
        eq(appSchema.organizationMember.userId, userId),
        eq(appSchema.organizationMember.organizationId, orgId),
      ),
    );

  if (!member) {
    throw new UnauthorizedError("Not a member of this organization");
  }
}

export async function createWebsiteHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = request.params as { orgId: string };
  const body = request.body as Omit<CreateWebsiteInput, "organizationId">;
  const { orgId } = params;

  await verifyOrgMember(request.user!.id, orgId);

  // Check limit (Max 100 websites per org)
  const result = await dbClient
    .select({ count: sql<number>`count(*)` })
    .from(appSchema.website)
    .where(eq(appSchema.website.organizationId, orgId));

  const count = result[0]?.count || 0;

  if (Number(count) >= 100) {
    return reply
      .status(400)
      .send({ message: "Website limit reached (max 100)." });
  }

  // Check unique URL
  const [existingWebsite] = await dbClient
    .select()
    .from(appSchema.website)
    .where(
      and(
        eq(appSchema.website.organizationId, orgId),
        eq(appSchema.website.url, body.url),
      ),
    );

  if (existingWebsite) {
    return reply
      .status(409)
      .send({
        message: "This website has already been added to your organization.",
      });
  }

  const website = await createWebsite({
    url: body.url,
    organizationId: orgId,
  });

  return reply.status(201).send(website);
}

export async function listWebsitesHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = request.params as { orgId: string };

  await verifyOrgMember(request.user!.id, params.orgId);

  const websites = await listWebsites(params.orgId);

  return reply.status(200).send(websites);
}

export async function rescrapeWebsiteHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = request.params as { orgId: string; id: string };

  await verifyOrgMember(request.user!.id, params.orgId);

  // Get website
  const [website] = await dbClient
    .select()
    .from(appSchema.website)
    .where(
      and(
        eq(appSchema.website.id, params.id),
        eq(appSchema.website.organizationId, params.orgId),
      ),
    );

  if (!website) {
    return reply.status(404).send({ message: "Website not found" });
  }

  // First, clear old chunks
  await dbClient
    .delete(appSchema.documentChunk)
    .where(eq(appSchema.documentChunk.websiteId, website.id));

  // Update status
  await dbClient
    .update(appSchema.website)
    .set({ status: "crawling", updatedAt: new Date() })
    .where(eq(appSchema.website.id, website.id));

  // Notify clients
  await redisClient.publish(
    `org:${params.orgId}:scrape-events`,
    JSON.stringify({ websiteId: website.id, status: "crawling" }),
  );

  // Re-queue
  await crawlQueue.add("website-crawl", {
    websiteId: website.id,
    url: website.url,
    organizationId: website.organizationId,
  });

  return reply.status(200).send({ success: true });
}

export async function websiteEventsHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = request.params as { orgId: string };

  await verifyOrgMember(request.user!.id, params.orgId);

  // Set standard SSE headers
  reply.raw.setHeader("Content-Type", "text/event-stream");
  reply.raw.setHeader("Cache-Control", "no-cache");
  reply.raw.setHeader("Connection", "keep-alive");

  // Fix CORS for hijacked SSE stream
  const origin = request.headers.origin;
  if (origin) {
    reply.raw.setHeader("Access-Control-Allow-Origin", origin);
    reply.raw.setHeader("Access-Control-Allow-Credentials", "true");
  }

  reply.hijack(); // Prevent Fastify from automatically closing the response

  // Duplicate redis client for this subscription connection
  const subscriber = redisClient.duplicate();
  await subscriber.subscribe(`org:${params.orgId}:scrape-events`);

  subscriber.on("message", (channel: string, message: string) => {
    reply.raw.write(`data: ${message}\n\n`);
  });

  // Keep connection alive with pings
  const interval = setInterval(() => {
    reply.raw.write(`: ping\n\n`);
  }, 30000);

  request.raw.on("close", () => {
    clearInterval(interval);
    subscriber.unsubscribe();
    subscriber.quit();
  });
}

export async function deleteWebsiteHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = request.params as { orgId: string; id: string };
  await verifyOrgMember(request.user!.id, params.orgId);

  // Delete chunks first
  await dbClient
    .delete(appSchema.documentChunk)
    .where(eq(appSchema.documentChunk.websiteId, params.id));

  // Delete website
  await dbClient
    .delete(appSchema.website)
    .where(
      and(
        eq(appSchema.website.id, params.id),
        eq(appSchema.website.organizationId, params.orgId),
      ),
    );

  return reply.status(200).send({ success: true });
}

export async function websitePagesHandler(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const params = request.params as { orgId: string; id: string };
  await verifyOrgMember(request.user!.id, params.orgId);

  // Get distinct URLs
  const pages = await dbClient
    .selectDistinct({ url: appSchema.documentChunk.url })
    .from(appSchema.documentChunk)
    .where(
      and(
        eq(appSchema.documentChunk.websiteId, params.id),
        eq(appSchema.documentChunk.organizationId, params.orgId),
      ),
    );

  return reply.status(200).send(pages);
}
