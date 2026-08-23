import { dbClient, appSchema } from "@atlas/database";
import { eq } from "drizzle-orm";
import { UnauthorizedError } from "../../common/errors/index.js";
import type { ChatInput, ChatResponse } from "./chat.types.js";
import { aiEngine } from "@atlas/ai";

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

  // MVP Context: Hardcoded system prompt for now. 
  // Next Step: RAG vector search from PgVector
  const systemPrompt = `You are a helpful support bot for ${keyRecord.name}. Answer queries concisely.`;

  // 2. Call LLM with the Fallback Chain
  const reply = await aiEngine.generateWithFallback(input.message, systemPrompt);

  return {
    reply,
    sources: [],
  };
}
