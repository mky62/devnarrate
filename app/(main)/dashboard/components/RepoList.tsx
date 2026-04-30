"use client"

import { useCallback, useEffect, useState } from "react";
import { Search, X, Loader2, Trash2 } from "lucide-react";
import { useDebounce } from "@/hooks/use-debounce";
import { FaCodeFork } from "react-icons/fa6";
import { useAddRepo, useDeleteRepo, useRepos } from "@/hooks/useRepos";
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

export default function RepoList({ initialSavedRepos = [] }: RepoListProps) {
    const [showSearchModal, setShowSearchModal] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchError, setSearchError] = useState<string | null>(null);
    const [searchResults, setSearchResults] = useState<Repo[]>([]);
    const [addingRepoId, setAddingRepoId] = useState<number | null>(null);
    const [deletingRepoId, setDeletingRepoId] = useState<number | null>(null);
    const [indexingRepoId, setIndexingRepoId] = useState<number | null>(null);
    const { data: savedRepos = initialSavedRepos, refetch: refetchRepos } = useRepos(initialSavedRepos);
    const addRepoMutation = useAddRepo();
    const deleteRepoMutation = useDeleteRepo();

    useEffect(() => {
        const hasActiveIndexJob = savedRepos.some(
            (repo) => repo.status === "pending" || repo.status === "indexing"
        );
        if (!hasActiveIndexJob) return;

        const interval = setInterval(() => {
            refetchRepos();
        }, 20000);

        return () => clearInterval(interval);
    }, [refetchRepos, savedRepos]);

    const debouncedSearch = useDebounce(async (query: string) => {
        if (query.trim().length === 0) {
            setSearchResults([]);
            setSearchError(null);
            return;
        }

        setIsSearching(true);
        setSearchError(null);

        try {
            const response = await fetch(`/api/github/search?q=${encodeURIComponent(query)}`);
            const data = await response.json();

            if (response.ok) {
                setSearchResults(data.repos);
                setSearchError(null);
            } else {
                setSearchResults([]);
                setSearchError(data.error || "GitHub search failed. Please try again.");
            }
        } catch (error) {
            console.error("Search error:", error);
            setSearchResults([]);
            setSearchError("GitHub search failed. Please try again.");
        } finally {
            setIsSearching(false);
        }
    }, 300);

    const handleSearch = useCallback(
        (query: string) => {
            setSearchQuery(query);
            debouncedSearch(query);
        },
        [debouncedSearch]
    );

    const addRepo = async (repo: Repo) => {
        if (!repo.name || savedRepos.some(r => r.githubRepoId === repo.githubRepoId) || addingRepoId === repo.githubRepoId) {
            return;
        }

        setAddingRepoId(repo.githubRepoId);

        try {
            await addRepoMutation.mutateAsync({
                githubRepoId: repo.githubRepoId,
                name: repo.name,
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


    const deleteRepo = async (githubRepoId: number) => {
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
                return <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">Indexed</span>;
            case "indexing":
                return <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">Indexing</span>;
            case "pending":
                return <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">Pending</span>;
            case "failed":
                return <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700">Failed</span>;
            case "failed_with_stale_index":
                return <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">Stale</span>;
            case "not_indexed":
                return <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">Not Indexed</span>;
            default:
                return <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-500">Checking</span>;
        }
    };

    const canIndexRepo = (repo: SavedRepo) => {
        const status = repo.status;
        return Boolean(
            repo.accountId &&
            repo.name &&
            (status === "not_indexed" || status === "failed" || status === "failed_with_stale_index")
        );
    };

    const indexRepo = async (repo: SavedRepo) => {
        if (!canIndexRepo(repo) || indexingRepoId === repo.githubRepoId) return;

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
        <div className="border-blue-500 border-2  h-full rounded-xl flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-blue-100 flex items-center justify-between shrink-0">
                <h2 className="font-semibold text-gray-800 text-sm">Repositories</h2>
                <div className="flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-600 font-medium px-2 py-0.5 rounded-full">
                        {savedRepos.length}
                    </span>
                    <button
                        onClick={() => setShowSearchModal(true)}
                        className="p-1 hover:bg-blue-50 rounded-md transition-colors"
                        title="Search GitHub repos"
                    >
                        <Search size={14} className="text-blue-600" />
                    </button>
                </div>
            </div>

            {/* Saved Repos List */}
            <div className="flex-1 overflow-y-auto divide-y divide-gray-100 p-2">
                {savedRepos.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-center py-8">
                        <p className="text-gray-400 text-sm">No repositories saved yet</p>
                        <p className="text-gray-400 text-xs mt-1">Click the search icon above to add some</p>
                    </div>
                ) : (
                    savedRepos.map((repo) => (
                        <div
                            key={repo.githubRepoId}
                            className="px-4 py-3 flex gap-2 items-center justify-between bg-gray-100/30 hover:border-b-2 hover:border-blue-500 rounded-xl mx-1"
                        >
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 truncate">{repo.name}</p>
                                <div className="mt-1 flex items-center gap-2">
                                    {repo.language && (
                                        <p className="text-xs text-gray-500">{repo.language}</p>
                                    )}
                                    {getStatusBadge(repo.status)}
                                </div>
                            </div>
                            <div className="text-xs text-gray-400 flex items-center gap-3">
                                {repo.stars !== undefined && <span>⭐ {repo.stars}</span>}
                                {repo.forks !== undefined && <span className="flex items-center gap-1"><FaCodeFork /> {repo.forks}</span>}
                            </div>

                            {canIndexRepo(repo) && (
                                <button
                                    onClick={() => indexRepo(repo)}
                                    disabled={indexingRepoId === repo.githubRepoId}
                                    className="text-xs flex items-center gap-1 px-2.5 py-1 rounded-full border border-blue-500 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                                    title="Index repository for AI writer"
                                >
                                    {indexingRepoId === repo.githubRepoId && <Loader2 size={12} className="animate-spin" />}
                                    {indexingRepoId === repo.githubRepoId ? "Indexing" : "Index"}
                                </button>
                            )}

                            <button
                                onClick={() => deleteRepo(repo.githubRepoId)}
                                disabled={deletingRepoId === repo.githubRepoId}
                                className="transition-opacity text-red-400 hover:text-red-600 disabled:opacity-50"
                                title="Remove repository"
                            >
                                {deletingRepoId === repo.githubRepoId ? (
                                    <Loader2 size={16} className="animate-spin" />
                                ) : (
                                    <Trash2 size={16} />
                                )}
                            </button>
                        </div>
                    ))
                )}
            </div>

            {/* Search Modal */}
            {showSearchModal && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-lg max-h-[80vh] flex flex-col">
                        <div className="px-4 py-3 flex items-center justify-between">
                            <h3 className="font-semibold text-gray-800">Search GitHub Repositories</h3>
                            <button
                                onClick={() => { setShowSearchModal(false); setSearchResults([]); setSearchQuery(""); setSearchError(null); }}
                                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                <X size={18} className="text-gray-500" />
                            </button>
                        </div>

                        <div className="px-4 py-3 ">
                            <div className="relative">
                                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Search repositories..."
                                    value={searchQuery}
                                    onChange={(e) => handleSearch(e.target.value)}
                                    className="w-full pl-10 pr-10 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    autoFocus
                                />
                                {isSearching && (
                                    <Loader2 size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin" />
                                )}
                            </div>
                        </div>

                        <div className="overflow-y-auto flex-1 divide-y divide-gray-100">
                            {searchError && (
                                <p className="px-4 py-3 text-sm text-red-600 border-b border-gray-100">
                                    {searchError}
                                </p>
                            )}

                            {searchResults.map((repo) => {
                                const isSaved = savedRepos.some(r => r.githubRepoId === repo.githubRepoId);
                                const isAdding = addingRepoId === repo.githubRepoId;

                                return (
                                    <div
                                        key={repo.githubRepoId}
                                        className="px-4 py-3 flex items-center justify-between hover:bg-gray-50"
                                    >
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-800 truncate">{repo.name}</p>
                                            {repo.language && <p className="text-xs text-gray-500">{repo.language}</p>}
                                        </div>
                                        <button
                                            onClick={() => addRepo(repo)}
                                            disabled={isSaved || isAdding}
                                            className="text-xs px-3 py-1 rounded-full border border-blue-500 text-blue-600 hover:bg-blue-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors whitespace-nowrap"
                                        >
                                            {isAdding ? "Adding…" : isSaved ? "Added" : "Add"}
                                        </button>
                                    </div>
                                );
                            })}

                            {!isSearching && searchQuery && searchResults.length === 0 && !searchError && (
                                <p className="text-sm text-gray-500 text-center py-6">No repositories found.</p>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
