"use client"

import { useEffect, useMemo, useState } from "react";
import { Search, X, Loader2, Trash2 } from "lucide-react";
import { FaCodeFork } from "react-icons/fa6";
import { useAddRepo, useDeleteRepo, useRepos } from "@/hooks/useRepos";
import { useRepoIndexingPolling } from "@/hooks/use-repo-indexing-polling";
import type { Repo as SavedRepo } from "@/lib/userdata";


interface Repo {
    githubRepoId: number;
    name: string | null;
    description?: string | null;
    language?: string | null;
    stargazers_count?: number;
    forks_count?: number;
}

interface RepoListProps {
    initialSavedRepos?: SavedRepo[];
}

type RepoId = SavedRepo["githubRepoId"];

export default function RepoList({ initialSavedRepos = [] }: RepoListProps) {
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [githubRepos, setGithubRepos] = useState<Repo[] | null>(null);
    const [addingRepoId, setAddingRepoId] = useState<number | null>(null);
    const [deletingRepoId, setDeletingRepoId] = useState<RepoId | null>(null);
    const [indexingRepoId, setIndexingRepoId] = useState<RepoId | null>(null);
    const { data: savedRepos = initialSavedRepos, refetch: refetchRepos } = useRepos(initialSavedRepos);
    const addRepoMutation = useAddRepo();
    const deleteRepoMutation = useDeleteRepo();

    useRepoIndexingPolling(savedRepos, refetchRepos);

    useEffect(() => {
        if (!showSearchModal || githubRepos !== null) return;

        let cancelled = false;

        const loadGithubRepos = async () => {
            setIsSearching(true);
            setSearchError(null);

            try {
                const response = await fetch("/api/github/repos");
                const data = await response.json();

                if (cancelled) return;

                if (response.ok) {
                    setGithubRepos(data.repos ?? []);
                    setSearchError(null);
                } else {
                    setSearchError(data.error || "GitHub repos failed to load. Please try again.");
                }
            } catch (error) {
                if (cancelled) return;
                console.error("GitHub repos load error:", error);
                setSearchError("GitHub repos failed to load. Please try again.");
            } finally {
                if (!cancelled) {
                    setIsSearching(false);
                }
            }
        };

        void loadGithubRepos();

        return () => {
            cancelled = true;
        };
    }, [githubRepos, showSearchModal]);

    const searchResults = useMemo(() => {
        const repos = githubRepos ?? [];
        const query = searchQuery.trim().toLowerCase();

        if (!query) {
            return repos;
        }

        return repos.filter((repo) => {
            const name = repo.name?.toLowerCase() ?? "";
            const language = repo.language?.toLowerCase() ?? "";
            const description = repo.description?.toLowerCase() ?? "";

            return (
                name.includes(query) ||
                language.includes(query) ||
                description.includes(query)
            );
        });
    }, [githubRepos, searchQuery]);

    const closeSearchModal = () => {
        setShowSearchModal(false);
        setSearchQuery("");
        setSearchError(null);
    };

    const openSearchModal = () => {
        setShowSearchModal(true);
    };

    const hasLoadedGithubRepos = githubRepos !== null;
    const shouldShowNoResults = Boolean(
        hasLoadedGithubRepos &&
        !isSearching &&
        searchQuery.trim() &&
        searchResults.length === 0 &&
        !searchError
    );

    const addRepo = async (repo: Repo) => {
        if (!repo.name || savedRepos.some(r => String(r.githubRepoId) === String(repo.githubRepoId)) || addingRepoId === repo.githubRepoId) {
            return;
        }

        setAddingRepoId(repo.githubRepoId);

        try {
            await addRepoMutation.mutateAsync({
                githubRepoId: repo.githubRepoId,
                name: repo.name,
                description: repo.description,
                language: repo.language,
                stargazers_count: repo.stargazers_count,
                forks_count: repo.forks_count,
            });
        } catch (error) {
            console.error("Add repo error:", error);
        } finally {
            setAddingRepoId(null);
        }
    };


    const deleteRepo = async (githubRepoId: RepoId) => {
        if (deletingRepoId === githubRepoId) return;

        if (!confirm("Delete this repository from your list?")) return;

        setDeletingRepoId(githubRepoId);

        try {
            await deleteRepoMutation.mutateAsync(githubRepoId);
        } catch (error) {
            console.error("Delete repo error:", error);
        } finally {
            setDeletingRepoId(null);
        }
    };

    const getStatusBadge = (status?: SavedRepo["status"]) => {
        switch (status) {
            case "completed":
                return <span className="block w-2 h-2 rounded-full bg-[#0556f7]" title="Indexed" />;
            case "indexing":
                return <span className="block w-2 h-2 rounded-full bg-[#12df03] animate-pulse" title="Indexing" />;
            case "pending":
                return <span className="block w-2 h-2 rounded-full bg-[#f7ef05] animate-pulse" title="Pending" />;
            case "failed":
                return <span className="block w-2 h-2 rounded-full bg-[#dd0404]" title="Failed" />;
            case "failed_with_stale_index":
            case "stale":
                return <span className="block w-2 h-2 rounded-full bg-[#e85704]" title="Stale" />;
            case "not_indexed":
                return <span className="block w-2 h-2 rounded-full bg-[#010107] animate-pulse" title="Not indexed" />;
            default:
                return (
                    <span className="flex w-2 h-2 items-center justify-center" title="Checking">
                        <Loader2 size={8} className="animate-spin text-[#0556f7]" />
                    </span>
                );
        }
    };

    const canIndexRepo = (repo: SavedRepo) => {
        const status = repo.status;
        return Boolean(
            repo.accountId &&
            repo.name &&
            (status === "not_indexed" || status === "failed" || status === "failed_with_stale_index" || status === "stale")
        );
    };

    const indexRepo = async (repo: SavedRepo) => {
        if (!canIndexRepo(repo) || String(indexingRepoId) === String(repo.githubRepoId)) return;

        setIndexingRepoId(repo.githubRepoId);

        try {
            const response = await fetch("/api/repos/index", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    repoId: repo.githubRepoId,
                    repoName: repo.name,
                    accountId: repo.accountId,
                }),
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || "Failed to start indexing");
            }

            await refetchRepos();
        } catch (error) {
            console.error("Index repo error:", error);
        } finally {
            setIndexingRepoId(null);
        }
    };

    return (
        <div className="border-white/10 border-2  h-full rounded-2xl flex flex-col overflow-hidden min-w-0">
            {/* Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
                <h2 className="font-semibold text-white/90 text-sm">Repositories</h2>
                <div className="flex items-center gap-2">
                    <span className="text-xs bg-white/10 text-white/70 font-medium px-2 py-0.5 rounded-full">
                        {savedRepos.length}
                    </span>
                    <button
                        onClick={openSearchModal}
                        className="p-1 hover:bg-white/10 rounded-md transition-colors"
                        title="Search GitHub repos"
                    >
                        <Search size={14} className="text-white/70" />
                    </button>
                </div>
            </div>

            {/* Saved Repos List */}
            <div className="flex-1 overflow-y-auto divide-y divide-white/5 p-2 min-h-0">
                {savedRepos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <p className="text-gray-400 text-sm">No repositories saved yet</p>
                        <p className="text-gray-400 text-xs mt-1">Click the search icon above to add</p>
                    </div>
                ) : (
                    savedRepos.map((repo) => (
                        <div
                            key={repo.githubRepoId}
                            className="px-3 py-2 flex gap-2 items-center justify-between bg-white/5 hover:bg-white/10 rounded-lg mx-1 transition-colors"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-xs font-medium text-white/90 truncate">{repo.name}</p>
                                <div className="mt-1 flex items-center gap-2">
                                    {repo.language && (
                                        <p className="text-[10px] text-white/50">{repo.language}</p>
                                    )}
                                    {getStatusBadge(repo.status)}
                                </div>
                            </div>
                            <div className="text-[10px] text-white/40 flex items-center gap-2">
                                {repo.stars !== undefined && <span>⭐ {repo.stars}</span>}
                                {repo.forks !== undefined && <span className="flex items-center gap-1"><FaCodeFork /> {repo.forks}</span>}
                            </div>

                            {canIndexRepo(repo) && (
                                <button
                                    onClick={() => indexRepo(repo)}
                                    disabled={String(indexingRepoId) === String(repo.githubRepoId)}
                                    className="text-[10px] flex items-center gap-1 px-2 py-1 rounded-full border border-white/20 text-white/70 hover:bg-white/10 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                                    title="Index repository for AI writer"
                                >
                                    {String(indexingRepoId) === String(repo.githubRepoId) && <Loader2 size={10} className="animate-spin" />}
                                    {String(indexingRepoId) === String(repo.githubRepoId) ? "Indexing" : "Index"}
                                </button>
                            )}

                            <button
                                onClick={() => deleteRepo(repo.githubRepoId)}
                                disabled={String(deletingRepoId) === String(repo.githubRepoId)}
                                className="transition-opacity text-white/40 hover:text-white/70 disabled:opacity-50"
                                title="Remove repository"
                            >
                                {String(deletingRepoId) === String(repo.githubRepoId) ? (
                                    <Loader2 size={14} className="animate-spin" />
                                ) : (
                                    <Trash2 size={14} />
                                )}
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Search Modal */}
            {showSearchModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-hidden">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[60vh] flex flex-col overflow-hidden">
                        <div className="px-4 py-3 flex items-center justify-between shrink-0">
                            <h3 className="font-semibold text-gray-800">Search GitHub Repositories</h3>
                            <button
                                onClick={closeSearchModal}
                                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="px-4 py-3 shrink-0">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search repositories..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    autoFocus
                                />
                                {isSearching && (
                                    <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                                )}
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 divide-y divide-gray-100 min-h-0">
                            {searchError && (
                                <p className="px-4 py-3 text-sm text-red-600 border-b border-gray-100 shrink-0">
                                    {searchError}
                                </p>
                            )}

                            {isSearching && !hasLoadedGithubRepos && (
                                <p className="text-sm text-gray-500 text-center py-6 shrink-0">Loading repositories...</p>
                            )}

                            {searchResults.map((repo) => {
                                const isSaved = savedRepos.some(r => String(r.githubRepoId) === String(repo.githubRepoId));
                                const isAdding = addingRepoId === repo.githubRepoId;

                                return (
                                    <div
                                        key={repo.githubRepoId}
                                        className="px-4 py-3 flex items-center justify-between hover:bg-gray-50 shrink-0"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{repo.name}</p>
                                            {repo.language && <p className="text-xs text-gray-500">{repo.language}</p>}
                                        </div>
                                        <button
                                            onClick={() => addRepo(repo)}
                                            disabled={isSaved || isAdding}
                                            className="text-xs px-3 py-1 rounded-full border border-blue-500 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
                                        >
                                            {isAdding ? "Adding…" : isSaved ? "Added" : "Add"}
                                        </button>
                                    </div>
                                );
                            })}

                            {shouldShowNoResults && (
                                <p className="text-sm text-gray-500 text-center py-6 shrink-0">No repositories found.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
