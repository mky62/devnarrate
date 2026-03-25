// hooks/useUpdateProfile.ts
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { updateUserProfile, UpdateProfilePayload, User } from "@/lib/api/user";

export function useUpdateProfile() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: updateUserProfile,

    // Optimistic update (v5 pattern)
    onMutate: async (newData: UpdateProfilePayload) => {
      // Cancel any outgoing refetches
      await queryClient.cancelQueries({ queryKey: ["user"] });

      // Snapshot the previous value
      const previousUser = queryClient.getQueryData<User>(["user"]);

      // Optimistically update to the new value
      queryClient.setQueryData<User>(["user"], (old) => {
        if (!old) return old;
        return {
          ...old,
          ...newData,
          socialLinks: {
            ...old.socialLinks,
            ...newData.socialLinks,
          },
        };
      });

      // Return a context object with the snapshotted value
      return { previousUser };
    },

    // If the mutation fails, use the context we returned above
    onError: (_err, _newData, context) => {
      if (context?.previousUser) {
        queryClient.setQueryData(["user"], context.previousUser);
      }
    },

    // Always refetch after error or success
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["user"] });
    },
  });
}
