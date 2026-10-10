import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Tv, 
  Radio, 
  Play, 
  Square, 
  Sparkles, 
  Layers, 
  Video, 
  Mic, 
  Volume2, 
  VolumeX, 
  RefreshCw, 
  Sliders, 
  CheckCircle, 
  AlertTriangle, 
  ArrowRight, 
  Clock, 
  Paperclip, 
  Zap, 
  Terminal, 
  Code, 
  FileText, 
  Flame, 
  ShieldCheck,
  ChevronRight,
  ExternalLink,
  Plus,
  Trash2,
  X,
  Eye,
  Check
} from 'lucide-react';
import { 
  UserRolePayload, 
  FastMcpVmixServerState, 
  VmixInputItem, 
  VmixAutoWorkflow, 
  VmixWorkflowCue, 
  FastMcpAttachment, 
  FastMcpToolLog,
  GeneratedScript,
  RepositoryAsset 
} from '../types';

interface FastMcpVmixStudioProps {
  userRole: UserRolePayload;
  scripts?: GeneratedScript[];
  assets?: RepositoryAsset[];
  onAddAsset?: (asset: any) => void;
  triggerToast?: (msg: string) => void;
}

export default function FastMcpVmixStudio({
  userRole,
  scripts = [],
  assets = [],
  onAddAsset,
  triggerToast = (msg) => console.log(msg)
}: FastMcpVmixStudioProps) {
  // Server State
  const [vmixState, setVmixState] = useState<FastMcpVmixServerState | null>(null);
  const [workflows, setWorkflows] = useState<VmixAutoWorkflow[]>([]);
  const [selectedWorkflowId, setSelectedWorkflowId] = useState<string>('wf-news-bulletin-auto');
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Active Sub-tab in Director Console
  const [activeConsoleTab, setActiveConsoleTab] = useState<'switcher' | 'auto_director' | 'attachments' | 'mcp_inspector'>('switcher');

  // Attachment Modal State
  const [isAttachModalOpen, setIsAttachModalOpen] = useState(false);
  const [targetInputForAttach, setTargetInputForAttach] = useState<number>(3);
  const [customAttachUrl, setCustomAttachUrl] = useState('');
  const [customAttachName, setCustomAttachName] = useState('');
  const [customAttachType, setCustomAttachType] = useState<'video' | 'image' | 'audio'>('video');

  // Script Auto-Attach Modal
  const [isScriptAttachModalOpen, setIsScriptAttachModalOpen] = useState(false);
  const [selectedScriptId, setSelectedScriptId] = useState<string>('');

  // FastMCP Tool Manual Runner
  const [testToolName, setTestToolName] = useState('vmix_switch_input');
  const [testToolArgsJson, setTestToolArgsJson] = useState('{\n  "targetInput": 1,\n  "transitionType": "Fade",\n  "durationMs": 600\n}');
  const [testToolResult, setTestToolResult] = useState<any>(null);
  const [isTestingTool, setIsTestingTool] = useState(false);

  // FastMCP Spec Modal
  const [isSpecModalOpen, setIsSpecModalOpen] = useState(false);
  const [fastMcpSpec, setFastMcpSpec] = useState<any>(null);

  // Automated Workflow Execution Timer
  const [activeWorkflowTimeRemaining, setActiveWorkflowTimeRemaining] = useState<number | null>(null);

  // Poll vMix State
  const fetchVmixStatus = async (silent = false) => {
    if (!silent) setIsRefreshing(true);
    try {
      const res = await fetch('/api/mcp/fastmcp-vmix/status');
      const data = await res.json();
      if (data.success && data.state) {
        setVmixState(data.state);
        if (data.workflows) setWorkflows(data.workflows);
      }
    } catch (err: any) {
      console.warn('[FastMCP vMix] Status fetch notice:', err.message);
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchVmixStatus();
    const interval = setInterval(() => {
      fetchVmixStatus(true);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Set default selected script
  useEffect(() => {
    if (scripts.length > 0 && !selectedScriptId) {
      setSelectedScriptId(scripts[0].id);
    }
  }, [scripts]);

  // Load FastMCP Spec
  const fetchSpec = async () => {
    try {
      const res = await fetch('/api/mcp/fastmcp-vmix/spec');
      const data = await res.json();
      setFastMcpSpec(data);
      setIsSpecModalOpen(true);
    } catch (err: any) {
      triggerToast('Failed to load FastMCP specification');
    }
  };

  // Switch Input Action
  const handleSwitchInput = async (targetInput: number, transitionType = 'Cut', durationMs = 500, toPreview = false) => {
    try {
      const res = await fetch('/api/mcp/fastmcp-vmix/switch', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetInput, transitionType, durationMs, toPreview })
      });
      const data = await res.json();
      if (data.success) {
        fetchVmixStatus(true);
        triggerToast(toPreview 
          ? `Cued Input ${targetInput} to PREVIEW (PVW)` 
          : `Switched Input ${targetInput} to PROGRAM (PGM) via ${transitionType}`
        );
      }
    } catch (err: any) {
      triggerToast(`Switch failed: ${err.message}`);
    }
  };

  // Toggle Overlay Action
  const handleToggleOverlay = async (channel: 1 | 2 | 3 | 4, action: 'Toggle' | 'In' | 'Out' = 'Toggle') => {
    try {
      const res = await fetch('/api/mcp/fastmcp-vmix/overlay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel, action })
      });
      const data = await res.json();
      if (data.success) {
        fetchVmixStatus(true);
        triggerToast(`Overlay ${channel} ${data.active ? 'ACTIVE (ON AIR)' : 'RETRACTED'}`);
      }
    } catch (err: any) {
      triggerToast(`Overlay failed: ${err.message}`);
    }
  };

  // FastMCP Media Attachment
  const handleAttachMedia = async (assetData: { name: string; url: string; type: string; assetId?: string }) => {
    try {
      const res = await fetch('/api/mcp/fastmcp-vmix/attach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          inputNumber: targetInputForAttach,
          asset: assetData
        })
      });
      const data = await res.json();
      if (data.success) {
        fetchVmixStatus(true);
        setIsAttachModalOpen(false);
        triggerToast(`FastMCP attached [${assetData.name}] to Input ${targetInputForAttach}`);
      }
    } catch (err: any) {
      triggerToast(`Attachment error: ${err.message}`);
    }
  };

  // Script Auto-Attach & Workflow Generation
  const handleScriptAutoAttach = async () => {
    const script = scripts.find(s => s.id === selectedScriptId);
    if (!script) {
      triggerToast('Please select a news script.');
      return;
    }

    // Find any matching video asset or use high-fidelity default
    const matchingVideo = assets.find(a => a.type === 'video');
    const assetUrl = matchingVideo?.url || 'https://assets.mixkit.co/videos/preview/mixkit-futuristic-holographic-data-screen-41552-large.mp4';

    try {
      const res = await fetch('/api/mcp/fastmcp-vmix/script-auto-attach', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script, assetUrl })
      });
      const data = await res.json();
      if (data.success) {
        fetchVmixStatus(true);
        setIsScriptAttachModalOpen(false);
        if (data.workflow) {
          setSelectedWorkflowId(data.workflow.id);
          setActiveConsoleTab('auto_director');
        }
        triggerToast(`Script "${script.title}" auto-attached to vMix Inputs & Rundown ready!`);
      }
    } catch (err: any) {
      triggerToast(`Script auto-attach failed: ${err.message}`);
    }
  };

  // Start Automated Workflow
  const handleStartWorkflow = async (workflowId: string) => {
    try {
      const res = await fetch('/api/mcp/fastmcp-vmix/workflow/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId })
      });
      const data = await res.json();
      if (data.success) {
        fetchVmixStatus(true);
        triggerToast(`Auto-Pilot Rundown [${data.workflow?.name || workflowId}] initiated!`);
      }
    } catch (err: any) {
      triggerToast(`Workflow error: ${err.message}`);
    }
  };

  // Stop Automated Workflow
  const handleStopWorkflow = async (workflowId: string) => {
    try {
      const res = await fetch('/api/mcp/fastmcp-vmix/workflow/stop', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ workflowId })
      });
      const data = await res.json();
      if (data.success) {
        fetchVmixStatus(true);
        triggerToast('Auto-Pilot Rundown safely stopped. Returned to manual control.');
      }
    } catch (err: any) {
      triggerToast(`Stop error: ${err.message}`);
    }
  };

  // Stream & Record Toggle
  const handleToggleStreamRecord = async (type: 'stream' | 'record' | 'both') => {
    try {
      const res = await fetch('/api/mcp/fastmcp-vmix/stream-record', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type })
      });
      const data = await res.json();
      if (data.success) {
        fetchVmixStatus(true);
        if (type === 'stream' || type === 'both') {
          triggerToast(data.isStreaming ? 'STREAMING LIVE: RTMP/SRT Broadcast Online' : 'Stream Stopped');
        }
        if (type === 'record' || type === 'both') {
          triggerToast(data.isRecording ? 'MASTER RECORDING: ISO High-Bitrate Capture Started' : 'Recording Saved');
        }
      }
    } catch (err: any) {
      triggerToast(`Broadcast toggle failed: ${err.message}`);
    }
  };

  // Manual FastMCP Tool Test Call
  const handleExecuteTestTool = async () => {
    setIsTestingTool(true);
    setTestToolResult(null);
    try {
      let parsedArgs = {};
      try {
        parsedArgs = JSON.parse(testToolArgsJson);
      } catch (e) {
        throw new Error('Invalid JSON format in tool arguments');
      }

      const res = await fetch('/api/mcp/fastmcp-vmix/execute-tool', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tool: testToolName, arguments: parsedArgs })
      });
      const data = await res.json();
      setTestToolResult(data);
      fetchVmixStatus(true);
      triggerToast(`FastMCP tool [${testToolName}] executed successfully.`);
    } catch (err: any) {
      setTestToolResult({ error: err.message, success: false });
      triggerToast(`Tool execution failed: ${err.message}`);
    } finally {
      setIsTestingTool(false);
    }
  };

  // Get active Program and Preview input objects
  const programInputObj = vmixState?.inputs.find(i => i.number === vmixState?.programInput);
  const previewInputObj = vmixState?.inputs.find(i => i.number === vmixState?.previewInput);
  const currentWorkflow = workflows.find(w => w.id === selectedWorkflowId) || workflows[0];

  return (
    <div className="space-y-6">
      {/* Top Header Card: FastMCP vMix Broadcast Control Plane */}
      <div className="bg-slate-900/40 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
        <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-white/5 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-600 to-rose-700 border border-red-500/30 flex items-center justify-center shadow-lg shadow-red-900/30">
              <Tv className="w-5 h-5 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-base font-bold text-white tracking-wide uppercase font-sans">
                  FastMCP vMix Live Switcher & Auto-Director
                </h1>
                <span className="text-[10px] bg-red-500/20 text-red-400 border border-red-500/40 px-2 py-0.5 rounded-full font-mono font-bold uppercase tracking-wider">
                  vMix 27.0
                </span>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2 py-0.5 rounded-full font-mono font-bold uppercase flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  FastMCP Online
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Model Context Protocol (FastMCP) Media Attachment Engine • Auto-Pilot Rundown Workflows • Live Tally
              </p>
            </div>
          </div>

          {/* Master Output Status Indicators & Action Bar */}
          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Live Streaming Indicator & Toggle */}
            <button
              onClick={() => handleToggleStreamRecord('stream')}
              className={`px-3.5 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                vmixState?.isStreaming
                  ? 'bg-red-600 hover:bg-red-500 text-white border-red-400 animate-pulse shadow-red-900/40'
                  : 'bg-slate-950/80 hover:bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              <Radio className="w-3.5 h-3.5" />
              <span>{vmixState?.isStreaming ? 'STREAM: LIVE (ON AIR)' : 'STREAM: OFF'}</span>
            </button>

            {/* Master Record Indicator & Toggle */}
            <button
              onClick={() => handleToggleStreamRecord('record')}
              className={`px-3.5 py-1.5 rounded-lg border text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer shadow-md ${
                vmixState?.isRecording
                  ? 'bg-amber-600 hover:bg-amber-500 text-white border-amber-400 animate-pulse shadow-amber-900/40'
                  : 'bg-slate-950/80 hover:bg-slate-900 text-slate-400 border-slate-800'
              }`}
            >
              <Square className={`w-3 h-3 ${vmixState?.isRecording ? 'fill-white' : ''}`} />
              <span>{vmixState?.isRecording ? 'REC: MASTER CAPTURE' : 'REC: IDLE'}</span>
            </button>

            {/* Auto-Attach News Script Button */}
            <button
              onClick={() => setIsScriptAttachModalOpen(true)}
              className="px-3.5 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-mono font-bold rounded-lg border border-blue-400/40 flex items-center gap-1.5 shadow-md shadow-blue-950/40 cursor-pointer transition-all"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Fast-Attach Script</span>
            </button>

            {/* FastMCP Protocol Specification Button */}
            <button
              onClick={fetchSpec}
              className="px-3 py-1.5 bg-slate-950/90 hover:bg-slate-900 text-slate-300 hover:text-white text-xs font-mono rounded-lg border border-slate-800 flex items-center gap-1.5 cursor-pointer transition-all"
            >
              <Code className="w-3.5 h-3.5 text-cyan-400" />
              <span>FastMCP Spec</span>
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => fetchVmixStatus()}
              disabled={isRefreshing}
              className="p-1.5 bg-slate-950/90 hover:bg-slate-900 text-slate-400 hover:text-white rounded-lg border border-slate-800 cursor-pointer transition-all"
              title="Refresh vMix State"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-red-400' : ''}`} />
            </button>
          </div>
        </div>

        {/* Navigation Sub-Tabs */}
        <div className="flex items-center gap-2 mt-4 pt-2 overflow-x-auto">
          {[
            { id: 'switcher', label: 'Live Switching Matrix & Tally', icon: Sliders },
            { id: 'auto_director', label: 'Automatic Work Ability (Auto-Director)', icon: Zap, badge: 'AUTO' },
            { id: 'attachments', label: 'FastMCP Media Attachments (8 Slots)', icon: Paperclip, count: vmixState?.attachments.length || 0 },
            { id: 'mcp_inspector', label: 'FastMCP JSON-RPC Console & Tools', icon: Terminal }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeConsoleTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveConsoleTab(tab.id as any)}
                className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'bg-red-500/15 border border-red-500/40 text-white shadow-lg shadow-red-950/20'
                    : 'bg-slate-950/60 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-red-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className="text-[9px] bg-red-600/30 text-red-300 px-1.5 py-0.2 rounded font-sans font-bold">
                    {tab.badge}
                  </span>
                )}
                {tab.count !== undefined && (
                  <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded font-mono">
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Console Views with Framer Motion transitions */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeConsoleTab}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.18, ease: "easeOut" }}
          className="w-full"
        >
          {/* VIEW 1: LIVE SWITCHING MATRIX & MULTI-VIEW TALLY MONITORS */}
          {activeConsoleTab === 'switcher' && (
        <div className="space-y-6">
          {/* Dual PGM & PVW Broadcast Monitors */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* PROGRAM (PGM) MONITOR - RED TALLY */}
            <div className="bg-slate-950/90 rounded-2xl border-2 border-red-600/80 shadow-2xl shadow-red-950/40 p-4 relative overflow-hidden flex flex-col justify-between">
              {/* Top Tally Header */}
              <div className="flex items-center justify-between mb-3 border-b border-red-900/30 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-red-500 animate-ping"></span>
                  <span className="text-xs font-mono font-black uppercase text-red-500 tracking-wider">
                    PROGRAM (PGM) • ON AIR
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold bg-red-500/20 text-red-300 px-2 py-0.5 rounded border border-red-500/30">
                    INPUT {vmixState?.programInput || 1}: {programInputObj?.name}
                  </span>
                </div>
              </div>

              {/* Video Screen Simulation */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-red-500/20 shadow-inner">
                {programInputObj?.attachment?.url ? (
                  programInputObj.attachment.type === 'video' || programInputObj.attachment.type === 'camera' ? (
                    <video
                      src={programInputObj.attachment.url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <img
                      src={programInputObj.attachment.url}
                      alt={programInputObj.name}
                      className="w-full h-full object-cover"
                    />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                    <Video className="w-10 h-10 text-slate-600" />
                    <span className="text-xs font-mono">{programInputObj?.name || 'Input Signal Active'}</span>
                  </div>
                )}

                {/* Live Broadcast Lower-Third Overlay (Channel 1) */}
                {vmixState?.activeOverlays.includes(1) && (
                  <div className="absolute bottom-3 left-3 right-3 bg-gradient-to-r from-red-950/95 via-slate-950/90 to-transparent border-l-4 border-red-500 p-3 rounded-r-lg backdrop-blur-md shadow-2xl animate-fade-in">
                    <div className="flex items-center gap-2">
                      <span className="text-[9px] bg-red-600 text-white font-black px-1.5 py-0.2 uppercase rounded tracking-wider">
                        GNN LIVE
                      </span>
                      <span className="text-xs font-bold text-white tracking-wide truncate">
                        {vmixState.inputs.find(i => i.number === 4)?.titleFields?.['Headline'] || 'GLOBAL NEWS NETWORK BROADCAST'}
                      </span>
                    </div>
                    <p className="text-[10px] text-slate-300 font-mono mt-0.5 truncate">
                      {vmixState.inputs.find(i => i.number === 4)?.titleFields?.['Subtitle'] || 'FastMCP Orchestration Active'}
                    </p>
                  </div>
                )}

                {/* News Ticker Overlay (Channel 2) */}
                {vmixState?.activeOverlays.includes(2) && (
                  <div className="absolute bottom-0 left-0 right-0 bg-slate-950/90 border-t border-yellow-500/40 px-3 py-1 flex items-center gap-2 overflow-hidden text-[10px] font-mono text-yellow-300">
                    <span className="bg-yellow-500 text-slate-950 font-bold px-1.5 py-0.2 rounded text-[9px] uppercase shrink-0">
                      TICKER
                    </span>
                    <span className="truncate">
                      {vmixState.inputs.find(i => i.number === 5)?.titleFields?.['Ticker'] || 'Continuous News Bulletins • FastMCP Live Attachments Operational'}
                    </span>
                  </div>
                )}

                {/* Urgent Breaking Alert (Channel 4) */}
                {vmixState?.activeOverlays.includes(4) && (
                  <div className="absolute top-3 left-3 bg-red-600 text-white font-black text-xs px-3 py-1 rounded shadow-lg animate-bounce flex items-center gap-1.5 border border-red-300">
                    <Flame className="w-3.5 h-3.5 fill-white" />
                    <span>BREAKING NEWS ALERT</span>
                  </div>
                )}
              </div>

              {/* Program Audio & Bus Status Strip */}
              <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Master Out: {vmixState?.audioBuses.master.meterL} dB</span>
                </div>
                <span className="text-red-400 font-bold">TALLY: PROGRAM LIVE</span>
              </div>
            </div>

            {/* PREVIEW (PVW) MONITOR - GREEN TALLY */}
            <div className="bg-slate-950/90 rounded-2xl border-2 border-emerald-600/80 shadow-2xl shadow-emerald-950/30 p-4 relative overflow-hidden flex flex-col justify-between">
              {/* Top Tally Header */}
              <div className="flex items-center justify-between mb-3 border-b border-emerald-900/30 pb-2">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
                  <span className="text-xs font-mono font-black uppercase text-emerald-400 tracking-wider">
                    PREVIEW (PVW) • CUED NEXT
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-mono font-bold bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded border border-emerald-500/30">
                    INPUT {vmixState?.previewInput || 2}: {previewInputObj?.name}
                  </span>
                </div>
              </div>

              {/* Video Screen Simulation */}
              <div className="relative aspect-video w-full rounded-xl overflow-hidden bg-slate-900 flex items-center justify-center border border-emerald-500/20 shadow-inner">
                {previewInputObj?.attachment?.url ? (
                  previewInputObj.attachment.type === 'video' || previewInputObj.attachment.type === 'camera' ? (
                    <video
                      src={previewInputObj.attachment.url}
                      autoPlay
                      loop
                      muted
                      playsInline
                      className="w-full h-full object-cover opacity-85"
                    />
                  ) : (
                    <img
                      src={previewInputObj.attachment.url}
                      alt={previewInputObj.name}
                      className="w-full h-full object-cover opacity-85"
                    />
                  )
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-slate-500">
                    <Video className="w-10 h-10 text-slate-600" />
                    <span className="text-xs font-mono">{previewInputObj?.name || 'Input Signal Ready'}</span>
                  </div>
                )}

                <div className="absolute top-2 right-2 bg-slate-950/80 px-2 py-0.5 rounded text-[10px] font-mono text-emerald-300 border border-emerald-500/30">
                  SAFE MARGIN READY
                </div>
              </div>

              {/* Transition Hardware Controls Bar */}
              <div className="mt-3 pt-2 border-t border-slate-900 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 flex-wrap">
                  {/* CUT BUTTON */}
                  <button
                    onClick={() => handleSwitchInput(vmixState?.previewInput || 1, 'Cut', 0)}
                    className="px-3.5 py-1.5 bg-red-600 hover:bg-red-500 text-white font-mono font-black text-xs rounded border border-red-400 shadow-md shadow-red-950/40 cursor-pointer transition-all active:scale-95"
                  >
                    CUT
                  </button>

                  {/* FADE 500ms */}
                  <button
                    onClick={() => handleSwitchInput(vmixState?.previewInput || 1, 'Fade', 500)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono font-bold text-xs rounded border border-slate-700 cursor-pointer transition-all active:scale-95"
                  >
                    FADE 500ms
                  </button>

                  {/* FADE 1000ms */}
                  <button
                    onClick={() => handleSwitchInput(vmixState?.previewInput || 1, 'Fade', 1000)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono font-bold text-xs rounded border border-slate-700 cursor-pointer transition-all active:scale-95 hidden sm:inline-block"
                  >
                    FADE 1s
                  </button>

                  {/* WIPE */}
                  <button
                    onClick={() => handleSwitchInput(vmixState?.previewInput || 1, 'Wipe', 750)}
                    className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono font-bold text-xs rounded border border-slate-700 cursor-pointer transition-all active:scale-95"
                  >
                    WIPE
                  </button>

                  {/* STINGER */}
                  <button
                    onClick={() => handleSwitchInput(vmixState?.previewInput || 1, 'Stinger', 1000)}
                    className="px-2.5 py-1.5 bg-purple-700 hover:bg-purple-600 text-white font-mono font-bold text-xs rounded border border-purple-500 cursor-pointer transition-all active:scale-95"
                  >
                    STINGER
                  </button>
                </div>

                {/* FTB (Fade to Black) */}
                <button
                  onClick={() => handleToggleOverlay(1, 'Out')}
                  className="px-2.5 py-1.5 bg-black hover:bg-zinc-900 text-red-400 font-mono font-bold text-xs rounded border border-red-950/60 cursor-pointer transition-all"
                  title="Clear graphics"
                >
                  CLR GFX
                </button>
              </div>
            </div>
          </div>

          {/* Overlay Channel Trigger Strip */}
          <div className="bg-slate-900/40 border border-white/10 rounded-xl p-4 flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <Layers className="w-4 h-4 text-cyan-400" />
              <span className="text-xs font-mono font-bold text-white uppercase">
                vMix Overlay Channels (1 - 4):
              </span>
            </div>

            <div className="flex items-center gap-2 flex-wrap">
              {[
                { ch: 1, label: 'Overlay 1: Lower Third GT Title', color: 'red' },
                { ch: 2, label: 'Overlay 2: News Ticker Strip', color: 'amber' },
                { ch: 3, label: 'Overlay 3: Channel Logo Bug', color: 'blue' },
                { ch: 4, label: 'Overlay 4: Breaking Flash Banner', color: 'purple' }
              ].map(ov => {
                const isActive = vmixState?.activeOverlays.includes(ov.ch);
                return (
                  <button
                    key={ov.ch}
                    onClick={() => handleToggleOverlay(ov.ch as any, 'Toggle')}
                    className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? 'bg-red-600 text-white border-red-400 shadow-md shadow-red-900/40'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${isActive ? 'bg-white animate-pulse' : 'bg-slate-600'}`}></span>
                    <span>{ov.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 8-Channel Broadcast Input Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sliders className="w-4 h-4 text-red-400" />
                8-Channel Virtual Switcher Inputs Matrix
              </h3>
              <span className="text-[11px] font-mono text-slate-500">
                Click input to preview, or switch to program
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {vmixState?.inputs.map(inp => {
                const isProgram = inp.number === vmixState.programInput;
                const isPreview = inp.number === vmixState.previewInput;
                return (
                  <div
                    key={inp.number}
                    className={`rounded-xl p-3.5 border transition-all flex flex-col justify-between ${
                      isProgram
                        ? 'bg-red-950/30 border-red-500 shadow-lg shadow-red-950/30 ring-1 ring-red-500/50'
                        : isPreview
                        ? 'bg-emerald-950/30 border-emerald-500 shadow-lg shadow-emerald-950/30 ring-1 ring-emerald-500/50'
                        : 'bg-slate-900/40 border-slate-800/90 hover:border-slate-700'
                    }`}
                  >
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-mono font-black px-1.5 py-0.5 rounded ${
                          isProgram 
                            ? 'bg-red-500 text-white' 
                            : isPreview 
                            ? 'bg-emerald-500 text-slate-950' 
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {inp.number}
                        </span>
                        <span className="text-xs font-bold text-slate-200 truncate">
                          {inp.name}
                        </span>
                      </div>

                      {/* Tally Badge */}
                      {isProgram && (
                        <span className="text-[9px] font-mono font-bold bg-red-600 text-white px-1.5 py-0.5 rounded uppercase">
                          PGM
                        </span>
                      )}
                      {isPreview && (
                        <span className="text-[9px] font-mono font-bold bg-emerald-600 text-white px-1.5 py-0.5 rounded uppercase">
                          PVW
                        </span>
                      )}
                    </div>

                    {/* Thumbnail / Visual State */}
                    <div className="aspect-video rounded-lg overflow-hidden bg-slate-950 border border-slate-800/80 mb-3 relative flex items-center justify-center">
                      {inp.attachment?.url ? (
                        inp.attachment.type === 'video' || inp.attachment.type === 'camera' ? (
                          <video
                            src={inp.attachment.url}
                            muted
                            loop
                            autoPlay
                            playsInline
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <img
                            src={inp.attachment.url}
                            alt={inp.name}
                            className="w-full h-full object-cover"
                          />
                        )
                      ) : (
                        <div className="text-center p-2">
                          <span className="text-[10px] font-mono text-slate-500 block">
                            Type: {inp.type}
                          </span>
                          {inp.titleFields && (
                            <span className="text-[9px] text-slate-400 font-sans truncate max-w-[140px] block mt-1">
                              {inp.titleFields['Headline'] || inp.titleFields['AlertText']}
                            </span>
                          )}
                        </div>
                      )}

                      {/* FastMCP Token Tag */}
                      {inp.attachment && (
                        <div className="absolute top-1 left-1 bg-slate-950/80 backdrop-blur-xs text-[8px] font-mono text-cyan-400 px-1 rounded border border-cyan-500/20 flex items-center gap-0.5">
                          <Paperclip className="w-2.5 h-2.5" />
                          <span>FastMCP</span>
                        </div>
                      )}
                    </div>

                    {/* Action Controls */}
                    <div className="flex items-center gap-1.5 pt-2 border-t border-white/5">
                      <button
                        onClick={() => handleSwitchInput(inp.number, 'Cut', 0)}
                        className={`flex-1 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                          isProgram
                            ? 'bg-red-600 text-white'
                            : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                        }`}
                      >
                        TAKE PGM
                      </button>

                      <button
                        onClick={() => handleSwitchInput(inp.number, 'Fade', 500, true)}
                        className={`flex-1 py-1 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                          isPreview
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800'
                        }`}
                      >
                        CUE PVW
                      </button>

                      <button
                        onClick={() => {
                          setTargetInputForAttach(inp.number);
                          setIsAttachModalOpen(true);
                        }}
                        className="p-1 rounded bg-slate-950 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 cursor-pointer"
                        title="FastMCP Attach Media"
                      >
                        <Paperclip className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 2: AUTOMATIC WORK ABILITY (AUTO-DIRECTOR & RUNDOWN ORCHESTRATOR) */}
      {activeConsoleTab === 'auto_director' && (
        <div className="space-y-6">
          {/* Automation Master Controller */}
          <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-sm font-mono font-bold text-white uppercase flex items-center gap-2">
                  <Zap className="w-4 h-4 text-amber-400" />
                  FastMCP Automatic Work Ability: Rundown Auto-Pilot
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Automated multi-cue broadcast sequences with timed transitions, lower-third graphic triggers, and audio ducking.
                </p>
              </div>

              {/* Workflow Selector */}
              <div className="flex items-center gap-2">
                <select
                  value={selectedWorkflowId}
                  onChange={(e) => setSelectedWorkflowId(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono rounded-lg px-3 py-1.5 focus:outline-none focus:border-red-500"
                >
                  {workflows.map(wf => (
                    <option key={wf.id} value={wf.id}>
                      {wf.name} ({wf.cues.length} Cues)
                    </option>
                  ))}
                </select>

                {currentWorkflow?.status === 'running' ? (
                  <button
                    onClick={() => handleStopWorkflow(currentWorkflow.id)}
                    className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white font-mono font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg shadow-red-950/50 animate-pulse"
                  >
                    <Square className="w-3.5 h-3.5 fill-white" />
                    <span>ABORT / STOP</span>
                  </button>
                ) : (
                  <button
                    onClick={() => handleStartWorkflow(selectedWorkflowId)}
                    className="px-4 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-mono font-bold text-xs rounded-lg flex items-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-950/50"
                  >
                    <Play className="w-3.5 h-3.5 fill-white" />
                    <span>RUN AUTO-PILOT</span>
                  </button>
                )}
              </div>
            </div>

            {/* Active Workflow Metadata Card */}
            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {currentWorkflow?.category}
                </span>
                <h4 className="text-sm font-bold text-white mt-1">
                  {currentWorkflow?.name}
                </h4>
                <p className="text-xs text-slate-400 font-sans mt-0.5">
                  {currentWorkflow?.description}
                </p>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-slate-400 shrink-0">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Estimated Runtime</span>
                  <span className="text-white font-bold">{currentWorkflow?.totalEstimatedDuration}s</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Total Cues</span>
                  <span className="text-white font-bold">{currentWorkflow?.cues.length} Steps</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase">Execution State</span>
                  <span className={`font-bold uppercase ${
                    currentWorkflow?.status === 'running' 
                      ? 'text-emerald-400 animate-pulse' 
                      : 'text-slate-400'
                  }`}>
                    {currentWorkflow?.status}
                  </span>
                </div>
              </div>
            </div>

            {/* Step-by-Step Cue Rundown Timeline */}
            <div className="space-y-2 pt-2">
              <span className="text-xs font-mono text-slate-400 uppercase tracking-wider block">
                Live Cue Execution Rundown Sequence:
              </span>

              <div className="space-y-2">
                {currentWorkflow?.cues.map((cue, idx) => {
                  const isActive = currentWorkflow.status === 'running' && currentWorkflow.activeCueIndex === idx;
                  const isCompleted = currentWorkflow.status === 'running' && currentWorkflow.activeCueIndex > idx;
                  return (
                    <div
                      key={cue.id}
                      className={`rounded-xl p-3.5 border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        isActive
                          ? 'bg-amber-950/20 border-amber-500/80 shadow-lg shadow-amber-950/20 ring-1 ring-amber-500/40'
                          : isCompleted
                          ? 'bg-slate-950/50 border-emerald-900/40 text-slate-400'
                          : 'bg-slate-950/80 border-slate-850 text-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-mono font-bold text-xs ${
                          isActive
                            ? 'bg-amber-500 text-slate-950 animate-bounce'
                            : isCompleted
                            ? 'bg-emerald-600 text-white'
                            : 'bg-slate-800 text-slate-400'
                        }`}>
                          {isCompleted ? <Check className="w-3.5 h-3.5" /> : idx + 1}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">
                              {cue.stepName}
                            </span>
                            <span className="text-[9px] font-mono uppercase bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                              {cue.action}
                            </span>
                          </div>
                          <span className="text-[11px] text-slate-400 font-mono">
                            {cue.logNote}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono">
                        {cue.targetInput > 0 && (
                          <span className="bg-slate-800/80 text-slate-300 px-2 py-0.5 rounded text-[11px]">
                            Target Input {cue.targetInput}
                          </span>
                        )}
                        {cue.overlayChannel && (
                          <span className="bg-red-500/20 text-red-300 px-2 py-0.5 rounded text-[11px]">
                            Overlay {cue.overlayChannel} ({cue.overlayAction})
                          </span>
                        )}
                        <span className="text-slate-500 text-[11px]">
                          Hold: {cue.delayAfterMs / 1000}s
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: FASTMCP ATTACHMENTS (8 SLOTS) */}
      {activeConsoleTab === 'attachments' && (
        <div className="space-y-6">
          <div className="bg-slate-900/40 border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/5 pb-4">
              <div>
                <h3 className="text-sm font-mono font-bold text-white uppercase flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-cyan-400" />
                  FastMCP Media Attachment Manager
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Model Context Protocol attachment tokens bound directly to live vMix hardware/NDI input channels.
                </p>
              </div>

              <button
                onClick={() => {
                  setTargetInputForAttach(3);
                  setIsAttachModalOpen(true);
                }}
                className="px-3.5 py-1.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold rounded-lg flex items-center gap-1.5 cursor-pointer shadow-md shadow-cyan-950/40"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Attach New Media to Slot</span>
              </button>
            </div>

            {/* List of Attachments */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {vmixState?.inputs.map(inp => (
                <div
                  key={inp.number}
                  className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 flex flex-col justify-between"
                >
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold bg-slate-800 text-slate-200 px-2 py-0.5 rounded">
                        SLOT {inp.number}
                      </span>
                      <div>
                        <h4 className="text-xs font-bold text-white">
                          {inp.name}
                        </h4>
                        <span className="text-[10px] text-slate-500 font-mono">
                          Channel Type: {inp.type}
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        setTargetInputForAttach(inp.number);
                        setIsAttachModalOpen(true);
                      }}
                      className="px-2.5 py-1 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white rounded border border-slate-800 text-[10px] font-mono cursor-pointer transition-all"
                    >
                      {inp.attachment ? 'Replace' : 'Attach'}
                    </button>
                  </div>

                  {inp.attachment ? (
                    <div className="bg-slate-900/60 rounded-lg p-3 border border-slate-850 space-y-2">
                      <div className="flex items-center justify-between text-[11px] font-mono">
                        <span className="text-cyan-300 font-bold truncate max-w-[200px]">
                          {inp.attachment.name}
                        </span>
                        <span className="text-[10px] text-slate-500 bg-slate-950 px-1.5 py-0.2 rounded border border-slate-800">
                          {inp.attachment.mimeType}
                        </span>
                      </div>

                      <div className="text-[10px] font-mono text-slate-400 space-y-1">
                        <div className="flex items-center justify-between">
                          <span>FastMCP Token:</span>
                          <span className="text-slate-300 font-mono bg-slate-950 px-1.5 py-0.2 rounded">
                            {inp.attachment.token}
                          </span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span>Attached Timestamp:</span>
                          <span className="text-slate-500">
                            {new Date(inp.attachment.attachedAt).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-900/30 rounded-lg p-4 border border-dashed border-slate-850 text-center">
                      <span className="text-xs text-slate-500 font-mono">
                        No FastMCP attachment in this slot.
                      </span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: FASTMCP JSON-RPC 2.0 PROTOCOL CONSOLE & TOOLS */}
      {activeConsoleTab === 'mcp_inspector' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            {/* Left: Test FastMCP Tool Execution */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl space-y-4">
              <div className="border-b border-white/5 pb-3">
                <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  FastMCP JSON-RPC Tool Invocation Tester
                </h3>
                <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                  Directly dispatch FastMCP tool calls to the live vMix switcher controller.
                </p>
              </div>

              {/* Tool Selector */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Select FastMCP Tool:
                </label>
                <select
                  value={testToolName}
                  onChange={(e) => {
                    const name = e.target.value;
                    setTestToolName(name);
                    if (name === 'vmix_switch_input') {
                      setTestToolArgsJson('{\n  "targetInput": 1,\n  "transitionType": "Fade",\n  "durationMs": 600\n}');
                    } else if (name === 'vmix_trigger_overlay') {
                      setTestToolArgsJson('{\n  "channel": 1,\n  "action": "Toggle"\n}');
                    } else if (name === 'vmix_set_text') {
                      setTestToolArgsJson('{\n  "inputNumber": 4,\n  "field": "Headline",\n  "value": "BREAKING: FastMCP Live Test Event"\n}');
                    } else if (name === 'vmix_attach_media') {
                      setTestToolArgsJson('{\n  "inputNumber": 3,\n  "assetName": "Studio Reel Test",\n  "type": "video",\n  "url": "https://assets.mixkit.co/videos/preview/mixkit-news-studio-studio-desk-broadcasting-41554-large.mp4"\n}');
                    } else if (name === 'vmix_auto_workflow_run') {
                      setTestToolArgsJson('{\n  "workflowId": "wf-news-bulletin-auto"\n}');
                    }
                  }}
                  className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono rounded-lg p-2 focus:outline-none focus:border-cyan-500"
                >
                  <option value="vmix_switch_input">vmix_switch_input (Program / Preview Transition)</option>
                  <option value="vmix_trigger_overlay">vmix_trigger_overlay (Channels 1-4 Graphic Overlays)</option>
                  <option value="vmix_set_text">vmix_set_text (Dynamic GT Title & Lower-Third Injection)</option>
                  <option value="vmix_attach_media">vmix_attach_media (FastMCP Media Attachment)</option>
                  <option value="vmix_auto_workflow_run">vmix_auto_workflow_run (Execute Auto Rundown)</option>
                </select>
              </div>

              {/* JSON Argument Editor */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Tool Arguments (JSON):
                </label>
                <textarea
                  value={testToolArgsJson}
                  onChange={(e) => setTestToolArgsJson(e.target.value)}
                  rows={6}
                  className="w-full bg-slate-950 border border-slate-800 text-cyan-300 text-xs font-mono rounded-lg p-3 focus:outline-none focus:border-cyan-500"
                />
              </div>

              <button
                onClick={handleExecuteTestTool}
                disabled={isTestingTool}
                className="w-full py-2.5 bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white text-xs font-mono font-bold rounded-lg flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-cyan-950/40"
              >
                {isTestingTool ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Executing FastMCP Tool...</span>
                  </>
                ) : (
                  <>
                    <Zap className="w-3.5 h-3.5" />
                    <span>Execute Tool Call (JSON-RPC)</span>
                  </>
                )}
              </button>

              {/* Tool Result Viewer */}
              {testToolResult && (
                <div className="bg-slate-950/90 rounded-xl p-3 border border-slate-800 text-xs font-mono space-y-1">
                  <span className="text-slate-400 uppercase text-[10px] block">Execution Response:</span>
                  <pre className="text-emerald-400 text-[11px] overflow-x-auto max-h-36">
                    {JSON.stringify(testToolResult, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            {/* Right: Live FastMCP Execution Telemetry Logs */}
            <div className="bg-slate-900/50 backdrop-blur-xl border border-white/10 rounded-2xl p-5 shadow-2xl flex flex-col justify-between space-y-4">
              <div className="border-b border-white/5 pb-3 flex items-center justify-between">
                <div>
                  <h3 className="text-xs font-mono font-bold text-white uppercase flex items-center gap-2">
                    <Code className="w-4 h-4 text-emerald-400" />
                    FastMCP Protocol Telemetry Stream
                  </h3>
                  <p className="text-[11px] text-slate-400 font-mono mt-0.5">
                    Real-time tool invocations, duration latency, and server callbacks.
                  </p>
                </div>

                <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  {vmixState?.recentLogs.length || 0} Events
                </span>
              </div>

              <div className="flex-1 overflow-y-auto space-y-2 max-h-[380px] pr-1">
                {vmixState?.recentLogs.map((log: FastMcpToolLog) => (
                  <div
                    key={log.id}
                    className="bg-slate-950/80 rounded-lg p-2.5 border border-slate-850 text-xs font-mono space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-cyan-300 font-bold">
                        {log.toolName}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span>{log.durationMs}ms</span>
                        <span>{new Date(log.timestamp).toLocaleTimeString()}</span>
                      </div>
                    </div>

                    <div className="text-[10px] text-slate-400 truncate">
                      params: {JSON.stringify(log.params)}
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-500 flex justify-between">
                <span>Protocol: FastMCP 2024-11-05</span>
                <span>Latency: ~8ms</span>
              </div>
            </div>
          </div>
        </div>
      )}
        </motion.div>
      </AnimatePresence>

      {/* MODAL 1: FASTMCP ATTACHMENT PICKER */}
      {isAttachModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-xl w-full p-5 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Paperclip className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-mono font-bold text-white uppercase">
                  Attach Media to vMix Input Slot {targetInputForAttach}
                </h3>
              </div>
              <button
                onClick={() => setIsAttachModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Pick from Repository Assets */}
            {assets.length > 0 && (
              <div className="space-y-2">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                  Pick from GNN Media Repository:
                </span>
                <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                  {assets.map(a => (
                    <div
                      key={a.id}
                      onClick={() => handleAttachMedia({
                        name: a.name,
                        url: a.url,
                        type: a.type,
                        assetId: a.id
                      })}
                      className="bg-slate-950 hover:bg-slate-850 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[9px] font-mono uppercase bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                          {a.type}
                        </span>
                        <span className="text-xs font-bold text-slate-200 truncate max-w-[280px]">
                          {a.name}
                        </span>
                      </div>
                      <button className="text-[10px] font-mono text-cyan-400 hover:underline">
                        Attach
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Or Paste Custom URL */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Or Attach Custom URL / Signal:
              </span>

              <div className="space-y-2">
                <input
                  type="text"
                  placeholder="Asset Display Title (e.g. Veo AI Reel / NDI Stream)"
                  value={customAttachName}
                  onChange={(e) => setCustomAttachName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />

                <input
                  type="text"
                  placeholder="Direct Media URL (MP4, Image, Audio, or Stream)"
                  value={customAttachUrl}
                  onChange={(e) => setCustomAttachUrl(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-white focus:outline-none focus:border-cyan-500"
                />

                <div className="flex items-center gap-2">
                  <select
                    value={customAttachType}
                    onChange={(e) => setCustomAttachType(e.target.value as any)}
                    className="bg-slate-950 border border-slate-800 rounded-lg p-2 text-xs font-mono text-slate-300"
                  >
                    <option value="video">Video (MP4 / WebM)</option>
                    <option value="image">Image (Virtual Set / Plate)</option>
                    <option value="audio">Audio (Voiceover / Music)</option>
                  </select>

                  <button
                    onClick={() => {
                      if (!customAttachUrl || !customAttachName) {
                        triggerToast('Please provide both a name and a URL.');
                        return;
                      }
                      handleAttachMedia({
                        name: customAttachName,
                        url: customAttachUrl,
                        type: customAttachType
                      });
                    }}
                    className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-mono font-bold text-xs rounded-lg cursor-pointer transition-all"
                  >
                    FastMCP Attach to Slot {targetInputForAttach}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: SCRIPT AUTO-ATTACH & RUNDOWN POPULATOR */}
      {isScriptAttachModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-mono font-bold text-white uppercase">
                  Auto-Attach Newsroom Script to vMix
                </h3>
              </div>
              <button
                onClick={() => setIsScriptAttachModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-400 font-sans leading-relaxed">
              FastMCP will automatically parse the news script, inject the headline and reporter into vMix Lower-Third (Input 4), attach any related video package into Input 3, and assemble a timed Rundown Workflow.
            </p>

            <div className="space-y-1.5">
              <label className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">
                Select Broadcast Script:
              </label>
              <select
                value={selectedScriptId}
                onChange={(e) => setSelectedScriptId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs font-mono rounded-lg p-2.5 focus:outline-none focus:border-blue-500"
              >
                {scripts.map(s => (
                  <option key={s.id} value={s.id}>
                    [{s.status.toUpperCase()}] {s.title} ({s.language})
                  </option>
                ))}
              </select>
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setIsScriptAttachModalOpen(false)}
                className="px-3.5 py-1.5 bg-slate-950 hover:bg-slate-850 text-slate-400 text-xs font-mono rounded-lg border border-slate-800 cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleScriptAutoAttach}
                className="px-4 py-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-mono font-bold text-xs rounded-lg cursor-pointer shadow-md shadow-blue-950/40 flex items-center gap-1.5"
              >
                <Zap className="w-3.5 h-3.5" />
                <span>Execute Script Auto-Attach</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: FASTMCP SPECIFICATION VIEWER */}
      {isSpecModalOpen && fastMcpSpec && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-5 space-y-4 shadow-2xl max-h-[85vh] flex flex-col justify-between">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-mono font-bold text-white uppercase">
                  FastMCP Server Specification (Model Context Protocol)
                </h3>
              </div>
              <button
                onClick={() => setIsSpecModalOpen(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-xs font-mono">
              <div className="bg-slate-950 rounded-xl p-3 border border-slate-850">
                <span className="text-cyan-400 font-bold block mb-1">Server Info:</span>
                <p className="text-slate-300">Name: {fastMcpSpec.serverInfo?.name}</p>
                <p className="text-slate-400">Version: {fastMcpSpec.serverInfo?.version}</p>
                <p className="text-slate-400">Description: {fastMcpSpec.serverInfo?.description}</p>
              </div>

              <div className="bg-slate-950 rounded-xl p-3 border border-slate-850">
                <span className="text-cyan-400 font-bold block mb-2">Registered FastMCP Tools:</span>
                <div className="space-y-2">
                  {fastMcpSpec.tools?.map((tool: any) => (
                    <div key={tool.name} className="border-b border-slate-900 pb-1.5">
                      <span className="text-emerald-400 font-bold">{tool.name}</span>
                      <p className="text-[11px] text-slate-400">{tool.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-slate-950 rounded-xl p-3 border border-slate-850">
                <span className="text-cyan-400 font-bold block mb-1">FastMCP Python Server Equivalent:</span>
                <pre className="text-[10px] text-slate-300 overflow-x-auto p-2 bg-slate-900 rounded">
{`from mcp.server.fastmcp import FastMCP

mcp = FastMCP("gnn-fastmcp-vmix")

@mcp.tool()
def vmix_attach_media(input_number: int, asset_name: str, url: str) -> dict:
    """Attaches media directly to a vMix input slot."""
    return vmix_client.attach(input_number, asset_name, url)

@mcp.tool()
def vmix_auto_workflow_run(workflow_id: str) -> dict:
    """Executes automated broadcast sequence."""
    return vmix_orchestrator.run(workflow_id)

mcp.run()`}
                </pre>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setIsSpecModalOpen(false)}
                className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-mono text-xs rounded-lg cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
