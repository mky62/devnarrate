"use client";

import Image from "next/image";
import { Pencil } from "lucide-react";

interface ProfileBannerProps {
  userId: string;
  onEdit: () => void;
}

export default function ProfileBanner({ userId, onEdit }: ProfileBannerProps) {
  return (
    <div className="relative w-full h-24 shrink-0 rounded-t-xl overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-[#1946BD] to-[#D5824A]" />
      <button
        onClick={onEdit}
        className="absolute top-2 right-2 p-2 bg-white/20 hover:bg-white/30 rounded-lg text-white/80 hover:text-white transition-all border border-white/20"
        title="Edit Profile"
      >
        <Pencil size={16} />
      </button>
    </div>
  );
}
