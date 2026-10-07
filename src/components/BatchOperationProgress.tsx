import React from 'react';
import { 
  Download, 
  Trash2, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  X, 
  FileVideo, 
  ImageIcon, 
  Volume2, 
  FileText, 
  Layers,
  StopCircle
} from 'lucide-react';

export interface BatchOperationState {
  type: 'download' | 'delete';
  current: number;
  total: number;
  currentAssetId?: string;
  currentAssetName?: string;
  currentAssetType?: string;
  currentAssetSize?: string;
  statusMessage: string;
  isComplete?: boolean;
  aborted?: boolean;
}

interface BatchOperationProgressProps {
  operation: BatchOperationState | null;
  onCancel?: () => void;
  onDismiss?: () => void;
}

export default function BatchOperationProgress({
  operation,
  onCancel,
  onDismiss
}: BatchOperationProgressProps) {
  if (!operation) return null;

  const isDownload = operation.type === 'download';
  const isDelete = operation.type === 'delete';
  const percent = operation.total > 0 
    ? Math.min(100, Math.round((operation.current / operation.total) * 100)) 
    : 0;

  const getMediaTypeIcon = (type?: string) => {
    switch (type) {
      case 'video':
        return <FileVideo className="w-4 h-4 text-red-400 shrink-0" />;
      case 'image':
        return <ImageIcon className="w-4 h-4 text-blue-400 shrink-0" />;
      case 'audio':
        return <Volume2 className="w-4 h-4 text-green-400 shrink-0" />;
      case 'script':
        return <FileText className="w-4 h-4 text-cyan-400 shrink-0" />;
      case 'subtitles':
        return <Layers className="w-4 h-4 text-yellow-400 shrink-0" />;
      default:
        return isDownload 
          ? <Download className="w-4 h-4 text-emerald-400 shrink-0" />
          : <Trash2 className="w-4 h-4 text-red-400 shrink-0" />;
    }
  };

  return (
    <div 
      id="asset-repository-batch-progress-bar"
      role="progressbar"
      aria-valuenow={percent}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-label={`Batch ${operation.type} in progress`}
      className={`rounded-2xl border p-4 transition-all duration-300 shadow-xl ${
        operation.isComplete
          ? 'bg-gradient-to-r from-emerald-950/50 via-slate-900 to-teal-950/40 border-emerald-500/40 shadow-emerald-950/20'
          : operation.aborted
          ? 'bg-gradient-to-r from-amber-950/50 via-slate-900 to-amber-950/40 border-amber-500/40 shadow-amber-950/20'
          : isDownload
          ? 'bg-gradient-to-r from-emerald-950/40 via-slate-900 to-teal-950/30 border-emerald-500/40 shadow-emerald-950/20'
          : 'bg-gradient-to-r from-red-950/40 via-slate-900 to-rose-950/30 border-red-500/40 shadow-red-950/20'
      }`}
    >
      {/* Top Header Row */}
      <div className="flex items-center justify-between gap-3 mb-2.5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-2 rounded-xl shrink-0 border ${
            operation.isComplete
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              : operation.aborted
              ? 'bg-amber-500/20 border-amber-500/40 text-amber-400'
              : isDownload
              ? 'bg-emerald-500/20 border-emerald-500/40 text-emerald-400'
              : 'bg-red-500/20 border-red-500/40 text-red-400'
          }`}>
            {operation.isComplete ? (
              <CheckCircle2 className="w-5 h-5 animate-bounce" />
            ) : operation.aborted ? (
              <AlertCircle className="w-5 h-5 text-amber-400" />
            ) : (
              <Loader2 className="w-5 h-5 animate-spin" />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="text-sm font-bold text-white font-sans tracking-wide">
                {operation.isComplete
                  ? `Batch ${isDownload ? 'Download' : 'Purge'} Complete`
                  : operation.aborted
                  ? `Batch ${isDownload ? 'Download' : 'Purge'} Aborted`
                  : `Batch ${isDownload ? 'Download' : 'Deletion'} in Progress`}
              </h4>

              <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold border ${
                operation.isComplete
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : operation.aborted
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                  : isDownload
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : 'bg-red-500/20 text-red-300 border-red-500/40'
              }`}>
                {operation.current} of {operation.total} Items • {percent}%
              </span>
            </div>

            <p className="text-xs text-slate-400 truncate mt-0.5">
              {operation.statusMessage}
            </p>
          </div>
        </div>

        {/* Action Buttons: Abort or Dismiss */}
        <div className="flex items-center gap-2 shrink-0">
          {!operation.isComplete && !operation.aborted && onCancel && (
            <button
              type="button"
              id="batch-progress-abort-btn"
              onClick={onCancel}
              className="px-2.5 py-1 rounded-lg text-xs font-semibold bg-slate-800/90 hover:bg-red-950/60 border border-slate-700 hover:border-red-500/50 text-slate-300 hover:text-red-300 flex items-center gap-1.5 transition-all cursor-pointer shadow-sm"
              title="Stop remaining batch operations"
            >
              <StopCircle className="w-3.5 h-3.5" />
              <span>Abort</span>
            </button>
          )}

          {(operation.isComplete || operation.aborted) && onDismiss && (
            <button
              type="button"
              id="batch-progress-dismiss-btn"
              onClick={onDismiss}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Dismiss status banner"
              aria-label="Dismiss status banner"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Visual Progress Bar */}
      <div className="w-full h-2 bg-slate-950/90 rounded-full border border-slate-800 overflow-hidden relative shadow-inner my-2">
        <div 
          className={`h-full rounded-full transition-all duration-300 ease-out relative ${
            operation.isComplete
              ? 'bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
              : operation.aborted
              ? 'bg-gradient-to-r from-amber-600 to-amber-400'
              : isDownload
              ? 'bg-gradient-to-r from-emerald-600 via-teal-500 to-emerald-400 shadow-[0_0_12px_rgba(16,185,129,0.4)]'
              : 'bg-gradient-to-r from-red-600 via-rose-500 to-red-400 shadow-[0_0_12px_rgba(239,68,68,0.4)]'
          }`}
          style={{ width: `${percent}%` }}
        >
          {/* Shimmer pulse highlight during active operations */}
          {!operation.isComplete && !operation.aborted && (
            <div className="absolute inset-0 bg-white/20 animate-pulse" />
          )}
        </div>
      </div>

      {/* Active Item Details Footer */}
      {operation.currentAssetName && (
        <div className="flex items-center justify-between gap-3 text-xs pt-1 text-slate-400 font-sans border-t border-slate-800/60 mt-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-500 shrink-0">
              Active Target:
            </span>
            <div className="flex items-center gap-1.5 min-w-0">
              {getMediaTypeIcon(operation.currentAssetType)}
              <span className="font-semibold text-slate-200 truncate max-w-[200px] sm:max-w-xs md:max-w-md" title={operation.currentAssetName}>
                {operation.currentAssetName}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 font-mono text-[11px] shrink-0 text-slate-400">
            {operation.currentAssetSize && (
              <span className="px-1.5 py-0.5 bg-slate-950/80 rounded border border-slate-800 text-slate-400">
                {operation.currentAssetSize}
              </span>
            )}
            <span className={isDownload ? 'text-emerald-400' : 'text-rose-400'}>
              {percent}%
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
