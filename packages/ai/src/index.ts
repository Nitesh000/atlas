import { createGroq } from "@ai-sdk/groq";
import { generateText } from "ai";
import { env } from "@atlas/config";

export class AIEngine {
  private keys: string[];

  constructor() {
    this.keys = env.GROQ_API_KEYS;
  }

  /**
   * Tries to generate text using the array of Groq keys sequentially.
   * If a key hits a rate limit or fails, it automatically falls back to the next key.
   */
  async generateWithFallback(prompt: string, systemContext?: string) {
    if (this.keys.length === 0) {
      throw new Error("No GROQ_API_KEYS configured. Add them to .env.");
    }

    let lastError: any;

    for (let i = 0; i < this.keys.length; i++) {
      const key = this.keys[i];
      try {
        const groq = createGroq({ apiKey: key });
        const { text } = await generateText({
          model: groq("openai/gpt-oss-20b"),
          prompt,
          system: systemContext,
        });

        return text;
      } catch (error: any) {
        console.warn(
          `[AI Engine] Key index ${i} failed. Trying next... Error:`,
          error?.message,
        );
        lastError = error;
        continue; // Try the next key in the chain
      }
    }

    throw new Error(
      `All ${this.keys.length} LLM keys failed. Last error: ${lastError?.message}`,
    );
  }
}

export const aiEngine = new AIEngine();
