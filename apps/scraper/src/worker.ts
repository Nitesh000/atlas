import { Worker } from "bullmq";
import { crawlQueue, redisClient, QUEUE_NAMES, type CrawlJobData } from "@atlas/queue";
import { dbClient, appSchema } from "@atlas/database";
import { eq } from "drizzle-orm";
import { ScraperEngine } from "./index.js"; // Using your existing scraper setup

async function updateWebsiteStatus(websiteId: string, status: "crawling" | "completed" | "failed") {
  await dbClient
    .update(appSchema.website)
    .set({ status, updatedAt: new Date() })
    .where(eq(appSchema.website.id, websiteId));
}

const worker = new Worker<CrawlJobData>(
  QUEUE_NAMES.WEBSITE_CRAWL,
  async (job) => {
    const { websiteId, url } = job.data;
    console.log(`[CRAWLER] Starting job ${job.id} for ${url}`);

    await updateWebsiteStatus(websiteId, "crawling");

    try {
      const engine = new ScraperEngine(1); // 1 concurrency for now
      await engine.init();

      // For MVP, just crawl the single page or home page
      // Future: add depth crawling
      const chunks = await engine.processUrl(url);

      // We have the markdown chunks now.
      // Next step would be embedding generation. For now, log success.
      console.log(`[CRAWLER] Processed ${url}, generated ${chunks.length} chunks.`);

      await updateWebsiteStatus(websiteId, "completed");
    } catch (error) {
      console.error(`[CRAWLER] Failed job ${job.id} for ${url}:`, error);
      await updateWebsiteStatus(websiteId, "failed");
      throw error; // Let BullMQ handle retries
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
