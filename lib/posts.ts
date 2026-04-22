import { db } from "@/lib/prisma";
import { POST_VISIBILITY } from "@/lib/post-moderation";

export interface SerializedPostSummary {
  id: string;
  title: string;
  projectLink: string | null;
  content: string;
  createdAt: string;
  likeCount: number;
  likedByViewer: boolean;
  canLike: boolean;
  reviewStatus: string;
  visibility: string;
  deletionScheduledFor: string | null;
  latestFlaggedContent: string[];
  latestReviewSummary: string | null;
  latestWritingFeedback: {
    summary: string;
    suggestions: string[];
  } | null;
}

export interface SerializedPostAuthor {
  id: string;
  name: string;
  stageName: string | null;
  image: string | null;
}

export interface SerializedPostDetail extends SerializedPostSummary {
  user: SerializedPostAuthor;
}

type PostWithLikeCount = {
  id: string;
  userId: string;
  title: string;
  projectLink: string | null;
  content: string;
  createdAt: Date;
  reviewStatus: string;
  visibility: string;
  deletionScheduledFor: Date | null;
  latestFlaggedContent: unknown;
  latestReviewSummary: string | null;
  latestWritingFeedback: unknown;
  _count: {
    likes: number;
  };
};

type PostDetailWithLikeCount = PostWithLikeCount & {
  user: SerializedPostAuthor;
};

async function getViewerLikedPostIds(postIds: string[], viewerId?: string, readOnly?: boolean) {
  if (!viewerId || readOnly || postIds.length === 0) {
    return new Set<string>();
  }

  const likes = await db.like.findMany({
    where: {
      userId: viewerId,
      postId: { in: postIds },
    },
    select: {
      postId: true,
    },
  });

  return new Set(likes.map((like) => like.postId));
}

function getCanLike(postUserId: string, viewerId?: string, readOnly?: boolean) {
  if (readOnly) {
    return false;
  }

  if (!viewerId) {
    return true;
  }

  return postUserId !== viewerId;
}

function normalizeStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.filter((item): item is string => typeof item === "string");
}

function normalizeWritingFeedback(value: unknown) {
  if (!value || typeof value !== "object") {
    return null;
  }

  const record = value as Record<string, unknown>;

  return {
    summary: typeof record.summary === "string" ? record.summary : "",
    suggestions: Array.isArray(record.suggestions)
      ? record.suggestions.filter((item): item is string => typeof item === "string")
      : [],
  };
}

export function canViewerAccessPost(post: Pick<PostWithLikeCount, "userId" | "visibility">, viewerId?: string) {
  if (post.visibility === POST_VISIBILITY.PUBLIC) {
    return true;
  }

  return Boolean(viewerId && viewerId === post.userId);
}

export async function serializePostSummaries(
  posts: PostWithLikeCount[],
  viewerId?: string,
  options?: { readOnly?: boolean }
): Promise<SerializedPostSummary[]> {
  const likedPostIds = await getViewerLikedPostIds(
    posts.map((post) => post.id),
    viewerId,
    options?.readOnly
  );

  return posts.map((post) => {
    const canLike =
      post.visibility === POST_VISIBILITY.PUBLIC &&
      getCanLike(post.userId, viewerId, options?.readOnly);

    return {
      id: post.id,
      title: post.title,
      projectLink: post.projectLink,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      likeCount: post._count.likes,
      likedByViewer: canLike ? likedPostIds.has(post.id) : false,
      canLike,
      reviewStatus: post.reviewStatus,
      visibility: post.visibility,
      deletionScheduledFor: post.deletionScheduledFor?.toISOString() ?? null,
      latestFlaggedContent: normalizeStringArray(post.latestFlaggedContent),
      latestReviewSummary: post.latestReviewSummary,
      latestWritingFeedback: normalizeWritingFeedback(post.latestWritingFeedback),
    };
  });
}

export async function serializePostDetail(
  post: PostDetailWithLikeCount,
  viewerId?: string,
  options?: { readOnly?: boolean }
): Promise<SerializedPostDetail> {
  const [summary] = await serializePostSummaries([post], viewerId, options);

  return {
    ...summary,
    user: post.user,
  };
}
