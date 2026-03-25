import { auth } from "@/lib/auth";
import { db } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {

  const session = await auth.api.getSession(
    {
      headers: request.headers,
    }
  );

  const userId = session?.user?.id

  if (!userId) {
    return NextResponse.json(
      {
        error: "Unauthorized"
      },
      {
        status: 401
      }
    )
  }

  const body = await request.json();
  const { title, link, content } = body;

  if (!title || !content) {
    return NextResponse.json(
      { error: "Title and content are required" },
      { status: 400 }
    );
  }

  const post = await db.post.create({
    data: {
      userId,
      title,
      projectLink: link || null,
      content: JSON.stringify(content),
    },
  });

  return NextResponse.json({ success: true, postId: post.id });
}
