import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  ChevronLeft, 
  ChevronRight, 
  FileVideo, 
  ImageIcon, 
  Volume2, 
  FileText, 
  Layers, 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Maximize2, 
  Minimize2,
  ExternalLink,
  Upload,
  Play,
  Pause,
  VolumeX,
  Copy,
  Check,
  CheckCircle2,
  Loader2,
  AlertTriangle,
  Folder
} from 'lucide-react';
import { RepositoryAsset } from '../types';

interface AssetPreviewModalProps {
  isOpen: boolean;
  asset: RepositoryAsset | null;
  onClose: () => void;
  onNext?: () => void;
  onPrev?: () => void;
  hasNext?: boolean;
  hasPrev?: boolean;
  currentIndex?: number;
  totalCount?: number;
  onDownload?: (asset: RepositoryAsset) => void;
  onReplaceFile?: (file: File) => void;
  canEdit?: boolean;
}

export default function AssetPreviewModal({
  isOpen,
  asset,
  onClose,
  onNext,
  onPrev,
  hasNext = false,
  hasPrev = false,
  currentIndex,
  totalCount,
  onDownload,
  onReplaceFile,
  canEdit = false
}: AssetPreviewModalProps) {
  const [zoom, setZoom] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mediaDimensions, setMediaDimensions] = useState<string | null>(null);
  const [detectedDuration, setDetectedDuration] = useState<string | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [copiedText, setCopiedText] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset zoom and states when asset changes
  useEffect(() => {
    setZoom(1);
    setMediaDimensions(null);
    setDetectedDuration(null);
    setIsPlaying(true);
    setCopiedText(false);
  }, [asset?.id]);

  // Keyboard navigation & escape listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      } else if (e.key === 'ArrowRight' && hasNext && onNext) {
        onNext();
      } else if (e.key === 'ArrowLeft' && hasPrev && onPrev) {
        onPrev();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, hasNext, hasPrev, onNext, onPrev, onClose]);

  // Fullscreen toggle
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
      setIsFullscreen(true);
    } else {
      document.exitFullscreen().catch(() => {});
      setIsFullscreen(false);
    }
  };

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.25, 0.5));
  const handleResetZoom = () => setZoom(1);

  const handleVideoPlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const handleVideoMuteToggle = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !videoRef.current.muted;
    setIsMuted(videoRef.current.muted);
  };

  const handleCopyText = () => {
    if (asset?.lyrics_or_text) {
      navigator.clipboard.writeText(asset.lyrics_or_text);
      setCopiedText(true);
      setTimeout(() => setCopiedText(false), 2000);
    }
  };

  const formatSeconds = (sec: number) => {
    if (!sec || isNaN(sec)) return null;
    const m = Math.floor(sec / 60);
    const s = Math.floor(sec % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  const getTypeIcon = () => {
    if (!asset) return null;
    switch (asset.type) {
      case 'video':
        return <FileVideo className="w-5 h-5 text-red-400" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-blue-400" />;
      case 'audio':
        return <Volume2 className="w-5 h-5 text-green-400" />;
      case 'script':
        return <FileText className="w-5 h-5 text-cyan-400" />;
      case 'subtitles':
        return <Layers className="w-5 h-5 text-yellow-400" />;
    }
  };

  return (
    <AnimatePresence>
      {isOpen && asset && (
        <motion.div 
          id="asset-preview-modal-backdrop"
          role="dialog"
          aria-modal="true"
          aria-labelledby="asset-preview-title"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onClick={(e) => {
            if (e.target === e.currentTarget) onClose();
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 md:p-6 bg-slate-950/85 backdrop-blur-md"
        >
          <motion.div 
            ref={containerRef}
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 16 }}
            transition={{ type: "spring", duration: 0.28, bounce: 0.12 }}
            className="w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[94vh] transition-all"
          >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/70 shrink-0">
          <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
            <div className="p-2 rounded-xl bg-slate-900 border border-slate-800 shrink-0">
              {getTypeIcon()}
            </div>

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 
                  id="asset-preview-title" 
                  className="text-sm sm:text-base font-bold text-white truncate max-w-sm sm:max-w-md"
                  title={asset.name}
                >
                  {asset.name}
                </h3>

                <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                  {asset.type}
                </span>

                {asset.category && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                    {asset.category}
                  </span>
                )}

                {asset.folder && (
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30 flex items-center gap-1">
                    <Folder className="w-3 h-3 text-purple-400" />
                    {asset.folder}
                  </span>
                )}

                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border flex items-center gap-1.5 ${
                  asset.status === 'Processing'
                    ? 'bg-amber-500/20 text-amber-200 border-amber-500/50 ring-1 ring-amber-500/35 animate-pulse shadow-[0_0_10px_rgba(245,158,11,0.25)]'
                    : asset.status === 'Error'
                    ? 'bg-red-500/25 text-red-200 border-red-500/60 ring-1 ring-red-500/40 shadow-[0_0_12px_rgba(239,68,68,0.3)]'
                    : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 ring-1 ring-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.2)]'
                }`}>
                  {asset.status === 'Processing' ? (
                    <Loader2 className="w-3 h-3 text-amber-400 animate-spin shrink-0" />
                  ) : asset.status === 'Error' ? (
                    <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                  ) : (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                  )}
                  <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                    asset.status === 'Processing'
                      ? 'bg-amber-400 animate-ping shadow-[0_0_6px_rgba(251,191,36,0.9)]'
                      : asset.status === 'Error'
                      ? 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.9)]'
                      : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.95)]'
                  }`} />
                  <span className="uppercase tracking-wider font-extrabold">{asset.status || 'Ready'}</span>
                </span>
              </div>

              {currentIndex !== undefined && totalCount !== undefined && (
                <p className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Asset {currentIndex + 1} of {totalCount}
                </p>
              )}
            </div>
          </div>

          {/* Header Controls */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Image Zoom Tools */}
            {asset.type === 'image' && (
              <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 mr-1">
                <button
                  type="button"
                  id="preview-zoom-out-btn"
                  onClick={handleZoomOut}
                  disabled={zoom <= 0.5}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
                  title="Zoom Out"
                >
                  <ZoomOut className="w-3.5 h-3.5" />
                </button>
                <span className="text-[10px] font-mono font-bold px-1.5 text-slate-300 min-w-[38px] text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  type="button"
                  id="preview-zoom-in-btn"
                  onClick={handleZoomIn}
                  disabled={zoom >= 3}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 disabled:opacity-40 transition-colors cursor-pointer"
                  title="Zoom In"
                >
                  <ZoomIn className="w-3.5 h-3.5" />
                </button>
                <button
                  type="button"
                  id="preview-zoom-reset-btn"
                  onClick={handleResetZoom}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer ml-0.5"
                  title="Reset Zoom (100%)"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Video Controls Shortcut */}
            {asset.type === 'video' && (
              <div className="hidden sm:flex items-center bg-slate-900 border border-slate-800 rounded-lg p-0.5 mr-1">
                <button
                  type="button"
                  id="preview-video-play-btn"
                  onClick={handleVideoPlayPause}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  title={isPlaying ? 'Pause' : 'Play'}
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-red-400" />}
                </button>
                <button
                  type="button"
                  id="preview-video-mute-btn"
                  onClick={handleVideoMuteToggle}
                  className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-800 transition-colors cursor-pointer"
                  title={isMuted ? 'Unmute' : 'Mute'}
                >
                  {isMuted ? <VolumeX className="w-3.5 h-3.5 text-amber-400" /> : <Volume2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}

            {/* Fullscreen Toggle */}
            <button
              type="button"
              id="preview-fullscreen-btn"
              onClick={toggleFullscreen}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
              title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>

            {/* Download Button */}
            {onDownload && (
              <button
                type="button"
                id="preview-download-btn"
                onClick={() => onDownload(asset)}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                title="Download asset to disk"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Download</span>
              </button>
            )}

            {/* Close Button */}
            <button
              type="button"
              id="preview-close-btn"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 border border-slate-800 transition-colors cursor-pointer"
              title="Close preview (Esc)"
              aria-label="Close preview"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Stage Viewport */}
        <div className="relative flex-1 min-h-[320px] max-h-[66vh] bg-slate-950 flex items-center justify-center p-4 overflow-hidden select-none">
          {/* Subtle Radial Matte background for contrast */}
          <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-40 pointer-events-none" />

          {/* Left Arrow Navigation */}
          {hasPrev && onPrev && (
            <button
              type="button"
              id="preview-prev-btn"
              onClick={onPrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white shadow-xl backdrop-blur-sm transition-all hover:scale-105 cursor-pointer"
              title="Previous Asset (Left Arrow)"
              aria-label="Previous Asset"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}

          {/* Right Arrow Navigation */}
          {hasNext && onNext && (
            <button
              type="button"
              id="preview-next-btn"
              onClick={onNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 p-2.5 rounded-full bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-white shadow-xl backdrop-blur-sm transition-all hover:scale-105 cursor-pointer"
              title="Next Asset (Right Arrow)"
              aria-label="Next Asset"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          )}

          {/* Stage Content: Image Preview */}
          {asset.type === 'image' && (
            <div className="relative w-full h-full flex items-center justify-center overflow-auto p-2">
              <img
                src={asset.url || asset.dataUrl}
                alt={asset.name}
                style={{
                  transform: `scale(${zoom})`,
                  transformOrigin: 'center center',
                  transition: 'transform 0.15s ease-out'
                }}
                onLoad={(e) => {
                  const img = e.currentTarget;
                  setMediaDimensions(`${img.naturalWidth} × ${img.naturalHeight}`);
                }}
                className="max-h-[58vh] max-w-full rounded-lg border border-slate-800 shadow-2xl object-contain"
              />
            </div>
          )}

          {/* Stage Content: Video Player */}
          {asset.type === 'video' && (
            <div className="relative w-full h-full flex items-center justify-center p-2">
              <video
                ref={videoRef}
                src={asset.url || asset.dataUrl}
                controls
                autoPlay
                playsInline
                className="max-h-[58vh] max-w-full rounded-lg border border-slate-850 shadow-2xl object-contain bg-black"
                onLoadedMetadata={(e) => {
                  const v = e.currentTarget;
                  setMediaDimensions(`${v.videoWidth} × ${v.videoHeight}`);
                  const dur = formatSeconds(v.duration);
                  if (dur) setDetectedDuration(dur);
                }}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
              />
            </div>
          )}

          {/* Stage Content: Audio Player & Waveform Visualizer */}
          {asset.type === 'audio' && (
            <div className="w-full max-w-lg p-6 sm:p-8 rounded-2xl bg-slate-900 border border-slate-800 shadow-2xl text-center space-y-5">
              <div className="relative p-4 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 w-16 h-16 mx-auto flex items-center justify-center">
                <Volume2 className="w-8 h-8 animate-pulse" />
              </div>

              <div>
                <h4 className="font-bold text-white text-base truncate">{asset.name}</h4>
                <p className="text-xs text-slate-400 font-mono mt-1">GNN Studio Master Audio &bull; Broadcast Ready</p>
              </div>

              {/* Dynamic Soundwave Equalizer Bars Animation */}
              <div className="flex items-center justify-center gap-1.5 h-12 py-1 px-4 bg-slate-950/80 rounded-xl border border-slate-800/80">
                {[45, 80, 60, 95, 30, 75, 100, 85, 40, 70, 90, 50, 65, 80].map((height, i) => (
                  <div
                    key={i}
                    style={{ 
                      height: `${height}%`,
                      animationDelay: `${i * 0.08}s`
                    }}
                    className="w-1.5 bg-gradient-to-t from-emerald-500 to-cyan-400 rounded-full animate-pulse transition-all duration-300"
                  />
                ))}
              </div>

              {/* Technical Audio Specs for Quick Inspection */}
              <div className="grid grid-cols-3 gap-2 text-[10px] font-mono bg-slate-950/50 p-2.5 rounded-lg border border-slate-800 text-slate-400">
                <div>
                  <span className="block text-slate-500">FORMAT</span>
                  <span className="text-slate-200 font-semibold">MP3 / WAV</span>
                </div>
                <div>
                  <span className="block text-slate-500">CHANNELS</span>
                  <span className="text-slate-200 font-semibold">Stereo 2.0</span>
                </div>
                <div>
                  <span className="block text-slate-500">BITRATE</span>
                  <span className="text-slate-200 font-semibold">320 kbps</span>
                </div>
              </div>

              <audio 
                src={asset.url || asset.dataUrl} 
                controls 
                autoPlay 
                className="w-full"
                onLoadedMetadata={(e) => {
                  const dur = formatSeconds(e.currentTarget.duration);
                  if (dur) setDetectedDuration(dur);
                }}
              />
            </div>
          )}

          {/* Stage Content: Script or Subtitles */}
          {(asset.type === 'script' || asset.type === 'subtitles') && (
            <div className="w-full h-full max-w-3xl flex flex-col rounded-xl bg-slate-900 border border-slate-800 shadow-2xl overflow-hidden">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-950/80 border-b border-slate-800 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-cyan-400" />
                  <span>{asset.type === 'subtitles' ? 'Subtitle File Transcript' : 'Broadcast Script Draft'}</span>
                </span>
                <button
                  type="button"
                  id="preview-copy-text-btn"
                  onClick={handleCopyText}
                  className="flex items-center gap-1 px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  {copiedText ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copiedText ? 'Copied' : 'Copy Text'}</span>
                </button>
              </div>
              <div className="p-4 font-mono text-xs text-cyan-300 leading-relaxed overflow-y-auto flex-1 bg-slate-950/40 whitespace-pre-wrap">
                {asset.lyrics_or_text || 'No transcribed content compiled for this asset document.'}
              </div>
            </div>
          )}
        </div>

        {/* Footer Meta & Actions Bar */}
        <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/70 flex flex-wrap items-center justify-between gap-3 text-xs font-mono text-slate-400 shrink-0">
          <div className="flex items-center gap-3 sm:gap-5 flex-wrap">
            <div>
              <span className="text-slate-500 uppercase">Format: </span>
              <strong className="text-cyan-300">
                {asset.type === 'video' ? 'MP4 H.264 Broadcast' : asset.type === 'image' ? 'Studio Graphic Plate' : asset.type === 'audio' ? 'MP3 Master Audio' : asset.type === 'subtitles' ? 'SRT Captions' : 'Script Document'}
              </strong>
            </div>

            {mediaDimensions && (
              <div>
                <span className="text-slate-500 uppercase">Resolution: </span>
                <strong className="text-slate-200">{mediaDimensions}</strong>
              </div>
            )}

            {!mediaDimensions && asset.resolution && (
              <div>
                <span className="text-slate-500 uppercase">Resolution: </span>
                <strong className="text-slate-200">{asset.resolution}</strong>
              </div>
            )}

            {(detectedDuration || asset.duration) && (
              <div>
                <span className="text-slate-500 uppercase">Duration: </span>
                <strong className="text-slate-200">{detectedDuration || asset.duration}</strong>
              </div>
            )}

            <div>
              <span className="text-slate-500 uppercase">Size: </span>
              <strong className="text-slate-200">{asset.size || 'Calculated on load'}</strong>
            </div>

            <div>
              <span className="text-slate-500 uppercase">Created: </span>
              <strong className="text-slate-200">{asset.createdAt}</strong>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Proxy Replace File */}
            {canEdit && onReplaceFile && (
              <>
                <button
                  type="button"
                  id="preview-replace-file-btn"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors cursor-pointer"
                  title="Replace proxy file asset"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Replace Proxy</span>
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) onReplaceFile(f);
                  }}
                />
              </>
            )}

            {/* Open Raw in New Tab */}
            {asset.url && asset.url !== '#' && !asset.url.startsWith('data:') && (
              <a
                href={asset.url}
                target="_blank"
                rel="noopener noreferrer"
                className="px-2.5 py-1 rounded bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white flex items-center gap-1.5 transition-colors"
                title="Open raw file in new browser tab"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Raw Source</span>
              </a>
            )}

            <button
              type="button"
              id="preview-bottom-close-btn"
              onClick={onClose}
              className="px-3 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )}
</AnimatePresence>
  );
}
