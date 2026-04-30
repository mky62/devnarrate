import { useEffect } from "react";
import type { Repo } from "@/lib/userdata";

export function useRepoIndexingPolling(
  repos: Repo[],
  refetchRepos: () => void,
  intervalMs = 5000
) {
  useEffect(() => {
    const hasActiveIndexJob = repos.some(
      (repo) => repo.status === "pending" || repo.status === "indexing"
    );

    if (!hasActiveIndexJob) return;

    const interval = setInterval(refetchRepos, intervalMs);
    return () => clearInterval(interval);
  }, [intervalMs, refetchRepos, repos]);
}
