import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { db } from "@/lib/prisma";
import { parseGithubRepoId } from "@/lib/github-repo-id";

export const runtime = "nodejs";

type GitHubPushPayload = {
  ref?: string;
  after?: string;
  repository?: {
    id?: number;
  };
};

function verifyGitHubSignature(payload: Buffer, signatureHeader: string | null) {
  const secret = process.env.GITHUB_WEBHOOK_SECRET;

  if (!secret || !signatureHeader?.startsWith("sha256=")) {
    return false;
  }

  const expectedSignature = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;
  const expected = Buffer.from(expectedSignature, "utf8");
  const received = Buffer.from(signatureHeader, "utf8");

  return expected.length === received.length && timingSafeEqual(expected, received);
}

export async function POST(request: Request) {
  const rawBody = Buffer.from(await request.arrayBuffer());

  if (!verifyGitHubSignature(rawBody, request.headers.get("x-hub-signature-256"))) {
    return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
  }

  const event = request.headers.get("x-github-event");

  if (event === "ping") {
    return NextResponse.json({ success: true });
  }

  if (event !== "push") {
    return NextResponse.json({ ignored: true, reason: "Unsupported event" }, { status: 202 });
  }

  let payload: GitHubPushPayload;
  try {
    payload = JSON.parse(rawBody.toString("utf8"));
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  if (payload.ref !== "refs/heads/main") {
    return NextResponse.json({ ignored: true, reason: "Not main branch" }, { status: 202 });
  }

  const githubRepoId = payload.repository?.id ? parseGithubRepoId(payload.repository.id) : null;
  const latestCommitSha = payload.after;

  if (!githubRepoId || !latestCommitSha) {
    return NextResponse.json({ error: "Missing repository id or commit SHA" }, { status: 400 });
  }

  const repo = await db.repo.findUnique({
    where: { githubRepoId },
    select: { id: true },
  });

  if (!repo) {
    return NextResponse.json({ ignored: true, reason: "Repository not tracked" }, { status: 202 });
  }

  await db.repo.update({
    where: { githubRepoId },
    data: {
      latestCommitSha,
      indexStatus: "STALE",
    },
  });

  return NextResponse.json({ success: true });
}
