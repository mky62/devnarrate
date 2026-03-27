"use client";

import Image from "next/image";
import { Pencil } from "lucide-react";

interface ProfileBannerProps {
  userId: string;
  onEdit: () => void;
}

export default function ProfileBanner({ userId, onEdit }: ProfileBannerProps) {
  return (
    <div className="relative w-full h-28 shrink-0">
      <Image
        src={`https://picsum.photos/seed/${userId}/400/120`}
        alt="profile banner"
        fill
        className="object-cover opacity-80"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
        loading="eager"
        priority
      />
      <button
        onClick={onEdit}
        className="absolute top-2 right-2 p-2 bg-white/90 hover:bg-white rounded-lg shadow-sm text-gray-600 hover:text-blue-600 transition-all"
        title="Edit Profile"
      >
        <Pencil size={16} />
      </button>
    </div>
  );
}
