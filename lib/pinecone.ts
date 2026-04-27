import { Pinecone } from '@pinecone-database/pinecone';

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

const index = pinecone.Index(process.env.PINECONE_INDEX!);

interface ChunkWithEmbedding {
  id: string;
  text: string;
  path: string;
  startLine: number;
  endLine: number;
  embedding: number[];
}

interface UpsertOptions {
  namespace: string;
  chunks: ChunkWithEmbedding[];
}

export async function upsertChunksToPinecone({ namespace, chunks }: UpsertOptions): Promise<void> {
  if (chunks.length === 0) {
    return;
  }

  // Pinecone has a limit of 100 vectors per upsert
  const batchSize = 100;

  for (let i = 0; i < chunks.length; i += batchSize) {
    const batch = chunks.slice(i, i + batchSize);

    const records = batch.map(chunk => ({
      id: chunk.id,
      values: chunk.embedding,
      metadata: {
        text: chunk.text,
        path: chunk.path,
        startLine: chunk.startLine,
        endLine: chunk.endLine,
      },
    }));

    await index.namespace(namespace).upsert({ records });
  }
}

interface QueryOptions {
  namespace: string;
  embedding: number[];
  topK?: number;
}

interface QueryResult {
  id: string;
  text: string;
  path: string;
  startLine: number;
  endLine: number;
  score: number;
}

export async function queryPinecone({
  namespace,
  embedding,
  topK = 5,
}: QueryOptions): Promise<QueryResult[]> {
  const results = await index.namespace(namespace).query({
    vector: embedding,
    topK,
    includeMetadata: true,
  });

  return results.matches?.map(match => ({
    id: match.id,
    text: (match.metadata?.text as string) || '',
    path: (match.metadata?.path as string) || '',
    startLine: (match.metadata?.startLine as number) || 0,
    endLine: (match.metadata?.endLine as number) || 0,
    score: match.score || 0,
  })) || [];
}

// Check if namespace has any vectors (to verify indexing is done)
export async function namespaceExists(namespace: string): Promise<boolean> {
  try {
    const stats = await index.namespace(namespace).describeIndexStats();
    return (stats.totalRecordCount || 0) > 0;
  } catch {
    return false;
  }
}
