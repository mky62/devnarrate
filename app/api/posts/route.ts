import { auth } from "@/lib/auth";
import { serializePostSummaries } from "@/lib/posts";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { headers } from "next/headers";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function GET(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
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
        where: { userId },
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
      db.post.count({ where: { userId } }),
    ]);

    const posts = await serializePostSummaries(rawPosts, userId, {
      readOnly: true,
    });

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
    console.error("Error fetching posts:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
