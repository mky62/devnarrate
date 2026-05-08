"use client";

import { TrendingUp, Eye, Heart } from "lucide-react";

interface TopStory {
  id: string;
  title: string;
  views: number;
  likes: number;
  author: string;
}

const mockStories: TopStory[] = [
  { id: "1", title: "Building a real-time collaboration tool", views: 1250, likes: 89, author: "Alex Chen" },
  { id: "2", title: "How I built my SaaS in 30 days", views: 980, likes: 67, author: "Sarah Miller" },
  { id: "3", title: "The secret to scalable architecture", views: 756, likes: 45, author: "Mike Johnson" },
];

export default function TopStories() {
  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center gap-2 mb-4">
        <TrendingUp size={16} className="text-white/60" />
        <h3 className="text-sm font-semibold text-white">Trending Stories</h3>
      </div>
      
      <div className="flex-1 overflow-y-auto space-y-3 dashboard-scroll">
        {mockStories.map((story, index) => (
          <div 
            key={story.id}
            className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
          >
            <div className="flex items-start gap-3">
              <span className="text-xs font-bold text-white/40 w-4">{index + 1}</span>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm text-white/90 font-medium line-clamp-2">
                  {story.title}
                </h4>
                <p className="text-xs text-white/50 mt-1">{story.author}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <Eye size={12} />
                    {story.views}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart size={12} />
                    {story.likes}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}