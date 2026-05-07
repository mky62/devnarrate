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

interface RepoListProps {
  initialSavedRepos: SavedRepo[];
}

export default function RepoList({ initialSavedRepos }: RepoListProps) {
  if (initialSavedRepos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-white/50 p-4 min-h-0">
        <p className="text-sm">No repositories tracked yet</p>
        <p className="text-xs mt-1 text-white/40">Add repos from your profile to track them here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto max-h-full p-2 min-h-0 h-full dashboard-scroll">
      <h3 className="text-sm font-semibold text-white/80 mb-2 px-2">Repositories</h3>
      {initialSavedRepos.map((repo) => (
        <div
          key={repo.githubRepoId}
          className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-colors"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-white truncate">
              {repo.name}
            </h4>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                repo.status === "completed" || repo.status === "indexed"
                  ? "bg-green-500/20 text-green-400 border border-green-500/30"
                  : repo.status === "pending" || repo.status === "indexing" || repo.status === "tracked"
                  ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                  : "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
              }`}
            >
              {repo.status === "completed" ? "indexed" : repo.status === "not_indexed" ? "pending" : repo.status}
            </span>
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
      ))}
    </div>
  );
}