import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";
import { postSchema } from "@/lib/validation";

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: request.headers,
    });

    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
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

    const post = await db.post.create({
      data: {
        userId,
        title,
        projectLink: link || null,
        content: JSON.stringify(content),
      },
    });

    return NextResponse.json({ success: true, postId: post.id });
  } catch (error) {
    console.error("Save post error:", error);
    return NextResponse.json(
      { error: "Failed to save post" },
      { status: 500 }
    );
  }
}
