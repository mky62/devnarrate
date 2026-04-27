import { InferenceClient } from "@huggingface/inference";

const HF_EMBEDDING_MODEL = "Qwen/Qwen3-Embedding-0.6B";

function getHFClient() {
  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new Error("HF_TOKEN is not set");
  }

  return new InferenceClient(token);
}

function normalizeEmbedding(result: number[] | number[][]): number[][] {
  if (Array.isArray(result[0])) {
    return result as number[][];
  }

  return [result as number[]];
}

export async function embedTexts(texts: string[]): Promise<number[][]> {
  if (texts.length === 0) {
    return [];
  }

  const client = getHFClient();
  const allEmbeddings: number[][] = [];

  for (const text of texts) {
    const output = await client.featureExtraction({
      model: HF_EMBEDDING_MODEL,
      inputs: text,
      provider: "hf-inference",
    });

    const embeddings = normalizeEmbedding(output as number[] | number[][]);
    allEmbeddings.push(...embeddings);
  }

  return allEmbeddings;
}

export async function embedText(text: string): Promise<number[]> {
  const embeddings = await embedTexts([text]);
  if (!embeddings || embeddings.length === 0 || !Array.isArray(embeddings[0])) {
    throw new Error(
      `Failed to generate embedding for text: "${text.slice(0, 100)}..." - empty or invalid response from embedTexts`
    );
  }

  return embeddings[0];
}
