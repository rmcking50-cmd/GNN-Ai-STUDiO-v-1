import React from 'react';
import { Zap, Link2, TrendingUp } from 'lucide-react';

export interface KnowledgeNodeData {
  id: string;
  title: string;
  description?: string;
  connectionsCount: number;
  confidenceScore: number; // 0-100
  category?: string;
  lastUpdated?: string;
  x?: number;
  y?: number;
}

interface KnowledgeNodeProps {
  node: KnowledgeNodeData;
  isSelected?: boolean;
  onClick?: (node: KnowledgeNodeData) => void;
  onConnect?: (nodeId: string) => void;
  compact?: boolean;
}

export default function KnowledgeNode({
  node,
  isSelected = false,
  onClick,
  onConnect,
  compact = false,
}: KnowledgeNodeProps) {
  const confidenceColor =
    node.confidenceScore >= 80
      ? 'from-emerald-500 to-green-600'
      : node.confidenceScore >= 60
        ? 'from-amber-500 to-orange-600'
        : 'from-rose-500 to-red-600';

  const handleClick = () => {
    if (onClick) {
      onClick(node);
    }
  };

  if (compact) {
    return (
      <div
        onClick={handleClick}
        className={`
          group relative p-3 rounded-lg border transition-all cursor-pointer
          ${
            isSelected
              ? 'bg-slate-800 border-blue-500 shadow-lg shadow-blue-500/20'
              : 'bg-slate-900 border-slate-800 hover:border-slate-700 hover:shadow-md'
          }
        `}
      >
        <div className="space-y-1.5">
          <div className="flex items-start justify-between gap-2">
            <h4 className="text-xs font-bold text-slate-200 line-clamp-1">
              {node.title}
            </h4>
            <div
              className={`
                w-1.5 h-1.5 rounded-full shrink-0 animate-pulse
                ${
                  node.confidenceScore >= 80
                    ? 'bg-emerald-500'
                    : node.confidenceScore >= 60
                      ? 'bg-amber-500'
                      : 'bg-rose-500'
                }
              `}
            />
          </div>

          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 flex items-center gap-1">
              <Link2 className="w-2.5 h-2.5" />
              {node.connectionsCount}
            </span>
            <span className="text-slate-500 font-mono">
              {node.confidenceScore}%
            </span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      onClick={handleClick}
      className={`
        group relative rounded-2xl border transition-all cursor-pointer overflow-hidden
        shadow-lg backdrop-blur-sm
        ${
          isSelected
            ? 'bg-slate-800/95 border-blue-500/60 shadow-2xl shadow-blue-500/30'
            : 'bg-slate-900/80 border-slate-800/60 hover:bg-slate-900/95 hover:border-slate-700/60 hover:shadow-xl'
        }
      `}
    >
      {/* Material3-style top accent */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500/60 via-purple-500/40 to-transparent" />

      <div className="p-5 space-y-4">
        {/* Header: Title + Category */}
        <div className="space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-bold text-white font-sans leading-tight">
                {node.title}
              </h3>
              {node.category && (
                <p className="text-[10px] text-slate-400 font-mono uppercase tracking-wider mt-1">
                  {node.category}
                </p>
              )}
            </div>
            <Zap className="w-5 h-5 text-amber-400 shrink-0 animate-pulse" />
          </div>

          {node.description && (
            <p className="text-xs text-slate-400 line-clamp-2">
              {node.description}
            </p>
          )}
        </div>

        {/* Confidence Score Bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-[10px]">
            <span className="text-slate-400 font-sans uppercase tracking-wider">
              Confidence
            </span>
            <span className="font-bold text-slate-300">{node.confidenceScore}%</span>
          </div>
          <div className="w-full h-2 bg-slate-950/60 rounded-full overflow-hidden border border-slate-800/50">
            <div
              className={`h-full bg-gradient-to-r ${confidenceColor} rounded-full transition-all`}
              style={{ width: `${node.confidenceScore}%` }}
            />
          </div>
        </div>

        {/* Connections + Timestamp */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/50">
          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-mono uppercase">
              Connections
            </p>
            <div className="flex items-center gap-1.5 text-sm font-bold text-slate-200">
              <Link2 className="w-4 h-4 text-blue-400" />
              <span>{node.connectionsCount}</span>
            </div>
          </div>

          <div className="space-y-1">
            <p className="text-[10px] text-slate-500 font-mono uppercase">Status</p>
            <div className="flex items-center gap-1.5">
              <div
                className={`w-2 h-2 rounded-full ${
                  node.confidenceScore >= 80
                    ? 'bg-emerald-500 animate-pulse'
                    : node.confidenceScore >= 60
                      ? 'bg-amber-500 animate-pulse'
                      : 'bg-rose-500 animate-pulse'
                }`}
              />
              <span className="text-xs font-mono text-slate-300">
                {node.confidenceScore >= 80
                  ? 'High'
                  : node.confidenceScore >= 60
                    ? 'Medium'
                    : 'Low'}
              </span>
            </div>
          </div>
        </div>

        {/* Footer: Last Updated + Action Button */}
        {node.lastUpdated && (
          <p className="text-[9px] text-slate-600 font-mono">
            Updated {node.lastUpdated}
          </p>
        )}

        {/* Connect Button */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            if (onConnect) {
              onConnect(node.id);
            }
          }}
          className={`
            w-full py-2.5 px-3 rounded-lg border text-xs font-bold transition-all
            flex items-center justify-center gap-2
            ${
              isSelected
                ? 'bg-blue-600/20 border-blue-500/60 text-blue-300 hover:bg-blue-600/30'
                : 'bg-slate-800/50 border-slate-700/50 text-slate-300 hover:bg-slate-800/70 hover:border-slate-600'
            }
          `}
        >
          <TrendingUp className="w-3.5 h-3.5" />
          Connect
        </button>
      </div>
    </div>
  );
}
