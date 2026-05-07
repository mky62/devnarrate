"use client";

import { X, Loader2, Save } from "lucide-react";
import { useState, useEffect } from "react";
import { z } from "zod";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { profileSchema } from "@/lib/profileValidation";

type ProfileFormData = z.infer<typeof profileSchema>;

interface SocialLinks {
  github?: string;
  twitter?: string;
  linkedin?: string;
}

interface User {
  stageName?: string | null;
  description?: string | null;
  socialLinks?: SocialLinks | null;
  contributionUrl?: string | null;
}

interface ProfileEditModalProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
}

interface FormData {
  stageName: string;
  description: string;
  github: string;
  twitter: string;
  linkedin: string;
  contributionUrl: string;
}

function getInitialFormData(user: User): FormData {
  return {
    stageName: user.stageName || "",
    description: user.description || "",
    github: user.socialLinks?.github || "",
    twitter: user.socialLinks?.twitter || "",
    linkedin: user.socialLinks?.linkedin || "",
    contributionUrl: user.contributionUrl || "",
  };
}

export default function ProfileEditModal({ user, isOpen, onClose }: ProfileEditModalProps) {
  const updateProfile = useUpdateProfile();
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [formData, setFormData] = useState<FormData>(() => getInitialFormData(user));

  useEffect(() => {
    if (!isOpen) return;

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isOpen, onClose]);

  const handleSave = () => {
    const result = profileSchema.safeParse(formData);

    if (!result.success) {
      const errors: Partial<Record<keyof ProfileFormData, string>> = {};
      result.error.issues.forEach((issue) => {
        const field = issue.path[0] as keyof ProfileFormData;
        errors[field] = issue.message;
      });
      setFieldErrors(errors);
      return;
    }

    updateProfile.mutate(
      {
        stageName: formData.stageName || null,
        description: formData.description || null,
        socialLinks: {
          github: formData.github || undefined,
          twitter: formData.twitter || undefined,
          linkedin: formData.linkedin || undefined,
        },
        contributionUrl: formData.contributionUrl || null,
      },
      {
        onSuccess: () => {
          onClose();
        },
      }
    );
  };

  if (!isOpen) return null;

  return (
    <div 
      role="dialog" 
      aria-modal="true"
      aria-labelledby="profile-edit-title"
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-[100]" 
      onClick={onClose}
    >
      <div 
        className="bg-gradient-to-br from-[#1946BD] to-[#D5824A] rounded-2xl shadow-2xl w-full max-w-md max-h-[85vh] flex flex-col border border-white/20 mx-4" 
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-4 py-3 border-b border-white/20 flex items-center justify-between shrink-0">
          <h3 id="profile-edit-title" className="font-semibold text-white">Edit Profile</h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors"
            disabled={updateProfile.isPending}
          >
            <X size={18} className="text-white/70" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          {updateProfile.isError && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 text-red-300 text-sm rounded-lg">
              {updateProfile.error?.message || "Failed to save"}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-white/90 mb-1.5">
              Stage Name{" "}
              <span className="text-white/50 text-xs">(unique identifier)</span>
            </label>
            <input
              type="text"
              value={formData.stageName}
              onChange={(e) =>
                setFormData({ ...formData, stageName: e.target.value })
              }
              placeholder="e.g., johndoe"
              className={`w-full px-3 py-2.5 text-sm bg-white/10 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent ${
                fieldErrors.stageName ? "border-red-500/50" : "border-white/20"
              }`}
            />
            {fieldErrors.stageName && (
              <p className="mt-1 text-xs text-red-400">
                {fieldErrors.stageName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-white/90 mb-1.5">
              Bio{" "}
              {formData.description && (
                <span
                  className={`text-xs ${
                    formData.description.length > 500
                      ? "text-red-400"
                      : "text-white/50"
                  }`}
                >
                  ({formData.description.length}/500)
                </span>
              )}
            </label>
            <textarea
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder="Tell us about yourself..."
              rows={3}
              className={`w-full px-3 py-2.5 text-sm bg-white/10 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent resize-none ${
                fieldErrors.description ? "border-red-500/50" : "border-white/20"
              }`}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-xs text-red-400">
                {fieldErrors.description}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-white/70">Social Links</p>

            <div>
              <label className="block text-xs text-white/60 mb-1.5">
                GitHub URL
              </label>
              <input
                type="url"
                value={formData.github}
                onChange={(e) =>
                  setFormData({ ...formData, github: e.target.value })
                }
                placeholder="https://github.com/username"
                className={`w-full px-3 py-2.5 text-sm bg-white/10 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent ${
                  fieldErrors.github ? "border-red-500/50" : "border-white/20"
                }`}
              />
              {fieldErrors.github && (
                <p className="mt-1 text-xs text-red-400">
                  {fieldErrors.github}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1.5">
                Twitter/X URL
              </label>
              <input
                type="url"
                value={formData.twitter}
                onChange={(e) =>
                  setFormData({ ...formData, twitter: e.target.value })
                }
                placeholder="https://twitter.com/username"
                className={`w-full px-3 py-2.5 text-sm bg-white/10 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent ${
                  fieldErrors.twitter ? "border-red-500/50" : "border-white/20"
                }`}
              />
              {fieldErrors.twitter && (
                <p className="mt-1 text-xs text-red-400">
                  {fieldErrors.twitter}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1.5">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) =>
                  setFormData({ ...formData, linkedin: e.target.value })
                }
                placeholder="https://linkedin.com/in/username"
                className={`w-full px-3 py-2.5 text-sm bg-white/10 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent ${
                  fieldErrors.linkedin ? "border-red-500/50" : "border-white/20"
                }`}
              />
              {fieldErrors.linkedin && (
                <p className="mt-1 text-xs text-red-400">
                  {fieldErrors.linkedin}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-white/60 mb-1.5">
                Support URL
              </label>
              <input
                type="url"
                value={formData.contributionUrl}
                onChange={(e) =>
                  setFormData({ ...formData, contributionUrl: e.target.value })
                }
                placeholder="https://www.buymeacoffee.com/username"
                className={`w-full px-3 py-2.5 text-sm bg-white/10 border rounded-lg text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent ${
                  fieldErrors.contributionUrl ? "border-red-500/50" : "border-white/20"
                }`}
              />
              {fieldErrors.contributionUrl && (
                <p className="mt-1 text-xs text-red-400">
                  {fieldErrors.contributionUrl}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-3 border-t border-white/20 flex justify-end gap-2 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={updateProfile.isPending}
            className="px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="px-4 py-2 text-sm bg-white/20 text-white hover:bg-white/30 border border-white/20 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {updateProfile.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save
          </button>
        </div>
      </div>
    </div>
  );
}