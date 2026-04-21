// hooks/useUser.ts
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser, User } from "@/lib/userdata";

export function useUser(initialData?: User | null) {
  return useQuery<User | null>({ 
    queryKey: ["user"],
    queryFn: getCurrentUser,
    initialData,
  });
}
