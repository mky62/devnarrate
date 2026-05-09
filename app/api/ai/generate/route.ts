import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { OpenRouter } from "@openrouter/sdk";
import { embedQuery, embedText } from "@/lib/embeddings";
import { queryPinecone, namespaceExists } from "@/lib/pinecone";
import { db } from "@/lib/prisma";
import { getRepoNamespace } from "@/lib/repo-indexing";
import { parseGithubRepoId } from "@/lib/github-repo-id";

export const runtime = "nodejs";
export const maxDuration = 60;

const OPENROUTER_MODEL = "nvidia/nemotron-3-super-120b-a12b:free";
const RETRIEVAL_TOP_K = 10;
const MIN_RELEVANCE_SCORE = 0.2;
const MAX_CONTEXT_CHARS = 14000;
const RETRIEVAL_TIMEOUT_MS = 20000;
const OPENROUTER_TIMEOUT_MS = 45000;
const STREAM_IDLE_TIMEOUT_MS = 30000;

const CONTENT_TYPES = ["tutorial", "overview", "changelog-style", "implementation deep dive"] as const;
const AUDIENCES = ["beginner", "intermediate", "advanced"] as const;
const TONES = ["concise", "explanatory", "polished"] as const;

type ContentType = (typeof CONTENT_TYPES)[number];
type Audience = (typeof AUDIENCES)[number];
type Tone = (typeof TONES)[number];

interface GenerateOptions {
  contentType: ContentType;
  audience: Audience;
  tone: Tone;
}

interface RetrievedChunk {
  id: string;
  text: string;
  path: string;
  startLine: number;
  endLine: number;
  score: number;
}

function pickOption<T extends readonly string[]>(
  value: unknown,
  allowed: T,
  fallback: T[number]
): T[number] {
  return typeof value === "string" && allowed.includes(value)
    ? value
    : fallback;
}

function getGenerateOptions(body: {
  contentType?: unknown;
  audience?: unknown;
  tone?: unknown;
}): GenerateOptions {
  return {
    contentType: pickOption(body.contentType, CONTENT_TYPES, "tutorial"),
    audience: pickOption(body.audience, AUDIENCES, "intermediate"),
    tone: pickOption(body.tone, TONES, "explanatory"),
  };
}

function hasLineOverlap(a: RetrievedChunk, b: RetrievedChunk): boolean {
  if (a.path !== b.path) {
    return false;
  }

  return a.startLine <= b.endLine && b.startLine <= a.endLine;
}

function dedupeChunks(chunks: RetrievedChunk[]): RetrievedChunk[] {
  return chunks.reduce<RetrievedChunk[]>((deduped, chunk) => {
    const normalizedText = chunk.text.trim();
    const duplicate = deduped.some((existing) => {
      const existingText = existing.text.trim();
      return (
        existing.id === chunk.id ||
        existingText === normalizedText ||
        (hasLineOverlap(existing, chunk) && existingText.includes(normalizedText))
      );
    });

    if (!duplicate) {
      deduped.push(chunk);
    }

    return deduped;
  }, []);
}

function buildRepositoryContext(chunks: RetrievedChunk[]): string {
  const byPath = new Map<string, RetrievedChunk[]>();

  for (const chunk of chunks) {
    const pathChunks = byPath.get(chunk.path) ?? [];
    pathChunks.push(chunk);
    byPath.set(chunk.path, pathChunks);
  }

  let context = "";
  let sourceNumber = 1;

  for (const [path, pathChunks] of byPath) {
    const fileHeader = `File: ${path}\n`;

    if (context.length + fileHeader.length > MAX_CONTEXT_CHARS) {
      break;
    }

    context += context ? `\n${fileHeader}` : fileHeader;

    const orderedChunks = [...pathChunks].sort((a, b) => a.startLine - b.startLine);
    for (const chunk of orderedChunks) {
      const sourceBlock = [
        `[Source ${sourceNumber}] lines ${chunk.startLine}-${chunk.endLine}, relevance ${chunk.score.toFixed(3)}`,
        "```",
        chunk.text.trim(),
        "```",
        "",
      ].join("\n");

      if (context.length + sourceBlock.length > MAX_CONTEXT_CHARS) {
        return context.trim();
      }

      context += sourceBlock;
      sourceNumber += 1;
    }
  }

  return context.trim();
}

function buildSystemPrompt(options: GenerateOptions): string {
  return [
    "You are a senior technical writer helping developers write repository-specific articles.",
    `Write a ${options.contentType} for a ${options.audience} developer audience in a ${options.tone} tone.`,
    "Use only the retrieved repository context for repo-specific claims.",
    "Do not invent files, APIs, architecture, dependencies, commands, behavior, or implementation details.",
    "When discussing implementation details, cite the file path inline, for example `(app/api/example/route.ts)`.",
    "If the context is not enough for part of the request, say what is missing and continue with the supported parts.",
    "Return polished markdown with a title, brief introduction, clear sections, concrete repo-specific details, and practical examples when the context supports them.",
  ].join(" ");
}

function buildUserPrompt({
  context,
  prompt,
  options,
}: {
  context: string;
  prompt: string;
  options: GenerateOptions;
}): string {
  return `Repository context:
---
${context}
---

Writing options:
- Content type: ${options.contentType}
- Audience: ${options.audience}
- Tone: ${options.tone}

User request:
${prompt}

Write the response now.`;
}

function filterRelevantChunks(chunks: RetrievedChunk[]): RetrievedChunk[] {
  return chunks.filter((chunk) => chunk.score >= MIN_RELEVANCE_SCORE);
}

function getOpenRouterClient(): OpenRouter {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENROUTER_API_KEY");
  }

  return new OpenRouter({
    apiKey,
    httpReferer: process.env.BETTER_AUTH_URL || "http://localhost:3000",
    appTitle: "devnarrate",
    timeoutMs: OPENROUTER_TIMEOUT_MS,
    retryConfig: { strategy: "none" },
  });
}

function withTimeout<T>(promise: Promise<T>, timeoutMs: number, label: string): Promise<T> {
  let timeout: ReturnType<typeof setTimeout>;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeout = setTimeout(() => {
      reject(new Error(`${label} timed out after ${Math.round(timeoutMs / 1000)}s`));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeout);
  });
}

export async function POST(req: Request) {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: {
    repoId?: string | number;
    prompt?: string;
    contentType?: string;
    audience?: string;
    tone?: string;
  };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { repoId, prompt } = body;

  if (!repoId) {
    return NextResponse.json({ error: "Missing repoId" }, { status: 400 });
  }

  const githubRepoId = parseGithubRepoId(repoId);
  if (!githubRepoId) {
    return NextResponse.json({ error: "Missing repoId" }, { status: 400 });
  }

  if (typeof prompt !== 'string' || prompt.trim().length === 0) {
    return NextResponse.json({ error: "prompt must be a non-empty string" }, { status: 400 });
  }

  const trimmedPrompt = prompt.trim();
  const generationOptions = getGenerateOptions(body);
  const MAX_PROMPT_LENGTH = 4000;
  if (trimmedPrompt.length > MAX_PROMPT_LENGTH) {
    return NextResponse.json({ error: "Prompt too long" }, { status: 413 });
  }

  const repo = await db.repo.findFirst({
    where: {
      githubRepoId,
      userId: session.user.id,
    },
    select: {
      githubRepoId: true,
      indexNamespace: true,
    },
  });

  if (!repo) {
    return NextResponse.json({ error: "Repository not found" }, { status: 404 });
  }

  const namespace = repo.indexNamespace ?? getRepoNamespace({
    userId: session.user.id,
    repoId: repo.githubRepoId,
  });

  let context: string;

  try {
    // Check if repo is indexed
    const isIndexed = await withTimeout(
      namespaceExists(namespace),
      RETRIEVAL_TIMEOUT_MS,
      "Repository index check"
    );

    if (!isIndexed) {
      return NextResponse.json(
        { error: "Repo is still being indexed. Please try again in a moment." },
        { status: 425 } // Too Early
      );
    }

    // Embed the user's prompt with the query prefix expected by E5 models.
    const promptEmbedding = await withTimeout(
      embedQuery(trimmedPrompt),
      RETRIEVAL_TIMEOUT_MS,
      "Prompt embedding"
    );

    // Query Pinecone for relevant chunks
    let chunks = filterRelevantChunks(await withTimeout(
      queryPinecone({
        namespace,
        embedding: promptEmbedding,
        topK: RETRIEVAL_TOP_K,
      }),
      RETRIEVAL_TIMEOUT_MS,
      "Repository context search"
    ));

    if (chunks.length === 0) {
      const legacyPromptEmbedding = await withTimeout(
        embedText(trimmedPrompt),
        RETRIEVAL_TIMEOUT_MS,
        "Fallback prompt embedding"
      );
      chunks = filterRelevantChunks(await withTimeout(
        queryPinecone({
          namespace,
          embedding: legacyPromptEmbedding,
          topK: RETRIEVAL_TOP_K,
        }),
        RETRIEVAL_TIMEOUT_MS,
        "Fallback repository context search"
      ));
    }

    if (chunks.length === 0) {
      return NextResponse.json(
        { error: "No sufficiently relevant content found in the repository" },
        { status: 404 }
      );
    }

    context = buildRepositoryContext(dedupeChunks(chunks));
    if (!context) {
      return NextResponse.json(
        { error: "No usable repository context found" },
        { status: 404 }
      );
    }
  } catch (error) {
    console.error("AI retrieval error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to retrieve repository context" },
      { status: 504 }
    );
  }

  try {
    const openRouter = getOpenRouterClient();

    const stream = await withTimeout(
      openRouter.chat.send(
        {
          chatRequest: {
            model: OPENROUTER_MODEL,
            messages: [
              {
                role: "system",
                content: buildSystemPrompt(generationOptions),
              },
              {
                role: "user",
                content: buildUserPrompt({
                  context,
                  prompt: trimmedPrompt,
                  options: generationOptions,
                }),
              },
            ],
            stream: true,
            temperature: 0.7,
          },
        },
        {
          timeoutMs: OPENROUTER_TIMEOUT_MS,
          retries: { strategy: "none" },
          retryCodes: [],
        }
      ),
      OPENROUTER_TIMEOUT_MS,
      "AI provider"
    );

    const encoder = new TextEncoder();
    const iterator = stream[Symbol.asyncIterator]();

    const readNextChunk = () =>
      withTimeout(
        iterator.next(),
        STREAM_IDLE_TIMEOUT_MS,
        "AI stream"
      );

    const responseStream = new ReadableStream({
      async start(controller) {
        try {
          while (true) {
            const { done, value: chunk } = await readNextChunk();
            if (done) break;

            if ("error" in chunk) {
              throw new Error(chunk.error?.message || "OpenRouter stream error");
            }

            const content = chunk.choices?.[0]?.delta?.content;
            if (content) {
              controller.enqueue(encoder.encode(content));
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
