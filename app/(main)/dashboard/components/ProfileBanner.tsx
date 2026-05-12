"use client";

import Image from "next/image";
import { Pencil } from "lucide-react";

interface ProfileBannerProps {
  userId: string;
  onEdit: () => void;
  image?: string;
}

export default function ProfileBanner({ userId, onEdit, image }: ProfileBannerProps) {
  return (
    <div className="relative w-full h-24">
      {image ? (
        <Image
          src={image}
          alt="Profile banner"
          fill
          className="object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-br from-white/10 to-white/5" />
      )}
      <button
        onClick={onEdit}
        className="absolute top-2 right-2 p-1.5 bg-white/10 hover:bg-white/20 rounded-lg shadow-sm text-white/70 hover:text-white/90 transition-all"
        title="Edit Profile"
      >
        <Pencil size={14} />
      </button>
    </div>
  );
}
