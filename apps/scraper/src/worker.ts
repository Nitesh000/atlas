import { Worker } from "bullmq";
import {
  crawlQueue,
  redisClient,
  QUEUE_NAMES,
  type CrawlJobData,
} from "@atlas/queue";
import { dbClient, appSchema } from "@atlas/database";
import { eq } from "drizzle-orm";
import { Crawler } from "./crawler.js";
import { generateEmbedding } from "@atlas/embeddings";

async function updateWebsiteStatus(
  websiteId: string,
  status: "crawling" | "completed" | "failed",
) {
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

    let crawler;
    try {
      crawler = new Crawler({
        startUrl: url,
        maxPages: 5,
        ignoreExternal: true,
      });

      const pages = await crawler.run();
      console.log(`[CRAWLER] Processed ${url}, scraped ${pages.length} pages.`);

      let totalChunks = 0;
      // Embed and insert chunks for all crawled pages
      for (const page of pages) {
        for (const chunk of page.chunks) {
          if (!chunk.content.trim()) continue;
          
          const embedding = await generateEmbedding(chunk.content);
          
          await dbClient.insert(appSchema.documentChunk).values({
            organizationId,
            websiteId,
            url: page.url,
            content: chunk.content,
            embedding,
          });
          totalChunks++;
        }
      }

      console.log(`[CRAWLER] Stored ${totalChunks} vectorized chunks for ${url}`);
      await updateWebsiteStatus(websiteId, "completed");
    } catch (error) {
      console.error(`[CRAWLER] Failed job ${job.id} for ${url}:`, error);
      await updateWebsiteStatus(websiteId, "failed");
      throw error;
    } finally {
      if (crawler) {
        await crawler.close();
      }
    }
  },
  {
    connection: redisClient,
    concurrency: 2,
  },
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
