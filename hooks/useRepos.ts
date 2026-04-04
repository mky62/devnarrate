// hooks/useRepos.ts
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRepos, addRepo, deleteRepo, AddRepoPayload, Repo } from "@/lib/userdata";

export function useRepos() {
  return useQuery<Repo[]>({
    queryKey: ["repos"],
    queryFn: getRepos,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 10,
    refetchOnMount: "always",
    refetchOnWindowFocus: false,
  });
}

export function useAddRepo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AddRepoPayload) => addRepo(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["repos"] });
    },
  });
}

export function useDeleteRepo() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (githubRepoId: number) => deleteRepo(githubRepoId),
    onMutate: async (githubRepoId) => {
      await queryClient.cancelQueries({ queryKey: ["repos"] });
      const previousRepos = queryClient.getQueryData<Repo[]>(["repos"]);
      queryClient.setQueryData<Repo[]>(
        ["repos"],
        (old) => old?.filter((repo) => repo.githubRepoId !== githubRepoId) ?? []
      );
      return { previousRepos };
    },
    onError: (_err, _vars, context) => {
      if (context?.previousRepos) {
        queryClient.setQueryData(["repos"], context.previousRepos);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["repos"] });
    },
  });
}
