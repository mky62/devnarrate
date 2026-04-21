"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useSession } from "@/lib/auth-client";

interface UsePostLikeOptions {
  postId: string;
  initialLiked: boolean;
  initialLikeCount: number;
  canLike: boolean;
}

interface ToggleLikeResponse {
  liked: boolean;
  likeCount: number;
}

export function usePostLike({
  postId,
  initialLiked,
  initialLikeCount,
  canLike,
}: UsePostLikeOptions) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { data: session, isPending: isSessionPending } = useSession();
  const [liked, setLiked] = useState(initialLiked);
  const [likeCount, setLikeCount] = useState(initialLikeCount);
  const [isPending, setIsPending] = useState(false);

  useEffect(() => {
    setLiked(initialLiked);
    setLikeCount(initialLikeCount);
  }, [initialLikeCount, initialLiked]);

  const redirectToSignIn = () => {
    const query = searchParams.toString();
    const next = `${pathname}${query ? `?${query}` : ""}`;
    router.push(`/sign-in?next=${encodeURIComponent(next)}`);
  };

  const toggleLike = async () => {
    if (isPending || isSessionPending || !canLike) {
      return;
    }

    if (!session?.user?.id) {
      redirectToSignIn();
      return;
    }

    const previousLiked = liked;
    const previousCount = likeCount;
    const nextLiked = !previousLiked;

    setIsPending(true);
    setLiked(nextLiked);
    setLikeCount((current) => Math.max(0, current + (nextLiked ? 1 : -1)));

    try {
      const response = await fetch(`/api/posts/${postId}/like`, {
        method: nextLiked ? "POST" : "DELETE",
      });

      if (response.status === 401) {
        redirectToSignIn();
      }

      if (!response.ok) {
        throw new Error(`Failed to toggle like (${response.status})`);
      }

      const data = (await response.json()) as ToggleLikeResponse;
      setLiked(data.liked);
      setLikeCount(data.likeCount);
    } catch (error) {
      console.error("Failed to toggle post like:", error);
      setLiked(previousLiked);
      setLikeCount(previousCount);
    } finally {
      setIsPending(false);
    }
  };

  return {
    liked,
    likeCount,
    isPending: isPending || isSessionPending,
    toggleLike,
  };
}
