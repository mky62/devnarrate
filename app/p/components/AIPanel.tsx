"use client";

import { useState, useEffect, useRef } from "react";
import { Sparkles, Loader2, RefreshCw, AlertCircle, X, Send } from "lucide-react";

interface Repo {
  githubRepoId: number;
  name: string | null;
  description: string | null;
  language: string | null;
  status: "not_indexed" | "pending" | "indexing" | "completed" | "failed";
  accountId: string;
}

interface AIPanelProps {
  onInsert: (content: string) => void;
  onClose: () => void;
}

export default function AIPanel({ onInsert, onClose }: AIPanelProps) {
  const [repos, setRepos] = useState<Repo[]>([]);
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isIndexing, setIsIndexing] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  // Fetch repos on mount
  useEffect(() => {
    fetchRepos();
  }, []);

  const fetchRepos = async () => {
    try {
      const res = await fetch("/api/repos/list");
      if (!res.ok) throw new Error("Failed to fetch repos");
      const data = await res.json();
      setRepos(data.repos || []);
    } catch (err) {
      setError("Failed to load repositories");
    }
  };

  const handleIndexRepo = async () => {
    if (!selectedRepo) return;

    const repo = repos.find((r) => String(r.githubRepoId) === selectedRepo);
    if (!repo?.name) return;

    setIsIndexing(true);
    setError(null);

    try {
      const res = await fetch("/api/repos/index", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoId: repo.githubRepoId,
          repoName: repo.name,
          accountId: repo.accountId,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to start indexing");
      }

      // Optimistically update status
      setRepos((prev) =>
        prev.map((r) =>
          String(r.githubRepoId) === selectedRepo
            ? { ...r, status: "pending" }
            : r
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to index repo");
    } finally {
      setIsIndexing(false);
    }
  };

  const handleGenerate = async () => {
    if (!selectedRepo || !prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedContent("");
    setError(null);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          repoId: selectedRepo,
          prompt: prompt.trim(),
        }),
      });

      if (!res.ok) {
        if (res.status === 425) {
          throw new Error("Repo is still being indexed. Please try again in a moment.");
        }
        const data = await res.json();
        throw new Error(data.error || "Failed to generate content");
      }

      // Read the streaming response
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value);
        content += chunk;
        setGeneratedContent(content);

        // Auto-scroll to bottom
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setIsGenerating(false);
    }
  };

  const getStatusBadge = (status: Repo["status"]) => {
    switch (status) {
      case "completed":
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">
            Indexed
          </span>
        );
      case "indexing":
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
            Indexing...
          </span>
        );
      case "pending":
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
            Pending
          </span>
        );
      case "failed":
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700">
            Failed
          </span>
        );
      default:
        return (
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
            Not Indexed
          </span>
        );
    }
  };

  const selectedRepoData = repos.find(
    (r) => String(r.githubRepoId) === selectedRepo
  );
  const canGenerate = selectedRepoData?.status === "completed";

  return (
    <div className="w-80 flex-shrink-0 border-l border-gray-200 bg-gray-50/50 flex flex-col h-full">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white">
        <div className="flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-blue-500" />
          <h3 className="font-semibold text-sm text-gray-800">AI Writer</h3>
        </div>
        <button
          onClick={onClose}
          className="p-1 hover:bg-gray-100 rounded-md transition-colors"
        >
          <X className="w-4 h-4 text-gray-500" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Repo Selector */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">
            Select Repository
          </label>
          <select
            value={selectedRepo}
            onChange={(e) => setSelectedRepo(e.target.value)}
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
          >
            <option value="">Choose a repo...</option>
            {repos.map((repo) => (
              <option key={repo.githubRepoId} value={repo.githubRepoId}>
                {repo.name}
              </option>
            ))}
          </select>

          {selectedRepoData && (
            <div className="flex items-center justify-between">
              {getStatusBadge(selectedRepoData.status)}

              {selectedRepoData.status !== "completed" &&
                selectedRepoData.status !== "indexing" &&
                selectedRepoData.status !== "pending" && (
                  <button
                    onClick={handleIndexRepo}
                    disabled={isIndexing}
                    className="text-xs flex items-center gap-1 px-3 py-1.5 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 transition-colors"
                  >
                    {isIndexing ? (
                      <Loader2 className="w-3 h-3 animate-spin" />
                    ) : (
                      <RefreshCw className="w-3 h-3" />
                    )}
                    {isIndexing ? "Indexing..." : "Index Repo"}
                  </button>
                )}
            </div>
          )}
        </div>

        {/* Prompt Input */}
        <div className="space-y-2">
          <label className="text-xs font-medium text-gray-600">
            What do you want to write?
          </label>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g., Write a tutorial about the main API endpoints..."
            className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-h-[100px] resize-none"
            disabled={isGenerating}
          />
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
            <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-red-600">{error}</p>
          </div>
        )}

        {/* Generate Button */}
        <button
          onClick={handleGenerate}
          disabled={!selectedRepo || !prompt.trim() || isGenerating || !canGenerate}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {isGenerating ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Generate
            </>
          )}
        </button>

        {!canGenerate && selectedRepo && (
          <p className="text-xs text-gray-500 text-center">
            Please index the repository first to generate content.
          </p>
        )}

        {/* Generated Content */}
        {generatedContent && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-medium text-gray-600">
                Generated Content
              </label>
              <button
                onClick={() => onInsert(generatedContent)}
                className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
              >
                Insert to Editor
              </button>
            </div>
            <div
              ref={contentRef}
              className="p-3 bg-white border border-gray-200 rounded-lg max-h-64 overflow-y-auto text-sm prose prose-sm"
            >
              {generatedContent.split("\n").map((line, i) => (
                <p key={i} className="mb-1">
                  {line}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
