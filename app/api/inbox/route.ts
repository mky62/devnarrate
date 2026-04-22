import { auth } from "@/lib/auth";
import { serializeInboxMessages } from "@/lib/inbox";
import { db } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const messages = await db.inboxMessage.findMany({
      where: {
        userId: session.user.id,
      },
      orderBy: [
        { status: "asc" },
        { createdAt: "desc" },
      ],
      take: 20,
      select: {
        id: true,
        postId: true,
        type: true,
        title: true,
        body: true,
        status: true,
        metadata: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return NextResponse.json({
      messages: serializeInboxMessages(messages),
    });
  } catch (error) {
    console.error("Error fetching inbox:", error);
    return NextResponse.json(
      { error: "Failed to fetch inbox" },
      { status: 500 }
    );
  }
}
