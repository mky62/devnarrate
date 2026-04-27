import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { embedText } from "@/lib/embeddings";
import { queryPinecone, namespaceExists } from "@/lib/pinecone";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { repoId, prompt } = await req.json();

  if (!repoId || !prompt) {
    return NextResponse.json(
      { error: "Missing repoId or prompt" },
      { status: 400 }
    );
  }

  const namespace = `repo-${repoId}`;

  // Check if repo is indexed
  const isIndexed = await namespaceExists(namespace);
  if (!isIndexed) {
    return NextResponse.json(
      { error: "Repo is still being indexed. Please try again in a moment." },
      { status: 425 } // Too Early
    );
  }

  // Embed the user's prompt
  const promptEmbedding = await embedText(prompt);

  // Query Pinecone for relevant chunks
  const chunks = await queryPinecone({
    namespace,
    embedding: promptEmbedding,
    topK: 5,
  });

  if (chunks.length === 0) {
    return NextResponse.json(
      { error: "No relevant content found in the repository" },
      { status: 404 }
    );
  }

  // Build context from chunks
  const context = chunks
    .map((chunk, i) =>
      `[Source ${i + 1}] ${chunk.path} (lines ${chunk.startLine}-${chunk.endLine}):\n${chunk.text}`
    )
    .join("\n\n");

  // Create the full prompt for Gemini
  const fullPrompt = `You are a technical writer helping create blog posts about code repositories.

Based on the following repository context, write a response to the user's request.

Repository Context:
---
${context}
---

User Request: ${prompt}

Write a well-structured, informative response. Use markdown formatting. Include code examples from the context where relevant. Be technical but accessible.`;

  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  try {
    const result = await model.generateContentStream(fullPrompt);

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of result.stream) {
            const text = chunk.text();
            controller.enqueue(new TextEncoder().encode(text));
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Transfer-Encoding": "chunked",
      },
    });
  } catch (error) {
    console.error("AI generation error:", error);
    return NextResponse.json(
      { error: "Failed to generate content" },
      { status: 500 }
    );
  }
}
