import React, { useState, useEffect } from 'react';
import { 
  ShieldAlert, 
  Trash2, 
  AlertTriangle, 
  X, 
  FileVideo, 
  ImageIcon, 
  Volume2, 
  FileText, 
  Layers, 
  Check, 
  Loader2 
} from 'lucide-react';
import { RepositoryAsset } from '../types';

interface BulkDeleteConfirmationDialogProps {
  isOpen: boolean;
  selectedAssets: RepositoryAsset[];
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting?: boolean;
}

export default function BulkDeleteConfirmationDialog({
  isOpen,
  selectedAssets,
  onConfirm,
  onCancel,
  isDeleting = false,
}: BulkDeleteConfirmationDialogProps) {
  const [safetyChecked, setSafetyChecked] = useState(false);

  // Reset safety confirmation whenever dialog opens
  useEffect(() => {
    if (isOpen) {
      setSafetyChecked(false);
    }
  }, [isOpen]);

  // Handle ESC key to dismiss
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen && !isDeleting) {
        onCancel();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isDeleting, onCancel]);

  if (!isOpen) return null;

  const totalCount = selectedAssets.length;

  return (
    <div 
      role="dialog" 
      aria-modal="true" 
      aria-labelledby="bulk-delete-dialog-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-fadeIn"
    >
      <div 
        className="w-full max-w-lg bg-slate-900 border border-red-500/30 rounded-2xl shadow-2xl shadow-red-950/30 p-6 space-y-5 animate-scaleIn relative overflow-hidden"
      >
        {/* Accent top bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500" />

        {/* Header with Warning Icon & Close */}
        <div className="flex items-start justify-between gap-3 pt-1">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl shrink-0 shadow-inner">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h3 id="bulk-delete-dialog-title" className="text-base font-bold text-white font-sans flex items-center gap-2">
                <span>Confirm Permanent Bulk Deletion</span>
                <span className="px-2 py-0.5 rounded-full text-[11px] font-mono font-bold bg-red-500/20 text-red-300 border border-red-500/30">
                  {totalCount} {totalCount === 1 ? 'Asset' : 'Assets'}
                </span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Destructive operation requiring explicit editorial authorization.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors cursor-pointer"
            aria-label="Close dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Warning Notice Banner */}
        <div className="p-3 bg-red-950/30 border border-red-900/50 rounded-xl flex items-start gap-2.5 text-xs text-red-200/90 leading-relaxed font-sans">
          <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-red-300 font-semibold">Warning: </strong>
            You are about to permanently purge <strong className="text-white font-bold">{totalCount} repository assets</strong>. 
            This action cannot be undone. Files will be purged from the active storage index and will no longer be available for broadcast switchers or social queues.
          </div>
        </div>

        {/* List of Affected Assets */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 uppercase tracking-wider">
            <span>Assets Queued for Purge:</span>
            <span>Total: {totalCount}</span>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-48 overflow-y-auto space-y-2 font-sans text-xs divide-y divide-slate-850">
            {selectedAssets.map((asset) => (
              <div key={asset.id} className="flex items-center justify-between gap-3 pt-2 first:pt-0 min-w-0">
                <div className="flex items-center gap-2.5 min-w-0 flex-1">
                  {asset.type === 'video' && <FileVideo className="w-4 h-4 text-red-400 shrink-0" />}
                  {asset.type === 'image' && <ImageIcon className="w-4 h-4 text-blue-400 shrink-0" />}
                  {asset.type === 'audio' && <Volume2 className="w-4 h-4 text-green-400 shrink-0" />}
                  {asset.type === 'script' && <FileText className="w-4 h-4 text-cyan-400 shrink-0" />}
                  {asset.type === 'subtitles' && <Layers className="w-4 h-4 text-yellow-400 shrink-0" />}

                  <span className="truncate text-slate-200 font-medium" title={asset.name}>
                    {asset.name}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400 shrink-0">
                  {asset.category && (
                    <span className="px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                      {asset.category}
                    </span>
                  )}
                  <span className="uppercase text-slate-500 font-bold">{asset.type}</span>
                  <span className="text-slate-600">•</span>
                  <span>{asset.size || 'N/A'}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Explicit Safety Confirmation Checkbox */}
        <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl">
          <label 
            htmlFor="safety-confirmation-checkbox"
            className="flex items-start gap-2.5 cursor-pointer select-none group text-xs"
          >
            <input
              id="safety-confirmation-checkbox"
              type="checkbox"
              checked={safetyChecked}
              onChange={(e) => setSafetyChecked(e.target.checked)}
              disabled={isDeleting}
              className="w-4 h-4 mt-0.5 accent-red-650 bg-slate-900 border-slate-700 rounded cursor-pointer shrink-0"
            />
            <span className="text-slate-300 group-hover:text-white leading-tight font-medium">
              I understand that these <strong className="text-red-400">{totalCount} assets</strong> will be permanently deleted and cannot be recovered.
            </span>
          </label>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors disabled:opacity-50"
          >
            Cancel
          </button>
          
          <button
            type="button"
            id="confirm-bulk-delete-btn"
            onClick={onConfirm}
            disabled={!safetyChecked || isDeleting}
            className={`px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 transition-all shadow-lg cursor-pointer ${
              safetyChecked && !isDeleting
                ? 'bg-red-600 hover:bg-red-500 text-white shadow-red-950/50'
                : 'bg-red-950/40 text-red-400/50 border border-red-900/30 cursor-not-allowed'
            }`}
          >
            {isDeleting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Purging Assets...</span>
              </>
            ) : (
              <>
                <Trash2 className="w-4 h-4" />
                <span>Permanently Delete ({totalCount})</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
