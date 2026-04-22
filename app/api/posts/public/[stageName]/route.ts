import { auth } from "@/lib/auth";
import { POST_VISIBILITY, REVIEW_STATUS } from "@/lib/post-moderation";
import { serializePostSummaries } from "@/lib/posts";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ stageName: string }> }
) {
  try {
    const { stageName } = await params;
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    const viewerId = session?.user?.id;

    if (!stageName) {
      return NextResponse.json(
        { error: "Stage name is required" },
        { status: 400 }
      );
    }

    const user = await db.user.findUnique({
      where: { stageName },
      select: { id: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: "User not found" },
        { status: 404 }
      );
    }

    const { searchParams } = new URL(request.url);
    const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
    const limit = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, parseInt(searchParams.get("limit") || String(DEFAULT_PAGE_SIZE), 10))
    );
    const skip = (page - 1) * limit;

    const [rawPosts, total] = await Promise.all([
      db.post.findMany({
        where: {
          userId: user.id,
          visibility: POST_VISIBILITY.PUBLIC,
          reviewStatus: REVIEW_STATUS.APPROVED,
        },
        orderBy: { createdAt: "desc" },
        select: {
          id: true,
          userId: true,
          title: true,
          projectLink: true,
          content: true,
          createdAt: true,
          reviewStatus: true,
          visibility: true,
          deletionScheduledFor: true,
          latestFlaggedContent: true,
          latestReviewSummary: true,
          latestWritingFeedback: true,
          _count: {
            select: {
              likes: true,
            },
          },
        },
        skip,
        take: limit,
      }),
      db.post.count({
        where: {
          userId: user.id,
          visibility: POST_VISIBILITY.PUBLIC,
          reviewStatus: REVIEW_STATUS.APPROVED,
        },
      }),
    ]);

    const posts = await serializePostSummaries(rawPosts, viewerId);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
    });
  } catch (error) {
    console.error("Error fetching public posts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
