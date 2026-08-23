import { pipeline, env } from "@xenova/transformers";

// Disable local models to download from HF hub
env.allowLocalModels = false;

let extractor: any = null;

export async function generateEmbedding(text: string): Promise<number[]> {
  if (!extractor) {
    extractor = await pipeline("feature-extraction", "Xenova/all-MiniLM-L6-v2");
  }

  const output = await extractor(text, {
    pooling: "mean",
    normalize: true,
  });

  return Array.from(output.data);
}
