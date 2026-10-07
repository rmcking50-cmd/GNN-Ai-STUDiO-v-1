import React, { useMemo, useState } from 'react';
import { 
  HardDrive, 
  Database, 
  FileVideo, 
  ImageIcon, 
  Volume2, 
  FileText, 
  Layers, 
  CheckCircle2, 
  AlertTriangle,
  Info,
  Server
} from 'lucide-react';
import { RepositoryAsset, AssetType } from '../types';

interface RepositoryStorageFooterProps {
  assets: RepositoryAsset[];
  quotaBytes?: number; // Defaults to 100 MB hypothetical studio limit
}

// Utility: parse size strings like "3.4 MB", "850 KB", "1.2 GB", "2048 B" into numeric bytes
export function parseSizeToBytes(sizeStr?: string): number {
  if (!sizeStr) return 0;
  const match = sizeStr.trim().match(/^([\d.]+)\s*([a-zA-Z]+)?$/);
  if (!match) return 0;
  const value = parseFloat(match[1]);
  if (isNaN(value)) return 0;
  const unit = (match[2] || 'B').toUpperCase();
  switch (unit) {
    case 'GB':
      return value * 1024 * 1024 * 1024;
    case 'MB':
      return value * 1024 * 1024;
    case 'KB':
      return value * 1024;
    case 'B':
    default:
      return value;
  }
}

// Utility: format numeric bytes to human-readable strings (e.g. "7.5 MB")
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes <= 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const dm = decimals < 0 ? 0 : decimals;
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export default function RepositoryStorageFooter({
  assets,
  quotaBytes = 100 * 1024 * 1024 // 100 MB default hypothetical studio cluster quota
}: RepositoryStorageFooterProps) {
  const [showDetails, setShowDetails] = useState(false);

  // Compute storage statistics
  const stats = useMemo(() => {
    let totalBytes = 0;
    const typeBreakdown: Record<AssetType, { bytes: number; count: number }> = {
      video: { bytes: 0, count: 0 },
      image: { bytes: 0, count: 0 },
      audio: { bytes: 0, count: 0 },
      script: { bytes: 0, count: 0 },
      subtitles: { bytes: 0, count: 0 },
    };

    for (const asset of assets) {
      const bytes = parseSizeToBytes(asset.size);
      totalBytes += bytes;
      if (typeBreakdown[asset.type]) {
        typeBreakdown[asset.type].bytes += bytes;
        typeBreakdown[asset.type].count += 1;
      }
    }

    const usedPercentage = quotaBytes > 0 
      ? Math.min(100, Math.round((totalBytes / quotaBytes) * 1000) / 10) 
      : 0;

    const remainingBytes = Math.max(0, quotaBytes - totalBytes);

    return {
      totalBytes,
      usedPercentage,
      remainingBytes,
      typeBreakdown,
      itemCount: assets.length
    };
  }, [assets, quotaBytes]);

  // Color dynamics based on quota threshold
  const statusConfig = useMemo(() => {
    if (stats.usedPercentage >= 90) {
      return {
        barColor: 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]',
        badgeColor: 'bg-red-500/15 text-red-300 border-red-500/40',
        textColor: 'text-red-400',
        label: 'Near Capacity',
        icon: AlertTriangle
      };
    }
    if (stats.usedPercentage >= 70) {
      return {
        barColor: 'bg-amber-500 shadow-[0_0_12px_rgba(245,158,11,0.6)]',
        badgeColor: 'bg-amber-500/15 text-amber-300 border-amber-500/40',
        textColor: 'text-amber-400',
        label: 'Moderate Usage',
        icon: AlertTriangle
      };
    }
    return {
      barColor: 'bg-emerald-500 shadow-[0_0_12px_rgba(16,185,129,0.5)]',
      badgeColor: 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40',
      textColor: 'text-emerald-400',
      label: 'Optimal Capacity',
      icon: CheckCircle2
    };
  }, [stats.usedPercentage]);

  const StatusIcon = statusConfig.icon;

  return (
    <footer 
      id="repository-storage-footer"
      aria-label="Repository Storage Usage"
      className="mt-6 p-4 sm:p-5 rounded-2xl bg-slate-900/90 border border-slate-800 shadow-xl backdrop-blur-sm text-slate-300 transition-all"
    >
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-slate-800 border border-slate-700/80 text-cyan-400 shrink-0">
            <HardDrive className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs sm:text-sm font-bold text-white tracking-tight">
                Repository Storage & Quota
              </span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                Edge CDN Tier ({formatBytes(quotaBytes, 0)})
              </span>
            </div>
            <p className="text-[11px] font-mono text-slate-400 mt-0.5">
              Current assets occupy <strong>{formatBytes(stats.totalBytes)}</strong> across {stats.itemCount} media file{stats.itemCount === 1 ? '' : 's'}.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className={`px-2.5 py-1 rounded-full text-[11px] font-mono font-bold border flex items-center gap-1.5 ${statusConfig.badgeColor}`}>
            <StatusIcon className="w-3.5 h-3.5" />
            <span>{statusConfig.label}</span>
          </div>

          <button
            type="button"
            id="storage-breakdown-toggle-btn"
            onClick={() => setShowDetails(prev => !prev)}
            className="px-2.5 py-1 text-[11px] font-mono rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/70 transition-colors flex items-center gap-1 cursor-pointer"
            title="Toggle media category breakdown"
          >
            <Info className="w-3.5 h-3.5 text-cyan-400" />
            <span>{showDetails ? 'Hide Breakdown' : 'View Breakdown'}</span>
          </button>
        </div>
      </div>

      {/* Progress Bar Section */}
      <div className="pt-3.5 space-y-2">
        <div className="flex justify-between items-baseline text-xs font-mono">
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Allocated Space:</span>
            <strong className="text-white font-semibold">
              {formatBytes(stats.totalBytes)}
            </strong>
            <span className="text-slate-500">/</span>
            <span className="text-slate-400">{formatBytes(quotaBytes, 0)} Limit</span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-slate-400">Available:</span>
            <strong className="text-emerald-400 font-semibold">
              {formatBytes(stats.remainingBytes)}
            </strong>
            <span className="px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px] font-bold">
              {stats.usedPercentage}%
            </span>
          </div>
        </div>

        {/* Outer Bar Track */}
        <div 
          role="progressbar"
          aria-valuenow={stats.usedPercentage}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label={`Storage usage: ${stats.usedPercentage}% of ${formatBytes(quotaBytes, 0)}`}
          className="relative w-full h-3 bg-slate-950 rounded-full border border-slate-800 overflow-hidden shadow-inner p-0.5"
        >
          {/* Main Progress Indicator */}
          <div 
            className={`h-full rounded-full transition-all duration-500 ease-out ${statusConfig.barColor}`}
            style={{ width: `${Math.max(1, Math.min(100, stats.usedPercentage))}%` }}
          />
        </div>
      </div>

      {/* Media Type Breakdown Details Panel */}
      {showDetails && (
        <div className="mt-4 pt-3 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-2.5 animate-fadeIn">
          {/* Video */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <FileVideo className="w-3.5 h-3.5 text-red-400" />
                <span>Video Assets</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {stats.typeBreakdown.video.count} files
              </span>
            </div>
            <div className="text-xs font-mono font-bold text-slate-200">
              {formatBytes(stats.typeBreakdown.video.bytes)}
            </div>
          </div>

          {/* Image */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <ImageIcon className="w-3.5 h-3.5 text-blue-400" />
                <span>Image Assets</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {stats.typeBreakdown.image.count} files
              </span>
            </div>
            <div className="text-xs font-mono font-bold text-slate-200">
              {formatBytes(stats.typeBreakdown.image.bytes)}
            </div>
          </div>

          {/* Audio */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Volume2 className="w-3.5 h-3.5 text-green-400" />
                <span>Audio Tracks</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {stats.typeBreakdown.audio.count} files
              </span>
            </div>
            <div className="text-xs font-mono font-bold text-slate-200">
              {formatBytes(stats.typeBreakdown.audio.bytes)}
            </div>
          </div>

          {/* Documents & Scripts */}
          <div className="p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 space-y-1">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <FileText className="w-3.5 h-3.5 text-cyan-400" />
                <span>Scripts & Subs</span>
              </span>
              <span className="text-[10px] font-mono text-slate-500">
                {stats.typeBreakdown.script.count + stats.typeBreakdown.subtitles.count} files
              </span>
            </div>
            <div className="text-xs font-mono font-bold text-slate-200">
              {formatBytes(stats.typeBreakdown.script.bytes + stats.typeBreakdown.subtitles.bytes)}
            </div>
          </div>
        </div>
      )}

      {/* Footer Info Legend */}
      <div className="mt-3 pt-2.5 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-2 text-[10px] font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <Server className="w-3 h-3 text-cyan-500" />
          <span>Distributed Object Storage Proxy &bull; Automatic GZIP & WebP Optimization</span>
        </div>
        <div>
          <span>Hypothetical Quota Limit: <strong>{formatBytes(quotaBytes, 0)}</strong></span>
        </div>
      </div>
    </footer>
  );
}
