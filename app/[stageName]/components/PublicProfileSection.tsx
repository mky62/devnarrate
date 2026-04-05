"use client";

import Image from "next/image";
import { Calendar, Globe } from "lucide-react";
import Link from "next/link";
import { FaGithub, FaLinkedin, FaTwitter } from "react-icons/fa6";
import { useEffect, useState } from "react";
import PublicGitStats from "./PublicGitStats";

interface SocialLinks {
  github?: string;
  twitter?: string;
  linkedin?: string;
  website?: string;
}

interface PublicUser {
  id: string;
  name: string | null;
  image: string | null;
  createdAt: string;
  stageName: string | null;
  description: string | null;
  socialLinks: SocialLinks | null;
}

interface PublicProfileSectionProps {
  stageName: string;
}

export default function PublicProfileSection({ stageName }: PublicProfileSectionProps) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch(`/api/user/${stageName}`);
        if (!response.ok) {
          const errorText = await response.text();
          console.error("Profile fetch error:", response.status, errorText);
          throw new Error("Failed to fetch user");
        }
        const data = await response.json();
        setUser(data);
      } catch (err) {
        console.error("Profile load error:", err);
        setError("Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [stageName]);

  if (loading) {
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

  if (error || !user) {
    return (
      <div className="h-full rounded-xl flex flex-col overflow-hidden border-blue-500 border-2 p-4">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
          <p className="text-gray-500 font-medium mb-2">Profile not found</p>
          <p className="text-gray-400 text-sm">
            This user hasn&apos;t set up their public profile yet.
            <br />
            A stage name is required.
          </p>
        </div>
      </div>
    );
  }

  const displayName = user.stageName || user.name;
  const socialLinks = user.socialLinks || ({} as SocialLinks);
  const joinedDate = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : null;

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
            <Link
              href={socialLinks.github}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <FaGithub size={18} />
            </Link>
          )}
          {socialLinks.twitter && (
            <Link
              href={socialLinks.twitter}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:text-blue-400 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <FaTwitter size={18} />
            </Link>
          )}
          {socialLinks.linkedin && (
            <Link
              href={socialLinks.linkedin}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-colors"
            >
              <FaLinkedin size={18} />
            </Link>
          )}
          {socialLinks.website && (
            <Link
              href={socialLinks.website}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 text-gray-600 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
            >
              <Globe size={18} />
            </Link>
          )}
        </div>
      </div>

      <PublicGitStats stageName={stageName} />
    </div>
  );
}
