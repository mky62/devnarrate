const HF_EMBEDDING_MODEL = "intfloat/multilingual-e5-large";

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

  const token = process.env.HF_TOKEN;
  if (!token) {
    throw new Error("HF_TOKEN is not set");
  }

  const response = await fetch(
    `https://router.huggingface.co/hf-inference/models/${HF_EMBEDDING_MODEL}/pipeline/feature-extraction`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      method: "POST",
      body: JSON.stringify({ inputs: texts.length === 1 ? texts[0] : texts }),
    }
  );

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(
      `HF embedding request failed (${response.status}): ${errorText}`
    );
  }

  const output = (await response.json()) as number[] | number[][];
  return normalizeEmbedding(output);
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
