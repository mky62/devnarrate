import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { OpenRouter } from "@openrouter/sdk";
import { embedText } from "@/lib/embeddings";
import { queryPinecone, namespaceExists } from "@/lib/pinecone";

const OPENROUTER_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";
const openRouter = new OpenRouter({
  apiKey: process.env.OPENROUTER_API_KEY ?? "",
  httpReferer: process.env.BETTER_AUTH_URL || "http://localhost:3000",
  appTitle: "devnarrate",
});

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: { repoId?: string | number; prompt?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { repoId, prompt } = body;

  if (!repoId) {
    return NextResponse.json({ error: "Missing repoId" }, { status: 400 });
  }

  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    return NextResponse.json({ error: "prompt must be a non-empty string" }, { status: 400 });
  }

  const trimmedPrompt = prompt.trim();
  const MAX_PROMPT_LENGTH = 4000;
  if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json({ error: "Prompt too long" }, { status: 413 });
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

  // Create the full prompt for OpenRouter
  const fullPrompt = `You are a technical writer helping create blog posts about code repositories.

Based on the following repository context, write a response to the user's request.

Repository Context:
---
${context}
---

User Request: ${prompt}

Write a well-structured, informative response. Use markdown formatting. Include code examples from the context where relevant. Be technical but accessible.`;

  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: "Missing OPENROUTER_API_KEY" },
        { status: 500 }
      );
    }

    const stream = await openRouter.chat.send({
      model: OPENROUTER_MODEL,
      messages: [
        {
          role: "system",
          content:
            "You are a technical writer helping create blog posts about code repositories.",
        },
        {
          role: "user",
          content: fullPrompt,
        },
      ],
      stream: true,
      temperature: 0.7,
    });

    const encoder = new TextEncoder();

    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            if ("error" in chunk) {
              throw new Error(chunk.error?.message || "OpenRouter stream error");
            }

            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
            }

            if (chunk.usage?.reasoningTokens !== undefined) {
              console.log("Reasoning tokens:", chunk.usage.reasoningTokens);
            }
          }
          controller.close();
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return new Response(responseStream, {
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
