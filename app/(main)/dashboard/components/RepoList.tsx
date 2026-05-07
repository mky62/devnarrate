"use client";

import { useState, useMemo, useTransition, useEffect } from "react";
import { Search, X, Plus, RefreshCw } from "lucide-react";
import RepoSearchModal from "./RepoSearchModal";

interface SavedRepo {
  githubRepoId: string | number | bigint;
  name: string | null;
  language: string | null;
  stars: number;
  forks: number;
  description: string | null;
  accountId: string;
  status: "not_indexed" | "pending" | "indexing" | "completed" | "failed" | "failed_with_stale_index" | "stale" | "tracked" | "indexed";
  latestCommitSha: string | null;
  indexedCommitSha: string | null;
}

interface StatusBadge {
  label: string;
  classes: string;
}

function getStatusBadge(status: SavedRepo["status"]): StatusBadge {
  const statusMap: Record<string, StatusBadge> = {
    completed: { label: "indexed", classes: "bg-green-500/20 text-green-400 border border-green-500/30" },
    indexed: { label: "indexed", classes: "bg-green-500/20 text-green-400 border border-green-500/30" },
    pending: { label: "pending", classes: "bg-blue-500/20 text-blue-400 border border-blue-500/30" },
    not_indexed: { label: "pending", classes: "bg-blue-500/20 text-blue-400 border border-blue-500/30" },
    indexing: { label: "indexing", classes: "bg-blue-500/20 text-blue-400 border border-blue-500/30" },
    tracked: { label: "tracked", classes: "bg-blue-500/20 text-blue-400 border border-blue-500/30" },
    failed: { label: "failed", classes: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" },
    failed_with_stale_index: { label: "stale index", classes: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" },
    stale: { label: "stale", classes: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" },
  };
  return statusMap[status] || { label: status, classes: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30" };
}

interface RepoListProps {
  initialSavedRepos: SavedRepo[];
}

export default function RepoList({ initialSavedRepos }: RepoListProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [indexingRepoId, setIndexingRepoId] = useState<string | null>(null);
  const [repos, setRepos] = useState(initialSavedRepos);
  const [refreshKey, setRefreshKey] = useState(0);

  // Update repos when initialSavedRepos changes or when refreshKey changes
  useEffect(() => {
    setRepos(initialSavedRepos);
  }, [initialSavedRepos, refreshKey]);

  const triggerRefresh = () => {
    setRefreshKey(k => k + 1);
  };

  const triggerIndex = async (githubRepoId: number, name: string | null, accountId: string) => {
    setIndexingRepoId(String(githubRepoId));
    try {
      const res = await fetch("/api/repos/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoId: githubRepoId,
          repoName: name,
          accountId,
        }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        console.error("Failed to start indexing:", data.error);
      }
    } catch (error) {
      console.error("Failed to start indexing:", error);
    } finally {
      setIndexingRepoId(null);
    }
  };

  const filteredRepos = useMemo(() => {
    if (!searchQuery.trim()) return initialSavedRepos;
    const query = searchQuery.toLowerCase();
    return initialSavedRepos.filter(
      (repo) =>
        repo.name?.toLowerCase().includes(query) ||
        repo.description?.toLowerCase().includes(query) ||
        repo.language?.toLowerCase().includes(query)
    );
  }, [initialSavedRepos, searchQuery]);

  if (initialSavedRepos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/50 p-4 min-h-0">
        <p className="text-sm">No repositories tracked yet</p>
        <p className="text-xs mt-1 text-white/40">Add repos from your profile to track them here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 overflow-hidden p-2 min-h-0 h-full">
      <div className="flex items-center gap-2 mb-2 px-2">
        <h3 className="text-sm font-semibold text-white/80 flex-shrink-0">Repositories</h3>
        <span className="text-xs text-white/50">{filteredRepos.length}</span>
        <div className="flex-1" />
        <button
          type="button"
          onClick={triggerRefresh}
          className="p-1 text-white/50 hover:text-white"
          title="Refresh repos"
        >
          <RefreshCw size={12} />
        </button>
        <button
          type="button"
          onClick={() => setIsSearchOpen(true)}
          className="flex items-center gap-1 px-2 py-1 text-xs bg-white/10 hover:bg-white/20 border border-white/20 rounded-lg text-white/80 transition-colors"
        >
          <Plus size={12} />
          Add
        </button>
        <div className="relative w-32">
          <Search size={12} className="absolute left-2 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            placeholder="Search..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-6 pr-6 py-1 text-xs bg-white/10 border border-white/10 rounded-lg text-white placeholder-white/40 focus:outline-none focus:border-white/20"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-1.5 top-1/2 -translate-y-1/2 text-white/40 hover:text-white"
            >
              <X size={10} />
            </button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto dashboard-scroll space-y-2">
        {filteredRepos.length === 0 ? (
          <div className="text-center py-4 text-white/40 text-sm">
            No repos found
          </div>
        ) : (
          filteredRepos.map((repo) => {
            const badge = getStatusBadge(repo.status);
            return (
            <div
              key={String(repo.githubRepoId)}
              className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-white truncate">
                  {repo.name}
                </h4>
                <div className="flex items-center gap-2">
                  {(repo.status === "not_indexed" || repo.status === "pending" || repo.status === "indexing" || repo.status === "failed" || repo.status === "stale") && (
                    <button
                      type="button"
                      onClick={() => triggerIndex(Number(repo.githubRepoId), repo.name, repo.accountId)}
                      disabled={indexingRepoId === String(repo.githubRepoId)}
                      className="p-1 text-white/50 hover:text-white disabled:opacity-50"
                      title="Start indexing"
                    >
                      {indexingRepoId === String(repo.githubRepoId) ? (
                        <RefreshCw size={12} className="animate-spin" />
                      ) : (
                        <RefreshCw size={12} />
                      )}
                    </button>
                  )}
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${badge.classes}`}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>
              {repo.description && (
                <p className="text-xs text-white/50 mt-1 line-clamp-2">
                  {repo.description}
                </p>
              )}
              <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                <span>⭐ {repo.stars}</span>
                <span>⑂ {repo.forks}</span>
                {repo.language && <span>{repo.language}</span>}
              </div>
            </div>
            );
          })
        )}
      </div>

      <RepoSearchModal 
        isOpen={isSearchOpen} 
        onClose={() => setIsSearchOpen(false)} 
        onRepoAdded={triggerRefresh}
      />
    </div>
  );
}