export interface Chunk {
  id: string;
  path: string;
  text: string;
  startLine: number;
  endLine: number;
}

interface ChunkOptions {
  path: string;
  content: string;
  maxChunkSize?: number;  // Default: 1500 chars
  overlap?: number;       // Default: 200 chars
}

function generateChunkId(path: string, index: number): string {
  return `${path.replace(/[^a-zA-Z0-9]/g, '_')}_${index}`;
}

export function chunkCodeFile({
  path,
  content,
  maxChunkSize = 1500,
  overlap = 200,
}: ChunkOptions): Chunk[] {
  const lines = content.split('\n');
  const chunks: Chunk[] = [];

  // For code files, try to chunk at function/class boundaries
  const isCodeFile = !path.endsWith('.md') && !path.endsWith('.txt') && !path.endsWith('.mdx');

  if (isCodeFile) {
    // Look for function/class boundaries
    const boundaryPattern = /^(function\s|class\s|const\s|let\s|var\s|export\s|import\s|async\s|def\s|fn\s|pub\s|impl\s)/;

    let currentChunk: string[] = [];
    let chunkStartLine = 0;
    let currentSize = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isBoundary = boundaryPattern.test(line.trim());

      // Start new chunk at boundary if current chunk is getting large
      if (isBoundary && currentSize > maxChunkSize * 0.5 && currentChunk.length > 0) {
        chunks.push({
          id: generateChunkId(path, chunks.length),
          path,
          text: currentChunk.join('\n'),
          startLine: chunkStartLine + 1, // 1-indexed
          endLine: i,
        });

        // Keep some overlap for context
        const overlapLines = currentChunk.slice(-Math.floor(overlap / 50)); // Approximate lines
        currentChunk = [...overlapLines, line];
        currentSize = currentChunk.join('\n').length;
        chunkStartLine = i - overlapLines.length;
      } else {
        currentChunk.push(line);
        currentSize += line.length + 1; // +1 for newline
      }
    }

    // Don't forget the last chunk
    if (currentChunk.length > 0) {
      chunks.push({
        id: generateChunkId(path, chunks.length),
        path,
        text: currentChunk.join('\n'),
        startLine: chunkStartLine + 1,
        endLine: lines.length,
      });
    }
  } else {
    // For markdown/text, chunk by paragraphs/headers
    let currentChunk: string[] = [];
    let chunkStartLine = 0;
    let currentSize = 0;

    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      const isHeader = line.startsWith('#');

      // Start new chunk at header if current is large enough
      if (isHeader && currentSize > maxChunkSize * 0.3 && currentChunk.length > 0) {
        chunks.push({
          id: generateChunkId(path, chunks.length),
          path,
          text: currentChunk.join('\n').trim(),
          startLine: chunkStartLine + 1,
          endLine: i,
        });

        currentChunk = [line];
        currentSize = line.length;
        chunkStartLine = i;
      } else if (currentSize > maxChunkSize && currentChunk.length > 0) {
        // Also chunk if size exceeds max (else if prevents double-push with header split)
        chunks.push({
          id: generateChunkId(path, chunks.length),
          path,
          text: currentChunk.join('\n').trim(),
          startLine: chunkStartLine + 1,
          endLine: i + 1,
        });

        // Overlap for context
        const overlapLines = currentChunk.slice(-3);
        currentChunk = [...overlapLines];
        currentSize = currentChunk.join('\n').length;
        chunkStartLine = Math.max(0, i - overlapLines.length + 1);
      } else {
        currentChunk.push(line);
        currentSize += line.length + 1;
      }
    }

    // Last chunk
    if (currentChunk.length > 0) {
      chunks.push({
        id: generateChunkId(path, chunks.length),
        path,
        text: currentChunk.join('\n').trim(),
        startLine: chunkStartLine + 1,
        endLine: lines.length,
      });
    }
  }

  return chunks;
}
