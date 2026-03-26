"use client";

import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { FaCodeFork } from "react-icons/fa6";

interface Repo {
  githubRepoId: number;
  name: string | null;
  description?: string | null;
  language?: string | null;
  stargazers_count?: number;
  forks_count?: number;
}

interface PublicRepoListProps {
  stageName: string;
}

export default function PublicRepoList({ stageName }: PublicRepoListProps) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/repos/public/${stageName}`)
      .then((res) => res.json())
      .then((data) => setRepos(data.repos ?? []))
      .catch(() => setRepos([]))
      .finally(() => setLoading(false));
  }, [stageName]);

  return (
    <div className="border-blue-500 border-2 h-full rounded-xl flex flex-col overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-blue-100 flex items-center justify-between shrink-0">
        <h2 className="font-semibold text-gray-800 text-sm">Repositories</h2>
        <div className="flex items-center gap-2">
          <span className="text-xs bg-blue-100 text-blue-600 font-medium px-2 py-0.5 rounded-full">
            {repos.length}
          </span>
        </div>
      </div>

      {/* Repos List */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3">
            <Loader2 size={24} className="animate-spin opacity-40" />
            <p className="text-sm">Loading repositories…</p>
          </div>
        ) : repos.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center py-8">
            <p className="text-gray-400 text-sm">No repositories saved yet</p>
            <p className="text-gray-400 text-xs mt-1">
              This user hasn&apos;t added any repositories
            </p>
          </div>
        ) : (
          repos.map((repo) => (
            <div
              key={repo.githubRepoId}
              className="px-4 py-3 flex gap-2 items-center justify-between bg-gray-100/30 hover:border-b-2 hover:border-blue-500 rounded-xl mx-1"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-800 truncate">
                  {repo.name}
                </p>
                {repo.language && (
                  <p className="text-xs text-gray-500">{repo.language}</p>
                )}
              </div>
              <div className="text-xs text-gray-400 flex items-center gap-3">
                {repo.stargazers_count !== undefined && (
                  <span>⭐ {repo.stargazers_count}</span>
                )}
                {repo.forks_count !== undefined && (
                  <span className="flex items-center gap-1">
                    <FaCodeFork /> {repo.forks_count}
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
