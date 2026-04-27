"use client";

import { Calendar } from "lucide-react";
import { useState } from "react";
import ProfileAvatar from "./ProfileAvatar";
import ProfileBanner from "./ProfileBanner";
import SocialLinks from "./SocialLinks";
import ProfileEditModal from "./ProfileEditModal";
import GitStats from "./GitStats";
import { useUser } from "@/hooks/useUser";
import type { GitStats as GitStatsData } from "@/lib/github-stats";

interface SocialLinksData {
  github?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}

interface User {
  id: string;
  name: string;
  email?: string | null;
  image?: string | null;
  createdAt?: string | Date;
  stageName?: string | null;
  description?: string | null;
  socialLinks?: SocialLinksData | null;
  contributionUrl?: string | null;
}

interface ProfileSectionProps {
  user: User | null;
  initialGitStats?: GitStatsData | null;
}

export default function ProfileSection({ user, initialGitStats }: ProfileSectionProps) {
  const { data: currentUser } = useUser(user);
  const [isEditing, setIsEditing] = useState(false);

  const resolvedUser = currentUser ?? user;

  if (!resolvedUser) {
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

  const displayName = resolvedUser.stageName || resolvedUser.name;
  const socialLinks = resolvedUser.socialLinks || {};
  const joinedDate = resolvedUser.createdAt
    ? new Date(resolvedUser.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

  return (
    <div className="h-full rounded-xl flex flex-col overflow-hidden border-blue-500 border-2">
      <ProfileBanner userId={resolvedUser.id} onEdit={() => setIsEditing(true)} />
      <ProfileAvatar image={resolvedUser.image} displayName={displayName} />

      <div className="flex-1 p-4 pt-3 space-y-3 min-h-0 overflow-y-auto">
        <div>
          <h2 className="font-bold text-gray-900 text-lg leading-tight truncate">
            {displayName || "Anonymous"}
          </h2>
          {resolvedUser.stageName && resolvedUser.name !== resolvedUser.stageName && (
            <p className="text-sm text-gray-500">{resolvedUser.name}</p>
          )}
        </div>

        {resolvedUser.description && (
          <p className="text-sm text-gray-600 break-words whitespace-pre-wrap">
            {resolvedUser.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-gray-500">
          {joinedDate && (
            <span className="flex items-center gap-1">
              <Calendar size={12} />
              Joined {joinedDate}
            </span>
          )}
        </div>

        <SocialLinks links={socialLinks} />
      </div>

      <GitStats initialStats={initialGitStats} />

      <ProfileEditModal
        key={isEditing ? "open" : "closed"}
        user={resolvedUser}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
      />
    </div>
  );
}
