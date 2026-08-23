import { dbClient, appSchema } from "@atlas/database";
import { and, eq, sql } from "drizzle-orm";
import { UnauthorizedError } from "../../common/errors/index.js";
import {
  RateLimitError,
  ForbiddenError,
} from "../../common/errors/http-errors.js";
import type { ChatInput, ChatResponse } from "./chat.types.js";
import { aiEngine } from "@atlas/ai";
import { generateEmbedding } from "@atlas/embeddings";

export async function processChat(
  apiKey: string,
  input: ChatInput,
  origin?: string,
): Promise<ChatResponse> {
  // 1. Validate API Key
  const [keyRecord] = await dbClient
    .select()
    .from(appSchema.apiKey)
    .where(eq(appSchema.apiKey.key, apiKey));

  if (!keyRecord) {
    throw new UnauthorizedError("Invalid API key");
  }

  // Domain Validation
  if (keyRecord.allowedDomains && keyRecord.allowedDomains.length > 0) {
    if (!origin) {
      throw new ForbiddenError(
        "Missing origin header for domain-restricted API key",
      );
    }

    try {
      const originUrl = new URL(origin);
      const isAllowed = keyRecord.allowedDomains.some((domain) => {
        // Strip protocol and exact match or subdomain match
        const cleanDomain = domain
          .replace(/^https?:\/\//, "")
          .replace(/\/$/, "");
        return (
          originUrl.hostname === cleanDomain ||
          originUrl.hostname.endsWith(`.${cleanDomain}`)
        );
      });

      if (!isAllowed) {
        throw new ForbiddenError(
          `Origin ${originUrl.hostname} is not permitted by this API key`,
        );
      }
    } catch (e) {
      if (e instanceof ForbiddenError) throw e;
      throw new ForbiddenError("Invalid origin header");
    }
  }

  const organizationId = keyRecord.organizationId;

  // 2. Usage limit check
  const monthYear = new Date().toISOString().slice(0, 7); // e.g., "2023-10"

  const usageRecords = await dbClient
    .select()
    .from(appSchema.apiUsage)
    .where(
      and(
        eq(appSchema.apiUsage.organizationId, organizationId),
        eq(appSchema.apiUsage.monthYear, monthYear),
      ),
    );

  let usageRecord = usageRecords[0];

  if (!usageRecord) {
    // Initialize if not exists
    const newRecords = await dbClient
      .insert(appSchema.apiUsage)
      .values({
        organizationId,
        monthYear,
        apiCallCount: 0,
      })
      .returning();
    usageRecord = newRecords[0]!;
  }

  if (usageRecord.apiCallCount >= usageRecord.limit) {
    throw new RateLimitError(
      `API rate limit reached (${usageRecord.limit} calls) for this month.`,
    );
  }

  // 3. Generate embedding for user query
  const queryEmbedding = await generateEmbedding(input.message);

  // 4. Vector Similarity Search
  // We use pgvector cosine distance `<=>` and limit to top 5 chunks
  const vectorStr = `[${queryEmbedding.join(",")}]`;
  const contextChunks = await dbClient
    .select({
      content: appSchema.documentChunk.content,
      url: appSchema.documentChunk.url,
    })
    .from(appSchema.documentChunk)
    .where(eq(appSchema.documentChunk.organizationId, organizationId))
    .orderBy(sql`${appSchema.documentChunk.embedding} <=> ${vectorStr}::vector`)
    .limit(5);

  const sources = contextChunks.map((chunk) => chunk.url);
  const contextText = contextChunks.map((c) => c.content).join("\n\n---\n\n");

  const systemPrompt = `You are a helpful support bot for the organization.
Answer queries concisely based strictly on the context provided.
If the context does not contain the answer, say you do not know.

CONTEXT:
${contextText}`;

  // 5. Call LLM with the Fallback Chain
  const reply = await aiEngine.generateWithFallback(
    input.message,
    systemPrompt,
  );

  // 6. Increment Usage
  await dbClient
    .update(appSchema.apiUsage)
    .set({
      apiCallCount: sql`${appSchema.apiUsage.apiCallCount} + 1`,
      updatedAt: new Date(),
    })
    .where(eq(appSchema.apiUsage.id, usageRecord.id));

  // 7. Update Last Used At on API Key
  await dbClient
    .update(appSchema.apiKey)
    .set({ lastUsedAt: new Date() })
    .where(eq(appSchema.apiKey.id, keyRecord.id));

  return {
    reply,
    sources: [...new Set(sources)], // unique URLs
  };
}
