// "use client";

// import { useEffect, useMemo, useRef, useState } from "react";
// import { Sparkles, Loader2, AlertCircle, X, Send } from "lucide-react";
// import { useCachedRepos } from "@/hooks/useRepos";
// import type { Repo } from "@/lib/userdata";

// const CONTENT_TYPES = ["tutorial", "overview", "changelog-style", "implementation deep dive"] as const;
// const AUDIENCES = ["beginner", "intermediate", "advanced"] as const;
// const TONES = ["concise", "explanatory", "polished"] as const;
// const GENERATE_TIMEOUT_MS = 75000;

// type ContentType = (typeof CONTENT_TYPES)[number];
// type Audience = (typeof AUDIENCES)[number];
// type Tone = (typeof TONES)[number];
// type RepoStatus = NonNullable<Repo["status"]>;

// interface AIPanelProps {
//   onInsert: (content: string) => void;
//   onClose: () => void;
// }

// export default function AIPanel({ onInsert, onClose }: AIPanelProps) {
//   const { data: repos = [] } = useCachedRepos();
//   const [selectedRepo, setSelectedRepo] = useState<string>("");
//   const [prompt, setPrompt] = useState("");
//   const [contentType, setContentType] = useState<ContentType>("tutorial");
//   const [audience, setAudience] = useState<Audience>("intermediate");
//   const [tone, setTone] = useState<Tone>("explanatory");
//   const [isGenerating, setIsGenerating] = useState(false);
//   const [generatedContent, setGeneratedContent] = useState("");
//   const [error, setError] = useState<string | null>(null);
//   const contentRef = useRef<HTMLDivElement>(null);

//   const indexedRepos = useMemo(
//     () =>
//       repos.filter(
//         (repo) =>
//           repo.status === "completed" ||
//           repo.status === "failed_with_stale_index" ||
//           repo.status === "stale"
//       ),
//     [repos]
//   );

//   useEffect(() => {
//     if (
//       selectedRepo &&
//       !indexedRepos.some((repo) => String(repo.githubRepoId) === selectedRepo)
//     ) {
//       setSelectedRepo("");
//     }
//   }, [indexedRepos, selectedRepo]);

//   const readErrorMessage = async (res: Response, fallback: string) => {
//     const data = await res.json().catch(() => ({} as { error?: string }));
//     return data.error || fallback;
//   };

//   const handleGenerate = async () => {
//     if (!selectedRepo || !prompt.trim()) return;

//     setIsGenerating(true);
//     setGeneratedContent("");
//     setError(null);

//     const controller = new AbortController();
//     const timeout = window.setTimeout(() => {
//       controller.abort();
//     }, GENERATE_TIMEOUT_MS);

//     try {
//       const res = await fetch("/api/ai/generate", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         signal: controller.signal,
//         body: JSON.stringify({
//           repoId: selectedRepo,
//           prompt: prompt.trim(),
//           contentType,
//           audience,
//           tone,
//         }),
//       });

//       if (!res.ok) {
//         if (res.status === 425) {
//           throw new Error("Repo is still being indexed. Please try again in a moment.");
//         }
//         throw new Error(await readErrorMessage(res, "Failed to generate content"));
//       }

//       // Read the streaming response
//       const reader = res.body?.getReader();
//       if (!reader) throw new Error("No response body");

//       const decoder = new TextDecoder();
//       let content = "";

//       while (true) {
//         const { done, value } = await reader.read();
//         if (done) break;

//         const chunk = decoder.decode(value, { stream: true });
//         content += chunk;
//         setGeneratedContent(content);

//         // Auto-scroll to bottom
//         if (contentRef.current) {
//           contentRef.current.scrollTop = contentRef.current.scrollHeight;
//         }
//       }

//       // Flush remaining bytes
//       const finalChunk = decoder.decode();
//       if (finalChunk) {
//         content += finalChunk;
//         setGeneratedContent(content);
//         if (contentRef.current) {
//           contentRef.current.scrollTop = contentRef.current.scrollHeight;
//         }
//       }

//       if (!content.trim()) {
//         throw new Error("AI provider returned an empty response. Please try again.");
//       }
//     } catch (err) {
//       if (err instanceof DOMException && err.name === "AbortError") {
//         setError("Generation timed out. Please try again with a shorter prompt or a different repository.");
//         return;
//       }

//       setError(err instanceof Error ? err.message : "Generation failed");
//     } finally {
//       window.clearTimeout(timeout);
//       setIsGenerating(false);
//     }
//   };

//   const getStatusBadge = (status: RepoStatus) => {
//     switch (status) {
//       case "completed":
//         return (
//           <span className="text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">
//             Indexed
//           </span>
//         );
//       case "indexing":
//         return (
//           <span className="text-[10px] px-2 py-0.5 rounded-full bg-yellow-100 text-yellow-700">
//             Indexing...
//           </span>
//         );
//       case "pending":
//         return (
//           <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
//             Pending
//           </span>
//         );
//       case "failed":
//         return (
//           <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-100 text-red-700">
//             Failed
//           </span>
//         );
//       case "failed_with_stale_index":
//         return (
//           <span className="text-[10px] px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
//             Stale Index
//           </span>
//         );
//       default:
//         return (
//           <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 text-gray-600">
//             Not Indexed
//           </span>
//         );
//     }
//   };

//   const selectedRepoData = indexedRepos.find(
//     (r) => String(r.githubRepoId) === selectedRepo
//   );
//   const canGenerate = Boolean(selectedRepoData);

//   return (
//     <div className="w-80 flex-shrink-0 border-l border-gray-200 bg-gray-50/50 flex flex-col h-full">
//       {/* Header */}
//       <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between bg-white">
//         <div className="flex items-center gap-2">
//           <Sparkles className="w-4 h-4 text-blue-500" />
//           <h3 className="font-semibold text-sm text-gray-800">AI Writer</h3>
//         </div>
//         <button
//           onClick={onClose}
//           className="p-1 hover:bg-gray-100 rounded-md transition-colors"
//         >
//           <X className="w-4 h-4 text-gray-500" />
//         </button>
//       </div>

//       {/* Content */}
//       <div className="flex-1 overflow-y-auto p-4 space-y-4">
//         {/* Repo Selector */}
//         <div className="space-y-2">
//           <label className="text-xs font-medium text-gray-600">
//             Select Repository
//           </label>
//           <select
//             value={selectedRepo}
//             onChange={(e) => setSelectedRepo(e.target.value)}
//             className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//           >
//             <option value="">Choose a repo...</option>
//             {indexedRepos.map((repo) => (
//               <option key={repo.githubRepoId} value={repo.githubRepoId}>
//                 {repo.name}
//               </option>
//             ))}
//           </select>

//           {selectedRepoData && (
//             <div className="flex items-center justify-between">
//               {getStatusBadge(selectedRepoData.status ?? "not_indexed")}
//             </div>
//           )}
//         </div>

//         {/* Generation Options */}
//         <div className="grid grid-cols-1 gap-3">
//           <div className="space-y-2">
//             <label className="text-xs font-medium text-gray-600">
//               Content Type
//             </label>
//             <select
//               value={contentType}
//               onChange={(e) => setContentType(e.target.value as ContentType)}
//               className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//               disabled={isGenerating}
//             >
//               {CONTENT_TYPES.map((option) => (
//                 <option key={option} value={option}>
//                   {option}
//                 </option>
//               ))}
//             </select>
//           </div>

//           <div className="grid grid-cols-2 gap-3">
//             <div className="space-y-2">
//               <label className="text-xs font-medium text-gray-600">
//                 Audience
//               </label>
//               <select
//                 value={audience}
//                 onChange={(e) => setAudience(e.target.value as Audience)}
//                 className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                 disabled={isGenerating}
//               >
//                 {AUDIENCES.map((option) => (
//                   <option key={option} value={option}>
//                     {option}
//                   </option>
//                 ))}
//               </select>
//             </div>

//             <div className="space-y-2">
//               <label className="text-xs font-medium text-gray-600">
//                 Tone
//               </label>
//               <select
//                 value={tone}
//                 onChange={(e) => setTone(e.target.value as Tone)}
//                 className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
//                 disabled={isGenerating}
//               >
//                 {TONES.map((option) => (
//                   <option key={option} value={option}>
//                     {option}
//                   </option>
//                 ))}
//               </select>
//             </div>
//           </div>
//         </div>

//         {/* Prompt Input */}
//         <div className="space-y-2">
//           <label className="text-xs font-medium text-gray-600">
//             What do you want to write?
//           </label>
//           <textarea
//             value={prompt}
//             onChange={(e) => setPrompt(e.target.value)}
//             placeholder="e.g., Write a tutorial about the main API endpoints..."
//             className="w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white min-h-[100px] resize-none"
//             disabled={isGenerating}
//           />
//         </div>

//         {/* Error */}
//         {error && (
//           <div className="flex items-start gap-2 p-3 bg-red-50 rounded-lg">
//             <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0 mt-0.5" />
//             <p className="text-xs text-red-600">{error}</p>
//           </div>
//         )}

//         {/* Generate Button */}
//         <button
//           onClick={handleGenerate}
//           disabled={!selectedRepo || !prompt.trim() || isGenerating || !canGenerate}
//           className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
//         >
//           {isGenerating ? (
//             <>
//               <Loader2 className="w-4 h-4 animate-spin" />
//               Generating...
//             </>
//           ) : (
//             <>
//               <Send className="w-4 h-4" />
//               Generate
//             </>
//           )}
//         </button>

//         {indexedRepos.length === 0 && (
//           <p className="text-xs text-gray-500 text-center">
//             Indexed repositories will appear here after indexing from the dashboard.
//           </p>
//         )}

//         {!canGenerate && selectedRepo && (
//           <p className="text-xs text-gray-500 text-center">
//             Index this repository from the dashboard repository list before generating content.
//           </p>
//         )}

//         {/* Generated Content */}
//         {generatedContent && (
//           <div className="space-y-2">
//             <div className="flex items-center justify-between">
//               <label className="text-xs font-medium text-gray-600">
//                 Generated Content
//               </label>
//               <button
//                 onClick={() => onInsert(generatedContent)}
//                 className="text-xs px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600 transition-colors"
//               >
//                 Insert to Editor
//               </button>
//             </div>
//             <div
//               ref={contentRef}
//               className="p-3 bg-white border border-gray-200 rounded-lg max-h-64 overflow-y-auto text-sm prose prose-sm"
//             >
//               {generatedContent.split("\n").map((line, i) => (
//                 <p key={i} className="mb-1">
//                   {line}
//                 </p>
//               ))}
//             </div>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// }


"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  Sparkles,
  Loader2,
  AlertCircle,
  X,
  Send,
  FileText,
  MessageSquare,
  Code2,
  Check,
  Copy,
  Database,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

import { useRepos } from "@/hooks/useRepos";
import type { Repo } from "@/lib/userdata";

const CONTENT_TYPES = [
  { value: "tutorial", label: "Tutorial", icon: FileText },
  { value: "overview", label: "Overview", icon: Sparkles },
  { value: "changelog-style", label: "Changelog", icon: MessageSquare },
  { value: "implementation deep dive", label: "Deep Dive", icon: Code2 },
] as const;

const AUDIENCES = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
] as const;

const TONES = [
  { value: "concise", label: "Concise" },
  { value: "explanatory", label: "Explanatory" },
  { value: "polished", label: "Polished" },
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

async function readErrorMessage(res: Response, fallback: string) {
  try {
    const data = await res.json();
    return data?.error || fallback;
  } catch {
    return fallback;
  }
}

export default function AIPanel({
  onInsert,
  onClose,
  isDarkMode = false,
}: AIPanelProps) {
  const { data: repos = [] } = useRepos();

  const [selectedRepo, setSelectedRepo] = useState("");
  const [prompt, setPrompt] = useState("");
  const [contentType, setContentType] =
    useState<ContentTypeValue>("tutorial");
  const [audience, setAudience] =
    useState<AudienceValue>("intermediate");
  const [tone, setTone] = useState<ToneValue>("explanatory");

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const contentRef = useRef<HTMLDivElement>(null);
  const copyTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const indexedRepos = useMemo(() => {
    return repos.filter(
      (repo) =>
        repo.status === "completed" ||
        repo.status === "failed_with_stale_index" ||
        repo.status === "stale"
    );
  }, [repos]);

  useEffect(() => {
    if (!selectedRepo && indexedRepos.length > 0) {
      setSelectedRepo(String(indexedRepos[0].githubRepoId));
    }
  }, [indexedRepos, selectedRepo]);

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) clearTimeout(copyTimeoutRef.current);
    };
  }, []);

  const selectedRepoData = indexedRepos.find(
    (repo) => String(repo.githubRepoId) === selectedRepo
  );

  const hasEmptyState = indexedRepos.length === 0;

  async function handleGenerate() {
    if (!selectedRepo || !prompt.trim()) {
      return;
    }

    setIsGenerating(true);
    setGeneratedContent("");
    setError(null);

    const controller = new AbortController();
    const timeout = setTimeout(() => {
      controller.abort();
    }, GENERATE_TIMEOUT_MS);

    try {
      const res = await fetch("/api/ai/generate", {
        method: "POST",
        signal: controller.signal,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          repoId: selectedRepo,
          prompt,
          contentType,
          audience,
          tone,
        }),
      });

      if (!res.ok) {
        throw new Error(
          await readErrorMessage(res, "Failed to generate content")
        );
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let content = "";

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        content += decoder.decode(value, { stream: true });
        setGeneratedContent(content);

        if (contentRef.current) {
          contentRef.current.scrollTop =
            contentRef.current.scrollHeight;
        }
      }
    } catch (err) {
      console.error("Generate error:", err);
      if (err instanceof Error) {
        if (err.name === "AbortError") {
          setError("Generation timed out. Try a smaller prompt.");
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to generate content");
      }
    } finally {
      clearTimeout(timeout);
      setIsGenerating(false);
    }
  }

  async function handleCopy() {
    if (!generatedContent) return;

    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);

      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }

      copyTimeoutRef.current = setTimeout(() => {
        setCopied(false);
      }, 2000);
    } catch {
      console.error("Copy failed");
    }
  }

  function getStatusBadge(status: RepoStatus) {
    const labels: Record<string, string> = {
      completed: "Indexed",
      failed_with_stale_index: "Stale Index",
      stale: "Stale",
      not_indexed: "Not Indexed",
    };

    return (
      <span
        className={`rounded-full border px-2 py-1 text-[10px] font-medium ${
          isDarkMode
            ? "border-emerald-800 bg-emerald-900/30 text-emerald-400"
            : "border-emerald-200 bg-emerald-50 text-emerald-700"
        }`}
      >
        {labels[status] || "Indexed"}
      </span>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className={`fixed inset-0 z-50 ${
        isDarkMode ? "bg-black text-white" : "bg-white text-slate-900"
      }`}
    >
      {/* Header */}
      <div
        className={`flex items-center justify-between border-b px-6 py-4 ${
          isDarkMode ? "border-neutral-800" : "border-slate-100"
        }`}
      >
        <div className="flex items-center gap-3">
          <div
            className={`flex h-10 w-10 items-center justify-center rounded-xl ${
              isDarkMode ? "bg-blue-500/10" : "bg-blue-50"
            }`}
          >
            <Sparkles className="h-5 w-5 text-blue-600" />
          </div>

          <div>
            <h2 className="text-lg font-semibold">AI Writer</h2>
            <p
              className={`text-sm ${
                isDarkMode ? "text-slate-400" : "text-slate-500"
              }`}
            >
              Generate content from indexed repositories
            </p>
          </div>
        </div>

        <button
          onClick={onClose}
          className={`rounded-xl border p-2 ${
            isDarkMode
              ? "border-neutral-700 hover:bg-neutral-900"
              : "border-slate-200 hover:bg-slate-50"
          }`}
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {hasEmptyState ? (
        <div className="flex h-[calc(100vh-73px)] flex-col items-center justify-center px-6 text-center">
          <div
            className={`flex h-20 w-20 items-center justify-center rounded-3xl ${
              isDarkMode ? "bg-neutral-900" : "bg-slate-50"
            }`}
          >
            <Database className="h-10 w-10 text-slate-400" />
          </div>

          <h3 className="mt-6 text-xl font-semibold">
            No indexed repositories
          </h3>
          <p className="mt-2 max-w-md text-slate-500">
            Index something first. AI remains tragically bad at reading
            code it cannot see.
          </p>
        </div>
      ) : (
        <div className="grid h-[calc(100vh-73px)] grid-cols-1 lg:grid-cols-[420px_1fr]">
          {/* Left panel */}
          <div
            className={`overflow-y-auto border-r p-6 ${
              isDarkMode ? "border-neutral-800" : "border-slate-100"
            }`}
          >
            <div className="space-y-6">
              {/* Repo */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Repository</label>

                <select
                  value={selectedRepo}
                  onChange={(e) => setSelectedRepo(e.target.value)}
                  className={`w-full rounded-xl border px-4 py-3 ${
                    isDarkMode
                      ? "border-neutral-700 bg-neutral-900"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {indexedRepos.map((repo) => (
                    <option
                      key={repo.githubRepoId}
                      value={repo.githubRepoId}
                    >
                      {repo.name}
                    </option>
                  ))}
                </select>

                {selectedRepoData && (
                  <div className="flex items-center gap-2">
                    {getStatusBadge(
                      selectedRepoData.status ?? "completed"
                    )}
                  </div>
                )}
              </div>

              {/* Prompt */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Prompt</label>

                <textarea
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  disabled={isGenerating}
                  placeholder="Explain authentication flow, architecture, deployment..."
                  className={`min-h-[140px] w-full resize-none rounded-xl border px-4 py-3 ${
                    isDarkMode
                      ? "border-neutral-700 bg-neutral-900"
                      : "border-slate-200 bg-white"
                  }`}
                />
              </div>

              {/* Content Type */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Content Type</label>

                <select
                  value={contentType}
                  onChange={(e) =>
                    setContentType(e.target.value as ContentTypeValue)
                  }
                  className={`w-full rounded-xl border px-4 py-3 ${
                    isDarkMode
                      ? "border-neutral-700 bg-neutral-900"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {CONTENT_TYPES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Audience */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Audience</label>

                <select
                  value={audience}
                  onChange={(e) =>
                    setAudience(e.target.value as AudienceValue)
                  }
                  className={`w-full rounded-xl border px-4 py-3 ${
                    isDarkMode
                      ? "border-neutral-700 bg-neutral-900"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {AUDIENCES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Tone */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Tone</label>

                <select
                  value={tone}
                  onChange={(e) =>
                    setTone(e.target.value as ToneValue)
                  }
                  className={`w-full rounded-xl border px-4 py-3 ${
                    isDarkMode
                      ? "border-neutral-700 bg-neutral-900"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  {TONES.map((item) => (
                    <option key={item.value} value={item.value}>
                      {item.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4"
                  >
                    <AlertCircle className="mt-0.5 h-5 w-5 text-red-500" />
                    <p className="text-sm text-red-600">{error}</p>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Generate */}
              <button
                onClick={handleGenerate}
                disabled={
                  !selectedRepo || !prompt.trim() || isGenerating
                }
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4" />
                    Generate
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right panel */}
          <div className="flex h-full flex-col">
            <div
              className={`flex items-center justify-between border-b px-6 py-4 ${
                isDarkMode ? "border-neutral-800" : "border-slate-100"
              }`}
            >
              <div className="font-medium">Generated Output</div>

              {generatedContent && (
                <button
                  onClick={handleCopy}
                  className={`flex items-center gap-2 rounded-lg border px-3 py-1.5 text-sm ${
                    isDarkMode
                      ? "border-neutral-700"
                      : "border-slate-200"
                  }`}
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
              )}
            </div>

            <div
              ref={contentRef}
              className={`flex-1 overflow-y-auto p-6 leading-relaxed ${
                isDarkMode
                  ? "bg-neutral-950 text-neutral-300"
                  : "bg-slate-50"
              }`}
            >
              {generatedContent ? (
                generatedContent.split("\n").map((line, i) =>
                  line.trim() ? (
                    <p key={i} className="mb-3 last:mb-0">
                      {line}
                    </p>
                  ) : (
                    <div key={i} className="h-3" />
                  )
                )
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-slate-500">
                  Generated content will appear here.
                </div>
              )}
            </div>

            {generatedContent && (
              <div
                className={`border-t p-4 ${
                  isDarkMode ? "border-neutral-800" : "border-slate-100"
                }`}
              >
                <button
                  onClick={() => onInsert(generatedContent)}
                  className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white"
                >
                  <Send className="h-4 w-4" />
                  Insert to Editor
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </motion.div>
  );
}
