"use client";

import { useQuery } from "@tanstack/react-query";
import { Flame } from "lucide-react";

interface GitStatsData {
  totalContributions: number;
  currentStreak: number;
  longestStreak: number;
  startDate: string;
  endDate: string;
  currentStreakStart: string;
  currentStreakEnd: string;
  longestStreakStart: string;
  longestStreakEnd: string;
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

interface PublicGitStatsProps {
  stageName: string;
}

export default function PublicGitStats({ stageName }: PublicGitStatsProps) {
  const { data, isLoading, error } = useQuery<GitStatsData>({
    queryKey: ["github-stats-public", stageName],
    queryFn: async () => {
      const res = await fetch(`/api/github/stats/public/${stageName}`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      const json = await res.json();
      return json.stats;
    },
    staleTime: 1000 * 60 * 30,
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
    <div className="p-4 border-t border-gray-200">
      <div className="flex items-center justify-between text-center">
        <div className="flex-1">
          <p className="text-2xl font-bold text-gray-900">{data.totalContributions.toLocaleString()}</p>
          <p className="text-sm text-gray-500 mt-1">Total Contributions</p>
          <p className="text-xs text-gray-400 mt-1">
            {formatDate(data.startDate)} - Present
          </p>
        </div>

        <div className="w-px h-16 bg-gray-300 mx-4" />

        <div className="flex-1">
          <div className="relative inline-flex items-center justify-center">
            <div className="w-16 h-16 rounded-full border-4 border-blue-400 flex items-center justify-center">
              <Flame className="w-6 h-6 text-orange-500" />
            </div>
            <span className="absolute text-lg font-bold text-gray-900">{data.currentStreak}</span>
          </div>
          <p className="text-sm text-gray-500 mt-2">Current Streak</p>
          <p className="text-xs text-gray-400 mt-1">
            {formatDate(data.currentStreakStart)} - {formatDate(data.currentStreakEnd)}
          </p>
        </div>

        <div className="w-px h-16 bg-gray-300 mx-4" />

        <div className="flex-1">
          <p className="text-2xl font-bold text-gray-900">{data.longestStreak}</p>
          <p className="text-sm text-gray-500 mt-1">Longest Streak</p>
          <p className="text-xs text-gray-400 mt-1">
            {formatDate(data.longestStreakStart)} - {formatDate(data.longestStreakEnd)}
          </p>
        </div>
      </div>
    </div>
  );
}
