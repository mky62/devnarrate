// hooks/usePosts.ts
import { useQuery } from "@tanstack/react-query";
import { getPosts, Post } from "@/lib/api/user";

export function usePosts() {
  return useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: getPosts,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
}
