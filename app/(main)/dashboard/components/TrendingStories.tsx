"use client";

import { Eye, Heart, TrendingUp } from "lucide-react";

interface TrendingStory {
  id: string;
  title: string;
  author: string;
  views: number;
  likes: number;
}

const mockTrendingStories: TrendingStory[] = [
  {
    id: "1",
    title: "Building a real-time collaboration tool",
    author: "Alex Chen",
    views: 1250,
    likes: 89,
  },
  {
    id: "2",
    title: "How I built my SaaS in 30 days",
    author: "Sarah Miller",
    views: 980,
    likes: 67,
  },
  {
    id: "3",
    title: "The secret to scalable architecture",
    author: "Mike Johnson",
    views: 756,
    likes: 45,
  },
];

export default function TrendingStories() {
  return (
    <div className="border-white/10 border-2 h-full rounded-2xl flex flex-col overflow-hidden min-w-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <TrendingUp size={16} className="text-white/70" />
          <h2 className="font-semibold text-white/90 text-sm">Trending Stories</h2>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-3 space-y-2 min-h-0">
        {mockTrendingStories.map((story) => (
          <div
            key={story.id}
            className="p-2.5 bg-white/5 rounded-lg hover:bg-white/10 transition-colors cursor-pointer"
          >
            <h3 className="text-xs font-medium text-white/90 line-clamp-2 mb-1.5">
              {story.title}
            </h3>
            <p className="text-[10px] text-white/50 mb-1.5">by {story.author}</p>
            <div className="flex items-center gap-3 text-[9px] text-white/40">
              <span className="flex items-center gap-1">
                <Eye size={10} />
                {story.views}
              </span>
              <span className="flex items-center gap-1">
                <Heart size={10} />
                {story.likes}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
