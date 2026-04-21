import { db } from "@/lib/prisma";

export interface SerializedPostSummary {
  id: string;
  title: string;
  projectLink: string | null;
  content: string;
  createdAt: string;
  likeCount: number;
  likedByViewer: boolean;
  canLike: boolean;
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
    const canLike = getCanLike(post.userId, viewerId, options?.readOnly);

    return {
      id: post.id,
      title: post.title,
      projectLink: post.projectLink,
      content: post.content,
      createdAt: post.createdAt.toISOString(),
      likeCount: post._count.likes,
      likedByViewer: canLike ? likedPostIds.has(post.id) : false,
      canLike,
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
