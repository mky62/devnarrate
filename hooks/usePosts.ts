// hooks/usePosts.ts
import { useQuery } from "@tanstack/react-query";
import { getPosts, Post } from "@/lib/userdata";

export function usePosts(initialData?: Post[]) {
  return useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: getPosts,
    initialData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: initialData ? false : true,
    refetchOnWindowFocus: false,
  });
}
