export interface Chunk {
  content: string;
  metadata: {
    title: string;
    heading?: string;
  };
}

export function chunkMarkdown(markdown: string, title: string, maxLength: number = 1000): Chunk[] {
  const chunks: Chunk[] = [];
  
  // Basic semantic splitting by headings (H1, H2, H3)
  const sections = markdown.split(/(?=^#{1,3} )/gm);
  
  for (const section of sections) {
    const lines = section.split('\n');
    let currentHeading = '';
    
    if (lines[0].startsWith('#')) {
      currentHeading = lines[0].replace(/^#{1,3}\s+/, '').trim();
    }
    
    // If a section is too long, split by double newlines (paragraphs)
    if (section.length > maxLength) {
      const paragraphs = section.split('\n\n');
      let currentChunk = '';
      
      for (const p of paragraphs) {
        if ((currentChunk.length + p.length) > maxLength && currentChunk.length > 0) {
          chunks.push({
            content: currentChunk.trim(),
            metadata: { title, heading: currentHeading }
          });
          currentChunk = p;
        } else {
          currentChunk += (currentChunk.length > 0 ? '\n\n' : '') + p;
        }
      }
      
      if (currentChunk.trim().length > 0) {
        chunks.push({
          content: currentChunk.trim(),
          metadata: { title, heading: currentHeading }
        });
      }
    } else if (section.trim().length > 0) {
      chunks.push({
        content: section.trim(),
        metadata: { title, heading: currentHeading }
      });
    }
  }
  
  return chunks;
}