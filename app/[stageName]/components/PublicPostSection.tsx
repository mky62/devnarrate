"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { FileText, ExternalLink, Clock, Loader2 } from "lucide-react";

interface Post {
  id: string;
  title: string;
  projectLink: string | null;
  content: string;
  createdAt: string;
}

interface PublicPostSectionProps {
  stageName: string;
}

export default function PublicPostSection({ stageName }: PublicPostSectionProps) {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/posts/public/${stageName}`)
      .then((res) => res.json())
      .then((data) => setPosts(data.posts ?? []))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [stageName]);

  const extractTextFromContent = (content: string): string => {
    try {
      const parsed = JSON.parse(content);
      if (!parsed?.content) return "";

      interface TiptapNode {
        type?: string;
        text?: string;
        content?: TiptapNode[];
      }
      const extractText = (nodes: TiptapNode[]): string => {
        return nodes
          .map((node) => {
            if (node.type === "text") return node.text || "";
            if (node.content) return extractText(node.content);
            return "";
          })
          .join(" ");
      };

      return extractText(parsed.content).slice(0, 200);
    } catch {
      return content.slice(0, 200);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="flex flex-col h-full rounded-xl overflow-hidden">
      {/* Header */}
      <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-gray-800 text-sm">Posts</h2>
          <span className="text-xs bg-blue-100 text-blue-600 font-medium px-2 py-0.5 rounded-full">
            {posts.length}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto">
        {loading ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3 p-8">
            <Loader2 size={24} className="animate-spin opacity-40" />
            <p className="text-sm">Loading posts…</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3 p-8">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
              <FileText size={24} className="text-blue-300" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-gray-500">No posts yet</p>
              <p className="text-xs text-gray-400 mt-1">
                This user hasn&apos;t shared any posts
              </p>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/p/${post.id}`}
                className="flex flex-col p-3 bg-white border border-gray-100 rounded-xl hover:border-blue-200 hover:shadow-md hover:shadow-blue-500/5 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute top-3 right-3 opacity-0 group-hover:opacity-100 transition-all duration-300 transform group-hover:translate-x-0 translate-x-1">
                  <div className="w-6 h-6 rounded-full bg-blue-50 flex items-center justify-center">
                    <ExternalLink size={10} className="text-blue-500" />
                  </div>
                </div>
                <div className="mb-2 shrink-0 w-8 h-8 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                  <FileText size={16} className="text-blue-500" />
                </div>
                <div className="flex-1 min-w-0 flex flex-col">
                  <h3 className="text-sm leading-snug font-semibold text-gray-900 line-clamp-1 group-hover:text-blue-600 transition-colors duration-200 mb-1">
                    {post.title}
                  </h3>
                  <p className="text-xs text-gray-500 line-clamp-2 mb-2 flex-1">
                    {extractTextFromContent(post.content)}
                  </p>
                  <div className="flex items-center gap-2 mt-auto pt-2 border-t border-gray-50">
                    <span className="inline-flex items-center gap-1 text-[10px] font-medium text-gray-400">
                      <Clock size={10} className="text-gray-300" />
                      {formatDate(post.createdAt)}
                    </span>
                    {post.projectLink && (
                      <span className="inline-flex items-center ml-auto px-1.5 py-0.5 text-[9px] font-bold tracking-wide uppercase text-blue-600 bg-blue-50 rounded">
                        Project
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
