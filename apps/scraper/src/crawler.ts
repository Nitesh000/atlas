import { chromium, Browser, Page } from 'playwright';
import { extractAndClean } from './extractor.js';
import { chunkMarkdown } from './chunker.js';

export interface CrawlOptions {
  startUrl: string;
  maxPages?: number;
  ignoreExternal?: boolean;
}

export class Crawler {
  private visited = new Set<string>();
  private queue: string[] = [];
  private browser: Browser | null = null;
  
  constructor(private options: CrawlOptions) {
    this.queue.push(options.startUrl);
  }

  async init() {
    this.browser = await chromium.launch({ headless: true });
  }

  async close() {
    if (this.browser) {
      await this.browser.close();
    }
  }

  async run() {
    if (!this.browser) await this.init();
    
    const maxPages = this.options.maxPages || 50;
    const startUrlObj = new URL(this.options.startUrl);
    const results = [];

    while (this.queue.length > 0 && this.visited.size < maxPages) {
      const url = this.queue.shift();
      if (!url || this.visited.has(url)) continue;
      
      this.visited.add(url);
      console.log(`Crawling: ${url}`);
      
      const context = await this.browser!.newContext();
      const page = await context.newPage();
      
      try {
        await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
        const html = await page.content();
        
        // Extract and clean
        const extracted = extractAndClean(html);
        
        // Chunk
        const chunks = chunkMarkdown(extracted.markdown, extracted.title);
        
        results.push({
          url,
          title: extracted.title,
          metadata: extracted.metadata,
          chunks
        });

        // Find internal links
        if (this.options.ignoreExternal !== false) {
          const links = await page.$$eval('a', els => els.map(a => a.href));
          for (const link of links) {
            try {
              const linkUrl = new URL(link);
              // Clean URL (remove hash)
              linkUrl.hash = '';
              const cleanLink = linkUrl.toString();
              
              if (linkUrl.hostname === startUrlObj.hostname && !this.visited.has(cleanLink)) {
                this.queue.push(cleanLink);
              }
            } catch (e) {
              // Ignore invalid URLs
            }
          }
        }
      } catch (error) {
        console.error(`Failed to crawl ${url}:`, error);
      } finally {
        await context.close();
      }
    }
    
    return results;
  }
}