// hooks/usePosts.ts
import { useQuery } from "@tanstack/react-query";
import { getPosts, Post } from "@/lib/userdata";

export function usePosts(initialData: Post[] = []) {
  const normalizedInitialData = initialData ?? [];

  return useQuery<Post[]>({
    queryKey: ["posts"],
    queryFn: getPosts,
    initialData: normalizedInitialData,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: normalizedInitialData.length > 0 ? false : true,
    refetchOnWindowFocus: false,
  });
}
