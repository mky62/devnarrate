"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Trash2, AlertTriangle, X, Loader2 } from "lucide-react"
import { signOut } from "@/lib/auth-client"

export default function DeleteProfile() {
  const [isConfirming, setIsConfirming] = useState(false)
  const [confirmText, setConfirmText] = useState("")
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleDelete = async () => {
    if (confirmText !== "DELETE") {
      setError("Please type DELETE to confirm")
      return
    }

    setIsDeleting(true)
    setError(null)

    try {
      const response = await fetch("/api/user/delete", {
        method: "DELETE",
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to delete account")
      }

      // Sign out to clear client-side session
      await signOut()

      // Redirect to home page after successful deletion
      router.push("/")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete account")
      setIsDeleting(false)
    }
  }

  const closeModal = () => {
    setIsConfirming(false)
    setConfirmText("")
    setError(null)
  }

  return (
    <div className="border-white/10 border-2 rounded-xl bg-white/5">
      <button
        onClick={() => setIsConfirming(true)}
        className="w-full px-4 py-2 text-xs font-medium text-white/70 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg transition-colors"
      >
        Delete Profile
      </button>

      {/* Confirmation Modal */}
      {isConfirming && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white/10 backdrop-blur-xl rounded-xl shadow-xl w-full max-w-md border border-white/10">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle size={18} className="text-red-400" />
                <h3 className="font-semibold text-white/90">Delete Profile</h3>
              </div>
              <button
                onClick={() => setIsConfirming(false)}
                className="p-1 hover:bg-white/10 rounded-md transition-colors"
              >
                <X size={16} className="text-white/70" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              <p className="text-xs text-white/70 mb-4">
                Are you sure you want to delete your profile? This action cannot be undone.
              </p>
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => setIsConfirming(false)}
                  className="px-4 py-2 text-xs font-medium text-white/70 bg-white/5 hover:bg-white/10 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-4 py-2 text-xs font-medium text-white/90 bg-red-500/20 hover:bg-red-500/30 border border-red-500/30 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isDeleting ? "Deleting..." : "Delete"}
                </button>
              </div>
              {error && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {error}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 py-3 border-t border-gray-200 flex justify-end gap-2">
              <button
                onClick={closeModal}
                disabled={isDeleting}
                className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={isDeleting || confirmText !== "DELETE"}
                className="px-4 py-2 text-sm bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={14} />
                    Delete Account
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