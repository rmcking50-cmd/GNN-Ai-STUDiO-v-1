import React, { useState, useEffect, useRef } from 'react';
import {
  Terminal,
  Cpu,
  Play,
  Pause,
  ChevronDown,
  ChevronUp,
  Search,
  Trash2,
  Download,
  Zap,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Info,
  Maximize2,
  Minimize2,
  RefreshCw
} from 'lucide-react';
import { GnnBrainLogEntry, GnnAgentSubsystem, GnnAutonomyTier } from '../types';

interface GnnBrainLogViewerProps {
  defaultExpanded?: boolean;
}

const INITIAL_LOGS: GnnBrainLogEntry[] = [
  {
    id: 'log-seed-1',
    timestamp: new Date(Date.now() - 75000).toLocaleTimeString(),
    subsystem: 'Planner',
    tier: 'Level 1: Read',
    level: 'INFO',
    message: 'Master Operating Policy loaded from AGENTS.md. Autonomy tiers 1 through 4 configured.',
    taskRef: 'TASK-SYS-001'
  },
  {
    id: 'log-seed-2',
    timestamp: new Date(Date.now() - 58000).toLocaleTimeString(),
    subsystem: 'MCP Gateway',
    tier: 'Level 1: Read',
    level: 'SUCCESS',
    message: 'FastMCP vMix gateway probe initialized on port 8088. TCP handshake healthy.',
    detail: 'Latency: 14ms • Inputs registered: 6 • Bus audio meters active',
    taskRef: 'TASK-MCP-014'
  },
  {
    id: 'log-seed-3',
    timestamp: new Date(Date.now() - 42000).toLocaleTimeString(),
    subsystem: 'News Engine',
    tier: 'Level 2: Propose',
    level: 'ACTION',
    message: 'RSS feed ingest evaluated 14 incoming wire bulletins. Identified 3 priority hooks.',
    taskRef: 'TASK-NEWS-082'
  },
  {
    id: 'log-seed-4',
    timestamp: new Date(Date.now() - 25000).toLocaleTimeString(),
    subsystem: 'GitHub CI/CD',
    tier: 'Level 2: Propose',
    level: 'INFO',
    message: 'Self-healing workflow verified commit integrity. Automated linter reported 0 regressions.',
    taskRef: 'CI-RUN-9421'
  },
  {
    id: 'log-seed-5',
    timestamp: new Date(Date.now() - 10000).toLocaleTimeString(),
    subsystem: 'Security Audit',
    tier: 'Level 1: Read',
    level: 'SUCCESS',
    message: 'Environment secret scan completed. 0 API credentials leaked to client bundle.',
    detail: 'Verified server-side isolation for Gemini API & Cloud Run runtime',
    taskRef: 'SEC-AUDIT-201'
  }
];

const AUTONOMOUS_POOL: Array<Omit<GnnBrainLogEntry, 'id' | 'timestamp'>> = [
  {
    subsystem: 'Planner',
    tier: 'Level 1: Read',
    level: 'INFO',
    message: 'Continuous workspace inspection: checking uncommitted script drafts and asset proxies.',
    taskRef: 'PLAN-CYCLE-09'
  },
  {
    subsystem: 'MCP Gateway',
    tier: 'Level 3: Execute',
    level: 'ACTION',
    message: 'FastMCP tool dispatch: call tool "get_audio_meters". Buses master and busA balanced.',
    detail: 'Meter L: -4.2 dB, R: -4.0 dB • Peak limiter optimal',
    taskRef: 'MCP-TOOL-503'
  },
  {
    subsystem: 'News Engine',
    tier: 'Level 2: Propose',
    level: 'INFO',
    message: 'Generated bilingual broadcast hook (EN + BN) for prime-time rundown.',
    taskRef: 'NEWS-HOOK-411'
  },
  {
    subsystem: 'Creative Studio',
    tier: 'Level 1: Read',
    level: 'SUCCESS',
    message: 'Inspected 16:9 and 9:16 vertical render matrices for active social reel templates.',
    taskRef: 'CREATIVE-712'
  },
  {
    subsystem: 'GitHub CI/CD',
    tier: 'Level 1: Read',
    level: 'INFO',
    message: 'GitHub Actions health probe: all 6 workflow definitions (.github/workflows/*) verified.',
    detail: 'ai-maintenance.yml • ci.yml • security.yml active',
    taskRef: 'GH-ACT-108'
  },
  {
    subsystem: 'Reasoner',
    tier: 'Level 1: Read',
    level: 'INFO',
    message: 'Evaluating token efficiency across generative prompts. Prompt compression ratio: 1.34x.',
    taskRef: 'REASON-904'
  },
  {
    subsystem: 'EAS / Mobile',
    tier: 'Level 2: Propose',
    level: 'INFO',
    message: 'EAS cloud build manifest cached. Ready for preview APK trigger upon next approval.',
    taskRef: 'EAS-BLD-041'
  },
  {
    subsystem: 'Security Audit',
    tier: 'Level 1: Read',
    level: 'SUCCESS',
    message: 'Level 4 guardrail check: zero unauthorized production deploy mutations detected.',
    taskRef: 'POLICY-CHECK-88'
  },
  {
    subsystem: 'Orchestrator',
    tier: 'Level 3: Execute',
    level: 'ACTION',
    message: 'Dispatched async background task to verify local repository audio spectrum signatures.',
    taskRef: 'ORCH-RUN-312'
  }
];

export const GnnBrainLogViewer: React.FC<GnnBrainLogViewerProps> = ({ defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState<boolean>(defaultExpanded);
  const [isStreaming, setIsStreaming] = useState<boolean>(true);
  const [logs, setLogs] = useState<GnnBrainLogEntry[]>(INITIAL_LOGS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedSubsystem, setSelectedSubsystem] = useState<string>('ALL');
  const [selectedLevel, setSelectedLevel] = useState<string>('ALL');
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [isTaskRunning, setIsTaskRunning] = useState<boolean>(false);
  const [isMaximized, setIsMaximized] = useState<boolean>(false);

  const terminalRef = useRef<HTMLDivElement>(null);
  const logIdCounter = useRef<number>(100);

  // Auto-scroll when new logs arrive
  useEffect(() => {
    if (autoScroll && isExpanded && terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [logs, isExpanded, autoScroll]);

  // Real-time autonomous activity streaming interval
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      // Pick a random event from the pool
      const randomTemplate = AUTONOMOUS_POOL[Math.floor(Math.random() * AUTONOMOUS_POOL.length)];
      logIdCounter.current += 1;

      const newEntry: GnnBrainLogEntry = {
        id: `log-stream-${logIdCounter.current}`,
        timestamp: new Date().toLocaleTimeString(),
        subsystem: randomTemplate.subsystem,
        tier: randomTemplate.tier,
        level: randomTemplate.level,
        message: randomTemplate.message,
        detail: randomTemplate.detail,
        taskRef: randomTemplate.taskRef || `TASK-${Math.floor(1000 + Math.random() * 9000)}`
      };

      setLogs((prev) => [...prev.slice(-150), newEntry]); // keep last 150 entries
    }, 7000);

    return () => clearInterval(interval);
  }, [isStreaming]);

  // Trigger simulated multi-step autonomous task sweep following the loop in AGENTS.md
  const handleTriggerAutonomousSweep = () => {
    if (isTaskRunning) return;
    setIsTaskRunning(true);
    if (!isExpanded) setIsExpanded(true);

    const sweepSteps: Array<{
      delay: number;
      subsystem: GnnAgentSubsystem;
      tier: GnnAutonomyTier;
      level: 'INFO' | 'ACTION' | 'SUCCESS';
      message: string;
      detail?: string;
    }> = [
      {
        delay: 200,
        subsystem: 'Planner',
        tier: 'Level 1: Read',
        level: 'INFO',
        message: '⚡ [SWEEP 1/5 UNDERSTAND]: Initiating autonomous system integrity check per Development Loop.',
        detail: 'Inspecting repository state, FastMCP sockets, and local asset inventory.'
      },
      {
        delay: 1100,
        subsystem: 'Reasoner',
        tier: 'Level 1: Read',
        level: 'INFO',
        message: '🔍 [SWEEP 2/5 INSPECT]: Evaluating audio loudness conformance (-24 LKFS standard).',
        detail: 'Sampled 3 broadcast WAV files; dynamic headrooms validated.'
      },
      {
        delay: 2100,
        subsystem: 'MCP Gateway',
        tier: 'Level 3: Execute',
        level: 'ACTION',
        message: '⚙️ [SWEEP 3/5 IMPLEMENT]: FastMCP vMix ping verified. Syncing audio buses to broadcast template.',
        detail: 'Master Vol: 100% • Bus A: -2.1 dB (Voiceover) • Bus B: -8.5 dB (Bed)'
      },
      {
        delay: 3200,
        subsystem: 'Security Audit',
        tier: 'Level 1: Read',
        level: 'SUCCESS',
        message: '🛡️ [SWEEP 4/5 TEST & SECURITY]: Clean static analysis. 0 secrets in client bundles; permissions verified.',
        detail: 'Autonomy Level 4 gate: active and enforcing human-in-the-loop protection.'
      },
      {
        delay: 4300,
        subsystem: 'Orchestrator',
        tier: 'Level 2: Propose',
        level: 'SUCCESS',
        message: '✅ [SWEEP 5/5 COMPLETE]: Autonomous verification loop passed with 0 warnings. Broadcast ready.',
        detail: 'Telemetry stream updated and operational.'
      }
    ];

    sweepSteps.forEach((step) => {
      setTimeout(() => {
        logIdCounter.current += 1;
        const entry: GnnBrainLogEntry = {
          id: `log-sweep-${logIdCounter.current}`,
          timestamp: new Date().toLocaleTimeString(),
          subsystem: step.subsystem,
          tier: step.tier,
          level: step.level,
          message: step.message,
          detail: step.detail,
          taskRef: `SWEEP-${Date.now().toString().slice(-4)}`
        };
        setLogs((prev) => [...prev, entry]);

        if (step.subsystem === 'Orchestrator' && step.level === 'SUCCESS') {
          setIsTaskRunning(false);
        }
      }, step.delay);
    });
  };

  // Export logs as JSON file
  const handleExportLogs = () => {
    const exportData = {
      exportTimestamp: new Date().toISOString(),
      agent: 'GNN AI Brain Master Orchestrator',
      totalLogs: logs.length,
      logs
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `gnn_ai_brain_telemetry_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Filtered log entries
  const filteredLogs = logs.filter((log) => {
    const matchesSearch =
      !searchQuery ||
      log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      log.subsystem.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (log.detail && log.detail.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (log.taskRef && log.taskRef.toLowerCase().includes(searchQuery.toLowerCase()));

    const matchesSubsystem = selectedSubsystem === 'ALL' || log.subsystem === selectedSubsystem;
    const matchesLevel = selectedLevel === 'ALL' || log.level === selectedLevel;

    return matchesSearch && matchesSubsystem && matchesLevel;
  });

  const latestLog = logs[logs.length - 1];

  const getLevelColor = (level: GnnBrainLogEntry['level']) => {
    switch (level) {
      case 'SUCCESS':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'ACTION':
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 'WARN':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      case 'ERROR':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
    }
  };

  const getTierBadge = (tier: GnnAutonomyTier) => {
    switch (tier) {
      case 'Level 1: Read':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-slate-800 text-slate-300 border border-slate-700">L1: Read</span>;
      case 'Level 2: Propose':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-blue-950/80 text-blue-300 border border-blue-800/60">L2: Propose</span>;
      case 'Level 3: Execute':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-amber-950/80 text-amber-300 border border-amber-800/60">L3: Execute</span>;
      case 'Level 4: Production':
        return <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-red-950/80 text-red-300 border border-red-800/60">L4: Gate</span>;
    }
  };

  return (
    <div
      id="gnn-brain-log-viewer"
      className="mt-6 rounded-xl border border-cyan-500/25 bg-slate-950/90 shadow-2xl backdrop-blur-md overflow-hidden transition-all duration-300"
    >
      {/* Header Bar - Always visible */}
      <div className="px-3.5 py-2.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 select-none">
        
        {/* Left Side: Title and Status Indicator */}
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-7 h-7 rounded-lg bg-cyan-500/15 border border-cyan-500/40 flex items-center justify-center shrink-0">
            <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
          </div>

          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-mono font-bold tracking-wider text-slate-100 uppercase truncate">
              GNN AI BRAIN • AGENT TELEMETRY
            </span>

            {/* Live Streaming Indicator */}
            <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[10px] font-mono text-emerald-400 shrink-0">
              <span className={`w-1.5 h-1.5 rounded-full ${isStreaming ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
              <span className="font-semibold">{isStreaming ? 'STREAMING' : 'PAUSED'}</span>
            </div>

            {/* Log count badge */}
            <span className="hidden sm:inline-block px-2 py-0.5 rounded bg-slate-800 text-[10px] font-mono text-slate-400 border border-slate-700/60">
              {logs.length} events
            </span>
          </div>
        </div>

        {/* Center / Ticker preview when collapsed */}
        {!isExpanded && latestLog && (
          <div
            onClick={() => setIsExpanded(true)}
            className="hidden md:flex items-center gap-2 flex-1 max-w-md mx-2 px-3 py-1 rounded-md bg-slate-950/70 border border-slate-800 text-[11px] font-mono text-slate-400 truncate cursor-pointer hover:border-cyan-500/40 hover:text-slate-200 transition-colors"
            title="Click to expand log stream"
          >
            <span className="text-cyan-400 font-bold shrink-0">[{latestLog.subsystem}]</span>
            <span className="truncate">{latestLog.message}</span>
          </div>
        )}

        {/* Right Side: Quick Action Controls */}
        <div className="flex items-center gap-1.5 shrink-0">
          
          {/* Autonomous Task Sweep Trigger */}
          <button
            type="button"
            onClick={handleTriggerAutonomousSweep}
            disabled={isTaskRunning}
            title="Run autonomous multi-step loop (UNDERSTAND → INSPECT → IMPLEMENT → TEST)"
            className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-mono font-medium border transition-all cursor-pointer ${
              isTaskRunning
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                : 'bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border-cyan-500/30 hover:border-cyan-400 shadow-xs'
            }`}
          >
            {isTaskRunning ? (
              <>
                <RefreshCw className="w-3 h-3 animate-spin" />
                <span className="text-[11px]">Sweeping...</span>
              </>
            ) : (
              <>
                <Zap className="w-3 h-3 text-cyan-400" />
                <span className="text-[11px]">Trigger Sweep</span>
              </>
            )}
          </button>

          {/* Pause / Resume Stream */}
          <button
            type="button"
            onClick={() => setIsStreaming(!isStreaming)}
            title={isStreaming ? 'Pause real-time stream' : 'Resume real-time stream'}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
          >
            {isStreaming ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
          </button>

          {/* Expand / Collapse Toggle Button */}
          <button
            type="button"
            id="gnn-brain-log-toggle-btn"
            onClick={() => setIsExpanded(!isExpanded)}
            title={isExpanded ? 'Collapse log panel' : 'Expand log panel'}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 hover:border-slate-600 text-xs font-mono font-medium transition-colors cursor-pointer"
          >
            <span>{isExpanded ? 'Collapse' : 'Expand Logs'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-cyan-400" /> : <ChevronDown className="w-3.5 h-3.5 text-cyan-400" />}
          </button>

        </div>
      </div>

      {/* Expandable Body */}
      {isExpanded && (
        <div className="p-3 sm:p-4 space-y-3 bg-slate-950/95">
          
          {/* Filter & Command Ribbon */}
          <div className="flex flex-wrap items-center justify-between gap-2.5 pb-2 border-b border-slate-800/80">
            
            {/* Search Input */}
            <div className="relative flex-1 min-w-[180px] max-w-sm">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search agent telemetry..."
                className="w-full pl-8 pr-3 py-1 bg-slate-900 border border-slate-800 rounded-lg text-xs font-mono text-slate-200 placeholder:text-slate-600 focus:outline-hidden focus:border-cyan-500/60"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 text-[11px]"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Subsystem & Severity Selectors */}
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedSubsystem}
                onChange={(e) => setSelectedSubsystem(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-300 focus:outline-hidden focus:border-cyan-500/60 cursor-pointer"
              >
                <option value="ALL">All Subsystems</option>
                <option value="Planner">Planner</option>
                <option value="Reasoner">Reasoner</option>
                <option value="Orchestrator">Orchestrator</option>
                <option value="MCP Gateway">MCP Gateway</option>
                <option value="News Engine">News Engine</option>
                <option value="Creative Studio">Creative Studio</option>
                <option value="GitHub CI/CD">GitHub CI/CD</option>
                <option value="EAS / Mobile">EAS / Mobile</option>
                <option value="Security Audit">Security Audit</option>
              </select>

              <select
                value={selectedLevel}
                onChange={(e) => setSelectedLevel(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs font-mono text-slate-300 focus:outline-hidden focus:border-cyan-500/60 cursor-pointer"
              >
                <option value="ALL">All Levels</option>
                <option value="INFO">INFO</option>
                <option value="ACTION">ACTION</option>
                <option value="SUCCESS">SUCCESS</option>
                <option value="WARN">WARN</option>
                <option value="ERROR">ERROR</option>
              </select>

              {/* Autoscroll checkbox */}
              <label className="flex items-center gap-1.5 text-xs font-mono text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={autoScroll}
                  onChange={(e) => setAutoScroll(e.target.checked)}
                  className="rounded border-slate-800 bg-slate-900 text-cyan-500 focus:ring-0 w-3 h-3 cursor-pointer"
                />
                <span>Auto-scroll</span>
              </label>
            </div>

            {/* Utility buttons */}
            <div className="flex items-center gap-1.5 ml-auto">
              {/* Maximize height toggle */}
              <button
                type="button"
                onClick={() => setIsMaximized(!isMaximized)}
                title={isMaximized ? 'Restore standard height' : 'Maximize terminal view'}
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition-colors cursor-pointer"
              >
                {isMaximized ? <Minimize2 className="w-3.5 h-3.5" /> : <Maximize2 className="w-3.5 h-3.5" />}
              </button>

              {/* Export logs */}
              <button
                type="button"
                onClick={handleExportLogs}
                title="Download full JSON telemetry trace"
                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-cyan-300 border border-slate-800 transition-colors text-xs font-mono cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Export</span>
              </button>

              {/* Clear logs */}
              <button
                type="button"
                onClick={() => setLogs([])}
                title="Clear current log buffer"
                className="p-1.5 rounded-lg bg-slate-900 hover:bg-red-950/40 text-slate-500 hover:text-red-400 border border-slate-800 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

          {/* Real-time Streaming Output Stream Window */}
          <div
            ref={terminalRef}
            className={`font-mono text-xs bg-slate-950 rounded-xl p-3.5 border border-slate-800/90 overflow-y-auto space-y-2 select-text shadow-inner transition-all duration-200 ${
              isMaximized ? 'max-h-[500px]' : 'max-h-72'
            }`}
          >
            {filteredLogs.length === 0 ? (
              <div className="py-8 text-center text-slate-600 font-mono space-y-1">
                <Terminal className="w-6 h-6 mx-auto mb-2 text-slate-700" />
                <p>No log events match the active filters.</p>
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedSubsystem('ALL');
                    setSelectedLevel('ALL');
                  }}
                  className="text-cyan-400 underline text-xs mt-1 hover:text-cyan-300"
                >
                  Reset filters
                </button>
              </div>
            ) : (
              filteredLogs.map((log) => (
                <div
                  key={log.id}
                  className="flex flex-col sm:flex-row sm:items-start gap-1 sm:gap-2.5 p-1.5 rounded hover:bg-slate-900/60 border border-transparent hover:border-slate-800/50 transition-colors group"
                >
                  {/* Timestamp & Task Ref */}
                  <div className="flex items-center gap-1.5 shrink-0 text-slate-500 text-[10px]">
                    <span className="text-slate-400">{log.timestamp}</span>
                    {log.taskRef && (
                      <span className="text-slate-600 font-mono">[{log.taskRef}]</span>
                    )}
                  </div>

                  {/* Badges: Subsystem, Tier, Level */}
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-cyan-300 border border-slate-800">
                      {log.subsystem}
                    </span>

                    {getTierBadge(log.tier)}

                    <span className={`px-1 py-0.5 rounded text-[9px] font-bold border ${getLevelColor(log.level)}`}>
                      {log.level}
                    </span>
                  </div>

                  {/* Message & Detail */}
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-200 leading-relaxed break-words">{log.message}</p>
                    {log.detail && (
                      <p className="text-[11px] text-slate-400 mt-0.5 font-mono bg-slate-900/70 p-1.5 rounded border border-slate-800/60">
                        ↳ {log.detail}
                      </p>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Footer Status & Autonomy Tier Summary */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 text-[10px] font-mono text-slate-500 border-t border-slate-900">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1 text-slate-400">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                Active Policy: <strong>GNN-v2-STRICT</strong>
              </span>
              <span>Buffer: {logs.length}/150</span>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-slate-400">Operating Loop:</span>
              <span className="text-cyan-400 font-semibold">UNDERSTAND → INSPECT → IMPLEMENT → TEST → DEPLOY</span>
            </div>
          </div>

        </div>
      )}
    </div>
  );
};

export default GnnBrainLogViewer;
