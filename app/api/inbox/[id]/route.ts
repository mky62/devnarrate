import { auth } from "@/lib/auth";
import { serializeInboxMessages } from "@/lib/inbox";
import { INBOX_MESSAGE_STATUS } from "@/lib/post-moderation";
import { db } from "@/lib/prisma";
import { headers } from "next/headers";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = (await request.json().catch(() => ({}))) as { status?: string };

    if (
      !body.status ||
      ![
        INBOX_MESSAGE_STATUS.READ,
        INBOX_MESSAGE_STATUS.RESOLVED,
        INBOX_MESSAGE_STATUS.UNREAD,
      ].includes(body.status as (typeof INBOX_MESSAGE_STATUS)[keyof typeof INBOX_MESSAGE_STATUS])
    ) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }

    const nextStatus =
      body.status as (typeof INBOX_MESSAGE_STATUS)[keyof typeof INBOX_MESSAGE_STATUS];

    const message = await db.inboxMessage.findUnique({
      where: { id },
      select: {
        id: true,
        userId: true,
      },
    });

    if (!message || message.userId !== session.user.id) {
      return NextResponse.json({ error: "Message not found" }, { status: 404 });
    }

    const updatedMessage = await db.inboxMessage.update({
      where: { id },
      data: {
        status: nextStatus,
      },
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
      message: serializeInboxMessages([updatedMessage])[0],
    });
  } catch (error) {
    console.error("Error updating inbox message:", error);
    return NextResponse.json(
      { error: "Failed to update inbox message" },
      { status: 500 }
    );
  }
}
