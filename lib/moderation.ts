import {
  getDeletionDeadline,
  INBOX_MESSAGE_STATUS,
  INBOX_MESSAGE_TYPE,
  POST_VISIBILITY,
  REVIEW_STATUS,
} from "@/lib/post-moderation";
import { extractPlainTextFromTiptapJson } from "@/lib/tiptap-text";
import { Prisma } from "@/packages/generated/prisma/client";

export interface ModerationInput {
  postId: string;
  title: string;
  content: string;
}

export interface ModerationWritingFeedback {
  summary: string;
  suggestions: string[];
}

export interface ModerationResult {
  decision: "approve" | "flag";
  unsafeReasons: string[];
  flaggedSnippets: string[];
  writingFeedback: ModerationWritingFeedback;
  reviewSummary: string;
}

type OpenRouterMessage = {
  role: "system" | "user";
  content: string;
};

const DEFAULT_OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1";
const DEFAULT_OPENROUTER_MODEL = "openai/gpt-4o-mini";

function toInputJsonValue(value: unknown): Prisma.InputJsonValue {
  return value as Prisma.InputJsonValue;
}

function getOpenRouterConfig() {
  const apiKey = process.env.OPENROUTER_API_KEY;

  if (!apiKey) {
    throw new Error("OPENROUTER_API_KEY is not configured");
  }

  return {
    apiKey,
    baseUrl: process.env.OPENROUTER_BASE_URL || DEFAULT_OPENROUTER_BASE_URL,
    model: process.env.OPENROUTER_MODERATION_MODEL || DEFAULT_OPENROUTER_MODEL,
    appName: process.env.OPENROUTER_APP_NAME || "DevNarrate",
    siteUrl: process.env.OPENROUTER_SITE_URL,
  };
}

function buildModerationPrompt(input: ModerationInput): OpenRouterMessage[] {
  const plainText = extractPlainTextFromTiptapJson(input.content);

  return [
    {
      role: "system",
      content:
        "You review user-generated technical blog posts. Flag only unsafe content such as hate, harassment, sexual content involving minors, explicit violence, self-harm encouragement, credible threats, or instructions for serious wrongdoing. Poor writing quality alone must never trigger a flag. Always return strict JSON with keys: decision, unsafeReasons, flaggedSnippets, writingFeedback, reviewSummary. writingFeedback must include summary and suggestions array.",
    },
    {
      role: "user",
      content: JSON.stringify({
        postId: input.postId,
        title: input.title,
        content: plainText,
      }),
    },
  ];
}

function parseModerationResponse(content: string): ModerationResult {
  const normalized = content.trim();
  const jsonText = normalized.startsWith("```")
    ? normalized.replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim()
    : normalized;

  const parsed = JSON.parse(jsonText) as Partial<ModerationResult>;

  if (parsed.decision !== "approve" && parsed.decision !== "flag") {
    throw new Error("Moderation response is missing a valid decision");
  }

  const writingFeedback = parsed.writingFeedback ?? {
    summary: "",
    suggestions: [],
  };

  return {
    decision: parsed.decision,
    unsafeReasons: Array.isArray(parsed.unsafeReasons)
      ? parsed.unsafeReasons.filter((entry): entry is string => typeof entry === "string")
      : [],
    flaggedSnippets: Array.isArray(parsed.flaggedSnippets)
      ? parsed.flaggedSnippets.filter((entry): entry is string => typeof entry === "string")
      : [],
    writingFeedback: {
      summary:
        typeof writingFeedback.summary === "string" ? writingFeedback.summary : "",
      suggestions: Array.isArray(writingFeedback.suggestions)
        ? writingFeedback.suggestions.filter((entry): entry is string => typeof entry === "string")
        : [],
    },
    reviewSummary:
      typeof parsed.reviewSummary === "string" ? parsed.reviewSummary : "",
  };
}

export async function reviewPostContent(input: ModerationInput): Promise<ModerationResult> {
  const config = getOpenRouterConfig();
  const response = await fetch(`${config.baseUrl}/chat/completions`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${config.apiKey}`,
      "Content-Type": "application/json",
      "HTTP-Referer": config.siteUrl ?? "https://devnarrate.local",
      "X-Title": config.appName,
    },
    body: JSON.stringify({
      model: config.model,
      temperature: 0,
      response_format: { type: "json_object" },
      messages: buildModerationPrompt(input),
    }),
  });

  if (!response.ok) {
    const errorText = await response.text().catch(() => "");
    throw new Error(`OpenRouter moderation failed (${response.status}): ${errorText}`);
  }

  const payload = (await response.json()) as {
    choices?: Array<{
      message?: {
        content?: string;
      };
    }>;
  };

  const content = payload.choices?.[0]?.message?.content;

  if (!content) {
    throw new Error("OpenRouter moderation response did not include content");
  }

  return parseModerationResponse(content);
}

export function getPendingModerationData() {
  return {
    reviewStatus: REVIEW_STATUS.PENDING,
    visibility: POST_VISIBILITY.AUTHOR_ONLY,
    reviewedAt: null,
    flaggedAt: null,
    deletionScheduledFor: null,
    reviewLeaseUntil: null,
    latestReviewSummary: null,
    latestFlaggedContent: Prisma.JsonNull,
    latestWritingFeedback: Prisma.JsonNull,
  };
}

export function getApprovedModerationData(result: ModerationResult) {
  return {
    reviewStatus: REVIEW_STATUS.APPROVED,
    visibility: POST_VISIBILITY.PUBLIC,
    reviewedAt: new Date(),
    flaggedAt: null,
    deletionScheduledFor: null,
    reviewLeaseUntil: null,
    latestReviewSummary: result.reviewSummary || "Post approved by automated review.",
    latestFlaggedContent: toInputJsonValue([]),
    latestWritingFeedback: toInputJsonValue({
      summary: result.writingFeedback.summary,
      suggestions: result.writingFeedback.suggestions,
    }),
  };
}

export function getFlaggedModerationData(result: ModerationResult) {
  const now = new Date();

  return {
    reviewStatus: REVIEW_STATUS.FLAGGED,
    visibility: POST_VISIBILITY.HIDDEN_BY_MODERATION,
    reviewedAt: now,
    flaggedAt: now,
    deletionScheduledFor: getDeletionDeadline(now),
    reviewLeaseUntil: null,
    latestReviewSummary: result.reviewSummary || "Post flagged by automated review.",
    latestFlaggedContent: toInputJsonValue(result.flaggedSnippets),
    latestWritingFeedback: toInputJsonValue({
      summary: result.writingFeedback.summary,
      suggestions: result.writingFeedback.suggestions,
    }),
  };
}

export function getReviewFailedData(error: unknown) {
  return {
    reviewStatus: REVIEW_STATUS.REVIEW_FAILED,
    visibility: POST_VISIBILITY.AUTHOR_ONLY,
    reviewedAt: null,
    flaggedAt: null,
    deletionScheduledFor: null,
    reviewLeaseUntil: null,
    latestFlaggedContent: Prisma.JsonNull,
    latestWritingFeedback: Prisma.JsonNull,
    latestReviewSummary:
      error instanceof Error ? error.message.slice(0, 1000) : "Moderation failed",
  };
}

export function buildFlaggedInboxMessage(params: {
  postId: string;
  title: string;
  reviewSummary: string;
  flaggedSnippets: string[];
  unsafeReasons: string[];
  deletionScheduledFor: Date;
}) {
  return {
    type: INBOX_MESSAGE_TYPE.MODERATION_WARNING,
    status: INBOX_MESSAGE_STATUS.UNREAD,
    title: `Post flagged: ${params.title}`,
    body:
      params.reviewSummary ||
      "Your post was flagged during automated moderation and will be deleted in 24 hours unless you edit and resubmit it.",
    metadata: {
      postId: params.postId,
      flaggedSnippets: params.flaggedSnippets,
      unsafeReasons: params.unsafeReasons,
      deletionScheduledFor: params.deletionScheduledFor.toISOString(),
    },
  };
}

export function buildApprovedInboxUpdate(params: { postId: string; title: string }) {
  return {
    type: INBOX_MESSAGE_TYPE.MODERATION_UPDATE,
    status: INBOX_MESSAGE_STATUS.UNREAD,
    title: `Post approved: ${params.title}`,
    body: "Your updated post passed automated review and is public again.",
    metadata: {
      postId: params.postId,
    },
  };
}
