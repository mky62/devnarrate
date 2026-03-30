// hooks/useUser.ts
import { useQuery } from "@tanstack/react-query";
import { getCurrentUser } from "@/lib/userdata";

export function useUser() {
  return useQuery({ 
    queryKey: ["user"],
    queryFn: getCurrentUser,
  });
}
