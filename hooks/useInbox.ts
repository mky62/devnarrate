import { useQuery } from "@tanstack/react-query";
import { getInbox, InboxMessage } from "@/lib/userdata";

export function useInbox(initialData?: InboxMessage[]) {
  return useQuery<InboxMessage[]>({
    queryKey: ["inbox"],
    queryFn: getInbox,
    initialData,
    staleTime: 1000 * 60,
    refetchOnWindowFocus: false,
  });
}
