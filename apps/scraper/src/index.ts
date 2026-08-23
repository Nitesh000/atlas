import { Crawler } from './crawler.js';

async function main() {
  const url = process.argv[2] || 'https://example.com';
  
  console.log(`Starting crawl for ${url}`);
  const crawler = new Crawler({
    startUrl: url,
    maxPages: 5, // Limit for MVP testing
    ignoreExternal: true
  });
  
  try {
    const results = await crawler.run();
    console.log(`Crawled ${results.length} pages.`);
    
    // For MVP, just output the first page chunks to verify
    if (results.length > 0) {
      console.log('Sample data from first page:');
      console.log(`Title: ${results[0]!.title}`);
      console.log(`Chunks generated: ${results[0]!.chunks.length}`);
    }
  } catch (error) {
    console.error('Crawl failed:', error);
  } finally {
    await crawler.close();
  }
}

main().catch(console.error);