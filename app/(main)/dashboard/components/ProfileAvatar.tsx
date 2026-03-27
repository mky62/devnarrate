"use client";

import Image from "next/image";

interface ProfileAvatarProps {
  image?: string | null;
  displayName: string | null;
}

export default function ProfileAvatar({ image, displayName }: ProfileAvatarProps) {
  return (
    <div className="relative px-4 -mt-10 shrink-0">
      <div className="w-20 h-20 rounded-xl border-4 border-white bg-white shadow-md overflow-hidden">
        {image ? (
          <Image
            src={image}
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
  );
}
