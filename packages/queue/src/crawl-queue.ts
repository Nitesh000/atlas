import { Queue } from "bullmq";
import { redisClient } from "./redis.js";
import { QUEUE_NAMES } from "./queue-names.js";

export const crawlQueue = new Queue(QUEUE_NAMES.WEBSITE_CRAWL, {
  connection: redisClient,
});

export type CrawlJobData = {
  websiteId: string;
  url: string;
  organizationId: string;
};
