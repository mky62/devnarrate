import { auth } from "@/lib/auth";
import { getPendingModerationData } from "@/lib/moderation";
import { canViewerAccessPost, serializePostDetail } from "@/lib/posts";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { postSchema } from "@/lib/validation";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });
    const viewerId = session?.user?.id;

    const { id } = await params;

    const rawPost = await db.post.findUnique({
      where: { id },
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
        user: {
          select: {
            id: true,
            name: true,
            stageName: true,
            image: true,
          },
        },
      },
    });

    if (!rawPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    if (!canViewerAccessPost(rawPost, viewerId)) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    const post = await serializePostDetail(rawPost, viewerId);

    return NextResponse.json({ post });
  } catch (error) {
    console.error("Error fetching post:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const post = await db.post.findUnique({
      where: { id },
      select: { userId: true },
    });

    if (!post) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    if (post.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    await db.$transaction(async (tx) => {
      await tx.inboxMessage.updateMany({
        where: {
          postId: id,
        },
        data: {
          status: "RESOLVED",
          title: "Post deleted",
          body: "This post was deleted by the author.",
        },
      });

      await tx.post.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting post:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { id } = await params;

    const existingPost = await db.post.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!existingPost) {
      return NextResponse.json(
        { error: "Post not found" },
        { status: 404 }
      );
    }

    if (existingPost.userId !== session.user.id) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    const body = await request.json();
    const validationResult = postSchema.safeParse(body);

    if (!validationResult.success) {
      return NextResponse.json(
        { error: validationResult.error.issues[0].message },
        { status: 400 }
      );
    }

    const { title, link, content } = validationResult.data;

    await db.post.update({
      where: { id },
      data: {
        title,
        projectLink: link || null,
        content: JSON.stringify(content),
        reviewAttemptCount: 0,
        ...getPendingModerationData(),
      },
    });

    return NextResponse.json({ success: true, postId: id });
  } catch (error) {
    console.error("Error updating post:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
