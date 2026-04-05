"use client";

import React, { useEffect, useState } from "react";

interface StatsData {
  developers: number;
  articles: number;
  repos: number;
}

export default function Stat() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        const response = await fetch("/api/stats");
        if (response.ok) {
          const data: StatsData = await response.json();
          setStats(data);
        } else {
          console.error("API returned non-OK status:", response.status);
        }
      } catch (error) {
        console.error("Failed to fetch stats:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []); // ✅ useEffect is correctly set up and WILL run once on mount

  const statItems = [
    { key: "developers" as const, label: "Developers" },
    { key: "articles" as const, label: "Articles" },
    { key: "repos" as const, label: "Repos" },
  ];

  return (
    <div className="w-full rounded-2xl p-4 md:p-8 bg-blue-400/20 shadow-[0_0_20px_0_rgba(74,222,128,0.8),0_0_40px_0_rgba(59,130,246,0.15)] shadow-emerald-600/20 shadow-blue-600/20 text-black flex flex-wrap items-center justify-center gap-6 md:gap-12 lg:gap-18">
      {statItems.map(({ key, label }) => {
        const displayValue = loading
          ? "..."
          : `${stats?.[key] ?? 0}+`;

        return (
          <div
            key={key}
            className="flex flex-col items-center justify-center min-w-[80px]"
          >
            <span className="text-xl md:text-2xl font-bold">{displayValue}</span>
            <span className="text-xs md:text-sm">{label}</span>
          </div>
        );
      })}
    </div>
  );
}