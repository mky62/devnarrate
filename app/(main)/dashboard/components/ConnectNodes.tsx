"use client";

import { Plus, FileText, Link2, BookOpen, Brain } from "lucide-react";

interface KnowledgeNode {
  id: string;
  title: string;
  type: "document" | "link" | "note";
  indexed: boolean;
}

interface ConnectNodesProps {
  knowledgeNodes?: KnowledgeNode[];
}

export default function ConnectNodes({ knowledgeNodes = [] }: ConnectNodesProps) {
  const hasNodes = knowledgeNodes.length > 0;
  const indexedCount = knowledgeNodes.filter(n => n.indexed).length;

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Brain size={16} className="text-white/60" />
          <h3 className="text-sm font-semibold text-white">Knowledge Base</h3>
        </div>
        <button type="button" className="py-2 px-3 rounded-lg bg-white/10 border border-white/20 text-white text-xs font-medium hover:bg-white/20 transition-all flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed" disabled>
          <Plus size={14} />
          Add
        </button>
      </div>

      {hasNodes && (
        <div className="flex items-center gap-2 mb-4 text-xs text-white/50">
          <span>{indexedCount} indexed</span>
          <span>•</span>
          <span>{knowledgeNodes.length - indexedCount} pending</span>
        </div>
      )}

      {hasNodes ? (
        <div className="flex-1 space-y-3 overflow-y-auto dashboard-scroll">
          {knowledgeNodes.map((node) => (
            <div 
              key={node.id}
              className="p-3 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    {node.type === "document" && <FileText size={16} className="text-white/70" />}
                    {node.type === "link" && <Link2 size={16} className="text-white/70" />}
                    {node.type === "note" && <BookOpen size={16} className="text-white/70" />}
                  </div>
                  <h4 className="text-sm text-white/90 font-medium truncate">{node.title}</h4>
                </div>
                <div 
                  className={`w-2 h-2 rounded-full ${node.indexed ? 'bg-green-400' : 'bg-yellow-400'}`}
                  aria-label={node.indexed ? 'Indexed' : 'Pending'}
                  title={node.indexed ? 'Indexed' : 'Pending'}
                />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <div className="w-12 h-12 rounded-xl bg-white/10 flex items-center justify-center mx-auto mb-2">
              <Brain size={20} className="text-white/40" />
            </div>
            <p className="text-xs text-white/50">No knowledge added</p>
          </div>
        </div>
      )}
    </div>
  );
}