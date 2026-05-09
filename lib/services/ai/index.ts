// AI service exports
export { embedTexts, embedText, embedQuery, embedPassages } from "./embeddings";
export { upsertChunksToPinecone, queryPinecone, namespaceExists, deletePineconeNamespace } from "./pinecone";
export type { QueryResult } from "./pinecone";
