"use client";

import { Plus, BookOpen } from "lucide-react";

export default function KnowledgeBase() {
  return (
    <div className="border-white/10 border-2 h-full rounded-2xl flex flex-col overflow-hidden min-w-0">
      {/* Header */}
      <div className="px-4 py-3 border-b border-white/10 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-2">
          <h2 className="font-semibold text-white/90 text-sm">Knowledge Base</h2>
        </div>
        <button
          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium rounded-lg bg-white/10 text-white/90 hover:bg-white/20 transition-colors duration-200"
        >
          <Plus size={12} />
          Add
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 min-h-0">
        <div className="flex flex-col items-center justify-center h-full text-center py-8">
          <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center mb-3">
            <BookOpen size={20} className="text-white/40" />
          </div>
          <p className="text-xs font-medium text-white/50">No knowledge added</p>
        </div>
      </div>
    </div>
  );
}
