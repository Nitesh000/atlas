import type { CreateWebsiteInput, Website } from "./websites.types.js";
import { insertWebsite, findWebsitesByOrgId } from "./websites.repository.js";
import { crawlQueue } from "@atlas/queue";

export async function createWebsite(input: CreateWebsiteInput): Promise<Website> {
  // Normalize URL
  const parsedUrl = new URL(input.url);
  const normalizedUrl = `${parsedUrl.protocol}//${parsedUrl.host}${parsedUrl.pathname}`;

  const website = await insertWebsite({
    ...input,
    url: normalizedUrl,
  });

  // Enqueue background crawl job
  await crawlQueue.add(
    "crawl-website",
    {
      websiteId: website.id,
      url: website.url,
      organizationId: input.organizationId,
    },
    {
      jobId: `crawl_${website.id}`,
      attempts: 3,
      backoff: { type: "exponential", delay: 1000 },
    },
  );

  return website;
}

export async function listWebsites(orgId: string): Promise<Website[]> {
  return findWebsitesByOrgId(orgId);
}
