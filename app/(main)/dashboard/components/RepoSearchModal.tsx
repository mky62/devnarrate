"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, X, Loader2, GitBranch, Star } from "lucide-react";
import { useAddRepo } from "@/hooks/useRepos";

interface GitHubRepo {
  githubRepoId: number;
  name: string;
  description: string | null;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
}

interface RepoSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRepoAdded?: () => void;
}

const CACHE_KEY = "github_repos_cache";
const CACHE_DURATION = 30 * 60 * 1000; // 30 minutes

function getCachedRepos(): GitHubRepo[] | null {
  if (typeof window === "undefined") return null;
  const cached = sessionStorage.getItem(CACHE_KEY);
  if (!cached) return null;
  
  try {
    const { data, timestamp } = JSON.parse(cached);
    if (Date.now() - timestamp > CACHE_DURATION) {
      sessionStorage.removeItem(CACHE_KEY);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

function setCachedRepos(repos: GitHubRepo[]) {
  if (typeof window === "undefined") return;
  sessionStorage.setItem(CACHE_KEY, JSON.stringify({
    data: repos,
    timestamp: Date.now()
  }));
}

export default function RepoSearchModal({ isOpen, onClose, onRepoAdded }: RepoSearchModalProps) {
  const [query, setQuery] = useState("");
  const [repos, setRepos] = useState<GitHubRepo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [addingId, setAddingId] = useState<number | null>(null);
  const [addedIds, setAddedIds] = useState<Set<number>>(new Set());
  
  const addRepo = useAddRepo();

  const fetchRepos = useCallback(async (searchQuery: string) => {
    setLoading(true);
    setError(null);
    
    try {
      // First check sessionStorage cache
      const cached = getCachedRepos();
      if (cached) {
        const filtered = searchQuery
          ? cached.filter(r => 
              r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
              r.description?.toLowerCase().includes(searchQuery.toLowerCase())
            )
          : cached;
        setRepos(filtered);
        setLoading(false);
        return;
      }

      // Fetch from API if no cache
      const res = await fetch(`/api/github/repos${searchQuery ? `?q=${encodeURIComponent(searchQuery)}` : ""}`);
      const data = await res.json();
      
      if (!res.ok) {
        setError(data.error || "Failed to fetch repositories");
        setRepos([]);
      } else {
        setRepos(data.repos || []);
        // Cache the results in sessionStorage
        if (data.repos) {
          setCachedRepos(data.repos);
        }
      }
    } catch (err) {
      setError("Failed to fetch repositories");
      setRepos([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isOpen && repos.length === 0) {
      fetchRepos("");
    }
  }, [isOpen, fetchRepos, repos.length]);

  const handleAddRepo = async (repo: GitHubRepo) => {
    if (addedIds.has(repo.githubRepoId) || addingId) return;
    
    setAddingId(repo.githubRepoId);
    try {
      await addRepo.mutateAsync({
        githubRepoId: repo.githubRepoId,
        name: repo.name,
        description: repo.description,
        language: repo.language,
        stargazers_count: repo.stargazers_count,
        forks_count: repo.forks_count,
      });
      
      setAddedIds(prev => new Set([...prev, repo.githubRepoId]));
      onRepoAdded?.();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to add repository");
    } finally {
      setAddingId(null);
    }
  };

  const handleSearch = (value: string) => {
    setQuery(value);
    fetchRepos(value);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[200]" onClick={onClose}>
      <div 
        className="bg-gradient-to-br from-[#1946BD] to-[#D5824A] rounded-2xl shadow-2xl w-full max-w-lg max-h-[80vh] flex flex-col border border-white/20 mx-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-4 py-3 border-b border-white/20 flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-white">Add Repository</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
          >
            <X size={18} className="text-white/70" />
          </button>
        </div>

        {/* Search */}
        <div className="p-4 border-b border-white/20">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-white/40" />
            <input
              type="text"
              value={query}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search your repositories..."
              className="w-full pl-9 pr-4 py-2.5 text-sm bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30"
              autoFocus
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="px-4 py-2 bg-red-500/20 border-b border-red-500/30">
            <p className="text-sm text-red-300">{error}</p>
          </div>
        )}

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 size={24} className="text-white/50 animate-spin" />
            </div>
          ) : repos.length === 0 ? (
            <div className="text-center py-8 text-white/50">
              <p>No repositories found</p>
            </div>
          ) : (
            <div className="space-y-2">
              {repos.map((repo) => (
                <button
                  key={repo.githubRepoId}
                  type="button"
                  onClick={() => handleAddRepo(repo)}
                  disabled={addedIds.has(repo.githubRepoId)}
                  className="w-full p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors text-left disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 min-w-0">
                      <GitBranch size={14} className="text-white/50 shrink-0" />
                      <span className="font-medium text-white truncate">{repo.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-xs text-white/50 shrink-0">
                      <span className="flex items-center gap-1">
                        <Star size={10} /> {repo.stargazers_count}
                      </span>
                      <span className="flex items-center gap-1">
                        {repo.forks_count}
                      </span>
                      {addedIds.has(repo.githubRepoId) ? (
                        <span className="text-green-400">Added</span>
                      ) : addingId === repo.githubRepoId ? (
                        <Loader2 size={12} className="animate-spin" />
                      ) : (
                        <span className="text-white/40">Add</span>
                      )}
                    </div>
                  </div>
                  {repo.description && (
                    <p className="text-xs text-white/50 mt-1 line-clamp-1 ml-6">
                      {repo.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-white/20 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}