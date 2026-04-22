"use client"

import { useState } from "react"
import Link from "next/link"
import { FileText, Plus, ExternalLink, Clock, Heart, Loader2, Trash2, X, AlertTriangle, PencilLine } from "lucide-react"
import { useRouter } from "next/navigation"
import { formatDeletionDeadline } from "@/lib/post-moderation"
import { extractPlainTextFromTiptapJson } from "@/lib/tiptap-text"
import { usePosts } from "@/hooks/usePosts"
import { useDeletePost } from "@/hooks/useDeletePost"
import { Post } from "@/lib/userdata"

interface PostSectionProps {
    initialPosts?: Post[];
}

export default function PostSection({ initialPosts = [] }: PostSectionProps) {
    const router = useRouter()
    const { data: posts = [], isLoading, error } = usePosts(initialPosts)
    const deletePost = useDeletePost()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const handleDelete = async (id: string) => {
        setDeletingId(null)
        await deletePost.mutateAsync(id)
    }

    const getModerationBadge = (post: Post) => {
        switch (post.reviewStatus) {
            case "APPROVED":
                return "bg-emerald-50 text-emerald-700 border-emerald-200"
            case "FLAGGED":
                return "bg-rose-50 text-rose-700 border-rose-200"
            case "REVIEW_FAILED":
                return "bg-amber-50 text-amber-700 border-amber-200"
            default:
                return "bg-slate-100 text-slate-700 border-slate-200"
        }
    }

    const getModerationLabel = (post: Post) => {
        switch (post.reviewStatus) {
            case "APPROVED":
                return "Approved"
            case "FLAGGED":
                return "Flagged"
            case "REVIEW_FAILED":
                return "Review failed"
            default:
                return "Pending review"
        }
    }

    const formatDate = (dateStr: string) => {
        const d = new Date(dateStr)
        return d.toLocaleDateString("en-US", {
            month: "short",
            day: "numeric",
            year: "numeric",
        })
    }

    return (
        <div className="flex flex-col h-full rounded-xl overflow-hidden">
            {/* Header */}
            <div className="px-4 py-3 border-b border-blue-600 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-2">
                    <h2 className="font-semibold text-gray-800 text-sm">Posts</h2>
                    <span className="text-xs bg-blue-100 text-blue-600 font-medium px-2 py-0.5 rounded-full">
                        {posts.length}
                    </span>
                </div>
                <Link
                    href="/p/create"
                    className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-blue-500 text-white hover:bg-blue-600 transition-colors duration-200 shadow-sm shadow-blue-500/20"
                >
                    <Plus size={12} />
                    New Post
                </Link>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto">
                {isLoading ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3 p-8">
                        <Loader2 size={24} className="animate-spin opacity-40" />
                        <p className="text-sm">Loading posts…</p>
                    </div>
                ) : error ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3 p-8">
                        <p className="text-sm text-red-500">Failed to load posts</p>
                    </div>
                ) : posts.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full text-gray-400 gap-3 p-8">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
                            <FileText size={24} className="text-blue-300" />
                        </div>
                        <div className="text-center">
                            <p className="text-sm font-medium text-gray-500">No posts yet</p>
                            <p className="text-xs text-gray-400 mt-1">
                                Share your projects and ideas
                            </p>
                        </div>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
                        {posts.map((post: Post) => (
                            <Link
                                key={post.id}
                                href={`/p/${post.id}`}
                                className="group flex flex-col p-4 bg-white border border-gray-100 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all duration-200"
                            >
                                <div className="flex items-start gap-3 mb-3">
                                    <div className="shrink-0 w-7 h-7 rounded-xl bg-blue-50 flex items-center justify-center group-hover:scale-110 transition-transform">
                                        <FileText size={15} className="text-blue-600" />
                                    </div>

                                    <div className="flex-1 min-w-0">
                                        <h3 className="text-sm font-semibold text-gray-900 line-clamp-2 group-hover:text-blue-600 transition-colors">
                                            {post.title}
                                        </h3>
                                        <span className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold ${getModerationBadge(post)}`}>
                                            {getModerationLabel(post)}
                                        </span>
                                    </div>

                                    {/* Hover peek - only visible on hover, zero space when hidden */}
                                    <div className="opacity-0 group-hover:opacity-100 transition-opacity -mt-0.5">
                                        <ExternalLink size={14} className="text-blue-400" />
                                    </div>
                                </div>

                                {/* Excerpt - tight */}
                                <p className="text-xs text-gray-500 line-clamp-3 mb-4 flex-1">
                                    {extractPlainTextFromTiptapJson(post.content).slice(0, 200)}
                                </p>

                                {post.reviewStatus === "FLAGGED" && (
                                    <div className="mb-3 rounded-xl border border-rose-200 bg-rose-50 px-3 py-2 text-[11px] text-rose-700">
                                        <p className="font-semibold">Flagged content</p>
                                        <p className="mt-1 line-clamp-2">
                                            {post.latestFlaggedContent[0] || post.latestReviewSummary || "Unsafe content detected."}
                                        </p>
                                        {post.deletionScheduledFor && (
                                            <p className="mt-1 text-[10px] font-medium uppercase tracking-wide">
                                                Deletes {formatDeletionDeadline(post.deletionScheduledFor)}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Footer - minimal, only necessary info */}
                                <div className="flex items-center justify-between text-[10px] text-gray-400 border-t border-gray-100 pt-3">
                                    <div className="flex items-center gap-3">
                                        <span className="flex items-center gap-1">
                                            <Clock size={12} />
                                            {formatDate(post.createdAt)}
                                        </span>
                                        <span className="inline-flex items-center gap-1 rounded-full border border-gray-200 px-2 py-1 text-[10px] font-medium text-gray-500">
                                            <Heart size={11} />
                                            {post.likeCount}
                                        </span>
                                    </div>

                                    <div className="flex items-center gap-2">
                                        {post.projectLink && (
                                            <span className="text-blue-600 font-medium text-[10px] uppercase tracking-widest">
                                                Project
                                            </span>
                                        )}
                                        {post.reviewStatus !== "APPROVED" && (
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault()
                                                    e.stopPropagation()
                                                    router.push(`/p/${post.id}/edit`)
                                                }}
                                                className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-semibold text-blue-600 hover:bg-blue-50"
                                            >
                                                <PencilLine size={11} />
                                                Edit
                                            </button>
                                        )}
                                        <button
                                            onClick={(e) => {
                                                e.preventDefault()
                                                e.stopPropagation()
                                                setDeletingId(post.id)
                                            }}
                                            className="p-1 rounded-md hover:bg-red-50 transition-colors opacity-0 group-hover:opacity-100"
                                            title="Delete post"
                                        >
                                            <Trash2 size={12} className="text-red-400 hover:text-red-600" />
                                        </button>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            {/* Delete Confirmation Modal */}
            {deletingId && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-sm">
                        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <AlertTriangle size={18} className="text-red-500" />
                                <h3 className="font-semibold text-gray-800 text-sm">Delete Post</h3>
                            </div>
                            <button
                                onClick={() => setDeletingId(null)}
                                disabled={deletePost.isPending}
                                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                            >
                                <X size={16} className="text-gray-500" />
                            </button>
                        </div>
                        <div className="p-4">
                            <p className="text-sm text-gray-600">
                                Are you sure you want to delete this post? This action cannot be undone.
                            </p>
                        </div>
                        <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
                            <button
                                onClick={() => setDeletingId(null)}
                                disabled={deletePost.isPending}
                                className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deletingId)}
                                disabled={deletePost.isPending}
                                className="px-3 py-1.5 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
                            >
                                {deletePost.isPending ? (
                                    <>
                                        <Loader2 size={14} className="animate-spin" />
                                        Deleting…
                                    </>
                                ) : (
                                    <>
                                        <Trash2 size={14} />
                                        Delete
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
