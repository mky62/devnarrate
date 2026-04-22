import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { canViewerAccessPost, serializePostDetail } from "@/lib/posts";
import { formatDeletionDeadline } from "@/lib/post-moderation";
import { getSafeExternalUrl, renderPostContent } from "@/lib/post-content";
import { notFound } from "next/navigation";
import Link from "next/link";
import NextImage from "next/image";
import { headers } from "next/headers";
import { ArrowLeft, ExternalLink, Calendar, PencilLine, ShieldAlert, ShieldCheck } from "lucide-react";
import PostLikeButton from "@/components/posts/PostLikeButton";

interface PostPageProps {
  params: Promise<{ id: string }>;
}

export default async function PostPage({ params }: PostPageProps) {
  const { id } = await params;
  const requestHeaders = await headers();
  const session = await auth.api.getSession({
    headers: requestHeaders,
  });

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
    notFound();
  }

  if (!canViewerAccessPost(rawPost, session?.user?.id)) {
    notFound();
  }

  const post = await serializePostDetail(rawPost, session?.user?.id);
  const isOwner = session?.user?.id === rawPost.userId;

  const renderedContent = renderPostContent(post.content);
  const safeProjectLink = getSafeExternalUrl(post.projectLink);

  const formattedDate = new Date(post.createdAt).toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  });

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-200">
        <div className="max-w-3xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link
            href="/dashboard"
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </Link>

          <div className="flex items-center gap-3">
            {isOwner && post.reviewStatus !== "APPROVED" && (
              <Link
                href={`/p/${post.id}/edit`}
                className="flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors"
              >
                <PencilLine size={16} />
                Edit
              </Link>
            )}

            {safeProjectLink && (
              <a
                href={safeProjectLink}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium text-blue-600 hover:text-blue-700 transition-colors"
              >
                <ExternalLink size={16} />
                View Project
              </a>
            )}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-3xl mx-auto px-4 py-12">
        <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          {/* Author Info */}
          <div className="flex items-center gap-3">
            {post.user.image ? (
              <NextImage
                src={post.user.image}
                alt={post.user.stageName || post.user.name || ""}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full object-cover"
                unoptimized
              />
            ) : (
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-500 flex items-center justify-center text-white font-semibold">
                {post.user.stageName?.[0] || post.user.name?.[0] || "U"}
              </div>
            )}
            <div>
              <p className="font-semibold text-gray-900">
                {post.user.stageName || post.user.name}
              </p>
              <p className="text-sm text-gray-500 flex items-center gap-1">
                <Calendar size={14} />
                {formattedDate}
              </p>
            </div>
          </div>

          <PostLikeButton
            postId={post.id}
            initialLiked={post.likedByViewer}
            initialLikeCount={post.likeCount}
            canLike={post.canLike}
            size="detail"
            className="self-start sm:self-center"
          />
        </div>

        {/* Title */}
        <h1 className="text-4xl font-bold text-gray-900 mb-8 leading-tight">
          {post.title}
        </h1>

        {isOwner && post.reviewStatus !== "APPROVED" && (
          <div className={`mb-8 rounded-2xl border px-4 py-4 ${
            post.reviewStatus === "FLAGGED"
              ? "border-rose-200 bg-rose-50"
              : post.reviewStatus === "REVIEW_FAILED"
                ? "border-amber-200 bg-amber-50"
                : "border-slate-200 bg-slate-50"
          }`}>
            <div className="flex items-start gap-3">
              {post.reviewStatus === "FLAGGED" ? (
                <ShieldAlert className="mt-0.5 text-rose-600" size={18} />
              ) : (
                <ShieldCheck className="mt-0.5 text-slate-600" size={18} />
              )}
              <div>
                <p className="text-sm font-semibold text-gray-900">
                  {post.reviewStatus === "FLAGGED"
                    ? "This post is hidden after moderation."
                    : post.reviewStatus === "REVIEW_FAILED"
                      ? "Automated review failed."
                      : "This post is waiting for review."}
                </p>
                <p className="mt-1 text-sm text-gray-700">
                  {post.latestReviewSummary ||
                    "The post is not public until the moderation process completes."}
                </p>
                {post.latestFlaggedContent.length > 0 && (
                  <p className="mt-2 text-sm text-rose-700">
                    Flagged content: “{post.latestFlaggedContent[0]}”
                  </p>
                )}
                {post.deletionScheduledFor && (
                  <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-rose-700">
                    Deletes {formatDeletionDeadline(post.deletionScheduledFor)}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {isOwner && post.latestWritingFeedback && (post.latestWritingFeedback.summary || post.latestWritingFeedback.suggestions.length > 0) && (
          <div className="mb-8 rounded-2xl border border-blue-200 bg-blue-50 px-4 py-4">
            <p className="text-sm font-semibold text-blue-900">Writing feedback</p>
            {post.latestWritingFeedback.summary && (
              <p className="mt-2 text-sm text-blue-800">{post.latestWritingFeedback.summary}</p>
            )}
            {post.latestWritingFeedback.suggestions.length > 0 && (
              <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-blue-800">
                {post.latestWritingFeedback.suggestions.map((suggestion) => (
                  <li key={suggestion}>{suggestion}</li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Content */}
        <article
          className="prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-blockquote:border-l-4 prose-blockquote:border-blue-300 prose-blockquote:bg-blue-50/50 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:italic prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-code:text-sm prose-code:px-1.5 prose-code:py-0.5 prose-code:bg-gray-100 prose-code:rounded"
          style={{ 
            '--tw-prose-body': '#374151',
            '--tw-prose-headings': '#111827',
          } as React.CSSProperties}
        >
          {renderedContent}
        </article>
        <style dangerouslySetInnerHTML={{__html: `
          .prose p { margin-bottom: 1rem; }
          .prose p:empty { min-height: 0.5rem; margin-bottom: 0.5rem; }
          .prose br { display: block; content: ""; margin-top: 0.5rem; }
          
          article ul { list-style-type: disc !important; padding-left: 1.5rem !important; margin-bottom: 1rem !important; }
          article ol { list-style-type: decimal !important; padding-left: 1.5rem !important; margin-bottom: 1rem !important; }
          article li { margin-bottom: 0.5rem !important; display: list-item !important; }
          article ul ul { list-style-type: circle !important; }
          article ul ul ul { list-style-type: square !important; }
          
          ul[data-type="bulletList"] { list-style-type: disc !important; }
          ol[data-type="orderedList"] { list-style-type: decimal !important; }
          li[data-type="listItem"] { display: list-item !important; }
          
          article span[style*="font-size"] { font-size: inherit !important; }
          article [style*="20px"] { font-size: 20px !important; }
        `}} />
      </main>
    </div>
  );
}
