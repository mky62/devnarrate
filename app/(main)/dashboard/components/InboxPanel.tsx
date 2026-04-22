"use client";

import Link from "next/link";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Bell, Clock3, Loader2 } from "lucide-react";
import { useInbox } from "@/hooks/useInbox";
import { formatDeletionDeadline } from "@/lib/post-moderation";
import { InboxMessage, updateInboxMessage } from "@/lib/userdata";

interface InboxPanelProps {
  initialMessages?: InboxMessage[];
}

export default function InboxPanel({ initialMessages = [] }: InboxPanelProps) {
  const queryClient = useQueryClient();
  const { data: messages = [], isLoading, error } = useInbox(initialMessages);

  const mutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) =>
      updateInboxMessage(id, { status }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["inbox"] });
    },
  });

  const activeMessages = messages.slice(0, 5);

  return (
    <div className="max-h-80 rounded-2xl border border-blue-500 bg-white/80 p-2 shadow-sm backdrop-blur-sm">
      <div className="mb-2 flex items-center justify-between border-b border-blue-100 px-2 pb-2">
        <div className="flex items-center gap-2">
          <Bell size={15} className="text-blue-600" />
          <h3 className="text-sm font-semibold text-gray-900">Inbox</h3>
        </div>
        <span className="rounded-full bg-blue-100 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
          {messages.filter((message) => message.status === "UNREAD").length}
        </span>
      </div>

      <div className="space-y-2 overflow-y-auto px-1 pb-1">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 px-3 py-6 text-sm text-gray-500">
            <Loader2 size={14} className="animate-spin" />
            Loading inbox…
          </div>
        ) : error ? (
          <div className="px-3 py-6 text-sm text-red-500">Failed to load inbox</div>
        ) : activeMessages.length === 0 ? (
          <div className="px-3 py-6 text-sm text-gray-500">
            No inbox messages yet.
          </div>
        ) : (
          activeMessages.map((message) => {
            const flaggedSnippets = Array.isArray(message.metadata?.flaggedSnippets)
              ? message.metadata.flaggedSnippets.filter(
                  (entry): entry is string => typeof entry === "string"
                )
              : [];

            const deletionDeadline =
              typeof message.metadata?.deletionScheduledFor === "string"
                ? formatDeletionDeadline(message.metadata.deletionScheduledFor)
                : null;

            return (
              <div
                key={message.id}
                className={`rounded-xl border px-3 py-3 ${
                  message.status === "UNREAD"
                    ? "border-amber-200 bg-amber-50/70"
                    : "border-gray-200 bg-white"
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{message.title}</p>
                    <p className="mt-1 text-xs text-gray-600">{message.body}</p>
                  </div>
                  <button
                    type="button"
                    disabled={mutation.isPending}
                    onClick={() =>
                      mutation.mutate({
                        id: message.id,
                        status: message.status === "UNREAD" ? "READ" : "RESOLVED",
                      })
                    }
                    className="rounded-lg border border-gray-200 px-2 py-1 text-[11px] font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-50"
                  >
                    {message.status === "UNREAD" ? "Mark read" : "Resolve"}
                  </button>
                </div>

                {flaggedSnippets.length > 0 && (
                  <div className="mt-2 rounded-lg bg-white/80 px-2 py-2 text-[11px] text-gray-700">
                    Flagged content: “{flaggedSnippets[0]}”
                  </div>
                )}

                <div className="mt-2 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1 text-[11px] text-gray-500">
                    <Clock3 size={12} />
                    {deletionDeadline ?? new Date(message.createdAt).toLocaleString("en-US")}
                  </div>

                  {message.postId && (
                    <Link
                      href={`/p/${message.postId}/edit`}
                      className="text-[11px] font-semibold text-blue-600 hover:text-blue-700"
                    >
                      Edit post
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
