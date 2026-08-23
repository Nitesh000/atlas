import { Worker } from "bullmq";
import { Sema } from "async-sema";
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

// Limit concurrent browser instances to prevent RAM exhaustion
const chromeSemaphore = new Sema(3);

async function updateWebsiteStatus(
  websiteId: string,
  organizationId: string,
  status: "crawling" | "completed" | "failed",
) {
  await dbClient
    .update(appSchema.website)
    .set({ status, updatedAt: new Date() })
    .where(eq(appSchema.website.id, websiteId));
    
  await redisClient.publish(
    `org:${organizationId}:scrape-events`,
    JSON.stringify({ websiteId, status })
  );
}

const worker = new Worker<CrawlJobData>(
  QUEUE_NAMES.WEBSITE_CRAWL,
  async (job) => {
    const { websiteId, url, organizationId } = job.data;
    console.log(`[CRAWLER] Starting job ${job.id} for ${url}`);

    await updateWebsiteStatus(websiteId, organizationId, "crawling");

    let crawler;
    try {
      await chromeSemaphore.acquire();
      console.log(`[CRAWLER] Acquired Chrome slot for ${url}. Active instances: ${3 - chromeSemaphore.nrWaiting()}`);
      
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

      console.log(
        `[CRAWLER] Stored ${totalChunks} vectorized chunks for ${url}`,
      );
      await updateWebsiteStatus(websiteId, organizationId, "completed");
    } catch (error) {
      console.error(`[CRAWLER] Failed job ${job.id} for ${url}:`, error);
      await updateWebsiteStatus(websiteId, organizationId, "failed");
      throw error;
    } finally {
      if (crawler) {
        await crawler.close();
      }
      chromeSemaphore.release();
    }
  },
  {
    connection: redisClient,
    concurrency: 5, // We can run 5 concurrent jobs, but only 3 can have Chrome open at once
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
