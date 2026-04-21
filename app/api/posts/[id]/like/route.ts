import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

async function getPostForLike(postId: string) {
  return db.post.findUnique({
    where: { id: postId },
    select: {
      id: true,
      userId: true,
    },
  });
}

async function getLikeCount(postId: string) {
  return db.like.count({
    where: { postId },
  });
}

function isPrismaUniqueViolation(error: unknown) {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    error.code === "P2002"
  );
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const post = await getPostForLike(id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.userId === session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    try {
      await db.like.create({
        data: {
          postId: id,
          userId: session.user.id,
        },
      });
    } catch (error) {
      if (!isPrismaUniqueViolation(error)) {
        throw error;
      }
    }

    return NextResponse.json({
      liked: true,
      likeCount: await getLikeCount(id),
    });
  } catch (error) {
    console.error("Error creating like:", error);
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
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const post = await getPostForLike(id);

    if (!post) {
      return NextResponse.json({ error: "Post not found" }, { status: 404 });
    }

    if (post.userId === session.user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    await db.like.deleteMany({
      where: {
        postId: id,
        userId: session.user.id,
      },
    });

    return NextResponse.json({
      liked: false,
      likeCount: await getLikeCount(id),
    });
  } catch (error) {
    console.error("Error deleting like:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
