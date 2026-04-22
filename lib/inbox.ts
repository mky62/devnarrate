type InboxMessageRecord = {
  id: string;
  postId: string | null;
  type: string;
  title: string;
  body: string;
  status: string;
  metadata: unknown;
  createdAt: Date;
  updatedAt: Date;
};

export interface SerializedInboxMessage {
  id: string;
  postId: string | null;
  type: string;
  title: string;
  body: string;
  status: string;
  metadata: Record<string, unknown> | null;
  createdAt: string;
  updatedAt: string;
}

export function serializeInboxMessages(
  messages: InboxMessageRecord[]
): SerializedInboxMessage[] {
  return messages.map((message) => ({
    id: message.id,
    postId: message.postId,
    type: message.type,
    title: message.title,
    body: message.body,
    status: message.status,
    metadata:
      typeof message.metadata === "object" && message.metadata !== null
        ? (message.metadata as Record<string, unknown>)
        : null,
    createdAt: message.createdAt.toISOString(),
    updatedAt: message.updatedAt.toISOString(),
  }));
}
