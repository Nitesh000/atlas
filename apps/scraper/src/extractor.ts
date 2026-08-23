import * as cheerio from "cheerio";
import TurndownService from "turndown";

export interface ExtractedData {
  title: string;
  metadata: Record<string, string>;
  markdown: string;
}

export function extractAndClean(html: string): ExtractedData {
  const $ = cheerio.load(html);

  // Extract title
  const title = $("title").text().trim() || $("h1").first().text().trim();

  // Extract metadata
  const metadata: Record<string, string> = {};
  $("meta").each((_, el) => {
    const name = $(el).attr("name") || $(el).attr("property");
    const content = $(el).attr("content");
    if (name && content) {
      metadata[name] = content;
    }
  });

  // Clean unnecessary elements
  $(
    'nav, footer, script, style, noscript, iframe, .cookie-banner, [role="navigation"], [role="contentinfo"]',
  ).remove();

  // Get main content. Fallback to body if no main tag.
  let mainContent =
    $("main").html() || $("article").html() || $("body").html() || "";

  // Convert to Markdown
  const turndownService = new TurndownService({
    headingStyle: "atx",
    codeBlockStyle: "fenced",
  });

  const markdown = turndownService.turndown(mainContent);

  return {
    title,
    metadata,
    markdown,
  };
}
