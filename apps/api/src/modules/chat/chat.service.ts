import { dbClient, appSchema } from "@atlas/database";
import { eq, sql } from "drizzle-orm";
import { UnauthorizedError } from "../../common/errors/index.js";
import type { ChatInput, ChatResponse } from "./chat.types.js";
import { aiEngine } from "@atlas/ai";
import { generateEmbedding } from "@atlas/embeddings";

export async function processChat(
  apiKey: string,
  input: ChatInput,
): Promise<ChatResponse> {
  // 1. Validate API Key
  const [keyRecord] = await dbClient
    .select()
    .from(appSchema.apiKey)
    .where(eq(appSchema.apiKey.key, apiKey));

  if (!keyRecord) {
    throw new UnauthorizedError("Invalid API key");
  }

  // 2. Generate embedding for user query
  const queryEmbedding = await generateEmbedding(input.message);

  // 3. Vector Similarity Search
  // We use pgvector cosine distance `<=>` and limit to top 5 chunks
  const vectorStr = `[${queryEmbedding.join(",")}]`;
  const contextChunks = await dbClient
    .select({
      content: appSchema.documentChunk.content,
      url: appSchema.documentChunk.url,
    })
    .from(appSchema.documentChunk)
    .where(eq(appSchema.documentChunk.organizationId, keyRecord.organizationId))
    .orderBy(sql`${appSchema.documentChunk.embedding} <=> ${vectorStr}::vector`)
    .limit(5);

  const sources = contextChunks.map((chunk) => chunk.url);
  const contextText = contextChunks.map((c) => c.content).join("\n\n---\n\n");

  const systemPrompt = `You are a helpful support bot for the organization.
Answer queries concisely based strictly on the context provided.
If the context does not contain the answer, say you do not know.

CONTEXT:
${contextText}`;

  // 4. Call LLM with the Fallback Chain
  const reply = await aiEngine.generateWithFallback(
    input.message,
    systemPrompt,
  );

  return {
    reply,
    sources: [...new Set(sources)], // unique URLs
  };
}
