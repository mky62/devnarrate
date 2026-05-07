interface SavedRepo {
  githubRepoId: string | number;
  name: string | null;
  language: string | null;
  stars: number;
  forks: number;
  description: string | null;
  accountId: string;
  status: "tracked" | "indexed" | "pending";
  latestCommitSha: string | null;
  indexedCommitSha: string | null;
}

interface RepoListProps {
  initialSavedRepos: SavedRepo[];
}

export default function RepoList({ initialSavedRepos }: RepoListProps) {
  if (initialSavedRepos.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 p-4">
        <p className="text-sm">No repositories tracked yet</p>
        <p className="text-xs mt-1">Add repos from your profile to track them here</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2 overflow-y-auto max-h-full p-2">
      {initialSavedRepos.map((repo) => (
        <div
          key={repo.githubRepoId}
          className="p-3 rounded-lg bg-gray-50 border border-gray-200 hover:border-blue-300 transition-colors"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-medium text-sm text-gray-900 truncate">
              {repo.name}
            </h4>
            <span
              className={`text-xs px-2 py-0.5 rounded-full ${
                repo.status === "indexed"
                  ? "bg-green-100 text-green-700"
                  : repo.status === "tracked"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-yellow-100 text-yellow-700"
              }`}
            >
              {repo.status}
            </span>
          </div>
          {repo.description && (
            <p className="text-xs text-gray-500 mt-1 line-clamp-2">
              {repo.description}
            </p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-gray-400">
            <span>⭐ {repo.stars}</span>
            <span>⑂ {repo.forks}</span>
            {repo.language && <span>{repo.language}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}