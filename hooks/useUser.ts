// hooks/useUser.ts
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/api/user";

export function useUser() {
  return useQuery({
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });
}
