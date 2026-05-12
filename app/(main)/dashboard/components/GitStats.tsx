"use client";

import { useQuery } from "@tanstack/react-query";
import type { GitStats as GitStatsData } from "@/lib/github-stats";

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

interface GitStatsProps {
  initialStats?: GitStatsData | null;
}

export default function GitStats({ initialStats }: GitStatsProps) {
  const { data, isLoading, error } = useQuery<GitStatsData | null>({
    queryKey: ["github-stats"],
    queryFn: async () => {
      const res = await fetch("/api/github/stats");
      if (!res.ok) throw new Error("Failed to fetch stats");
      const json = await res.json();
      return json.stats;
    },
    initialData: initialStats,
    staleTime: 1000 * 60 * 30,
    refetchOnMount: initialStats === undefined,
  });

  if (isLoading) {
    return (
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
          <div className="h-4 bg-gray-200 rounded animate-pulse w-1/4" />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return null;
  }

  return (
    <div className="bg-white/5 p-3 border-t border-white/10">
      <div className="flex items-center justify-between text-center">
        <div className="flex-1">
          <p className="text-lg font-semibold text-white/90">{data.totalContributions.toLocaleString()}</p>
          <p className="text-[10px] font-medium text-white/60 mt-1">Total Contributions</p>
          <p className="text-[9px] text-white/40 mt-1">
            {formatDate(data.startDate)} - Present
          </p>
        </div>

        <div className="w-px h-12 bg-white/10 mx-3" />

        <div className="flex-1">
          <p className="text-lg font-semibold text-white/90">{data.currentStreak}</p>
          <p className="text-[10px] font-medium text-white/60 mt-1">Current Streak</p>
          <p className="text-[9px] text-white/40 mt-1">days</p>
        </div>

        <div className="w-px h-12 bg-white/10 mx-3" />

        <div className="flex-1">
          <p className="text-lg font-semibold text-white/90">{data.longestStreak}</p>
          <p className="text-[10px] font-medium text-white/60 mt-1">Longest Streak</p>
          <p className="text-[9px] text-white/40 mt-1">days</p>
        </div>
      </div>
    </div>
  );
}
