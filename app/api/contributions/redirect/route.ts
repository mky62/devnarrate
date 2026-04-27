import { auth } from "@/lib/auth";
import {
  getSafeContributionUrl,
  getSafeHttpUrl,
  truncateHeaderValue,
} from "@/lib/contributions";
import { db } from "@/lib/prisma";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const postId = request.nextUrl.searchParams.get("postId");

  if (!postId) {
    return NextResponse.json(
      { error: "Post ID is required" },
      { status: 400 }
    );
  }

  const post = await db.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      projectLink: true,
      userId: true,
      user: {
        select: {
          contributionUrl: true,
        },
      },
    },
  });

  const safeContributionUrl = getSafeContributionUrl(post?.user.contributionUrl);

  if (!post || !getSafeHttpUrl(post.projectLink) || !safeContributionUrl) {
    return NextResponse.json(
      { error: "Contribution link is not available" },
      { status: 404 }
    );
  }

  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    await db.contributionClick.create({
      data: {
        postId: post.id,
        authorId: post.userId,
        viewerId: session?.user?.id ?? null,
        referrer: truncateHeaderValue(request.headers.get("referer")),
        userAgent: truncateHeaderValue(request.headers.get("user-agent")),
      },
    });
  } catch (error) {
    console.error("Contribution click logging failed:", error);
  }

  return NextResponse.redirect(safeContributionUrl);
}
