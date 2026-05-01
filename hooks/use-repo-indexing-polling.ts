import { useEffect } from "react";
import type { Repo } from "@/lib/userdata";

export function useRepoIndexingPolling(
  repos: Repo[],
  refetchRepos: () => Promise<unknown> | unknown,
  intervalMs = 5000
) {
  useEffect(() => {
    const hasActiveIndexJob = repos.some(
      (repo) => repo.status === "pending" || repo.status === "indexing"
    );

    if (!hasActiveIndexJob) return;

    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout>;

    const poll = async () => {
      try {
        await refetchRepos();
      } finally {
        if (!cancelled) {
          timeout = setTimeout(poll, intervalMs);
        }
      }
    };

    timeout = setTimeout(poll, intervalMs);

    return () => {
      cancelled = true;
      clearTimeout(timeout);
    };
  }, [intervalMs, refetchRepos, repos]);
}
