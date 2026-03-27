"use client";

import { X, Loader2 } from "lucide-react";
import { useState } from "react";
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
}

function getInitialFormData(user: User): FormData {
  return {
    stageName: user.stageName || "",
    description: user.description || "",
    github: user.socialLinks?.github || "",
    twitter: user.socialLinks?.twitter || "",
    linkedin: user.socialLinks?.linkedin || "",
  };
}

export default function ProfileEditModal({ user, isOpen, onClose }: ProfileEditModalProps) {
  const updateProfile = useUpdateProfile();
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});
  const [formData, setFormData] = useState<FormData>(() => getInitialFormData(user));

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
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between shrink-0">
          <h3 className="font-semibold text-gray-800">Edit Profile</h3>
          <button
            onClick={onClose}
            className="p-1 hover:bg-gray-100 rounded-md transition-colors"
            disabled={updateProfile.isPending}
          >
            <X size={18} className="text-gray-500" />
          </button>
        </div>

        <div className="p-4 space-y-4 overflow-y-auto">
          {updateProfile.isError && (
            <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
              {updateProfile.error?.message || "Failed to save"}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Stage Name{" "}
              <span className="text-gray-400">(unique identifier)</span>
            </label>
            <input
              type="text"
              value={formData.stageName}
              onChange={(e) =>
                setFormData({ ...formData, stageName: e.target.value })
              }
              placeholder="e.g., johndoe"
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                fieldErrors.stageName ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors.stageName && (
              <p className="mt-1 text-xs text-red-500">
                {fieldErrors.stageName}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bio{" "}
              {formData.description && (
                <span
                  className={`text-xs ${
                    formData.description.length > 500
                      ? "text-red-500"
                      : "text-gray-400"
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
              className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none ${
                fieldErrors.description ? "border-red-500" : "border-gray-300"
              }`}
            />
            {fieldErrors.description && (
              <p className="mt-1 text-xs text-red-500">
                {fieldErrors.description}
              </p>
            )}
          </div>

          <div className="space-y-3">
            <p className="text-sm font-medium text-gray-700">Social Links</p>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                GitHub URL
              </label>
              <input
                type="url"
                value={formData.github}
                onChange={(e) =>
                  setFormData({ ...formData, github: e.target.value })
                }
                placeholder="https://github.com/username"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  fieldErrors.github ? "border-red-500" : "border-gray-300"
                }`}
              />
              {fieldErrors.github && (
                <p className="mt-1 text-xs text-red-500">
                  {fieldErrors.github}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                Twitter/X URL
              </label>
              <input
                type="url"
                value={formData.twitter}
                onChange={(e) =>
                  setFormData({ ...formData, twitter: e.target.value })
                }
                placeholder="https://twitter.com/username"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  fieldErrors.twitter ? "border-red-500" : "border-gray-300"
                }`}
              />
              {fieldErrors.twitter && (
                <p className="mt-1 text-xs text-red-500">
                  {fieldErrors.twitter}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">
                LinkedIn URL
              </label>
              <input
                type="url"
                value={formData.linkedin}
                onChange={(e) =>
                  setFormData({ ...formData, linkedin: e.target.value })
                }
                placeholder="https://linkedin.com/in/username"
                className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                  fieldErrors.linkedin ? "border-red-500" : "border-gray-300"
                }`}
              />
              {fieldErrors.linkedin && (
                <p className="mt-1 text-xs text-red-500">
                  {fieldErrors.linkedin}
                </p>
              )}
            </div>
          </div>
        </div>

        <div className="p-2 border-t border-gray-200 flex justify-end gap-2 shrink-0">
          <button
            onClick={handleSave}
            disabled={updateProfile.isPending}
            className="p-2 max-h-6 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
          >
            {updateProfile.isPending ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              "→"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
