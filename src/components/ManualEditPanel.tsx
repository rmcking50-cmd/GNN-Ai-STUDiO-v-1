import React, { useState, useEffect, useRef } from 'react';
import { 
  Scissors, 
  Tv, 
  Play, 
  Pause, 
  Upload, 
  Radio, 
  Download, 
  Settings, 
  RefreshCw, 
  Sparkles, 
  Layers, 
  Sliders, 
  Volume2, 
  Type, 
  Eye, 
  Plus, 
  Trash2, 
  CheckCircle, 
  Info, 
  Calendar, 
  Monitor, 
  Smartphone, 
  Cpu, 
  Key, 
  FileText, 
  Send, 
  Wifi,
  ChevronRight,
  Gauge,
  Share2,
  Cloud,
  Database
} from 'lucide-react';
import { UserRolePayload } from '../types';

interface ManualEditPanelProps {
  userRole: UserRolePayload;
  onAddAsset: (asset: any) => void;
}

export default function ManualEditPanel({ userRole, onAddAsset }: ManualEditPanelProps) {
  const [currentSection, setCurrentSection] = useState<'edit' | 'interface' | 'upload' | 'stream' | 'export' | 'settings'>('edit');

  // --- 1. EDIT TOOLS STATE ---
  const [aspectRatio, setAspectRatio] = useState<'16:9' | '9:16' | '1:1'>('16:9');
  const [videoFilter, setVideoFilter] = useState<string>('cinematic');
  const [trimStart, setTrimStart] = useState<number>(0);
  const [trimEnd, setTrimEnd] = useState<number>(100);
  const [overlayText, setOverlayText] = useState<string>('GNN NEWS - LIVE BREAKING');
  const [textColor, setTextColor] = useState<string>('#ef4444');
  const [textSize, setTextSize] = useState<string>('text-lg');
  const [subtitlesLanguage, setSubtitlesLanguage] = useState<string>('Bangla');
  const [subtitlesText, setSubtitlesText] = useState<string>('আজকের তাজা খবর জিএনএন বাংলা স্টুডিও থেকে সরাসরি সম্প্রচার করা হচ্ছে।');
  const [captionList, setCaptionList] = useState<{ id: string; time: string; text: string }[]>([
    { id: '1', time: '00:01 - 00:04', text: 'জিএনএন বাংলা স্টুডিও থেকে সরাসরি সম্প্রচারিত তথ্য।' },
    { id: '2', time: '00:05 - 00:10', text: 'আজকের প্রধান খবরগুলো নিয়ে আমি আপনাদের সাথে আছি।' }
  ]);
  const [newCaptionText, setNewCaptionText] = useState<string>('');
  const [newCaptionTime, setNewCaptionTime] = useState<string>('00:11 - 00:15');

  // --- 2. INTERFACE PREVIEW STATE ---
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(80);
  const [currentTime, setCurrentTime] = useState<string>('00:04');
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [splitScreen, setSplitScreen] = useState<boolean>(false);
  const [chromaKeyColor, setChromaKeyColor] = useState<string>('#00b140'); // Green screen hex
  const [chromaTolerance, setChromaTolerance] = useState<number>(45);
  const [teleprompterSpeed, setTeleprompterSpeed] = useState<number>(3);
  const [teleprompterText, setTeleprompterText] = useState<string>(
    'সহকর্মী সুধী, জিএনএন বাংলা স্টুডিও থেকে আমরা প্রতি মুহূর্তের খবর পৌঁছে দিচ্ছি আপনাদের কাছে। আবহাওয়ার খবরের পরেই থাকছে শিল্প ও বাণিজ্যের বিশেষ প্রতিবেদন।'
  );

  // --- 3. AUTO UPLOAD STATE ---
  const [targetPlatforms, setTargetPlatforms] = useState({
    youtube: true,
    tiktok: true,
    facebook: false,
    instagram: true,
    twitter: false,
  });
  const [autoDescription, setAutoDescription] = useState<string>(
    'সরাসরি জিএনএন স্টুডিও থেকে আজকের প্রধান সংবাদ সমাচার। AI জেনারেটেড সাবটাইটেল এবং হাই-রেজোলিউশন প্রোডাকশন ভিডিও।'
  );
  const [postTags, setPostTags] = useState<string>('bangla, news, breaking, gnn_tv, bangladesh');
  const [selectedProfile, setSelectedProfile] = useState<string>('Official GNN Main Station');
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [uploading, setUploading] = useState<boolean>(false);
  const [scheduledDate, setScheduledDate] = useState<string>('2026-06-25');
  const [scheduledTime, setScheduledTime] = useState<string>('20:00');
  const [uploadLogs, setUploadLogs] = useState<string[]>([
    'System: Automation engine initiated...',
    'System: Access tokens verified with Auth API.',
  ]);

  // --- 4. LIVE STREAM STATE ---
  const [isLive, setIsLive] = useState<boolean>(false);
  const [rtmpUrl, setRtmpUrl] = useState<string>('rtmp://live.gnn.bangla/primary_stream');
  const [streamKey, setStreamKey] = useState<string>('gnn_live_key_99xbc_78asd');
  const [streamQuality, setStreamQuality] = useState<string>('1080p_60fps');
  const [subscribersCount, setSubscribersCount] = useState<number>(12850);
  const [likesCount, setLikesCount] = useState<number>(410);
  const [chatMessages, setChatMessages] = useState<{ user: string; text: string; time: string }[]>([
    { user: 'Kahinur', text: 'খুব সুন্দর উপস্থাপনা!', time: '23:14' },
    { user: 'Samiul_01', text: 'ক্লিন স্টুডিও গ্রাফিক্স।', time: '23:15' },
    { user: 'Monika', text: 'Is this live from Dhaka?', time: '23:16' }
  ]);
  const [streamLatency, setStreamLatency] = useState<string>('1.2s (Ultra-Low)');
  const [streamStats, setStreamStats] = useState({ kbps: 5800, fps: 60, drops: 0 });

  // --- 5. EXPORT STATE ---
  const [exportFormat, setExportFormat] = useState<string>('mp4');
  const [exportRes, setExportRes] = useState<string>('1080p');
  const [burnSubtitles, setBurnSubtitles] = useState<boolean>(true);
  const [compressVideo, setCompressVideo] = useState<boolean>(false);
  const [exportProgress, setExportProgress] = useState<number>(0);
  const [exporting, setExporting] = useState<boolean>(false);
  const [exportSuccessUrl, setExportSuccessUrl] = useState<string | null>(null);

  // --- 6. SETTINGS STATE ---
  const [apiKeyYoutube, setApiKeyYoutube] = useState<string>('••••••••••••••••••••••••••••••••');
  const [apiKeyTiktok, setApiKeyTiktok] = useState<string>('••••••••••••••••••••••••••••••••');
  const [watermarkEnabled, setWatermarkEnabled] = useState<boolean>(true);
  const [watermarkText, setWatermarkText] = useState<string>('GNN TV BANGLA');
  const [translationLanguage, setTranslationLanguage] = useState<string>('English');
  const [saveLocalCopy, setSaveLocalCopy] = useState<boolean>(true);

  // --- 7. CLOUD STORAGE AUTOUPLOAD BACKUP STATE ---
  const [cloudBackupEnabled, setCloudBackupEnabled] = useState<boolean>(true);
  const [cloudBackupProvider, setCloudBackupProvider] = useState<'gdrive' | 's3' | 'dropbox'>('gdrive');
  const [gdriveFolder, setGdriveFolder] = useState<string>('GNN_Production_Backups');
  const [gdriveClientId, setGdriveClientId] = useState<string>('gnn-backup-node-402911.apps.googleusercontent.com');
  const [gdriveApiKey, setGdriveApiKey] = useState<string>('••••••••••••••••••••••••••••••••••••••••');
  
  const [s3BucketName, setS3BucketName] = useState<string>('gnn-television-raw-archives');
  const [s3AccessKeyId, setS3AccessKeyId] = useState<string>('AKIAIOSFODNN7EXAMPLE');
  const [s3SecretAccessKey, setS3SecretAccessKey] = useState<string>('••••••••••••••••••••••••••••••••••••••••');
  const [s3Region, setS3Region] = useState<string>('ap-southeast-1');
  
  const [dropboxToken, setDropboxToken] = useState<string>('••••••••••••••••••••••••••••••••••••••••');
  const [dropboxPath, setDropboxPath] = useState<string>('/GNN_News_Archive');

  const [backupStatus, setBackupStatus] = useState<'idle' | 'backing_up' | 'success' | 'error'>('idle');
  const [backupProgress, setBackupProgress] = useState<number>(0);
  const [backupLogs, setBackupLogs] = useState<string[]>([
    'System: Cloud Storage Auto-Backup module initialized.',
    'System: Ready to synchronize after render.'
  ]);

  // Audio EQ Levels State for Visual Effect
  const [eqLevels, setEqLevels] = useState<number[]>([15, 45, 75, 40, 85, 90, 60, 45, 20]);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
      interval = setInterval(() => {
        setEqLevels(prev => prev.map(() => Math.floor(Math.random() * 85) + 10));
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  // Handle adding new custom caption
  const handleAddCaption = () => {
    if (!newCaptionText) return;
    setCaptionList(prev => [...prev, {
      id: String(Date.now()),
      time: newCaptionTime,
      text: newCaptionText
    }]);
    setNewCaptionText('');
  };

  const handleRemoveCaption = (id: string) => {
    setCaptionList(prev => prev.filter(c => c.id !== id));
  };

  // Simulation handlers
  const triggerAutoUpload = () => {
    if (uploading) return;
    setUploading(true);
    setUploadProgress(10);
    setUploadLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] Target engines connecting to YouTube & TikTok...`]);

    const timer = setInterval(() => {
      setUploadProgress(prev => {
        if (prev >= 100) {
          clearInterval(timer);
          setUploading(false);
          setUploadLogs(prevLogs => [
            ...prevLogs,
            `[${new Date().toLocaleTimeString()}] SUCCESS: Published to YouTube Shorts!`,
            `[${new Date().toLocaleTimeString()}] SUCCESS: Published to TikTok!`,
            `GNN TV Automation node successfully synchronized content over secure endpoints.`
          ]);
          alert('Successfully uploaded and automated social platform publishing!');
          return 100;
        }
        if (prev === 40) {
          setUploadLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] Watermark burned correctly. Compiling payload metadata...`]);
        }
        if (prev === 70) {
          setUploadLogs(prevLogs => [...prevLogs, `[${new Date().toLocaleTimeString()}] Subtitle burning validated. Transferring base64 buffers...`]);
        }
        return prev + 15;
      });
    }, 400);
  };

  const startStreamBroadcast = () => {
    if (isLive) {
      setIsLive(false);
      alert('Broadcast connection disconnected gracefully.');
    } else {
      setIsLive(true);
      alert('Live GNN Broadcast established. Streaming video feed to primary endpoints.');
    }
  };

  const triggerCloudBackup = (fileName: string) => {
    if (!cloudBackupEnabled) return;
    setBackupStatus('backing_up');
    setBackupProgress(0);
    setBackupLogs(prev => [
      ...prev,
      `[${new Date().toLocaleTimeString()}] Initiating automated backup for "${fileName}"`,
      `[${new Date().toLocaleTimeString()}] Authenticating with ${cloudBackupProvider.toUpperCase()} secure API endpoints...`
    ]);

    let progress = 0;
    const backupInterval = setInterval(() => {
      progress += 20;
      setBackupProgress(progress);
      
      if (progress === 40) {
        setBackupLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] SSL tunnel established. Target: ${
            cloudBackupProvider === 'gdrive' ? `Google Drive folder "/${gdriveFolder}"` :
            cloudBackupProvider === 's3' ? `S3 Bucket "s3://${s3BucketName}" (${s3Region})` :
            `Dropbox path "${dropboxPath}"`
          }`
        ]);
      }
      
      if (progress === 80) {
        setBackupLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] Uploading multi-part chunks (4.8 MB binary buffer transfer)...`
        ]);
      }

      if (progress >= 100) {
        clearInterval(backupInterval);
        setBackupStatus('success');
        setBackupLogs(prev => [
          ...prev,
          `[${new Date().toLocaleTimeString()}] SUCCESS: Automated backup complete!`,
          `[${new Date().toLocaleTimeString()}] Verified MD5 checksum for GNN_Render_HD_${exportRes}.${exportFormat}`
        ]);
      }
    }, 400);
  };

  const handleExportRender = () => {
    if (exporting) return;
    setExporting(true);
    setExportProgress(5);
    setExportSuccessUrl(null);

    const renderTimer = setInterval(() => {
      setExportProgress(prev => {
        if (prev >= 100) {
          clearInterval(renderTimer);
          setExporting(false);
          
          const sampleUrl = 'https://assets.mixkit.co/videos/preview/mixkit-news-anchor-on-chroma-key-studio-41551-large.mp4';
          setExportSuccessUrl(sampleUrl);

          const newFileName = `Manual Edit GNN Render - ${new Date().toLocaleDateString()}`;

          // Add to repository database
          onAddAsset({
            id: `asset-manual-${Date.now()}`,
            name: newFileName,
            type: 'video',
            url: sampleUrl,
            createdAt: new Date().toLocaleDateString(),
            duration: '0:15',
            size: '4.8 MB',
            resolution: exportRes === '1080p' ? '1920x1080' : '1280x720',
          });
          
          alert('Video file compiled successfully and added into Media Repository.');

          // Trigger automated cloud backup if enabled
          if (cloudBackupEnabled) {
            triggerCloudBackup(newFileName);
          }

          return 100;
        }
        return prev + 10;
      });
    }, 300);
  };

  return (
    <div className="space-y-6">
      {/* Station Control Hub Title */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900/60 p-5 rounded-2xl border border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-bold font-sans tracking-tight text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-red-500 animate-pulse" />
              GNN Manual Edit Panel <span className="text-xs bg-red-600/20 text-red-500 border border-red-500/20 px-2 py-0.5 rounded-full font-mono">ম্যানুয়াল প্যানেল</span>
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-sans">
            Full-service manual suite: trim video loops, hardcode overlays, inject voice subtitles, simulate premium live broadcasting streams & multi-channel social upload.
          </p>
        </div>

        {/* User Role Authorization Indicator */}
        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="block text-[10px] uppercase font-mono text-slate-500">System Permission</span>
            <span className="text-xs font-semibold text-emerald-400">
              {userRole.permissions.canPublish ? 'Full Station Master Access' : 'Read-Only Mode Restricted'}
            </span>
          </div>
          <div className="p-2.5 bg-slate-950 rounded-lg border border-slate-800/60">
            <Cpu className="w-5 h-5 text-red-500" />
          </div>
        </div>
      </div>

      {/* Main Sub-section Navigation Tab Bars */}
      <div className="flex flex-wrap gap-2 p-1 bg-slate-900 rounded-xl border border-slate-800">
        {[
          { id: 'edit', label: 'Edit Tools (টুলস)', icon: Scissors, color: 'text-red-500' },
          { id: 'interface', label: 'Interface Screen', icon: Eye, color: 'text-orange-500' },
          { id: 'upload', label: 'Auto Upload', icon: Upload, color: 'text-blue-500' },
          { id: 'stream', label: 'Live Stream (লাইভ)', icon: Radio, color: 'text-emerald-500' },
          { id: 'export', label: 'Export Renders', icon: Download, color: 'text-purple-500' },
          { id: 'settings', label: 'System Settings', icon: Settings, color: 'text-slate-400' },
        ].map((sec) => {
          const Icon = sec.icon;
          const isActive = currentSection === sec.id;
          return (
            <button
              key={sec.id}
              onClick={() => setCurrentSection(sec.id as any)}
              className={`flex items-center space-x-2 px-3 py-2.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                isActive 
                  ? 'bg-red-600 text-white shadow-lg' 
                  : 'text-slate-400 hover:text-white hover:bg-slate-850'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-white' : sec.color}`} />
              <span>{sec.label}</span>
            </button>
          );
        })}
      </div>

      {/* Interactive Main Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Hand: Controls & Interface settings */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-6">
          
          {/* ======================================= */}
          {/* 1. EDIT TOOLS */}
          {/* ======================================= */}
          {currentSection === 'edit' && (
            <div className="space-y-5">
              <div className="border-b border-slate-900 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                  <Scissors className="w-4 h-4 text-red-500" />
                  Manual Video & Sound Edit tools
                </h3>
                <p className="text-xs text-slate-400 mt-1">Configure layout, resolution filters, trim intervals, and subtitle logs.</p>
              </div>

              {/* Grid selectors */}
              <div className="grid grid-cols-2 gap-4">
                {/* 1. Aspect Ratio */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Canvas aspect ratio</label>
                  <div className="flex space-x-1 p-1 bg-slate-900 rounded-lg">
                    {[
                      { id: '16:9', label: '16:9 Landscape', icon: Monitor },
                      { id: '9:16', label: '9:16 Portrait', icon: Smartphone },
                      { id: '1:1', label: '1:1 Square', icon: Tv },
                    ].map((asp) => (
                      <button
                        key={asp.id}
                        onClick={() => setAspectRatio(asp.id as any)}
                        className={`flex-1 py-2 text-[10px] font-bold rounded flex flex-col items-center justify-center gap-1 cursor-pointer transition-colors ${
                          aspectRatio === asp.id ? 'bg-red-600 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        <asp.icon className="w-3.5 h-3.5" />
                        <span>{asp.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* 2. Color Profile / Media Filters */}
                <div className="space-y-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Color Grade Filter</label>
                  <select
                    value={videoFilter}
                    onChange={(e) => setVideoFilter(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-200 focus:outline-none"
                  >
                    <option value="cinematic">Cinematic Anchor Flare (Blue Ambient)</option>
                    <option value="warm-tv">Classic Warm Evening Broadcast</option>
                    <option value="retro-mono">1970s Monochrome Retro Feed</option>
                    <option value="neon-cyber">Cybernetic Crimson Highlight</option>
                  </select>
                </div>
              </div>

              {/* Video Timeline Trimming Ranges mock */}
              <div className="bg-slate-900/50 p-4 rounded-xl border border-slate-850 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Vidio Segment Trim (sec)</span>
                  <span className="text-[10px] font-mono text-slate-100 bg-red-600/20 text-red-500 border border-red-500/20 px-2 py-0.5 rounded">{trimStart}s - {trimEnd}s</span>
                </div>
                
                {/* Timeline Range Track simulating edit trimmer */}
                <div className="relative h-6 bg-slate-950 rounded flex items-center overflow-hidden border border-slate-800 px-1">
                  <div className="absolute inset-y-0 bg-red-600/20 border-l border-r border-red-500" style={{ left: '15%', right: '25%' }} />
                  <span className="absolute left-[20%] text-[8px] font-mono text-red-400 font-bold">ACTIVE REGION</span>
                  <div className="w-full flex justify-between absolute px-1.5 pointer-events-none text-[8px] text-slate-600 font-mono">
                    <span>0:00</span>
                    <span>0:05</span>
                    <span>0:10</span>
                    <span>0:15</span>
                    <span>0:20</span>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <span className="text-[9px] text-slate-500 block">Trim Start Mark</span>
                    <input type="range" min="0" max="9" value={trimStart} onChange={(e) => setTrimStart(Number(e.target.value))} className="w-full accent-red-600" />
                  </div>
                  <div className="flex-1">
                    <span className="text-[9px] text-slate-500 block">Trim End Mark</span>
                    <input type="range" min="10" max="20" value={trimEnd} onChange={(e) => setTrimEnd(Number(e.target.value))} className="w-full accent-red-600" />
                  </div>
                </div>
              </div>

              {/* Subtitle Generator list & Text Overlay */}
              <div className="space-y-3">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Station Text Overlay Banner</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={overlayText}
                    onChange={(e) => setOverlayText(e.target.value)}
                    className="flex-1 bg-slate-900 border border-slate-800 rounded px-3 py-1.5 text-xs text-white"
                    placeholder="E.g., GNN NEWS - LIVE BROADCAST"
                  />
                  <input
                    type="color"
                    value={textColor}
                    onChange={(e) => setTextColor(e.target.value)}
                    className="w-10 h-8 rounded bg-transparent cursor-pointer"
                  />
                </div>
              </div>

              {/* Caption logs database section */}
              <div className="bg-slate-900/40 p-4 border border-slate-850 rounded-xl space-y-3">
                <div className="flex justify-between items-center text-[10px] font-mono">
                  <span className="text-slate-300 font-bold uppercase">Manual Subtitle Logs / SRT Captions</span>
                  <span className="text-slate-500">Live Interactive Database</span>
                </div>

                <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                  {captionList.map((c) => (
                    <div key={c.id} className="flex items-center justify-between p-2 bg-slate-950 border border-slate-900 rounded text-xs">
                      <div>
                        <span className="font-mono text-red-500 font-semibold border-r border-slate-800 pr-2 mr-2">{c.time}</span>
                        <span className="text-slate-300 font-sans">{c.text}</span>
                      </div>
                      <button onClick={() => handleRemoveCaption(c.id)} className="text-slate-600 hover:text-red-500 p-1">
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>

                {/* Adding manual Caption logs */}
                <div className="flex flex-col md:flex-row gap-2 pt-2 border-t border-slate-900">
                  <input
                    type="text"
                    value={newCaptionTime}
                    onChange={(e) => setNewCaptionTime(e.target.value)}
                    className="w-full md:w-1/4 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300"
                    placeholder="Time (00:00 - 00:00)"
                  />
                  <input
                    type="text"
                    value={newCaptionText}
                    onChange={(e) => setNewCaptionText(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300"
                    placeholder="বাংলা বা ইংরেজি সাবটাইটেল টেক্সট..."
                  />
                  <button
                    onClick={handleAddCaption}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold text-xs px-3 py-1.5 rounded cursor-pointer shrink-0 flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* 2. INTERFACE SCREEN */}
          {/* ======================================= */}
          {currentSection === 'interface' && (
            <div className="space-y-4">
              <div className="border-b border-slate-900 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                  <Eye className="w-4 h-4 text-orange-500" />
                  Broadcast Layout Interface Options
                </h3>
                <p className="text-xs text-slate-400 mt-1">Monitor split-screen parameters, teleprompter scroll speed, and audio levels.</p>
              </div>

              {/* Interactive Audio Mixer Levels */}
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 space-y-4">
                <div>
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold tracking-wider block">Sound Decibel (Volume) Controller</span>
                  <div className="flex items-center space-x-3 mt-1.5">
                    <Volume2 className="w-4 h-4 text-slate-400" />
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={volume} 
                      onChange={(e) => setVolume(Number(e.target.value))} 
                      className="flex-1 accent-red-600 h-1 bg-slate-950 rounded-lg cursor-pointer"
                    />
                    <span className="text-[11px] font-mono text-slate-100 font-bold bg-slate-950 px-2 py-0.5 rounded">{volume}%</span>
                  </div>
                </div>

                {/* EQ Audio levels animation visualizer */}
                <div>
                  <span className="text-[10px] font-mono text-slate-500 block uppercase font-bold tracking-wider mb-2">Live Graphic Equalizer Feed</span>
                  <div className="h-14 bg-slate-950 rounded-lg flex items-end justify-between px-6 py-2 border border-slate-900">
                    {eqLevels.map((lvl, index) => (
                      <div 
                        key={index} 
                        className="w-2.5 bg-gradient-to-t from-red-600 to-orange-400 rounded-sm transition-all" 
                        style={{ height: `${lvl}%` }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Green Screen Chroma Key Controls */}
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 space-y-3">
                <div>
                  <h4 className="text-xs font-bold text-white uppercase font-mono tracking-wider">Chroma Key Green Screen Matrix</h4>
                  <p className="text-[10px] text-slate-500">Enable clean alpha key background removal for custom animated news studio decor plates.</p>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-[9px] text-slate-400 block font-bold mb-1">Key Color Range</span>
                    <div className="flex gap-2">
                      <input 
                        type="color" 
                        value={chromaKeyColor} 
                        onChange={(e) => setChromaKeyColor(e.target.value)} 
                        className="w-8 h-8 rounded border-none bg-transparent cursor-pointer"
                      />
                      <span className="text-[10px] text-slate-300 font-mono bg-slate-950 px-2 py-1 rounded border border-slate-900 self-center">{chromaKeyColor}</span>
                    </div>
                  </div>

                  <div>
                    <span className="text-[9px] text-slate-400 block font-bold mb-1">Tolerance Threshold</span>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      value={chromaTolerance} 
                      onChange={(e) => setChromaTolerance(Number(e.target.value))} 
                      className="w-full accent-orange-500" 
                    />
                    <div className="text-[9px] text-slate-500 flex justify-between">
                      <span>Low Match</span>
                      <span className="text-orange-400 font-bold">{chromaTolerance}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Teleprompt Board */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-400 uppercase font-bold">Broadcast Prompt Speed</span>
                  <span className="text-[10px] text-slate-100 bg-orange-600/20 text-orange-400 border border-orange-500/20 px-2.5 py-0.5 rounded font-mono">{teleprompterSpeed}x Rate</span>
                </div>
                <input 
                  type="range" 
                  min="1" 
                  max="10" 
                  value={teleprompterSpeed} 
                  onChange={(e) => setTeleprompterSpeed(Number(e.target.value))} 
                  className="w-full accent-orange-500 cursor-pointer" 
                />
                
                <textarea
                  value={teleprompterText}
                  onChange={(e) => setTeleprompterText(e.target.value)}
                  rows={2}
                  className="w-full bg-slate-950 border border-slate-850 rounded p-2.5 text-xs text-slate-300 outline-none font-sans leading-relaxed"
                />
              </div>
            </div>
          )}

          {/* ======================================= */}
          {/* 3. AUTO UPLOAD */}
          {/* ======================================= */}
          {currentSection === 'upload' && (
            <div className="space-y-4">
              <div className="border-b border-slate-900 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                  <Upload className="w-4 h-4 text-blue-500" />
                  Social Platform Auto-Upload System
                </h3>
                <p className="text-xs text-slate-400 mt-1">Synchronize uploads to major APIs. Schedule automated posts with smart titles & tag loops.</p>
              </div>

              {/* Platforms toggle widgets */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Target Broadcast Profiles</span>
                <div className="grid grid-cols-5 gap-2">
                  {[
                    { id: 'youtube', name: 'YouTube', color: 'bg-red-650' },
                    { id: 'tiktok', name: 'TikTok', color: 'bg-slate-950 border border-slate-850' },
                    { id: 'instagram', name: 'Instagram', color: 'bg-purple-800' },
                    { id: 'facebook', name: 'Facebook', color: 'bg-blue-600' },
                    { id: 'twitter', name: 'Twitter / X', color: 'bg-indigo-650' },
                  ].map((plat) => {
                    const active = (targetPlatforms as any)[plat.id];
                    return (
                      <button
                        key={plat.id}
                        onClick={() => setTargetPlatforms(prev => ({ ...prev, [plat.id]: !active }))}
                        className={`p-2.5 rounded-lg text-[10px] font-bold font-sans cursor-pointer transition-all ${
                          active 
                            ? `${plat.color} text-white shadow` 
                            : 'bg-slate-900/60 text-slate-500 border border-slate-900 hover:border-slate-800'
                        }`}
                      >
                        {plat.name}
                        <span className="block text-[8px] font-mono mt-0.5">{active ? '✓ READY' : 'OFF'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Automatic description generators */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Smart Caption & Description Templates</label>
                  <textarea
                    value={autoDescription}
                    onChange={(e) => setAutoDescription(e.target.value)}
                    rows={2}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2.5 text-xs text-slate-200 focus:border-blue-500 outline-none"
                    placeholder="Main caption..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Automation Hashtags</label>
                  <input
                    type="text"
                    value={postTags}
                    onChange={(e) => setPostTags(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-300 focus:outline-none"
                  />
                </div>
              </div>

              {/* Scheduler timings interface */}
              <div className="p-3 bg-slate-900/50 border border-slate-850 rounded-lg flex items-center justify-between gap-4">
                <div className="flex-1">
                  <span className="text-[9px] text-slate-500 block font-mono font-bold uppercase">Schedule Campaign Date</span>
                  <input 
                    type="date" 
                    value={scheduledDate} 
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-xs text-slate-300 rounded p-1" 
                  />
                </div>
                <div className="flex-1">
                  <span className="text-[9px] text-slate-500 block font-mono font-bold uppercase">Target Peak Hour</span>
                  <input 
                    type="time" 
                    value={scheduledTime} 
                    onChange={(e) => setScheduledTime(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 text-xs text-slate-300 rounded p-1" 
                  />
                </div>
              </div>

              {/* Interactive execution console */}
              <div className="bg-slate-950 border border-slate-900 rounded-lg p-3 space-y-2">
                <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                  <span>SYSTEM BROADCAST AUTOMATION NODE LOGS</span>
                  <span>SSL v3 Encrypted Connection</span>
                </div>
                <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                  {uploadLogs.map((log, index) => (
                    <div key={index} className="text-[10px] font-mono text-slate-400">
                      ➤ {log}
                    </div>
                  ))}
                </div>

                {uploading ? (
                  <div className="space-y-1 pt-2 border-t border-slate-900">
                    <div className="flex justify-between text-[10px] font-mono">
                      <span className="text-blue-400 animate-pulse">Uploading Media Buffer Stream...</span>
                      <span className="text-white font-bold">{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                      <div className="bg-blue-500 h-full transition-all" style={{ width: `${uploadProgress}%` }} />
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={triggerAutoUpload}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold font-sans py-2 rounded-lg cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <Share2 className="w-4 h-4" />
                    <span>Trigger Active Instant Auto-Upload</span>
                  </button>
                )}
              </div>

              {/* CLOUD STORAGE AUTO-BACKUP CONFIGURATION SECTION */}
              <div className="border-t border-slate-900 pt-4 mt-6 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-bold text-white flex items-center gap-2 font-sans">
                      <Cloud className="w-4 h-4 text-sky-400" />
                      Cloud Storage Backup & Archiving
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-0.5">Configure cloud storage credentials to automate backups after rendering.</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">Automate Backups</span>
                    <input
                      type="checkbox"
                      checked={cloudBackupEnabled}
                      onChange={(e) => setCloudBackupEnabled(e.target.checked)}
                      className="w-4 h-4 accent-sky-500 rounded cursor-pointer"
                    />
                  </div>
                </div>

                {cloudBackupEnabled && (
                  <div className="space-y-4 animate-fadeIn">
                    {/* Provider Select Tabs */}
                    <div className="flex space-x-1 p-1 bg-slate-900 rounded-lg">
                      {[
                        { id: 'gdrive', label: 'Google Drive', color: 'text-yellow-400' },
                        { id: 's3', label: 'Amazon S3', color: 'text-amber-500' },
                        { id: 'dropbox', label: 'Dropbox', color: 'text-blue-400' },
                      ].map((prov) => (
                        <button
                          key={prov.id}
                          type="button"
                          onClick={() => setCloudBackupProvider(prov.id as any)}
                          className={`flex-1 py-2 text-xs font-semibold rounded flex items-center justify-center gap-1.5 cursor-pointer transition-colors ${
                            cloudBackupProvider === prov.id 
                              ? 'bg-sky-600/20 text-sky-450 border border-sky-500/30 font-bold' 
                              : 'text-slate-400 hover:text-white hover:bg-slate-850'
                          }`}
                        >
                          <Database className={`w-3.5 h-3.5 ${prov.color}`} />
                          <span>{prov.label}</span>
                        </button>
                      ))}
                    </div>

                    {/* Dynamic Provider Input Fields */}
                    {cloudBackupProvider === 'gdrive' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-900/20 p-3 rounded-xl border border-slate-850">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Google Drive Folder</label>
                          <input
                            type="text"
                            value={gdriveFolder}
                            onChange={(e) => setGdriveFolder(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-sky-500"
                            placeholder="e.g. My_Backups"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">OAuth Client ID</label>
                          <input
                            type="text"
                            value={gdriveClientId}
                            onChange={(e) => setGdriveClientId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300 font-mono outline-none focus:border-sky-500"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">API Key or Auth Token</label>
                          <div className="relative">
                            <input
                              type="password"
                              value={gdriveApiKey}
                              onChange={(e) => setGdriveApiKey(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300 font-mono outline-none focus:border-sky-500 pr-8"
                            />
                            <Key className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5" />
                          </div>
                        </div>
                      </div>
                    )}

                    {cloudBackupProvider === 's3' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-900/20 p-3 rounded-xl border border-slate-850">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">S3 Bucket Name</label>
                          <input
                            type="text"
                            value={s3BucketName}
                            onChange={(e) => setS3BucketName(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-sky-500"
                            placeholder="e.g. my-s3-bucket"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">AWS Region</label>
                          <select
                            value={s3Region}
                            onChange={(e) => setS3Region(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300 outline-none focus:border-sky-500"
                          >
                            <option value="us-east-1">US East (N. Virginia)</option>
                            <option value="us-west-2">US West (Oregon)</option>
                            <option value="ap-southeast-1">Asia Pacific (Singapore)</option>
                            <option value="eu-west-1">Europe (Ireland)</option>
                          </select>
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">AWS Access Key ID</label>
                          <input
                            type="text"
                            value={s3AccessKeyId}
                            onChange={(e) => setS3AccessKeyId(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300 font-mono outline-none focus:border-sky-500"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">AWS Secret Access Key</label>
                          <div className="relative">
                            <input
                              type="password"
                              value={s3SecretAccessKey}
                              onChange={(e) => setS3SecretAccessKey(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300 font-mono outline-none focus:border-sky-500 pr-8"
                            />
                            <Key className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5" />
                          </div>
                        </div>
                      </div>
                    )}

                    {cloudBackupProvider === 'dropbox' && (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-slate-900/20 p-3 rounded-xl border border-slate-850">
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">Dropbox Target Path</label>
                          <input
                            type="text"
                            value={dropboxPath}
                            onChange={(e) => setDropboxPath(e.target.value)}
                            className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-white outline-none focus:border-sky-500"
                            placeholder="e.g. /My_Dropbox_Backups"
                          />
                        </div>
                        <div className="space-y-1">
                          <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">App Access Token</label>
                          <div className="relative">
                            <input
                              type="password"
                              value={dropboxToken}
                              onChange={(e) => setDropboxToken(e.target.value)}
                              className="w-full bg-slate-950 border border-slate-800 rounded p-2 text-xs text-slate-300 font-mono outline-none focus:border-sky-500 pr-8"
                            />
                            <Key className="w-3.5 h-3.5 text-slate-500 absolute right-2.5 top-2.5" />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Test handshake and manual trigger */}
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          alert(`SSL handshake success! Verified link with ${
                            cloudBackupProvider === 'gdrive' ? 'Google Drive Folder "' + gdriveFolder + '"' : 
                            cloudBackupProvider === 's3' ? 'AWS S3 Bucket "' + s3BucketName + '"' : 
                            'Dropbox path "' + dropboxPath + '"'
                          }. Credentials have been registered.`);
                          setBackupLogs(prev => [
                            ...prev,
                            `[${new Date().toLocaleTimeString()}] Manual Handshake check passed with provider: ${cloudBackupProvider.toUpperCase()}`
                          ]);
                        }}
                        className="flex-1 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 rounded-lg py-2 text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <RefreshCw className="w-3.5 h-3.5 text-sky-400 animate-spin-slow" />
                        <span>Test Handshake Connection</span>
                      </button>
                    </div>

                    {/* Console Output logs */}
                    <div className="bg-slate-950 border border-slate-900 rounded-lg p-3 space-y-2">
                      <div className="flex justify-between items-center text-[9px] font-mono text-slate-500">
                        <span>CLOUD STORAGE BACKUP LIVE CONSOLE</span>
                        <span>SSL Encryption Verified</span>
                      </div>
                      <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                        {backupLogs.map((log, index) => (
                          <div key={index} className="text-[10px] font-mono text-slate-400">
                            ➤ {log}
                          </div>
                        ))}
                      </div>

                      {backupStatus === 'backing_up' && (
                        <div className="space-y-1 pt-2 border-t border-slate-900">
                          <div className="flex justify-between text-[10px] font-mono">
                            <span className="text-sky-400 animate-pulse">Synchronizing multi-part binary stream...</span>
                            <span className="text-white font-bold">{backupProgress}%</span>
                          </div>
                          <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                            <div className="bg-sky-400 h-full transition-all" style={{ width: `${backupProgress}%` }} />
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* ======================================= */}
          {/* 4. LIVE STREAM */}
          {/* ======================================= */}
          {currentSection === 'stream' && (
            <div className="space-y-4">
              <div className="border-b border-slate-900 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                  <Radio className="w-4 h-4 text-emerald-500" />
                  Live Broadcast Multi-Stream Control Unit
                </h3>
                <p className="text-xs text-slate-400 mt-1">Configure RTMP parameters, stream keys, monitor video output, and simulated audience count feeds.</p>
              </div>

              {/* Interactive settings input */}
              <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-850">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Channel RTMP Endpoint Url</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={rtmpUrl}
                      onChange={(e) => setRtmpUrl(e.target.value)}
                      className="flex-1 bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-xs text-slate-200"
                    />
                    <span className="bg-slate-950 px-2 py-1.5 rounded border border-slate-800 text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                      <Wifi className="w-3.5 h-3.5" /> High Bandwidth
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Secure Broadcast Stream Key</label>
                  <input
                    type="password"
                    value={streamKey}
                    onChange={(e) => setStreamKey(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-100 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 pt-1">
                  <div>
                    <label className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Broadcast Resolution Quality</label>
                    <select
                      value={streamQuality}
                      onChange={(e) => setStreamQuality(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-1 rounded text-xs text-slate-300"
                    >
                      <option value="1080p_60fps">1080p Full HD (60 Frames)</option>
                      <option value="720p_30fps">720p Clean Output (30 Frames)</option>
                      <option value="4K_Ultra_Master">4K Ultra HDR Broadcast Model</option>
                    </select>
                  </div>

                  <div>
                    <label className="text-[9px] font-mono text-slate-500 block uppercase font-bold">Simulated Stream Latency</label>
                    <div className="text-xs text-slate-300 font-mono bg-slate-950 border border-slate-800 p-1.5 rounded text-center">
                      {streamLatency}
                    </div>
                  </div>
                </div>
              </div>

              {/* Streaming indicators & active feeds */}
              {isLive ? (
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-ping" />
                      STATION BROADCAST IS LIVE NOW
                    </span>
                    <button
                      onClick={startStreamBroadcast}
                      className="bg-red-600 hover:bg-red-700 text-white text-[10px] font-bold font-mono px-3 py-1 rounded cursor-pointer"
                    >
                      STOP STREAM
                    </button>
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-950 p-2 rounded border border-slate-900 text-center">
                      <span className="block text-[8px] uppercase font-mono text-slate-500">Active Viewers</span>
                      <span className="text-sm font-semibold font-mono text-white">{(subscribersCount).toLocaleString()}</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-900 text-center">
                      <span className="block text-[8px] uppercase font-mono text-slate-500">Live Reactions</span>
                      <span className="text-sm font-semibold font-mono text-white">{(likesCount).toLocaleString()} ❤️</span>
                    </div>
                    <div className="bg-slate-950 p-2 rounded border border-slate-900 text-center">
                      <span className="block text-[8px] uppercase font-mono text-slate-500">Video Bandwidth</span>
                      <span className="text-sm font-semibold font-mono text-white">{(streamStats.kbps / 1000).toFixed(1)} Mbps</span>
                    </div>
                  </div>

                  {/* Streaming simulation logs */}
                  <div className="bg-slate-950 p-2.5 rounded text-[10px] font-mono text-emerald-500/80 space-y-1">
                    <p>✔ Audio encoder status: pristine AAC quality</p>
                    <p>✔ Video stream frame stability: {streamStats.fps} fps solid</p>
                  </div>
                </div>
              ) : (
                <button
                  onClick={startStreamBroadcast}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold py-3 rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <Radio className="w-4 h-4 animate-pulse" />
                  <span>Connect Stream Server & Go Live Now</span>
                </button>
              )}

            </div>
          )}

          {/* ======================================= */}
          {/* 5. EXPORT RENDERS */}
          {/* ======================================= */}
          {currentSection === 'export' && (
            <div className="space-y-4">
              <div className="border-b border-slate-900 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                  <Download className="w-4 h-4 text-purple-500" />
                  Render & Media Export engine
                </h3>
                <p className="text-xs text-slate-400 mt-1">Compile overlay banners, subtitle files, and audio layers directly into a download-safe MP4/MOV container.</p>
              </div>

              {/* Form parameters */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Output Container Format</span>
                  <select
                    value={exportFormat}
                    onChange={(e) => setExportFormat(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="mp4">MP4 Broadcast Stream (H.264 Audio/Video)</option>
                    <option value="webm">WebM Fast Online Streamer</option>
                    <option value="avi">Uncompressed AVI Archive Master</option>
                    <option value="wav">WAV Linear PCM Audio only</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Output Resolution Aspect</span>
                  <select
                    value={exportRes}
                    onChange={(e) => setExportRes(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded p-2 text-xs text-slate-300 focus:outline-none"
                  >
                    <option value="1080p">1080p HD Master Presentation</option>
                    <option value="720p">720p Standard Streaming Grade</option>
                    <option value="4K">4K Cinematic Broadcaster High Bitrate</option>
                  </select>
                </div>
              </div>

              {/* Toggles */}
              <div className="space-y-2 bg-slate-900/40 p-4 rounded-xl border border-slate-850">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-200 block font-bold">Hardcode / Burn Bengali Subtitles</span>
                    <span className="text-[10px] text-slate-500">Render SRT lines directly on top of video frames.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={burnSubtitles}
                    onChange={(e) => setBurnSubtitles(e.target.checked)}
                    className="w-4 h-4 accent-purple-650 rounded cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-950">
                  <div>
                    <span className="text-xs text-slate-200 block font-bold">Dynamic Metadata Compression</span>
                    <span className="text-[10px] text-slate-500 font-sans">Minify container footprint to expedite platform upload buffers.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={compressVideo}
                    onChange={(e) => setCompressVideo(e.target.checked)}
                    className="w-4 h-4 accent-purple-650 rounded cursor-pointer"
                  />
                </div>
              </div>

              {/* Active exporter */}
              {exporting ? (
                <div className="space-y-1.5 p-4 bg-slate-900 border border-purple-500/20 rounded-xl">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="text-purple-400 font-bold animate-pulse">Rendering Video Vectors: Burning Subtitles...</span>
                    <span className="text-white font-bold">{exportProgress}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                    <div className="bg-purple-600 h-full transition-all" style={{ width: `${exportProgress}%` }} />
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <button
                    onClick={handleExportRender}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 text-xs rounded-xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
                  >
                    <Download className="w-4 h-4" />
                    <span>Compile Video & Export to Media Repository</span>
                  </button>

                  {exportSuccessUrl && (
                    <div className="bg-emerald-950/20 p-4 border border-emerald-500/30 rounded-xl flex flex-col md:flex-row justify-between items-center gap-3">
                      <div>
                        <span className="text-xs text-emerald-400 font-semibold block">✓ Compiled Master File Active</span>
                        <p className="text-[10px] text-slate-400 font-mono">Output: GNN_Render_HD_{exportRes}.{exportFormat}</p>
                      </div>
                      <a
                        href={exportSuccessUrl}
                        download={`GNN_Manual_Edit_Video.${exportFormat}`}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer flex items-center gap-1.5"
                      >
                        <Download className="w-3.5 h-3.5" /> Download File
                      </a>
                    </div>
                  )}
                </div>
              )}

            </div>
          )}

          {/* ======================================= */}
          {/* 6. SETTINGS */}
          {/* ======================================= */}
          {currentSection === 'settings' && (
            <div className="space-y-4">
              <div className="border-b border-slate-900 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-1.5 font-sans">
                  <Settings className="w-4 h-4 text-slate-400" />
                  GNN Studio Manual Overrides & APIs
                </h3>
                <p className="text-xs text-slate-400 mt-1">Configure secure API keys, default subtitle languages, watermarks, & local parameters.</p>
              </div>

              {/* Secure parameters credentials */}
              <div className="space-y-3 bg-slate-900/50 p-4 rounded-xl border border-slate-850">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">YouTube Platform Integration API Key</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={apiKeyYoutube}
                      onChange={(e) => setApiKeyYoutube(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-100 font-mono"
                    />
                    <Key className="w-3.5 h-3.5 text-slate-600 absolute right-2.5 top-2.5" />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">TikTok Creator OAuth API Secret</label>
                  <div className="relative">
                    <input
                      type="password"
                      value={apiKeyTiktok}
                      onChange={(e) => setApiKeyTiktok(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-xs text-slate-100 font-mono"
                    />
                    <Key className="w-3.5 h-3.5 text-slate-600 absolute right-2.5 top-2.5" />
                  </div>
                </div>
              </div>

              {/* Station Watermarking overlay */}
              <div className="bg-slate-900/40 p-4 rounded-xl border border-slate-850 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-xs text-slate-200 block font-bold">Watermark Security Overlay</span>
                    <span className="text-[10px] text-slate-550">Stamp station logo dynamically onto raw exported images and video anchors.</span>
                  </div>
                  <input
                    type="checkbox"
                    checked={watermarkEnabled}
                    onChange={(e) => setWatermarkEnabled(e.target.checked)}
                    className="w-4 h-4 accent-red-600 rounded cursor-pointer"
                  />
                </div>

                {watermarkEnabled && (
                  <div className="space-y-1">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Watermark Title text</span>
                    <input
                      type="text"
                      value={watermarkText}
                      onChange={(e) => setWatermarkText(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 p-1.5 rounded text-xs text-slate-305 focus:outline-none"
                    />
                  </div>
                )}
              </div>

              {/* Translation target defaults */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 block uppercase font-bold">Default Subtitle Target Language</span>
                  <select
                    value={translationLanguage}
                    onChange={(e) => setTranslationLanguage(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 p-1.5 rounded text-xs text-slate-300"
                  >
                    <option value="English">English</option>
                    <option value="Bangla">Bengali (বাংলা)</option>
                    <option value="Hindi">Hindi (हिंदी)</option>
                    <option value="Spanish">Spanish (Español)</option>
                  </select>
                </div>

                <div className="space-y-1.5 self-center">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={saveLocalCopy}
                      onChange={(e) => setSaveLocalCopy(e.target.checked)}
                      className="w-4 h-4 accent-red-650 rounded cursor-pointer"
                    />
                    <span className="text-xs text-slate-300 font-bold">Save raw buffers locally</span>
                  </div>
                  <span className="text-[9px] text-slate-500 block ml-6">Retains historical logs inside your client Cache.</span>
                </div>
              </div>

              <button
                onClick={() => alert('Station Settings saved successfully.')}
                className="w-full bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 rounded-xl py-2.5 text-xs font-bold font-sans cursor-pointer transition-colors"
              >
                Store Configurations & Refresh Station Node
              </button>

            </div>
          )}

        </div>

        {/* Right Hand Side: Premium Virtual Live Broadcast Interface Screen Display */}
        <div id="station-interface-render" className="lg:col-span-5 bg-slate-950 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between min-h-[500px]">
          
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-900 pb-2">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-widest font-bold">
                {currentSection === 'stream' ? 'Stream Monitor (ব্রডকাস্ট)' : 'Interactive Preview monitor'}
              </span>
              <div className="flex items-center space-x-1.5">
                {isLive ? (
                  <span className="text-[9px] font-mono bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded flex items-center gap-1 animate-pulse">
                    <span className="w-1 h-1 rounded-full bg-emerald-400" /> ON-AIR
                  </span>
                ) : (
                  <span className="text-[9px] font-mono bg-red-600/10 border border-red-500/20 text-red-500 px-2 py-0.5 rounded">
                    OFFLINE
                  </span>
                )}
                <span className="text-[9px] font-mono text-slate-500 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded uppercase">LIVE</span>
              </div>
            </div>

            {/* Video screen rendering frame */}
            <div className="relative aspect-[16/9] w-full bg-slate-900 rounded-xl overflow-hidden border border-slate-850 flex items-center justify-center">
              
              {/* Simulated active video loops with real media */}
              <video
                src="https://assets.mixkit.co/videos/preview/mixkit-news-anchor-on-chroma-key-studio-41551-large.mp4"
                autoPlay={isPlaying}
                loop
                muted={isMuted}
                className={`w-full h-full object-cover rounded-lg absolute inset-0 ${
                  videoFilter === 'retro-mono' ? 'grayscale' : 
                  videoFilter === 'warm-tv' ? 'sepia hue-rotate-15 contrast-125' : 
                  videoFilter === 'neon-cyber' ? 'saturate-200 hue-rotate-90' : 'brightness-110'
                }`}
              />

              {/* Station Watermark Stamp overlay */}
              {watermarkEnabled && (
                <div className="absolute top-3 left-3 bg-red-650/80 border border-red-500/30 text-[9px] text-white font-bold px-2 py-0.5 rounded font-mono shadow">
                  ★ {watermarkText}
                </div>
              )}

              {/* Headline lower third banner overlay */}
              <div className="absolute bottom-3 inset-x-3 bg-gradient-to-t from-slate-950 to-slate-900/60 border border-slate-800/80 p-2 rounded-lg flex items-center gap-2 shadow-2xl backdrop-blur-sm">
                <div className="bg-red-600 uppercase text-[9px] font-bold text-white px-2 py-1 rounded tracking-wider animate-pulse font-mono flex items-center gap-1">
                  🔴 GNN BREAKING
                </div>
                <div className="flex-1 min-w-0">
                  <span className="block text-[8px] font-mono uppercase text-red-500 font-bold tracking-widest">{aspectRatio} CANVAS FRAME</span>
                  <span className="block text-[10px] font-sans font-bold text-slate-150 truncate" style={{ color: textColor }}>
                    {overlayText}
                  </span>
                </div>
              </div>

              {/* Burning Subtitles SRT directly on frame */}
              {burnSubtitles && subtitlesText && (
                <div className="absolute bottom-16 inset-x-6 text-center select-none pointer-events-none">
                  <span className="bg-slate-950/85 text-white font-sans text-xs px-2.5 py-1 rounded border border-slate-850/50 shadow-lg leading-relaxed">
                    [বাংলা সাবটাইটেল] {subtitlesText}
                  </span>
                </div>
              )}

              {/* Absolute coordinates for UI status */}
              <div className="absolute top-3 right-3 bg-slate-950/80 border border-slate-800 text-[8px] text-slate-400 font-mono px-2 py-1 rounded">
                RES: {exportRes} | COMP: {compressVideo ? 'YES' : 'NO'}
              </div>
            </div>

            {/* Video Controls under screen */}
            <div className="flex justify-between items-center bg-slate-900/40 border border-slate-850 p-2.5 rounded-xl">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-300 hover:text-white cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 text-orange-400" /> : <Play className="w-4 h-4 text-emerald-400" />}
              </button>

              <div className="flex items-center space-x-1.5 text-xs text-slate-400">
                <Monitor className="w-3.5 h-3.5 text-slate-500" />
                <span className="font-mono text-[10px] text-slate-350">{currentTime} / 0:15</span>
              </div>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="bg-slate-950 hover:bg-slate-900 border border-slate-800 p-2 rounded-lg text-slate-300 hover:text-white cursor-pointer"
              >
                <Volume2 className={`w-4 h-4 ${isMuted ? 'text-red-500 line-through' : 'text-slate-300'}`} />
              </button>
            </div>

            {/* Simulated Live Audience interactions in real-time chat */}
            {currentSection === 'stream' && (
              <div className="space-y-2 bg-slate-900/40 p-3.5 rounded-xl border border-slate-850 text-slate-205">
                <span className="text-[10px] font-mono text-slate-400 uppercase font-bold block">Simulated Viewers Feed Live Chat</span>
                <div className="space-y-1.5 max-h-32 overflow-y-auto pr-1">
                  {chatMessages.map((msg, idx) => (
                    <div key={idx} className="text-xs bg-slate-950 p-2 rounded border border-slate-900">
                      <span className="font-mono text-emerald-400 pr-1.5">{msg.user}:</span>
                      <span className="text-slate-300">{msg.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center text-[9px] font-mono text-slate-500">
            <span>Powered by <strong className="text-red-500">GNN TV Engine v2.4</strong></span>
            <span>Local Time: {new Date().toLocaleTimeString()}</span>
          </div>

        </div>

      </div>
    </div>
  );
}
