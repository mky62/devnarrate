"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Sparkles, Loader2, AlertCircle, X, Send, FileText, Users, MessageSquare, Code2, Check, Copy, Database } from "lucide-react";
import { useCachedRepos } from "@/hooks/useRepos";
import type { Repo } from "@/lib/userdata";
import { motion, AnimatePresence } from "framer-motion";

const CONTENT_TYPES = [
  { value: "tutorial", label: "Tutorial", icon: FileText },
  { value: "overview", label: "Overview", icon: Sparkles },
  { value: "changelog-style", label: "Changelog", icon: MessageSquare },
  { value: "implementation deep dive", label: "Deep Dive", icon: Code2 },
] as const;

const AUDIENCES = [
  { value: "beginner", label: "Beginner", description: "New to the topic" },
  { value: "intermediate", label: "Intermediate", description: "Some experience" },
  { value: "advanced", label: "Advanced", description: "Expert level" },
] as const;

const TONES = [
  { value: "concise", label: "Concise", description: "Brief & to the point" },
  { value: "explanatory", label: "Explanatory", description: "Detailed explanations" },
  { value: "polished", label: "Polished", description: "Professional style" },
] as const;

const GENERATE_TIMEOUT_MS = 75000;

interface AIPanelProps {
  onInsert: (content: string) => void;
  onClose: () => void;
  isDarkMode?: boolean;
}

type ContentTypeValue = (typeof CONTENT_TYPES)[number]["value"];
type AudienceValue = (typeof AUDIENCES)[number]["value"];
type ToneValue = (typeof TONES)[number]["value"];
type RepoStatus = NonNullable<Repo["status"]>;

export default function AIPanel({ onInsert, onClose, isDarkMode = false }: AIPanelProps) {
  const { data: repos = [] } = useCachedRepos();
  const [selectedRepo, setSelectedRepo] = useState<string>("");
  const [prompt, setPrompt] = useState("");
  const [contentType, setContentType] = useState<ContentTypeValue>("tutorial");
  const [audience, setAudience] = useState<AudienceValue>("intermediate");
  const [tone, setTone] = useState<ToneValue>("explanatory");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);

  const indexedRepos = useMemo(() => {
    return repos.filter(
      (repo) =>
        repo.status === "completed" ||
        repo.status === "failed_with_stale_index" ||
        repo.status === "stale"
    );
  }, [repos]);

  useEffect(() => {
    if (
      selectedRepo &&
      !indexedRepos.some((repo) => String(repo.githubRepoId) === selectedRepo)
    ) {
      setSelectedRepo("");
    }
  }, [indexedRepos, selectedRepo]);

  const readErrorMessage = async (res: Response, fallback: string) => {
    const data = await res.json().catch(() => ({} as { error?: string }));
    return data.error || fallback;
  };

  const handleGenerate = async () => {
    if (!selectedRepo || !prompt.trim()) return;

    setIsGenerating(true);
    setGeneratedContent("");
    setError(null);

    const controller = new AbortController();
    const timeout = window.setTimeout(() => {
      controller.abort();
    }, GENERATE_TIMEOUT_MS);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        signal: controller.signal,
        body: JSON.stringify({
          repoId: selectedRepo,
          prompt: prompt.trim(),
          contentType,
          audience,
          tone,
        }),
      });

      if (!res.ok) {
        if (res.status === 425) {
          throw new Error("Repo is still being indexed. Please try again in a moment.");
        }
        throw new Error(await readErrorMessage(res, "Failed to generate content"));
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let content = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        content += chunk;
        setGeneratedContent(content);

        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      }

      const finalChunk = decoder.decode();
      if (finalChunk) {
        content += finalChunk;
        setGeneratedContent(content);
        if (contentRef.current) {
          contentRef.current.scrollTop = contentRef.current.scrollHeight;
        }
      }

      if (!content.trim()) {
        throw new Error("AI provider returned an empty response. Please try again.");
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === "AbortError") {
        setError("Generation timed out. Please try again with a shorter prompt or a different repository.");
        return;
      }

      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      window.clearTimeout(timeout);
      setIsGenerating(false);
    }
  };

  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      copyTimeoutRef.current = setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy to clipboard:", error);
    }
  };

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const getStatusBadge = (status: RepoStatus) => {
    const lightStyles: Record<string, string> = {
      completed: "bg-emerald-50 text-emerald-700 border-emerald-200",
      indexing: "bg-amber-50 text-amber-700 border-amber-200",
      pending: "bg-blue-50 text-blue-700 border-blue-200",
      failed: "bg-red-50 text-red-700 border-red-200",
      failed_with_stale_index: "bg-orange-50 text-orange-700 border-orange-200",
      stale: "bg-purple-50 text-purple-700 border-purple-200",
      not_indexed: "bg-gray-50 text-gray-600 border-gray-200",
    };

    const darkStyles: Record<string, string> = {
      completed: "bg-emerald-900/50 text-emerald-400 border-emerald-800",
      indexing: "bg-amber-900/50 text-amber-400 border-amber-800",
      pending: "bg-blue-900/50 text-blue-400 border-blue-800",
      failed: "bg-red-900/50 text-red-400 border-red-800",
      failed_with_stale_index: "bg-orange-900/50 text-orange-400 border-orange-800",
      stale: "bg-purple-900/50 text-purple-400 border-purple-800",
      not_indexed: "bg-gray-800/50 text-gray-400 border-gray-700",
    };

    const labels: Record<string, string> = {
      completed: "Indexed",
      indexing: "Indexing...",
      pending: "Pending",
      failed: "Failed",
      failed_with_stale_index: "Stale Index",
      stale: "Stale",
      not_indexed: "Not Indexed",
    };

    const styles = isDarkMode ? darkStyles : lightStyles;

    return (
      <span className={`text-[10px] px-2.5 py-1 rounded-full border font-medium ${styles[status] || styles.not_indexed}`}>
        {labels[status] || "Not Indexed"}
      </span>
    );
  };

  const selectedRepoData = indexedRepos.find(
    (r) => String(r.githubRepoId) === selectedRepo
  );
  const canGenerate = Boolean(selectedRepoData);
  const hasEmptyState = indexedRepos.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 flex flex-col ${isDarkMode ? "bg-black text-white" : "bg-white text-slate-900"}`}
    >
      {/* Header */}
      <div className={`flex items-center justify-between border-b px-6 py-4 md:px-10 ${isDarkMode ? "border-neutral-800" : "border-slate-100"}`}>
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${isDarkMode ? "bg-blue-500/10" : "bg-blue-50"}`}>
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <h2 className={`text-lg font-semibold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>AI Writer</h2>
            <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Generate content from your repositories</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className={`flex h-10 w-10 items-center justify-center rounded-xl border transition-all hover:text-slate-900 ${isDarkMode ? "border-slate-700 text-slate-400 hover:border-slate-600 hover:bg-slate-800 hover:text-slate-100" : "border-slate-200 text-slate-500 hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900"}`}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        <AnimatePresence mode="wait">
          {hasEmptyState ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="flex flex-col items-center justify-center px-6 py-20 text-center"
            >
              <div className={`flex h-20 w-20 items-center justify-center rounded-3xl ${isDarkMode ? "bg-neutral-900" : "bg-slate-50"}`}>
                <Database className={`h-10 w-10 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} />
              </div>
              <h3 className={`mt-6 text-xl font-semibold ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>No indexed repositories</h3>
              <p className={`mt-2 max-w-md text-base ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                Index repositories from your dashboard to start generating AI-powered content
              </p>
            </motion.div>
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mx-auto max-w-3xl px-6 py-10 md:py-16"
            >
              {/* Repo Selector */}
              <div className="space-y-3">
                <label className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                  <FileText className={`h-4 w-4 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} />
                  Repository
                </label>
                <div className="relative">
                  <select
                    value={selectedRepo}
                    onChange={(e) => setSelectedRepo(e.target.value)}
                    className={`w-full appearance-none rounded-xl border px-4 py-3.5 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 cursor-pointer pr-12 ${isDarkMode ? "border-neutral-700 bg-neutral-900 text-white" : "border-slate-200 bg-white text-slate-900"}`}
                  >
                    <option value="">Select a repository...</option>
                    {indexedRepos.map((repo) => (
                      <option key={repo.githubRepoId} value={repo.githubRepoId}>
                        {repo.name}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
                    <svg className={`h-5 w-5 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </div>
                </div>

                {selectedRepoData && (
                  <div className="flex items-center gap-3">
                    {getStatusBadge(selectedRepoData.status ?? "not_indexed")}
                    <span className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>Ready for generation</span>
                  </div>
                )}
              </div>

              {/* Configuration Grid */}
              <div className="mt-8 grid gap-8 md:grid-cols-3">
                {/* Content Type */}
                <div className="space-y-3">
                  <label className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    <Sparkles className={`h-4 w-4 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} />
                    Content Type
                  </label>
                  <div className="space-y-2">
                    {CONTENT_TYPES.map((type) => {
                      const Icon = type.icon;
                      return (
                        <button
                          key={type.value}
                          onClick={() => setContentType(type.value)}
                          disabled={isGenerating}
                          className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                            contentType === type.value
                              ? isDarkMode
                                ? "border border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-sm"
                                : "border border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                              : isDarkMode
                                ? "border border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800"
                                : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                          } disabled:opacity-50`}
                        >
                          <Icon className="h-4 w-4" />
                          {type.label}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Audience */}
                <div className="space-y-3">
                  <label className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    <Users className={`h-4 w-4 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} />
                    Audience
                  </label>
                  <div className="space-y-2">
                    {AUDIENCES.map((aud) => (
                      <button
                        key={aud.value}
                        onClick={() => setAudience(aud.value)}
                        disabled={isGenerating}
                        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                          audience === aud.value
                            ? isDarkMode
                              ? "border border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-sm"
                              : "border border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                            : isDarkMode
                              ? "border border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800"
                              : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        } disabled:opacity-50`}
                      >
                        <span>{aud.label}</span>
                        <span className="text-xs text-slate-400">{aud.description}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tone */}
                <div className="space-y-3">
                  <label className={`flex items-center gap-2 text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                    <MessageSquare className={`h-4 w-4 ${isDarkMode ? "text-slate-500" : "text-slate-400"}`} />
                    Tone
                  </label>
                  <div className="space-y-2">
                    {TONES.map((t) => (
                      <button
                        key={t.value}
                        onClick={() => setTone(t.value)}
                        disabled={isGenerating}
                        className={`flex w-full items-center justify-between rounded-xl px-4 py-3 text-sm font-medium transition-all ${
                          tone === t.value
                            ? isDarkMode
                              ? "border border-blue-500/30 bg-blue-500/10 text-blue-400 shadow-sm"
                              : "border border-blue-200 bg-blue-50 text-blue-700 shadow-sm"
                            : isDarkMode
                              ? "border border-neutral-700 bg-neutral-900 text-neutral-300 hover:border-neutral-600 hover:bg-neutral-800"
                              : "border border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50"
                        } disabled:opacity-50`}
                      >
                        <span>{t.label}</span>
                        <span className="text-xs text-slate-400">{t.description}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Prompt */}
              <div className="mt-8 space-y-3">
                <label className={`text-sm font-medium ${isDarkMode ? "text-slate-300" : "text-slate-700"}`}>
                  What should I write about?
                </label>
                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  placeholder="Describe what you want to create. For example: 'Explain the authentication flow and how JWT tokens are implemented...'"
                  className={`w-full min-h-[140px] resize-none rounded-xl border px-4 py-3.5 text-base shadow-sm focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 ${isDarkMode ? "border-neutral-700 bg-neutral-900 text-white placeholder:text-neutral-500" : "border-slate-200 bg-white text-slate-900 placeholder:text-slate-400"}`}
                  disabled={isGenerating}
                />
                <p className={`text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                  Be specific for better results. Include key points you want covered.
                </p>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                  >
                    <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-red-500" />
                    <p className="text-sm leading-relaxed text-red-600">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generate Button */}
              <div className="mt-8">
                <button
                  onClick={handleGenerate}
                  disabled={!selectedRepo || !prompt.trim() || isGenerating || !canGenerate}
                  className="flex w-full items-center justify-center gap-3 rounded-xl bg-blue-600 px-8 py-4 text-base font-semibold text-white shadow-lg shadow-blue-600/20 transition-all hover:bg-blue-500 hover:shadow-xl hover:shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:shadow-none"
                >
                  {isGenerating ? (
                    <>
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Generating content...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-5 w-5" />
                      Generate Content
                    </>
                  )}
                </button>

                {!canGenerate && selectedRepo && (
                  <p className={`mt-3 text-center text-sm ${isDarkMode ? "text-slate-400" : "text-slate-500"}`}>
                    This repository needs to be indexed before generating content
                  </p>
                )}
              </div>

              {/* Generated Content */}
              <AnimatePresence>
                {generatedContent && (
                  <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -30 }}
                    className={`mt-10 overflow-hidden rounded-2xl border shadow-xl ${isDarkMode ? "border-neutral-700 bg-neutral-900" : "border-slate-200 bg-white"}`}
                  >
                    <div className={`flex items-center justify-between border-b px-6 py-4 ${isDarkMode ? "border-slate-700" : "border-slate-100"}`}>
                      <div className="flex items-center gap-2">
                        <Check className="h-5 w-5 text-emerald-500" />
                        <span className={`font-medium ${isDarkMode ? "text-slate-100" : "text-slate-900"}`}>Generated Content</span>
                      </div>
                      <button
                        onClick={handleCopy}
                        className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm transition-colors ${isDarkMode ? "border-neutral-700 text-neutral-400 hover:bg-neutral-800 hover:text-white" : "border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                        title="Copy to clipboard"
                      >
                        {copied ? (
                          <>
                            <Check className="h-4 w-4 text-emerald-500" />
                            Copied
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy
                          </>
                        )}
                      </button>
                    </div>
                    <div
                      ref={contentRef}
                      className={`max-h-[60vh] overflow-y-auto p-6 text-base leading-relaxed ${isDarkMode ? "bg-black text-neutral-300" : "bg-slate-50/50 text-slate-800"}`}
                    >
                      {generatedContent.split("\n").map((line, i) => (
                        <p key={i} className="mb-3 last:mb-0">
                          {line}
                        </p>
                      ))}
                    </div>
                    <div className={`border-t px-6 py-4 ${isDarkMode ? "border-slate-700" : "border-slate-100"}`}>
                      <button
                        onClick={() => onInsert(generatedContent)}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3.5 text-sm font-semibold text-white transition-all hover:bg-blue-500 active:scale-[0.98]"
                      >
                        <Send className="h-4 w-4" />
                        Insert to Editor
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
