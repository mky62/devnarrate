// hooks/useDeletePost.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deletePost, Post } from "@/lib/api/user";

export function useDeletePost() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deletePost,

    // Optimistic update
    onMutate: async (id: string) => {
      await queryClient.cancelQueries({ queryKey: ["posts"] });
      const previousPosts = queryClient.getQueryData<Post[]>(["posts"]);

      queryClient.setQueryData<Post[]>(["posts"], (old) => {
        if (!old) return old;
        return old.filter((post) => post.id !== id);
      });

      return { previousPosts };
    },

    onError: (_err, _id, context) => {
      if (context?.previousPosts) {
        queryClient.setQueryData(["posts"], context.previousPosts);
      }
    },

    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });
}
