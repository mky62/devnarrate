"use client";

import Image from "next/image";
import { Calendar, Globe, Pencil, X, Loader2, RefreshCw } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { useUser } from "@/hooks/useUser";
import { useUpdateProfile } from "@/hooks/useUpdateProfile";
import { profileSchema } from "@/lib/profileValidation";
import { FaGithub, FaXTwitter, FaLinkedin } from "react-icons/fa6";
import FeedbackSection from "./FeedbackSection";
import { Button } from "@/components/ui/button";

type ProfileFormData = z.infer<typeof profileSchema>;

interface SocialLinks {
  github?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}

interface FormData {
  stageName: string;
  description: string;
  github: string;
  twitter: string;
  linkedin: string;
}

export default function ProfileSection() {
  // TanStack Query v5 hooks
  const { data: user, isLoading } = useUser();
  const updateProfile = useUpdateProfile();

  // Local UI state (not server data)
  const [isEditing, setIsEditing] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<keyof ProfileFormData, string>>>({});

  const [formData, setFormData] = useState<FormData>({
    stageName: "",
    description: "",
    github: "",
    twitter: "",
    linkedin: "",
  });

  if (isLoading || !user) {
    return (
      <div className="h-full rounded-xl flex flex-col overflow-hidden border-blue-500 border-2">
        <div className="relative w-full h-28 animate-pulse bg-gray-200" />
        <div className="flex-1 p-4 space-y-3">
          <div className="h-4 bg-gray-200 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-1/2" />
          <div className="h-3 bg-gray-200 rounded animate-pulse w-2/3" />
        </div>
      </div>
    );
  }

  const displayName = user.stageName || user.name;
  const socialLinks = user.socialLinks || ({} as SocialLinks);
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  const openEditModal = () => {
    setFormData({
      stageName: user.stageName || "",
      description: user.description || "",
      github: user.socialLinks?.github || "",
      twitter: user.socialLinks?.twitter || "",
      linkedin: user.socialLinks?.linkedin || "",
    });
    setFieldErrors({});
    setIsEditing(true);
  };

  const handleSave = () => {
    // Validate with Zod
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

    // Use TanStack Query mutation (v5: isPending instead of isLoading)
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
          setIsEditing(false);
        },
      }
    );
  };

  const generateAIFeedback = () => {
    const res = fetch("/api/feedback", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: user.id,
    });
    // This should call an API to generate feedback based on the user's content
  };

  return (
    <div className="h-full rounded-xl flex flex-col overflow-hidden border-blue-500 border-2">
      {/* Banner */}
      <div className="relative w-full h-28 shrink-0">
        <Image
          src={`https://picsum.photos/400/120?t=${Date.now()}`}
          alt="profile banner"
          fill
          className="object-cover opacity-80"
          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
          loading="eager"
          priority
        />
        {/* Edit Button */}
        <button
          onClick={openEditModal}
          className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm text-gray-600 hover:text-blue-600 transition-all"
          title="Edit Profile"
        >
          <Pencil size={16} />
        </button>
      </div>

      {/* Avatar - positioned to overlap banner */}
      <div className="relative px-4 -mt-10 shrink-0">
        <div className="w-20 h-20 rounded-xl border-4 border-white bg-white shadow-md overflow-hidden">
          {user.image ? (
            <Image
              src={user.image}
              alt={displayName || "Profile"}
              width={80}
              height={80}
              className="object-cover w-full h-full"
              unoptimized
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl font-bold">
              {displayName?.charAt(0).toUpperCase() || "U"}
            </div>
          )}
        </div>
      </div>

      {/* User Info */}
      <div className="flex-1 p-4 pt-3 space-y-3 min-h-0 overflow-y-auto">
        <div>
          <h2 className="font-bold text-gray-900 text-lg leading-tight truncate">
            {displayName || "Anonymous"}
          </h2>
          {user.stageName && user.name !== user.stageName && (
            <p className="text-sm text-gray-500">{user.name}</p>
          )}
        </div>

        {user.description && (
          <p className="text-sm text-gray-600 break-words whitespace-pre-wrap">
            {user.description}
          </p>
        )}

        {/* Meta Info */}
        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          {joinedDate && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              Joined {joinedDate}
            </span>
          )}
        </div>

        {/* Social Links */}
        <div className="flex gap-2 pt-1 flex-wrap">
          {socialLinks.github && (
            <a
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
              title="GitHub"
            >
              <FaGithub size={16} />
            </a>
          )}
          {socialLinks.twitter && (
            <a
              href={socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:text-blue-400 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
              title="Twitter"
            >
             <FaXTwitter size={16} />
            </a>
          )}
          {socialLinks.linkedin && (
            <a
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors text-sm font-medium"
              title="LinkedIn"
            >
             <FaLinkedin size={16} />
            </a>
          )}
          {socialLinks.website && (
            <a
              href={socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
              title="Website"
            >
              <Globe size={18} />
            </a>
          )}
          <Button
          className="flex items-center gap-2"
          onClick={generateAIFeedback}>
            <RefreshCw size={16} />
            AI Feedback
          </Button>
        </div>
        <FeedbackSection />
      </div>

      {/* Edit Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
            {/* Modal Header */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between shrink-0">
              <h3 className="font-semibold text-gray-800">Edit Profile</h3>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1 hover:bg-gray-100 rounded-md transition-colors"
                disabled={updateProfile.isPending}
              >
                <X size={18} className="text-gray-500" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 space-y-4 overflow-y-auto">
              {/* Error from mutation */}
              {updateProfile.isError && (
                <div className="p-3 bg-red-50 text-red-600 text-sm rounded-lg">
                  {updateProfile.error?.message || "Failed to save"}
                </div>
              )}

              {/* Stage Name */}
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

              {/* Description */}
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

              {/* Social Links */}
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

            {/* Modal Footer */}
            <div className="p-2 border-t border-gray-200 flex justify-end gap-2 shrink-0">
              <button
                onClick={handleSave}
                disabled={updateProfile.isPending}
                className="p-2 max-h-6 text-sm bg-blue-500 text-white hover:bg-blue-600 rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                  </>
                ) : (
                  "→"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
