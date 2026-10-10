import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'qrcode';
import { 
  Smartphone, 
  QrCode, 
  ExternalLink, 
  Copy, 
  Check, 
  RefreshCw, 
  Play, 
  Pause, 
  Video, 
  Wifi, 
  Battery, 
  Sliders, 
  Send, 
  Layers, 
  Tv, 
  Sparkles, 
  Radio, 
  FileText, 
  CheckCheck, 
  Terminal,
  ShieldCheck,
  Maximize2,
  Volume2,
  Signal,
  ArrowRight,
  Info
} from 'lucide-react';
import { GeneratedScript } from '../types';

interface ExpoMobileCompanionProps {
  scripts?: GeneratedScript[];
  onAddAsset?: (asset: any) => void;
  triggerToast: (msg: string) => void;
  onNavigateTab?: (tab: string) => void;
  initialUrl?: string;
  isModalView?: boolean;
  onCloseModal?: () => void;
}

export default function ExpoMobileCompanion({
  scripts = [],
  onAddAsset,
  triggerToast,
  onNavigateTab,
  initialUrl = 'exp://exp.host/@aigaming/gnn-ai-studio',
  isModalView = false,
  onCloseModal
}: ExpoMobileCompanionProps) {
  const [expoUrl, setExpoUrl] = useState(initialUrl);
  const [customUrlInput, setCustomUrlInput] = useState(initialUrl);
  const [isEditingUrl, setIsEditingUrl] = useState(false);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>('');
  const [isCopied, setIsCopied] = useState(false);
  const [activeSubTab, setActiveSubTab] = useState<'PAIRING' | 'TELEPROMPTER' | 'CAMERA_FEED' | 'EAS_STATUS'>('PAIRING');

  // Live paired device simulation state
  const [isDeviceConnected, setIsDeviceConnected] = useState(true);
  const [pairedDevice, setPairedDevice] = useState({
    name: 'iPhone 16 Pro — Field Anchor Unit 01',
    platform: 'iOS 18.2 / Expo Go v52.0',
    battery: 91,
    latencyMs: 14,
    resolution: '1080p 60fps HDR',
    ip: '192.168.1.142',
    lastPing: 'Live (0.4s ago)'
  });

  // Mobile Teleprompter controls
  const [selectedScriptId, setSelectedScriptId] = useState<string>(scripts[0]?.id || 'demo-script');
  const [isPrompterScrolling, setIsPrompterScrolling] = useState(false);
  const [prompterSpeed, setPrompterSpeed] = useState(2);
  const [prompterFontSize, setPrompterFontSize] = useState(28);
  const [isPrompterMirrored, setIsPrompterMirrored] = useState(false);
  const [prompterSentSuccess, setPrompterSentSuccess] = useState(false);

  // Field Camera feed simulation
  const [isStreamingFeed, setIsStreamingFeed] = useState(true);
  const [audioVuLevel, setAudioVuLevel] = useState(72);
  const [isFeedLinkedToVmix, setIsFeedLinkedToVmix] = useState(false);

  // Generate QR Code on URL change
  useEffect(() => {
    let isMounted = true;
    QRCode.toDataURL(expoUrl, {
      width: 320,
      margin: 2,
      color: {
        dark: '#ffffff',
        light: '#020617' // slate-950
      },
      errorCorrectionLevel: 'M'
    })
      .then((url) => {
        if (isMounted) setQrCodeDataUrl(url);
      })
      .catch((err) => {
        console.error('Failed to generate QR Code:', err);
      });

    return () => {
      isMounted = false;
    };
  }, [expoUrl]);

  // Audio VU meter simulation
  useEffect(() => {
    if (!isStreamingFeed) return;
    const interval = setInterval(() => {
      setAudioVuLevel(Math.floor(55 + Math.random() * 38));
    }, 400);
    return () => clearInterval(interval);
  }, [isStreamingFeed]);

  const activeScript = useMemo(() => {
    return scripts.find(s => s.id === selectedScriptId) || scripts[0] || {
      id: 'demo-script',
      title: 'Global Semiconductor Summit releases Joint AI Standards Accord',
      headline: 'Automated Broadcast Verification Protocol Ratified in Geneva',
      body: 'GENEVA — Delegates from 38 nations have ratified the Geneva Protocol for Automated Broadcast Verification today. The treaty mandates cryptographic watermarks on synthetic broadcast assets while preserving journalist provenance.',
      voiceoverText: 'Breaking coverage from GNN newsroom. 38 nations have ratified the Geneva Protocol for Automated Broadcast Verification. Watermarks mandated on all synthetic broadcast media.',
      language: 'English',
      status: 'approved'
    };
  }, [scripts, selectedScriptId]);

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(expoUrl);
    setIsCopied(true);
    triggerToast(`Copied Expo URL to clipboard: ${expoUrl}`);
    setTimeout(() => setIsCopied(false), 2000);
  };

  const handleSaveCustomUrl = () => {
    const trimmed = customUrlInput.trim();
    if (!trimmed) return;
    setExpoUrl(trimmed);
    setIsEditingUrl(false);
    triggerToast(`Updated Expo project link to: ${trimmed}`);
  };

  const handlePushScriptToMobile = () => {
    setPrompterSentSuccess(true);
    triggerToast(`Pushed "${activeScript.title.substring(0, 30)}..." to paired mobile teleprompter!`);
    setTimeout(() => setPrompterSentSuccess(false), 3000);
  };

  const handleAddFeedToRepository = () => {
    if (isFeedLinkedToVmix) {
      triggerToast('Mobile feed is already bridged to media repository / switcher.');
      return;
    }

    const mobileAsset = {
      id: `asset-mobile-${Date.now()}`,
      name: `Remote_Field_Cam_${pairedDevice.name.replace(/[^a-zA-Z0-9]/g, '_')}.mp4`,
      type: 'video' as const,
      url: 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1600&q=80',
      size: 'Live SRT Stream',
      resolution: pairedDevice.resolution,
      createdAt: new Date().toISOString(),
      status: 'Ready' as const,
      category: 'Mobile Field Camera Stream',
      lyrics_or_text: `Live SRT stream from ${pairedDevice.name} on ${pairedDevice.platform}. Endpoint: srt://gnn-studio.live:9000?streamid=mobile-field-01`
    };

    if (onAddAsset) {
      onAddAsset(mobileAsset);
    }
    setIsFeedLinkedToVmix(true);
    triggerToast(`Added ${pairedDevice.name} live feed to Media Repository & FastMCP!`);
  };

  return (
    <div className={`space-y-6 text-slate-200 ${isModalView ? 'p-1' : ''}`}>
      
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/70 border border-indigo-500/30 rounded-2xl p-5 shadow-2xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 shadow-inner">
              <Smartphone className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>GNN AI Studio Mobile Companion</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 font-bold">
                  EXPO GO / EAS
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Remote anchor teleprompter, field reporter SRT camera hit & mobile script dispatch.
              </p>
            </div>
          </div>
        </div>

        {/* Status Pills & Direct Deep-Links */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/90 border border-slate-800 text-xs font-mono">
            <span className={`w-2 h-2 rounded-full ${isDeviceConnected ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
            <span className="text-slate-300 font-bold">
              {isDeviceConnected ? 'Device Paired (14ms)' : 'Standby'}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCopyUrl}
            className="px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer"
            title="Copy exp:// URL"
          >
            {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{isCopied ? 'Copied URL!' : 'Copy exp://'}</span>
          </button>

          <a
            href={expoUrl}
            target="_blank"
            rel="noreferrer"
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-500 hover:to-blue-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 shadow-lg shadow-indigo-950/40 transition-all cursor-pointer"
            title="Open directly in Expo Go on your device or browser"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Launch in Expo Go</span>
          </a>

          {isModalView && onCloseModal && (
            <button
              type="button"
              onClick={onCloseModal}
              className="px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-mono font-bold transition-all cursor-pointer"
            >
              Close
            </button>
          )}
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-2 overflow-x-auto">
        {[
          { id: 'PAIRING', label: '📱 Scan QR & Pairing', desc: 'Expo Go Link & QR' },
          { id: 'TELEPROMPTER', label: '📜 Field Teleprompter', desc: 'Remote Anchor Feed' },
          { id: 'CAMERA_FEED', label: '🎥 Remote Camera (vMix)', desc: 'Live Field Video Hit' },
          { id: 'EAS_STATUS', label: '⚡ EAS & Build Info', desc: 'Release Telemetry' }
        ].map((tab) => {
          const isActive = activeSubTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveSubTab(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-2 shrink-0 cursor-pointer ${
                isActive
                  ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 1: QR CODE & DEVICE PAIRING                           */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'PAIRING' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: QR Code Display & Quick Scan Instructions (Col 5) */}
          <div className="lg:col-span-5 bg-slate-950 border border-slate-900 rounded-2xl p-6 flex flex-col items-center text-center space-y-4 shadow-xl">
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 font-bold px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/30">
                SCANNABLE EXPO GO QR CODE
              </span>
              <h3 className="text-sm font-bold text-white font-sans">
                Scan to Launch on iOS or Android
              </h3>
            </div>

            {/* Rendered Crisp QR Code Canvas Container */}
            <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-indigo-500/30 shadow-2xl relative group">
              {qrCodeDataUrl ? (
                <img
                  src={qrCodeDataUrl}
                  alt="Expo Go QR Code"
                  className="w-64 h-64 rounded-xl object-contain shadow-inner"
                />
              ) : (
                <div className="w-64 h-64 flex items-center justify-center bg-slate-950 rounded-xl text-slate-500 text-xs font-mono">
                  Generating QR Code...
                </div>
              )}
              <div className="absolute inset-0 bg-indigo-950/60 opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex flex-col items-center justify-center p-4 backdrop-blur-xs text-white">
                <QrCode className="w-8 h-8 text-indigo-300 mb-2" />
                <span className="text-xs font-mono font-bold">exp.host/@aigaming</span>
                <span className="text-[10px] text-slate-300">Click to copy URL</span>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="mt-3 px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold cursor-pointer"
                >
                  Copy URL
                </button>
              </div>
            </div>

            {/* Expo URL Badge & Editor */}
            <div className="w-full space-y-2">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between text-xs font-mono text-slate-300">
                <span className="truncate text-indigo-300 select-all" title={expoUrl}>
                  {expoUrl}
                </span>
                <button
                  type="button"
                  onClick={handleCopyUrl}
                  className="p-1 hover:text-white transition-colors cursor-pointer shrink-0 ml-2"
                  title="Copy URL"
                >
                  {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              {isEditingUrl ? (
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={customUrlInput}
                    onChange={(e) => setCustomUrlInput(e.target.value)}
                    placeholder="exp://..."
                    className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1 text-xs font-mono text-white outline-none focus:border-indigo-400"
                  />
                  <button
                    type="button"
                    onClick={handleSaveCustomUrl}
                    className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold rounded-lg cursor-pointer"
                  >
                    Save
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsEditingUrl(false)}
                    className="px-2 py-1 bg-slate-800 text-slate-300 text-xs font-mono rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setCustomUrlInput(expoUrl);
                    setIsEditingUrl(true);
                  }}
                  className="text-[11px] font-mono text-slate-400 hover:text-indigo-300 transition-colors cursor-pointer"
                >
                  Edit custom development URL
                </button>
              )}
            </div>

            {/* Quick Step-by-Step Instructions */}
            <div className="w-full text-left bg-slate-900/60 p-3.5 rounded-xl border border-slate-850 space-y-2 text-xs">
              <div className="font-bold text-white flex items-center gap-1.5 font-sans">
                <Info className="w-3.5 h-3.5 text-indigo-400" />
                <span>How to open in Expo Go:</span>
              </div>
              <ul className="space-y-1 text-slate-400 text-[11px] list-disc list-inside">
                <li><strong className="text-slate-200">iOS:</strong> Open the built-in Camera app, point at this QR, and tap the notification banner.</li>
                <li><strong className="text-slate-200">Android:</strong> Open the Expo Go app, tap <em>"Scan QR Code"</em>, and aim at the screen.</li>
                <li>Ensure device has the free <strong className="text-indigo-300">Expo Go</strong> app installed from App Store or Google Play.</li>
              </ul>
            </div>
          </div>

          {/* Right Column: Live Paired Device & Companion Features (Col 7) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Live Paired Device Card */}
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="p-2 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-white font-sans">
                      Active Paired Field Unit
                    </h4>
                    <p className="text-[11px] text-slate-400 font-mono">
                      {pairedDevice.name}
                    </p>
                  </div>
                </div>

                <span className="px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>ONLINE</span>
                </span>
              </div>

              {/* Device Telemetry Metrics */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-2">
                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-850 space-y-0.5">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
                    <span>BATTERY</span>
                    <Battery className="w-3.5 h-3.5 text-emerald-400" />
                  </div>
                  <div className="text-sm font-bold text-white font-mono">{pairedDevice.battery}%</div>
                  <div className="text-[9px] text-emerald-400 font-mono">Charging</div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-850 space-y-0.5">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
                    <span>LATENCY</span>
                    <Signal className="w-3.5 h-3.5 text-cyan-400" />
                  </div>
                  <div className="text-sm font-bold text-white font-mono">{pairedDevice.latencyMs} ms</div>
                  <div className="text-[9px] text-cyan-400 font-mono">5G Ultra Low</div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-850 space-y-0.5">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
                    <span>VIDEO FEED</span>
                    <Video className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                  <div className="text-sm font-bold text-white font-mono">60 FPS</div>
                  <div className="text-[9px] text-slate-400 font-mono">1080p HDR</div>
                </div>

                <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-850 space-y-0.5">
                  <div className="flex items-center justify-between text-slate-400 text-[10px] font-mono">
                    <span>AUDIO VU</span>
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                  </div>
                  <div className="text-sm font-bold text-white font-mono">{audioVuLevel} dB</div>
                  <div className="text-[9px] text-amber-400 font-mono">Mic Ready</div>
                </div>
              </div>

              {/* IP and Platform Metadata */}
              <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-850 flex flex-wrap items-center justify-between text-xs font-mono text-slate-400 gap-2">
                <span>Platform: <strong className="text-white">{pairedDevice.platform}</strong></span>
                <span>IP: <strong className="text-indigo-300">{pairedDevice.ip}</strong></span>
                <span>Last Heartbeat: <strong className="text-emerald-400">{pairedDevice.lastPing}</strong></span>
              </div>
            </div>

            {/* Quick Action Matrix for Mobile Companion */}
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
                Companion Operating Modes
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setActiveSubTab('TELEPROMPTER')}
                  className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 text-left transition-all cursor-pointer group space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-2">
                      <FileText className="w-4 h-4 text-cyan-400" />
                      <span>Anchor Teleprompter</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Stream news scripts in real time to the anchor's mobile phone screen with scroll sync.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveSubTab('CAMERA_FEED')}
                  className="p-3.5 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-indigo-500/40 text-left transition-all cursor-pointer group space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white text-xs flex items-center gap-2">
                      <Video className="w-4 h-4 text-red-400" />
                      <span>Remote Camera Hit</span>
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-red-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Route the field reporter's mobile phone camera directly into the vMix switcher via SRT.
                  </p>
                </button>
              </div>
            </div>

          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 2: MOBILE TELEPROMPTER REMOTE DISPATCH                */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'TELEPROMPTER' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Script Selector & Controls (Col 5) */}
          <div className="lg:col-span-5 bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <FileText className="w-4 h-4 text-cyan-400" />
                <span>Teleprompter Script Stream</span>
              </h3>
              <p className="text-xs text-slate-400">
                Push news scripts to the mobile teleprompter app screen in real time.
              </p>
            </div>

            {/* Script Selection Dropdown */}
            <div className="space-y-1.5">
              <label htmlFor="mobile-script-select" className="text-[11px] font-mono text-slate-400">
                Choose Script to Dispatch:
              </label>
              <select
                id="mobile-script-select"
                value={selectedScriptId}
                onChange={(e) => setSelectedScriptId(e.target.value)}
                className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 outline-none focus:border-cyan-400 cursor-pointer"
              >
                {scripts.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} ({s.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            {/* Teleprompter Scroll Controls */}
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-850 space-y-3">
              <span className="text-[10px] font-mono text-slate-500 uppercase font-bold block">
                Scroll & Display Controls
              </span>

              <div className="flex items-center justify-between gap-3">
                <button
                  type="button"
                  onClick={() => setIsPrompterScrolling(!isPrompterScrolling)}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                    isPrompterScrolling
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-md'
                  }`}
                >
                  {isPrompterScrolling ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
                  <span>{isPrompterScrolling ? 'Pause Scroll' : 'Start Auto-Scroll'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => setIsPrompterMirrored(!isPrompterMirrored)}
                  className={`py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer border ${
                    isPrompterMirrored
                      ? 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
                      : 'bg-slate-800 text-slate-400 border-slate-700'
                  }`}
                  title="Mirror text horizontally for glass teleprompter rigs"
                >
                  Mirror Rig: {isPrompterMirrored ? 'ON' : 'OFF'}
                </button>
              </div>

              {/* Speed Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-300">
                  <span>Scroll Speed:</span>
                  <span className="text-cyan-300 font-bold">{prompterSpeed}x</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={5}
                  step={0.5}
                  value={prompterSpeed}
                  onChange={(e) => setPrompterSpeed(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>

              {/* Font Size Slider */}
              <div className="space-y-1">
                <div className="flex justify-between text-[11px] font-mono text-slate-300">
                  <span>Display Font Size:</span>
                  <span className="text-cyan-300 font-bold">{prompterFontSize}px</span>
                </div>
                <input
                  type="range"
                  min={18}
                  max={48}
                  step={2}
                  value={prompterFontSize}
                  onChange={(e) => setPrompterFontSize(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                />
              </div>
            </div>

            {/* One-Click Push to Mobile Button */}
            <button
              type="button"
              onClick={handlePushScriptToMobile}
              className={`w-full py-3 rounded-xl font-bold font-mono text-xs flex items-center justify-center gap-2 shadow-xl transition-all cursor-pointer ${
                prompterSentSuccess
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white shadow-cyan-950/40'
              }`}
            >
              {prompterSentSuccess ? (
                <>
                  <CheckCheck className="w-4 h-4" />
                  <span>Pushed to Paired Mobile!</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Push Script to Mobile Teleprompter</span>
                </>
              )}
            </button>
          </div>

          {/* Right Column: Live Mobile Teleprompter Screen Mockup (Col 7) */}
          <div className="lg:col-span-7 bg-slate-950 border border-slate-900 rounded-2xl p-5 flex flex-col items-center">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mb-3">
              LIVE MOBILE SCREEN VIEW (iPhone 16 Pro)
            </span>

            {/* Mobile Phone Device Chassis */}
            <div className="w-full max-w-sm rounded-[36px] bg-slate-900 p-3 shadow-2xl border-4 border-slate-800 relative">
              {/* Top Dynamic Island / Speaker */}
              <div className="w-24 h-4 bg-slate-950 rounded-full mx-auto mb-2 flex items-center justify-center">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-900 ml-12" />
              </div>

              {/* Screen Area */}
              <div 
                className="h-[440px] bg-slate-950 rounded-[28px] p-5 overflow-y-auto text-left relative scroll-smooth border border-slate-850"
                style={{
                  transform: isPrompterMirrored ? 'scaleX(-1)' : 'none'
                }}
              >
                <div className="sticky top-0 bg-slate-950/90 backdrop-blur-sm pb-2 mb-3 border-b border-slate-850 flex items-center justify-between text-[10px] font-mono text-cyan-400">
                  <span>GNN TELEPROMPTER</span>
                  <span>{isPrompterScrolling ? '● SCROLLING' : '❚❚ PAUSED'}</span>
                </div>

                <h3 className="font-bold text-white mb-2 leading-snug" style={{ fontSize: `${prompterFontSize * 0.85}px` }}>
                  {activeScript.headline || activeScript.title}
                </h3>

                <p 
                  className="text-amber-200 font-semibold leading-relaxed tracking-wide whitespace-pre-wrap selection:bg-amber-500/40"
                  style={{ fontSize: `${prompterFontSize}px` }}
                >
                  {activeScript.voiceoverText || activeScript.body}
                </p>

                <div className="mt-8 text-center text-slate-600 text-xs font-mono">
                  — END OF BROADCAST WIRE —
                </div>
              </div>

              {/* Bottom Home Indicator */}
              <div className="w-28 h-1 bg-slate-700 rounded-full mx-auto mt-2" />
            </div>
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 3: REMOTE CAMERA & VMIX VIDEO HIT                     */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'CAMERA_FEED' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Column: Live Field Video Viewport (Col 8) */}
          <div className="lg:col-span-8 bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
                <span className="font-bold text-xs text-white uppercase font-mono">
                  LIVE MOBILE SRT HIT — {pairedDevice.name}
                </span>
              </div>
              <span className="px-2 py-0.5 rounded bg-slate-900 text-slate-400 text-[10px] font-mono border border-slate-800">
                1080p 60fps • SRT Caller Mode
              </span>
            </div>

            {/* Video Canvas with Broadcast HUD Overlay */}
            <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-850 shadow-2xl group">
              <img
                src="https://images.unsplash.com/photo-1585829365295-ab7cd400c167?auto=format&fit=crop&w=1600&q=80"
                alt="Field Camera Live"
                className="w-full h-full object-cover"
              />

              {/* On-Screen Broadcast HUD */}
              <div className="absolute inset-0 p-4 flex flex-col justify-between pointer-events-none bg-gradient-to-t from-slate-950/80 via-transparent to-slate-950/40">
                {/* Top HUD */}
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="px-2 py-1 rounded bg-red-650 text-white font-bold tracking-wider flex items-center gap-1.5 shadow-md">
                    <Radio className="w-3.5 h-3.5 animate-pulse" />
                    <span>ON AIR</span>
                  </span>
                  <div className="flex items-center gap-2 bg-slate-950/80 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                    <span>TC: 14:02:18:24</span>
                    <span>•</span>
                    <span className="text-emerald-400">14ms RTT</span>
                  </div>
                </div>

                {/* Center Crosshairs */}
                <div className="self-center border border-white/20 w-16 h-16 rounded-full flex items-center justify-center">
                  <div className="w-2 h-2 bg-white/40 rounded-full" />
                </div>

                {/* Bottom HUD: Audio VU meter & Field Correspondent Name */}
                <div className="flex items-end justify-between text-xs font-mono">
                  <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800">
                    <span className="text-slate-400 text-[10px] block">CORRESPONDENT:</span>
                    <span className="text-white font-bold">Field Unit 01 (Dhaka Central Station)</span>
                  </div>

                  <div className="bg-slate-950/80 p-2 rounded-lg border border-slate-800 flex items-center gap-2">
                    <Volume2 className="w-3.5 h-3.5 text-amber-400" />
                    <div className="w-24 h-2 bg-slate-800 rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-gradient-to-r from-emerald-500 via-amber-500 to-red-500" 
                        style={{ width: `${audioVuLevel}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Video Stream Connection Controls */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                type="button"
                onClick={handleAddFeedToRepository}
                className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-mono font-bold flex items-center justify-center gap-2 transition-all cursor-pointer ${
                  isFeedLinkedToVmix
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                    : 'bg-gradient-to-r from-red-650 to-blue-650 hover:from-red-600 hover:to-blue-600 text-white shadow-lg'
                }`}
              >
                {isFeedLinkedToVmix ? (
                  <>
                    <CheckCheck className="w-4 h-4 text-emerald-400" />
                    <span>Bridged to FastMCP vMix & Repository</span>
                  </>
                ) : (
                  <>
                    <Tv className="w-4 h-4" />
                    <span>Route Mobile Feed to FastMCP Switcher</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => setIsStreamingFeed(!isStreamingFeed)}
                className="py-2.5 px-4 rounded-xl bg-slate-850 hover:bg-slate-800 text-slate-300 text-xs font-mono font-bold cursor-pointer"
              >
                {isStreamingFeed ? 'Pause Stream' : 'Resume Stream'}
              </button>
            </div>
          </div>

          {/* Right Column: SRT & Encoder Metadata (Col 4) */}
          <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase tracking-wider">
              SRT & Encoder Settings
            </h4>

            <div className="space-y-2 text-xs font-mono">
              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-850 space-y-1">
                <span className="text-[10px] text-slate-500">SRT LISTENER URL:</span>
                <p className="text-indigo-300 font-bold select-all break-all">
                  srt://gnn-studio.live:9000?streamid=mobile-field-01
                </p>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-850 space-y-1">
                <span className="text-[10px] text-slate-500">VIDEO CODEC:</span>
                <p className="text-white">H.265 / HEVC Hardware (Apple VideoToolbox)</p>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-850 space-y-1">
                <span className="text-[10px] text-slate-500">AUDIO FORMAT:</span>
                <p className="text-white">Opus 48kHz Stereo 160 kbps</p>
              </div>

              <div className="bg-slate-900/80 p-2.5 rounded-xl border border-slate-850 space-y-1">
                <span className="text-[10px] text-slate-500">ENCRYPTION:</span>
                <p className="text-emerald-400">AES-128 Pre-Shared Passphrase</p>
              </div>
            </div>

            {onNavigateTab && (
              <button
                type="button"
                onClick={() => onNavigateTab('fastmcp_vmix')}
                className="w-full py-2.5 px-3 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-cyan-300 text-xs font-mono font-bold flex items-center justify-center gap-2 cursor-pointer"
              >
                <Tv className="w-3.5 h-3.5" />
                <span>Open in FastMCP vMix Switcher</span>
              </button>
            )}
          </div>

        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SUB-TAB 4: EAS & BUILD TELEMETRY                              */}
      {/* ------------------------------------------------------------- */}
      {activeSubTab === 'EAS_STATUS' && (
        <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 space-y-6">
          <div className="flex items-center justify-between border-b border-slate-850 pb-4">
            <div>
              <h3 className="text-sm font-bold text-white font-sans flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span>EAS (Expo Application Services) Build Pipeline</span>
              </h3>
              <p className="text-xs text-slate-400">
                Production release status and command telemetry for @aigaming/gnn-ai-studio.
              </p>
            </div>

            <a
              href="https://expo.dev/@aigaming/gnn-ai-studio"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-mono font-bold flex items-center gap-1.5 transition-all"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>expo.dev Dashboard</span>
            </a>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-850 space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase">PROJECT SLUG</span>
              <p className="text-sm font-bold text-white font-mono">@aigaming/gnn-ai-studio</p>
              <span className="text-[10px] font-mono text-indigo-400">ID: a7f8c12-gnn-mobile</span>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-850 space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase">EXPO RUNTIME SDK</span>
              <p className="text-sm font-bold text-white font-mono">SDK 52.0.0 (React 19)</p>
              <span className="text-[10px] font-mono text-emerald-400">Release: Stable</span>
            </div>

            <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-850 space-y-1">
              <span className="text-[10px] font-mono text-slate-500 uppercase">RELEASE CHANNEL</span>
              <p className="text-sm font-bold text-white font-mono">production</p>
              <span className="text-[10px] font-mono text-cyan-400">OTA Updates Enabled</span>
            </div>
          </div>

          {/* CLI Helper Commands */}
          <div className="space-y-2">
            <h4 className="text-xs font-mono font-bold text-slate-400 uppercase">
              EAS & Expo CLI Snippets
            </h4>
            <div className="bg-slate-900 p-4 rounded-xl border border-slate-850 font-mono text-xs text-slate-300 space-y-2">
              <div className="flex items-center justify-between">
                <span># Start development server with Expo Go URL:</span>
                <span className="text-slate-500 text-[10px]">Development</span>
              </div>
              <p className="text-cyan-300 bg-slate-950 p-2 rounded border border-slate-800">
                npx expo start --tunnel
              </p>

              <div className="flex items-center justify-between pt-2">
                <span># Build production standalone apps for App Store & Google Play:</span>
                <span className="text-slate-500 text-[10px]">EAS Build</span>
              </div>
              <p className="text-indigo-300 bg-slate-950 p-2 rounded border border-slate-800">
                eas build --platform all --profile production
              </p>

              <div className="flex items-center justify-between pt-2">
                <span># Push over-the-air hot update to all field devices:</span>
                <span className="text-slate-500 text-[10px]">EAS Update</span>
              </div>
              <p className="text-emerald-300 bg-slate-950 p-2 rounded border border-slate-800">
                eas update --branch production --message "Teleprompter & SRT field hit update"
              </p>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
