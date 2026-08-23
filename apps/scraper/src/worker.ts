import { Worker } from "bullmq";
import { crawlQueue, redisClient, QUEUE_NAMES, type CrawlJobData } from "@atlas/queue";
import { dbClient, appSchema } from "@atlas/database";
import { eq } from "drizzle-orm";
import { ScraperEngine } from "./index.js";
import { generateEmbedding } from "@atlas/embeddings";

async function updateWebsiteStatus(websiteId: string, status: "crawling" | "completed" | "failed") {
  await dbClient
    .update(appSchema.website)
    .set({ status, updatedAt: new Date() })
    .where(eq(appSchema.website.id, websiteId));
}

const worker = new Worker<CrawlJobData>(
  QUEUE_NAMES.WEBSITE_CRAWL,
  async (job) => {
    const { websiteId, url, organizationId } = job.data;
    console.log(`[CRAWLER] Starting job ${job.id} for ${url}`);

    await updateWebsiteStatus(websiteId, "crawling");

    try {
      const engine = new ScraperEngine(1);
      await engine.init();

      const chunks = await engine.processUrl(url);
      console.log(`[CRAWLER] Processed ${url}, generated ${chunks.length} chunks.`);

      // Embed and insert chunks
      for (const chunk of chunks) {
        if (!chunk.text.trim()) continue;
        
        const embedding = await generateEmbedding(chunk.text);
        
        await dbClient.insert(appSchema.documentChunk).values({
          organizationId,
          websiteId,
          url: chunk.url,
          content: chunk.text,
          embedding,
        });
      }

      console.log(`[CRAWLER] Stored ${chunks.length} vectorized chunks for ${url}`);
      await updateWebsiteStatus(websiteId, "completed");
    } catch (error) {
      console.error(`[CRAWLER] Failed job ${job.id} for ${url}:`, error);
      await updateWebsiteStatus(websiteId, "failed");
      throw error;
    }
  },
  {
    connection: redisClient,
    concurrency: 2,
  }
);

worker.on("completed", (job) => {
  console.log(`[WORKER] Job ${job.id} completed successfully`);
});

worker.on("failed", (job, err) => {
  console.log(`[WORKER] Job ${job?.id} failed with ${err.message}`);
});

console.log(`[WORKER] Listening for jobs on ${QUEUE_NAMES.WEBSITE_CRAWL}...`);

// Graceful shutdown
process.on("SIGINT", async () => {
  console.log("Shutting down worker...");
  await worker.close();
  process.exit(0);
});
