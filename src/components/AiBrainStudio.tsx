import React, { useState, useEffect, useRef } from 'react';
import { 
  Brain, 
  Cpu, 
  Layers, 
  Tv, 
  Folder, 
  FolderPlus, 
  PlusCircle, 
  Mic, 
  Video, 
  Terminal, 
  CheckCircle, 
  RefreshCw, 
  Play, 
  Volume2, 
  Github, 
  Database, 
  FileCode, 
  Sliders, 
  Sparkles, 
  UserCheck, 
  Search, 
  Check, 
  HelpCircle, 
  FileText,
  AlertCircle,
  FolderOpen,
  Trash2,
  ChevronRight,
  Shield,
  Clock,
  ExternalLink,
  Zap,
  Radio
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface Channel {
  id: string;
  name: string;
  language: string;
  logoColor: string;
  platforms: string[];
  plugins: string[];
  voiceModel: string;
  presenter: string;
  activeFeed: string;
}

interface FileItem {
  name: string;
  size: string;
  date: string;
  type: string;
}

export default function AiBrainStudio() {
  // Active internal sections
  const [activeChannelId, setActiveChannelId] = useState<string>('gnn-global');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedFolder, setSelectedFolder] = useState<string>('model');
  const [isRecordingVoice, setIsRecordingVoice] = useState<boolean>(false);
  const [recordingSeconds, setRecordingSeconds] = useState<number>(0);
  const [voiceList, setVoiceList] = useState<string[]>(['Kahinur Rahman (Premium Bangla Male)', 'Tasnim Sultana (Neutral Bangla Female)', 'David Miller (Deep British Desk)', 'Sophia AI (Corporate English Female)']);
  const [newVoiceName, setNewVoiceName] = useState<string>('');
  
  // Presenter editor state
  const [presenterConfig, setPresenterConfig] = useState({
    face: 'Warm South-Asian',
    body: 'Anchored News Suit',
    hair: 'Classic Executive Trim',
    chromaKey: '#10b981', // Emerald green chroma
    background: 'High-Tech Broadcast Desk',
    scale: 100,
    voice: 'Kahinur Rahman (Premium Bangla Male)'
  });

  // Render video preview state
  const [isRenderingVideo, setIsRenderingVideo] = useState<boolean>(false);
  const [renderProgress, setRenderProgress] = useState<number>(0);
  const [renderLogs, setRenderLogs] = useState<string[]>([]);
  const [renderedPreviewUrl, setRenderedPreviewUrl] = useState<string | null>(null);

  // Channels state
  const [channels, setChannels] = useState<Channel[]>([
    {
      id: 'gnn-global',
      name: 'GNN TV (Global News Network)',
      language: 'English',
      logoColor: 'from-red-600 to-amber-500',
      platforms: ['YouTube Live', 'Facebook Live', 'TikTok', 'X Broadcast'],
      plugins: ['SEO Engine v3.1', 'Multi-LLM News Summarizer', 'Ocoya Scheduler', 'Auto-Captions'],
      voiceModel: 'David Miller (Deep British Desk)',
      presenter: 'David Miller (Male suit)',
      activeFeed: 'Science & Fusion Thermal Containment'
    },
    {
      id: 'tnews-bangla',
      name: 'Tnews Bangla (বাংলাদেশ নিউজ)',
      language: 'Bangla',
      logoColor: 'from-emerald-600 to-green-400',
      platforms: ['YouTube Live', 'Facebook Live', 'GNN Portal'],
      plugins: ['Bangla Translation Engine', 'National News Scraper', 'Local SEO Optimizer'],
      voiceModel: 'Kahinur Rahman (Premium Bangla Male)',
      presenter: 'Kahinur Rahman (Standard)',
      activeFeed: 'GNN বাংলা স্টুডিও সরাসরি সম্প্রচার'
    },
    {
      id: 'channel-a1',
      name: 'Channel A1 Broadcast',
      language: 'English / Bangla Hybrid',
      logoColor: 'from-blue-600 to-cyan-400',
      platforms: ['TikTok Shorts', 'Instagram Reels'],
      plugins: ['Vertical layout generator', 'Fast Vocal pitch auto-tune'],
      voiceModel: 'Tasnim Sultana (Neutral Bangla Female)',
      presenter: 'Tasnim Sultana (Corporate)',
      activeFeed: 'Mobile Anchor Intro'
    }
  ]);

  // Folder and files data model
  const [folders, setFolders] = useState<Record<string, FileItem[]>>({
    'model': [
      { name: 'Presenter_Kahinur_Rig.obj', size: '42.4 MB', date: '2026-07-15', type: 'model' },
      { name: 'Presenter_Tasnim_Corporate.obj', size: '38.1 MB', date: '2026-07-17', type: 'model' },
      { name: 'Studio_Backdrop_3D_Set.blend', size: '145.2 MB', date: '2026-07-10', type: 'model' },
    ],
    'voice-model': [
      { name: 'Bangla_Kahinur_Voice_Signature.vmodel', size: '4.2 MB', date: '2026-07-14', type: 'voice' },
      { name: 'English_David_Broadcaster_v2.vmodel', size: '3.8 MB', date: '2026-07-15', type: 'voice' },
      { name: 'Tasnim_Soft_Pitch_Anchor.vmodel', size: '5.1 MB', date: '2026-07-18', type: 'voice' },
    ],
    'video-model': [
      { name: 'GNN_News_Intro_Loop_Landscape.mp4', size: '3.4 MB', date: '2026-06-19', type: 'video' },
      { name: 'Mobile_Anchor_Intro_Portrait.mp4', size: '2.9 MB', date: '2026-06-19', type: 'video' },
      { name: '3D_Cartoon_Anchor_Draft_H264.mp4', size: '8.7 MB', date: '2026-07-19', type: 'video' },
    ],
    'create-model': [
      { name: 'Cartoon_Kid_Aesthetic.obj', size: '12.4 MB', date: '2026-07-11', type: 'creative' },
      { name: 'Bangla_Natok_Traditional_Room.fbx', size: '64.5 MB', date: '2026-07-12', type: 'creative' },
    ],
    'news presenter model': [
      { name: 'Avatar_Male_Suit_FullRig.fbx', size: '52.1 MB', date: '2026-07-09', type: 'avatar' },
      { name: 'Avatar_Female_Traditional_Saree.fbx', size: '58.4 MB', date: '2026-07-13', type: 'avatar' },
    ],
    'customize model': [
      { name: 'Custom_GNN_Chroma_Template.json', size: '12 KB', date: '2026-07-18', type: 'config' },
      { name: 'Chroma_Rig_Hair_Adjustment_Preset.json', size: '8 KB', date: '2026-07-19', type: 'config' },
    ]
  });

  // Channel wizard modal
  const [showChannelWizard, setShowChannelWizard] = useState<boolean>(false);
  const [wizardName, setWizardName] = useState<string>('');
  const [wizardLang, setWizardLang] = useState<string>('Bangla');
  const [wizardColor, setWizardColor] = useState<string>('from-purple-650 to-pink-500');
  const [wizardPlatform, setWizardPlatform] = useState<string[]>(['Facebook Live']);
  const [wizardPlugins, setWizardPlugins] = useState<string[]>(['SEO Engine', 'Auto-Captions']);

  // Google Account integration state
  const [isGoogleConnected, setIsGoogleConnected] = useState<boolean>(true);
  const [allowedGoogleActions, setAllowedGoogleActions] = useState({
    drive: true,
    calendar: true,
    gmail: true,
    youtube: true
  });

  // SSH Key Generation state
  const [sshKey, setSshKey] = useState<string>('ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDQza5597369bb77a9197264... GNN-Studio-Agent@GNN-OS');
  const [isGeneratingSSH, setIsGeneratingSSH] = useState<boolean>(false);
  const [copiedSSH, setCopiedSSH] = useState<boolean>(false);

  // Auto-fix agent simulator logs
  const [autoFixLogs, setAutoFixLogs] = useState<string[]>([
    'Self-Repair Agent listening on telemetry stream...',
    'System status: 100% operational.',
    'No file errors or pipeline deadlocks identified.'
  ]);

  // Voice recording timer
  useEffect(() => {
    let interval: any;
    if (isRecordingVoice) {
      interval = setInterval(() => {
        setRecordingSeconds(prev => prev + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(interval);
  }, [isRecordingVoice]);

  // Self repair logs simulator
  useEffect(() => {
    const timer = setInterval(() => {
      const repairs = [
        'Checked file descriptor pooling: normal.',
        'Validated video compiler buffer cache: 0 bytes stale.',
        'Synchronized GNN vocal presets with server.ts endpoint.',
        'Cleaned temporary audio rendering buffers automatically.',
        'Verified Google Cloud Run container ingress latency: 12ms.',
        'MCP Sync healthcheck: 12/12 connections active.'
      ];
      const randomRepair = repairs[Math.floor(Math.random() * repairs.length)];
      setAutoFixLogs(prev => [...prev.slice(-8), `[Self-Fix] ${new Date().toLocaleTimeString()} - ${randomRepair}`]);
    }, 8000);
    return () => clearInterval(timer);
  }, []);

  const handleCreateChannel = () => {
    if (!wizardName.trim()) return;
    const newChan: Channel = {
      id: `channel-${Date.now()}`,
      name: wizardName,
      language: wizardLang,
      logoColor: wizardColor,
      platforms: wizardPlatform,
      plugins: wizardPlugins,
      voiceModel: 'Tasnim Sultana (Neutral Bangla Female)',
      presenter: 'Custom Avatar Rig v1',
      activeFeed: 'Awaiting first script schedule...'
    };
    setChannels(prev => [...prev, newChan]);
    setActiveChannelId(newChan.id);
    setShowChannelWizard(false);
    
    // Add success system log
    setAutoFixLogs(prev => [...prev, `[System-Init] Automatically spawned new broadcast channel "${wizardName}" with cloned GNN plugins & templates!`]);
    setWizardName('');
  };

  const handleGenerateSSH = () => {
    setIsGeneratingSSH(true);
    setTimeout(() => {
      setSshKey('ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDQza5597369bb77a9197264... GNN-Studio-Agent@GNN-OS');
      setIsGeneratingSSH(false);
      setAutoFixLogs(prev => [...prev, '[SSH] Generated new RSA 4096-bit secure keypair for GitHub MCP (GNN-Studio-Agent@GNN-OS).']);
    }, 1000);
  };

  const handleCopySSH = () => {
    navigator.clipboard.writeText(sshKey);
    setCopiedSSH(true);
    setTimeout(() => setCopiedSSH(false), 2500);
  };

  const handleVoiceRecordToggle = () => {
    if (isRecordingVoice) {
      // Stop recording and add to list
      if (newVoiceName.trim()) {
        const addedName = `${newVoiceName.trim()} (Custom Cloned Voice)`;
        setVoiceList(prev => [...prev, addedName]);
        // Add voice file to files list
        const updatedFiles = [...folders['voice-model'], {
          name: `${newVoiceName.replace(/\s+/g, '_')}_Signature.vmodel`,
          size: '1.4 MB',
          date: new Date().toISOString().split('T')[0],
          type: 'voice'
        }];
        setFolders(prev => ({ ...prev, 'voice-model': updatedFiles }));
        setAutoFixLogs(prev => [...prev, `[VoiceLab] Cloned voice signature for "${newVoiceName}" saved as active model.`]);
        setNewVoiceName('');
      } else {
        const num = Math.floor(Math.random() * 100);
        const addedName = `Voice Record #${num} (Custom Voice)`;
        setVoiceList(prev => [...prev, addedName]);
        const updatedFiles = [...folders['voice-model'], {
          name: `Voice_Record_${num}_Signature.vmodel`,
          size: '800 KB',
          date: new Date().toISOString().split('T')[0],
          type: 'voice'
        }];
        setFolders(prev => ({ ...prev, 'voice-model': updatedFiles }));
      }
      setIsRecordingVoice(false);
    } else {
      setIsRecordingVoice(true);
    }
  };

  const handleStartRender = () => {
    setIsRenderingVideo(true);
    setRenderProgress(0);
    setRenderLogs(['Initializing render pipeline...', 'Loading model: ' + presenterConfig.face, 'Loading outfit: ' + presenterConfig.body, 'Syncing voice actor: ' + presenterConfig.voice]);
    
    const logs = [
      'Applying Chroma Key backdrop plates...',
      'Setting virtual lighting layers...',
      'Synthesizing vocal patterns with AI text-to-sequence render...',
      'Encoding 3D face mesh expressions...',
      'Assembling H264 video stream containers...',
      'Injecting audio voice-over track...',
      'Render sequence 100% complete. final file layout generated.'
    ];

    let currentLogIdx = 0;
    const interval = setInterval(() => {
      setRenderProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsRenderingVideo(false);
          setRenderedPreviewUrl('https://assets.mixkit.co/videos/preview/mixkit-news-anchor-on-chroma-key-studio-41551-large.mp4');
          return 100;
        }
        
        // Randomly push logs
        if (prev % 15 === 0 && currentLogIdx < logs.length) {
          setRenderLogs(l => [...l, logs[currentLogIdx]]);
          currentLogIdx++;
        }

        return prev + 5;
      });
    }, 150);
  };

  // Filter folders / files based on search
  const getFilteredFiles = () => {
    const files = folders[selectedFolder] || [];
    if (!searchQuery.trim()) return files;
    return files.filter(f => f.name.toLowerCase().includes(searchQuery.toLowerCase()));
  };

  const currentChannel = channels.find(c => c.id === activeChannelId) || channels[0];

  return (
    <div className="space-y-6 text-slate-100 p-1">
      
      {/* Header and Quick Stats */}
      <div className="relative bg-gradient-to-br from-slate-900 via-slate-950 to-blue-950/20 border border-slate-800 rounded-2xl p-6 overflow-hidden shadow-2xl">
        <div className="absolute right-0 top-0 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute left-1/3 bottom-0 w-60 h-60 bg-red-500/5 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-red-500 uppercase">
              <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping" />
              <span>Layer 1-5 — GNN AI OS Engine Core</span>
            </div>
            <h2 className="text-3xl font-display font-black tracking-tight text-white flex items-center gap-2">
              <Brain className="w-9 h-9 text-red-500 animate-pulse" /> GNN Hyper AI Brain 🧠 STUDIO
            </h2>
            <p className="text-sm text-slate-400 max-w-2xl font-sans">
              Deploy fully autonomous TV News channels, clone and train voice-over signatures, design 3D live presenter models, and manage cross-platform publishing pipelines under Google & GitHub MCP telemetry.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-slate-950/80 border border-slate-800 px-4 py-3 rounded-xl backdrop-blur-md">
            <Cpu className="w-5 h-5 text-red-500 animate-spin-slow" />
            <div className="text-xs font-mono">
              <span className="block text-slate-500 text-[10px] uppercase">AI Brain Power</span>
              <span className="text-emerald-400 font-bold">14 Active Agents Online</span>
            </div>
          </div>
        </div>
      </div>

      {/* Grid containing Channel Management, Voice records, and Avatars */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Work for Channel Dashboard */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-850 rounded-xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div>
                <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <Tv className="w-4 h-4 text-red-500" /> Work For Channel
                </h3>
                <p className="text-[10px] text-slate-400 font-mono">Broadcast profile selection and setup</p>
              </div>
              <button 
                onClick={() => setShowChannelWizard(true)}
                className="flex items-center gap-1.5 text-xs text-red-400 hover:text-red-300 font-mono font-bold transition-all bg-red-500/10 border border-red-500/20 rounded-md px-2.5 py-1 cursor-pointer"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>Create Channel</span>
              </button>
            </div>

            {/* List of active channels */}
            <div className="space-y-3.5 max-h-[320px] overflow-y-auto pr-1">
              {channels.map((chan) => {
                const isActive = chan.id === activeChannelId;
                return (
                  <div 
                    key={chan.id}
                    onClick={() => {
                      setActiveChannelId(chan.id);
                      setAutoFixLogs(prev => [...prev, `[Channel] Active channel switched to "${chan.name}"`]);
                    }}
                    className={`relative p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col justify-between ${
                      isActive 
                        ? 'bg-gradient-to-br from-slate-900 to-slate-950 border-red-500/40 shadow-lg shadow-red-950/20' 
                        : 'bg-slate-950/45 border-slate-900/60 hover:border-slate-800 hover:bg-slate-950'
                    }`}
                  >
                    {isActive && (
                      <span className="absolute top-3.5 right-3.5 w-2 h-2 rounded-full bg-red-500 animate-ping" />
                    )}

                    <div className="flex items-start gap-2.5">
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${chan.logoColor} flex items-center justify-center text-xs text-white font-bold shrink-0`}>
                        {chan.name.substring(0, 2).toUpperCase()}
                      </div>
                      <div className="space-y-1">
                        <h4 className="text-xs font-bold text-slate-200 group-hover:text-red-400 transition-colors">
                          {chan.name}
                        </h4>
                        <span className="text-[10px] text-slate-400 block font-mono">Lang: <strong>{chan.language}</strong></span>
                      </div>
                    </div>

                    <div className="mt-2 pt-2 border-t border-slate-900 flex flex-wrap gap-1">
                      {chan.platforms.map((p, idx) => (
                        <span key={idx} className="text-[8px] font-mono bg-slate-900 border border-slate-850 text-slate-400 px-1.5 py-0.5 rounded">
                          {p}
                        </span>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Connected plugins of active channel */}
          <div className="bg-slate-950/70 border border-slate-900 rounded-xl p-3.5 mt-4 space-y-2">
            <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Active Channel Core Plugins</span>
            <div className="flex flex-wrap gap-1.5">
              {currentChannel.plugins.map((plugin, idx) => (
                <span key={idx} className="text-[10px] font-mono font-medium text-red-400 bg-red-500/5 border border-red-500/10 rounded px-2 py-0.5">
                  ⚙️ {plugin}
                </span>
              ))}
            </div>
            <div className="text-[9px] font-mono text-slate-500 pt-1 flex justify-between">
              <span>Active Anchor: <strong>{currentChannel.presenter}</strong></span>
              <span>Voice: <strong>{currentChannel.voiceModel.split(' ')[0]}</strong></span>
            </div>
          </div>
        </div>

        {/* Middle Column: Voice Model & Vocal Lab Customizer */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-850 rounded-xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Mic className="w-4 h-4 text-red-500 animate-pulse" /> Voice Model Customizer
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">Microphone recorder voice cloner engine</p>
            </div>

            <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-4 space-y-3.5">
              <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest">Clone a New Voice</label>
              
              <div className="space-y-2">
                <input 
                  type="text" 
                  placeholder="Enter Voice-Model Name (e.g. Kahinur Pro)"
                  value={newVoiceName}
                  onChange={(e) => setNewVoiceName(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-850 rounded-lg p-2 text-xs font-mono text-slate-200 focus:border-red-500 outline-none"
                />

                {/* Recorder Button panel */}
                <div className="flex items-center justify-between p-2 bg-slate-900/50 rounded-lg border border-slate-850">
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className={`w-2.5 h-2.5 rounded-full ${isRecordingVoice ? 'bg-red-500 animate-ping' : 'bg-slate-600'}`} />
                    <span>{isRecordingVoice ? `RECORDING: ${recordingSeconds}s` : 'READY TO VOICE CAPTURE'}</span>
                  </div>
                  <button 
                    onClick={handleVoiceRecordToggle}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      isRecordingVoice 
                        ? 'bg-red-500 hover:bg-red-650 text-white animate-pulse' 
                        : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {isRecordingVoice ? 'Stop & Save' : 'New Voice Record'}
                  </button>
                </div>
              </div>
            </div>

            {/* List of custom and standard trained voices */}
            <div className="space-y-2">
              <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block mb-1">Available Trained Voices</span>
              <div className="grid grid-cols-1 gap-1.5 max-h-[160px] overflow-y-auto pr-1">
                {voiceList.map((v, i) => (
                  <div 
                    key={i} 
                    onClick={() => {
                      setPresenterConfig(prev => ({ ...prev, voice: v }));
                      setAutoFixLogs(prev => [...prev, `[Vocal Lab] Selected "${v}" voice model for anchor synthesis.`]);
                    }}
                    className={`p-2.5 rounded-lg border text-xs font-mono flex items-center justify-between cursor-pointer transition-colors ${
                      presenterConfig.voice === v 
                        ? 'bg-red-500/5 border-red-500/30 text-red-300' 
                        : 'bg-slate-950/60 border-slate-900/60 text-slate-300 hover:border-slate-800'
                    }`}
                  >
                    <span className="truncate">{v}</span>
                    <Volume2 className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="bg-slate-950/80 border border-slate-900 rounded-xl p-3 text-[10px] font-mono text-slate-500 leading-normal">
            ⚡ <strong>Vocal Hybridization</strong>: Combines custom voice records with Bengali or English TTS models to generate rich broadcast-ready packages automatically.
          </div>
        </div>

        {/* Right Column: News Presenter Rig Model */}
        <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-850 rounded-xl p-5 shadow-lg space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="border-b border-slate-800 pb-3">
              <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Video className="w-4 h-4 text-red-500" /> Presenter Model Studio
              </h3>
              <p className="text-[10px] text-slate-400 font-mono">Custom 3D character preset customization</p>
            </div>

            {/* Sliders and drop downs */}
            <div className="space-y-2.5">
              <div>
                <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Avatar Face Rig</label>
                <select 
                  value={presenterConfig.face}
                  onChange={(e) => setPresenterConfig(prev => ({ ...prev, face: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-xs text-slate-300 outline-none cursor-pointer"
                >
                  <option value="Warm South-Asian">Warm South-Asian (Kahinur)</option>
                  <option value="Classic Caucasian">Classic Caucasian (David)</option>
                  <option value="Smart East-Asian">Smart East-Asian (Yuki)</option>
                  <option value="3D Cartoon Character">3D Cartoon / Kid Aesthetic</option>
                </select>
              </div>

              <div>
                <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Body Posture & Outfit</label>
                <select 
                  value={presenterConfig.body}
                  onChange={(e) => setPresenterConfig(prev => ({ ...prev, body: e.target.value }))}
                  className="w-full bg-slate-950 border border-slate-850 rounded px-2 py-1 text-xs text-slate-300 outline-none cursor-pointer"
                >
                  <option value="Anchored News Suit">Anchored Corporate Suit</option>
                  <option value="Traditional Bengali Saree">Traditional Saree (Bengali Female)</option>
                  <option value="Traditional Kurta Style">Traditional Kurta (South-Asian Male)</option>
                  <option value="Casual Dynamic T-Shirt">Casual Digital Creator (T-Shirt)</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Chroma Key bg</label>
                  <div className="flex gap-1.5 items-center bg-slate-950 border border-slate-850 rounded p-1.5">
                    <input 
                      type="color" 
                      value={presenterConfig.chromaKey}
                      onChange={(e) => setPresenterConfig(prev => ({ ...prev, chromaKey: e.target.value }))}
                      className="w-5 h-5 bg-transparent border-0 cursor-pointer"
                    />
                    <span className="text-[10px] text-slate-300 font-mono">{presenterConfig.chromaKey}</span>
                  </div>
                </div>

                <div>
                  <label className="block text-[9px] font-mono text-slate-500 uppercase mb-1">Render Stage</label>
                  <select 
                    value={presenterConfig.background}
                    onChange={(e) => setPresenterConfig(prev => ({ ...prev, background: e.target.value }))}
                    className="w-full bg-slate-950 border border-slate-850 rounded p-1.5 text-xs text-slate-300 outline-none cursor-pointer"
                  >
                    <option value="High-Tech Broadcast Desk">Virtual News Studio</option>
                    <option value="Solid Chroma Green">Solid Chroma Color</option>
                    <option value="Dynamic Studio Backdrop Plate">Unsplash Backdrop Plate</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Rendering Progress Indicator / Logs */}
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-3.5 space-y-2">
              <div className="flex justify-between text-[10px] font-mono">
                <span className="text-slate-400">Preview Generator</span>
                <span className="text-red-400 font-bold">{renderProgress}%</span>
              </div>
              <div className="w-full bg-slate-900 h-1 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: `${renderProgress}%` }} />
              </div>

              {isRenderingVideo ? (
                <div className="h-14 overflow-y-auto font-mono text-[8px] text-emerald-400/80 space-y-0.5">
                  {renderLogs.map((l, i) => (
                    <div key={i}>&gt; {l}</div>
                  ))}
                </div>
              ) : (
                <button 
                  onClick={handleStartRender}
                  className="w-full bg-slate-100 hover:bg-slate-200 text-slate-950 py-1.5 rounded text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Play className="w-3.5 h-3.5 text-slate-950 fill-slate-950" />
                  <span>Generate 10s Presenter Test Render</span>
                </button>
              )}
            </div>
          </div>

          {/* Render Preview Frame */}
          {renderedPreviewUrl && (
            <div className="relative group border border-slate-800 rounded-lg overflow-hidden h-28 bg-slate-950">
              <video 
                src={renderedPreviewUrl} 
                className="w-full h-full object-cover" 
                autoPlay 
                loop 
                muted 
                playsInline
              />
              <div className="absolute inset-0 bg-slate-950/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                <span className="text-[10px] font-mono text-cyan-400 px-2.5 py-1 rounded border border-cyan-400 bg-slate-950/90">
                  RIG PREVIEW ACTIVE
                </span>
              </div>
            </div>
          )}
        </div>

      </div>

      {/* Directory Folder-to-Folder model and files manager */}
      <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-slate-900 pb-4">
          <div>
            <h3 className="text-base font-sans font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <FolderOpen className="w-5 h-5 text-red-500" /> GNN File & Asset Directory
            </h3>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Structured folder layout managing 3D models, custom voices, raw clips, and cartoon meshes.
            </p>
          </div>

          <div className="flex gap-2 w-full sm:w-auto">
            <div className="relative flex-1 sm:w-60">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-2.5 top-2.5" />
              <input 
                type="text" 
                placeholder="Search file name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-900 border border-slate-850 rounded-lg pl-8 pr-3 py-1.5 text-xs font-mono text-slate-200 outline-none"
              />
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Folders List sidebar */}
          <div className="md:col-span-1 space-y-1.5">
            {[
              { id: 'model', label: 'Models Rigs (/model)', count: folders['model'].length },
              { id: 'voice-model', label: 'Voice models (/voice-model)', count: folders['voice-model'].length },
              { id: 'video-model', label: 'Generated Videos (/video-model)', count: folders['video-model'].length },
              { id: 'create-model', label: 'Creative/Cartoon (/create-model)', count: folders['create-model'].length },
              { id: 'news presenter model', label: 'Presenters (/news presenter)', count: folders['news presenter model'].length },
              { id: 'customize model', label: 'Custom Presets (/customize)', count: folders['customize model'].length }
            ].map((folder) => {
              const isSelected = selectedFolder === folder.id;
              return (
                <button
                  key={folder.id}
                  onClick={() => setSelectedFolder(folder.id)}
                  className={`w-full flex items-center justify-between text-left px-3.5 py-2.5 rounded-lg text-xs font-mono transition-all border cursor-pointer ${
                    isSelected 
                      ? 'bg-red-500/10 border-red-500/40 text-red-400 font-bold' 
                      : 'bg-slate-950 border-slate-900 text-slate-400 hover:text-slate-200 hover:border-slate-800'
                  }`}
                >
                  <span className="truncate">{folder.label}</span>
                  <span className="text-[9px] bg-slate-900 border border-slate-800 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                    {folder.count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Files List details area */}
          <div className="md:col-span-3 bg-slate-950 border border-slate-900 rounded-xl overflow-hidden min-h-[220px] flex flex-col justify-between">
            <div className="divide-y divide-slate-900">
              <div className="grid grid-cols-12 gap-2 p-3 bg-slate-900/40 text-[9px] font-mono text-slate-500 uppercase tracking-wider">
                <span className="col-span-6">File Name</span>
                <span className="col-span-2">File Size</span>
                <span className="col-span-2">Date Created</span>
                <span className="col-span-2 text-right">Actions</span>
              </div>

              {getFilteredFiles().length === 0 ? (
                <div className="p-8 text-center text-xs font-mono text-slate-500">
                  No matching files found inside folder "{selectedFolder}".
                </div>
              ) : (
                getFilteredFiles().map((file, idx) => (
                  <div key={idx} className="grid grid-cols-12 gap-2 p-3 text-xs font-mono text-slate-300 hover:bg-slate-900/20 transition-colors items-center">
                    <span className="col-span-6 truncate font-medium text-slate-200 flex items-center gap-1.5">
                      <FileCode className="w-3.5 h-3.5 text-red-400 shrink-0" />
                      {file.name}
                    </span>
                    <span className="col-span-2 text-slate-400">{file.size}</span>
                    <span className="col-span-2 text-slate-400">{file.date}</span>
                    <span className="col-span-2 text-right">
                      <button 
                        onClick={() => {
                          setAutoFixLogs(prev => [...prev, `[File Directory] Download trigger simulated for file "${file.name}"`]);
                          alert(`File ${file.name} is ready for broadcast staging download!`);
                        }}
                        className="text-[10px] text-red-400 hover:text-red-300 font-bold bg-red-500/5 px-2 py-1 rounded border border-red-500/10 cursor-pointer"
                      >
                        Download
                      </button>
                    </span>
                  </div>
                ))
              )}
            </div>

            <div className="p-3 bg-slate-900/30 border-t border-slate-900 flex justify-between items-center text-[10px] font-mono text-slate-500">
              <span>Total Folder Storage: <strong>~454 MB used</strong></span>
              <span>Workspace Directory Path: <code>/assets/GNN_Models/{selectedFolder}/</code></span>
            </div>
          </div>
        </div>
      </div>

      {/* Integration Panels: Google Account & GitHub SSH Gateway */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Google Account integration */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-xl space-y-4">
          <div className="flex justify-between items-start border-b border-slate-900 pb-3">
            <div>
              <h4 className="text-sm font-sans font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <span className="text-base">🌐</span> Authorized Google Account Support
              </h4>
              <p className="text-[10px] text-slate-400 font-mono">Simulated OAuth linkages & backup synchronization</p>
            </div>
            
            <button 
              onClick={() => {
                setIsGoogleConnected(!isGoogleConnected);
                setAutoFixLogs(prev => [...prev, isGoogleConnected ? '[OAuth] Decoupled Google Account connection.' : '[OAuth] Authenticated rmcking50@gmail.com. Connected calendars & drive.']);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                isGoogleConnected 
                  ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400' 
                  : 'bg-red-500 text-white hover:bg-red-650'
              }`}
            >
              {isGoogleConnected ? '✓ Google Connected' : 'Connect Account'}
            </button>
          </div>

          {isGoogleConnected ? (
            <div className="space-y-3">
              <div className="p-3 bg-slate-900/40 border border-slate-900 rounded-lg flex items-center justify-between">
                <div className="text-xs font-mono">
                  <span className="block text-slate-200 font-medium">Linked Email Address</span>
                  <span className="text-slate-400">rmcking50@gmail.com</span>
                </div>
                <span className="text-[9px] bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono uppercase">
                  OAUTH ACTIVE
                </span>
              </div>

              <div className="space-y-2">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-widest block">Configure Authorized Services</span>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'drive', label: 'Auto-Backup to Drive' },
                    { id: 'calendar', label: 'Sync Broadcast Calendar' },
                    { id: 'gmail', label: 'GNN Email Press Releases' },
                    { id: 'youtube', label: 'Direct Publish YouTube' }
                  ].map((act) => (
                    <label key={act.id} className="p-2.5 bg-slate-900/20 hover:bg-slate-900/40 border border-slate-900 rounded-lg flex items-center gap-2 cursor-pointer text-xs font-mono">
                      <input 
                        type="checkbox" 
                        checked={(allowedGoogleActions as any)[act.id]} 
                        onChange={(e) => {
                          setAllowedGoogleActions(prev => ({ ...prev, [act.id]: e.target.checked }));
                          setAutoFixLogs(prev => [...prev, `[OAuth] Toggled permissions for: ${act.label}`]);
                        }}
                        className="rounded border-slate-800 text-red-500 focus:ring-red-500 focus:ring-opacity-20"
                      />
                      <span>{act.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <div className="p-4 text-center bg-slate-900/30 border border-slate-900 rounded-lg text-xs font-mono text-slate-500">
              Connect your Google account (rmcking50@gmail.com) to allow automated calendar scheduler updates & Drive backup pushes.
            </div>
          )}
        </div>

        {/* GitHub SSH Key Gateway */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-xl space-y-4">
          <div className="border-b border-slate-900 pb-3">
            <h4 className="text-sm font-sans font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Github className="w-4 h-4 text-slate-300" /> GitHub Developer Mode & SSH Key
            </h4>
            <p className="text-[10px] text-slate-400 font-mono">Cloning repositories, pulling commits, triggers</p>
          </div>

          <div className="space-y-3">
            <div className="flex gap-2">
              <button 
                onClick={handleGenerateSSH}
                disabled={isGeneratingSSH}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-mono font-bold py-2 rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                {isGeneratingSSH ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Generating rig...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5 text-yellow-500" />
                    <span>Generate RSA SSH Key</span>
                  </>
                )}
              </button>
            </div>

            {sshKey ? (
              <div className="space-y-2">
                <label className="block text-[9px] font-mono text-slate-500 uppercase tracking-widest">Public Key (Add to your GitHub Settings)</label>
                <div className="bg-slate-900 border border-slate-850 p-2.5 rounded-lg text-[9px] font-mono break-all text-slate-300">
                  {sshKey}
                </div>
                <div className="flex justify-between items-center text-[9px] font-mono text-emerald-400">
                  <span className="flex items-center gap-1">
                    <Check className="w-3 h-3 text-emerald-400" />
                    <span>✓ SSH Key generation complete</span>
                  </span>
                  <button 
                    onClick={handleCopySSH}
                    className="text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 px-2 py-0.5 rounded transition-colors cursor-pointer flex items-center gap-1"
                  >
                    {copiedSSH ? (
                      <span className="text-emerald-400 font-bold">Copied!</span>
                    ) : (
                      <span>Copy Key</span>
                    )}
                  </button>
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-500 font-mono text-center py-2">
                No active SSH keypair exists. Generate key to allow code commits & workflow syncing.
              </p>
            )}
          </div>
        </div>

      </div>

      {/* Auto-Fix Agent Simulator Log Console */}
      <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-xl space-y-3">
        <div className="flex justify-between items-center border-b border-slate-900 pb-2.5">
          <div className="flex items-center gap-1.5">
            <Terminal className="w-4 h-4 text-emerald-400" />
            <h4 className="text-xs font-mono font-bold text-slate-300">GNN AI OS Auto-Fix & Diagnostics Terminal</h4>
          </div>
          <span className="text-[9px] font-mono text-emerald-400 animate-pulse uppercase tracking-wider bg-emerald-500/5 border border-emerald-500/20 px-2 py-0.5 rounded">
            Self-Repair Loop: Active
          </span>
        </div>

        <div className="bg-slate-950 p-3 rounded-lg border border-slate-900 font-mono text-[10px] text-emerald-400/90 h-32 overflow-y-auto space-y-1 scrollbar-thin">
          {autoFixLogs.map((log, idx) => (
            <div key={idx} className="leading-relaxed">
              <span className="text-slate-600">[{new Date().toISOString().split('T')[0]}]</span> {log}
            </div>
          ))}
        </div>
      </div>

      {/* Channel Wizard Overlay */}
      <AnimatePresence>
        {showChannelWizard && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4">
            <motion.div 
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-5"
            >
              <div className="border-b border-slate-800 pb-3 flex justify-between items-center">
                <h3 className="text-base font-display font-bold text-white flex items-center gap-2">
                  <Tv className="w-5 h-5 text-red-500" /> Create Broadcast Channel
                </h3>
                <button 
                  onClick={() => setShowChannelWizard(false)}
                  className="text-slate-400 hover:text-white font-mono text-sm cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Channel Name</label>
                  <input 
                    type="text" 
                    placeholder="e.g. Channel GNN Pro"
                    value={wizardName}
                    onChange={(e) => setWizardName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Language</label>
                    <select 
                      value={wizardLang} 
                      onChange={(e) => setWizardLang(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-300 outline-none cursor-pointer"
                    >
                      <option value="Bangla">Bangla (বাংলা)</option>
                      <option value="English">English</option>
                      <option value="Hindi">Hindi</option>
                      <option value="Arabic">Arabic</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1.5">Brand Theme Color</label>
                    <select 
                      value={wizardColor} 
                      onChange={(e) => setWizardColor(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-300 outline-none cursor-pointer font-mono"
                    >
                      <option value="from-red-600 to-amber-500">Red Amber</option>
                      <option value="from-emerald-600 to-green-400">Emerald Green</option>
                      <option value="from-blue-600 to-cyan-400">Blue Cyan</option>
                      <option value="from-purple-600 to-pink-500">Purple Pink</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-[10px] font-mono text-slate-400 uppercase">Publishing Gateways (API)</label>
                  <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                    {['YouTube Live', 'Facebook Page', 'TikTok Stream', 'Website Feed'].map((plat) => (
                      <label key={plat} className="p-2 bg-slate-950 border border-slate-850 rounded flex items-center gap-2 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={wizardPlatform.includes(plat)}
                          onChange={(e) => {
                            if (e.target.checked) setWizardPlatform(p => [...p, plat]);
                            else setWizardPlatform(p => p.filter(x => x !== plat));
                          }}
                          className="rounded text-red-500 focus:ring-red-500" 
                        />
                        <span>{plat}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-3">
                <button 
                  onClick={() => setShowChannelWizard(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateChannel}
                  className="flex-1 bg-red-600 hover:bg-red-650 text-white py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Create & Link Plugins
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
