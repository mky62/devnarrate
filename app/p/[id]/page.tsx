import { db } from "@/lib/prisma";
import { auth } from "@/lib/auth";
import { serializePostDetail } from "@/lib/posts";
import { getSafeExternalUrl, renderPostContent } from "@/lib/post-content";
import { notFound } from "next/navigation";
import Link from "next/link";
import NextImage from "next/image";
import { headers } from "next/headers";
import { ArrowLeft, ExternalLink, Calendar, Coffee } from "lucide-react";
import PostLikeButton from "@/components/posts/PostLikeButton";
import { getSafeContributionUrl } from "@/lib/contributions";

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
          contributionUrl: true,
        },
      },
    },
  });

  if (!rawPost) {
    notFound();
  }

  const post = await serializePostDetail(rawPost, session?.user?.id);

  const renderedContent = renderPostContent(post.content);
  const safeProjectLink = getSafeExternalUrl(post.projectLink);
  const safeContributionUrl = getSafeContributionUrl(post.user.contributionUrl);
  const contributionHref =
    safeProjectLink && safeContributionUrl
      ? `/api/contributions/redirect?postId=${encodeURIComponent(post.id)}`
      : null;

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

          <div className="flex items-center gap-4">
            {contributionHref && (
              <a
                href={contributionHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-800 transition-colors"
              >
                <Coffee size={16} />
                Buy me a coffee
              </a>
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

        {/* Content */}
        <article
          className="post-content prose prose-lg max-w-none prose-headings:text-gray-900 prose-p:text-gray-700 prose-strong:text-gray-900 prose-a:text-blue-600 hover:prose-a:text-blue-700 prose-blockquote:border-l-4 prose-blockquote:border-blue-300 prose-blockquote:bg-blue-50/50 prose-blockquote:pl-4 prose-blockquote:py-2 prose-blockquote:italic prose-pre:bg-gray-900 prose-pre:text-gray-100 prose-code:text-sm prose-code:px-1.5 prose-code:py-0.5 prose-code:bg-gray-100 prose-code:rounded"
          style={{ 
            '--tw-prose-body': '#374151',
            '--tw-prose-headings': '#111827',
          } as React.CSSProperties}
        >
          {renderedContent}
        </article>

      </main>
    </div>
  );
}
