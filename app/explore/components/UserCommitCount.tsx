"use client";

import { useQuery } from "@tanstack/react-query";

interface GitStatsResponse {
  stats?: {
    totalContributions?: number;
  } | null;
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en", {
    notation: value >= 10000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

export default function UserCommitCount({ stageName }: { stageName: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["explore-user-commits", stageName],
    queryFn: async () => {
      const res = await fetch(`/api/github/stats/public/${stageName}`);
      if (!res.ok) return 0;

      const json = (await res.json()) as GitStatsResponse;
      return json.stats?.totalContributions ?? 0;
    },
    staleTime: 1000 * 60 * 30,
  });

  if (isLoading) {
    return <span className="text-white/45">...</span>;
  }

  return <>{formatNumber(data ?? 0)}</>;
}
