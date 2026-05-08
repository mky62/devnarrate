"use client";

import { Calendar } from "lucide-react";
import { useState } from "react";
import ProfileAvatar from "./ProfileAvatar";
import ProfileBanner from "./ProfileBanner";
import SocialLinks from "./SocialLinks";
import ProfileEditModal from "./ProfileEditModal";
import GitStats from "./GitStats";
import DeleteProfile from "./DeleteProfile";
import { useUser } from "@/hooks/useUser";
import type { GitStats as GitStatsData } from "@/lib/github-stats";

interface SocialLinksData {
  github?: string;
  twitter?: string;
  linkedin?: string;
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
      <div className="h-full rounded-xl flex flex-col overflow-hidden border-white/20 border min-h-0">
        <div className="relative w-full h-28 animate-pulse bg-white/10" />
        <div className="flex-1 p-4 space-y-3">
          <div className="h-4 bg-white/10 rounded animate-pulse w-3/4" />
          <div className="h-3 bg-white/10 rounded animate-pulse w-1/2" />
          <div className="h-3 bg-white/10 rounded animate-pulse w-2/3" />
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
    <div className="h-full rounded-xl flex flex-col overflow-hidden min-h-0">
      <ProfileBanner userId={resolvedUser.id} onEdit={() => setIsEditing(true)} />
      <ProfileAvatar image={resolvedUser.image} displayName={displayName} />

      <div className="flex-1 p-4 pt-3 space-y-3 min-h-0 overflow-y-auto dashboard-scroll">
        <div>
          <h2 className="font-bold text-white text-lg leading-tight truncate">
            {displayName || "Anonymous"}
          </h2>
          {resolvedUser.stageName && resolvedUser.name !== resolvedUser.stageName && (
            <p className="text-sm text-white/60">{resolvedUser.name}</p>
          )}
        </div>

        {resolvedUser.description && (
          <p className="text-sm text-white/70 break-words whitespace-pre-wrap">
            {resolvedUser.description}
          </p>
        )}

        <div className="flex flex-wrap gap-2 text-xs text-white/50">
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

      <div className="mt-4 pt-4 border-t border-white/20">
        <DeleteProfile />
      </div>

      <ProfileEditModal
        key={isEditing ? "open" : "closed"}
        user={resolvedUser}
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
      />
    </div>
  );
}
