"use client";

import Image from "next/image";
import { User } from "lucide-react";

interface ProfileAvatarProps {
  image?: string | null;
  displayName: string | null;
}

export default function ProfileAvatar({ image, displayName }: ProfileAvatarProps) {
  return (
    <div className="relative px-4 -mt-8 shrink-0">
      <div className="w-16 h-16 rounded-xl border-4 border-white/10 bg-white/5 shadow-md overflow-hidden">
        {image ? (
          <Image
            src={image}
            alt={displayName || "Avatar"}
            width={64}
            height={64}
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full bg-white/5 flex items-center justify-center">
            <User size={28} className="text-white/40" />
          </div>
        )}
      </div>
    </div>
  );
}
