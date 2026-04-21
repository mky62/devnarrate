"use client";

import type { MouseEvent } from "react";
import { Heart, Loader2 } from "lucide-react";
import { usePostLike } from "@/hooks/usePostLike";
import { cn } from "@/lib/utils";

interface PostLikeButtonProps {
  postId: string;
  initialLiked: boolean;
  initialLikeCount: number;
  canLike: boolean;
  size?: "card" | "detail";
  className?: string;
  stopPropagation?: boolean;
}

export default function PostLikeButton({
  postId,
  initialLiked,
  initialLikeCount,
  canLike,
  size = "card",
  className,
  stopPropagation = false,
}: PostLikeButtonProps) {
  const { liked, likeCount, isPending, toggleLike } = usePostLike({
    postId,
    initialLiked,
    initialLikeCount,
    canLike,
  });

  const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (stopPropagation) {
      event.preventDefault();
      event.stopPropagation();
    }

    void toggleLike();
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending || !canLike}
      aria-pressed={liked}
      title={canLike ? (liked ? "Unlike post" : "Like post") : "You can't like your own post"}
      className={cn(
        "inline-flex items-center rounded-full border transition-colors",
        size === "detail"
          ? "gap-2 px-4 py-2 text-sm font-medium"
          : "gap-1.5 px-2.5 py-1 text-[11px] font-semibold",
        liked
          ? "border-rose-200 bg-rose-50 text-rose-600"
          : "border-gray-200 bg-white text-gray-500",
        canLike && !isPending && "hover:border-rose-200 hover:bg-rose-50 hover:text-rose-600",
        !canLike && "cursor-not-allowed opacity-70",
        isPending && "cursor-wait opacity-80",
        className
      )}
    >
      {isPending ? (
        <Loader2
          size={size === "detail" ? 16 : 12}
          className="animate-spin"
        />
      ) : (
        <Heart
          size={size === "detail" ? 16 : 12}
          className={liked ? "fill-current" : ""}
        />
      )}
      <span>{likeCount}</span>
      {size === "detail" && <span>{likeCount === 1 ? "like" : "likes"}</span>}
    </button>
  );
}
