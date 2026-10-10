import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Key, 
  Lock, 
  Cpu, 
  Terminal, 
  Layers, 
  Zap, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  Copy, 
  Check, 
  Github, 
  Globe, 
  Server, 
  Database, 
  Activity, 
  UserCheck, 
  Sliders, 
  Clock, 
  ExternalLink, 
  Workflow, 
  Sparkles,
  Share2,
  Box,
  HardDrive,
  Mail,
  Calendar as CalendarIcon,
  FileCode,
  FolderLock,
  Search,
  Code2,
  ArrowRight,
  ShieldAlert,
  ShieldCheck,
  Play,
  Trash2,
  Ban,
  Eye,
  FileTerminal,
  LockKeyhole
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { OSUserRole, McpPermissionSet, McpServerItem, StructuredTelemetryLog, UserRolePayload } from '../types';
import {
  executeGnnOsAction,
  validateLocalStorageToken,
  verifyTokenAndScopes,
  getStoredJwtToken,
  storeJwtToken,
  removeStoredJwtToken,
  generateAndStoreGnnJwt,
  SENSITIVE_GNN_ACTIONS,
  GnnActionResult,
  GnnTokenPayload,
  SensitiveActionConfig
} from '../utils/gnnApiMiddleware';

interface GnnControlPlaneProps {
  userRole: UserRolePayload;
  setUserRole: (role: UserRolePayload) => void;
  onNavigateTab?: (tabId: string) => void;
}

const INITIAL_MCP_SERVERS: McpServerItem[] = [
  {
    id: 'vmix_fastmcp',
    name: 'FastMCP vMix Live Switcher',
    type: 'Broadcast',
    status: 'connected',
    desc: 'Real-time FastMCP media attachments, 8-channel video switcher & auto-pilot rundown workflows',
    latencyMs: 8,
    scopesRequired: ['social.publish', 'cloud.read'],
    endpoint: 'mcp://fastmcp-vmix.internal:8088/v1',
    lastSync: 'Real-time active',
    authMethod: 'API Key'
  },
  {
    id: 'expo_mobile',
    name: 'Expo Go Mobile Companion (@aigaming)',
    type: 'Mobile',
    status: 'connected',
    desc: 'Live anchor teleprompter stream, field SRT camera hit & mobile app link for @aigaming/gnn-ai-studio',
    latencyMs: 14,
    scopesRequired: ['cloud.read', 'social.publish'],
    endpoint: 'exp://exp.host/@aigaming/gnn-ai-studio',
    lastSync: 'Real-time connected',
    authMethod: 'API Key'
  },
  {
    id: 'github',
    name: 'GitHub MCP',
    type: 'Developer',
    status: 'connected',
    desc: 'Secure repository cloning, automated commits & branch orchestration',
    latencyMs: 34,
    scopesRequired: ['github.read', 'github.write'],
    endpoint: 'mcp://github.gnn.internal:8080/v1',
    lastSync: '2 mins ago',
    authMethod: 'SSH Key'
  },
  {
    id: 'gdrive',
    name: 'Google Drive MCP',
    type: 'Storage',
    status: 'idle',
    desc: 'Auto-sync media assets & cold render archives with cloud storage',
    latencyMs: 120,
    scopesRequired: ['drive.read', 'drive.write'],
    endpoint: 'mcp://drive.google.internal/storage/v2',
    lastSync: '18 mins ago',
    authMethod: 'OAuth 2.0'
  },
  {
    id: 'gmail',
    name: 'Gmail MCP',
    type: 'Workspace',
    status: 'connected',
    desc: 'Automated broadcast summaries & editorial press pitch releases',
    latencyMs: 45,
    scopesRequired: ['drive.read'],
    endpoint: 'mcp://gmail.google.internal/mail/v1',
    lastSync: '5 mins ago',
    authMethod: 'OAuth 2.0'
  },
  {
    id: 'gcalendar',
    name: 'Calendar MCP',
    type: 'Workspace',
    status: 'connected',
    desc: 'Sync editorial boards, live broadcast slots & publication timers',
    latencyMs: 40,
    scopesRequired: ['drive.read'],
    endpoint: 'mcp://calendar.google.internal/cal/v3',
    lastSync: 'Just now',
    authMethod: 'OAuth 2.0'
  },
  {
    id: 'notion',
    name: 'Notion MCP',
    type: 'Integrations',
    status: 'connected',
    desc: 'Pull structured news hooks, editorial scripts & research templates',
    latencyMs: 88,
    scopesRequired: ['database.read'],
    endpoint: 'mcp://notion.internal/v1/blocks',
    lastSync: '12 mins ago',
    authMethod: 'API Key'
  },
  {
    id: 'figma',
    name: 'Figma MCP',
    type: 'Creative',
    status: 'idle',
    desc: 'Sync vector cards, lower-thirds overlays & branding shapes',
    latencyMs: 110,
    scopesRequired: ['drive.read'],
    endpoint: 'mcp://figma.internal/v2/files',
    lastSync: '1 hr ago',
    authMethod: 'OAuth 2.0'
  },
  {
    id: 'blender',
    name: 'Blender MCP',
    type: 'Creative',
    status: 'idle',
    desc: 'Automate 3D virtual studio rendering triggers & camera rig parameters',
    latencyMs: 240,
    scopesRequired: ['cloud.scale'],
    endpoint: 'mcp://blender-render.internal:9999',
    lastSync: '4 hrs ago',
    authMethod: 'IAM Role'
  },
  {
    id: 'ocoya',
    name: 'Ocoya MCP',
    type: 'Publishing',
    status: 'active',
    desc: 'Multi-channel social scheduler & auto-publishing gateway',
    latencyMs: 28,
    scopesRequired: ['social.draft', 'social.publish'],
    endpoint: 'mcp://ocoya.api.internal/social/v3',
    lastSync: 'Live',
    authMethod: 'API Key'
  },
  {
    id: 'database',
    name: 'Database MCP',
    type: 'Database',
    status: 'active',
    desc: 'PostgreSQL instance metrics synchronization & high-density telemetry',
    latencyMs: 14,
    scopesRequired: ['database.read', 'database.write'],
    endpoint: 'postgres://gnn_os_db:5432/gnn_production',
    lastSync: 'Live',
    authMethod: 'IAM Role'
  },
  {
    id: 'docker',
    name: 'Docker MCP',
    type: 'System',
    status: 'connected',
    desc: 'Control virtual render environment containers & ffmpeg pipelines',
    latencyMs: 19,
    scopesRequired: ['cloud.read', 'cloud.scale'],
    endpoint: 'unix:///var/run/docker.sock',
    lastSync: '1 min ago',
    authMethod: 'IAM Role'
  },
  {
    id: 'kubernetes',
    name: 'Kubernetes MCP',
    type: 'System',
    status: 'connected',
    desc: 'Scale real-time caption pipelines & high-throughput worker nodes',
    latencyMs: 22,
    scopesRequired: ['cloud.scale'],
    endpoint: 'https://k8s-cluster.gnn.internal',
    lastSync: '1 min ago',
    authMethod: 'IAM Role'
  },
  {
    id: 'cloud',
    name: 'Cloud MCP',
    type: 'System',
    status: 'active',
    desc: 'Google Cloud Run microservices routing logs & container ingress',
    latencyMs: 16,
    scopesRequired: ['cloud.read', 'cloud.scale'],
    endpoint: 'https://ais-dev-pz6tgpgynuzy2yxumtbvjg.asia-southeast1.run.app',
    lastSync: 'Live',
    authMethod: 'IAM Role'
  }
];

const INITIAL_TELEMETRY_LOGS: StructuredTelemetryLog[] = [
  {
    id: 'log-1',
    timestamp: '23:24:45',
    level: 'INFO',
    source: 'AI Planner',
    event: 'audience_model_recalculation',
    project: 'gnn-ai-studio',
    status: 'running',
    text: 'AI Planner: Recalculating demographic engagement coefficient based on new Bangladesh viewership.'
  },
  {
    id: 'log-2',
    timestamp: '23:24:30',
    level: 'INFO',
    source: 'Database',
    event: 'index_telemetry_batch',
    project: 'gnn-ai-studio',
    status: 'completed',
    text: 'Database MCP: Running standard indexing protocol for high-density social performance logs.'
  },
  {
    id: 'log-3',
    timestamp: '23:23:48',
    level: 'SUCCESS',
    source: 'Google Drive MCP',
    event: 'backup_archive_push',
    project: 'gnn-ai-studio',
    status: 'completed',
    text: 'Google Drive MCP: Sync completed. Pushed backup copy of captioned reels.'
  },
  {
    id: 'log-4',
    timestamp: '23:23:13',
    level: 'INFO',
    source: 'AI Planner',
    event: 'demographic_coefficient_update',
    project: 'gnn-ai-studio',
    status: 'completed',
    text: 'AI Planner: Recalculating demographic engagement coefficient based on new Bangladesh viewership.'
  },
  {
    id: 'log-5',
    timestamp: '23:22:40',
    level: 'INFO',
    source: 'GitHub MCP',
    event: 'auto_commit_templates',
    project: 'gnn-ai-studio',
    status: 'completed',
    text: 'GitHub MCP: Automated commit of latest News Studio layout templates.'
  },
  {
    id: 'log-6',
    timestamp: '19:38:02',
    level: 'SUCCESS',
    source: 'Workflow Engine',
    event: 'os_init_layers',
    project: 'gnn-ai-studio',
    status: 'completed',
    text: 'GNN AI OS initialization complete. Layer 1-5 online.'
  },
  {
    id: 'log-7',
    timestamp: '19:38:05',
    level: 'INFO',
    source: 'GitHub MCP',
    event: 'ssh_key_verified',
    project: 'gnn-ai-studio',
    status: 'completed',
    text: 'GitHub MCP loaded. SSH Key status verified.'
  },
  {
    id: 'log-8',
    timestamp: '19:38:10',
    level: 'SUCCESS',
    source: 'Ocoya MCP',
    event: 'social_gateway_synced',
    project: 'gnn-ai-studio',
    status: 'completed',
    text: 'Ocoya MCP channel sync: TikTok, YouTube, Instagram Reels connected.'
  },
  {
    id: 'log-9',
    timestamp: '19:38:12',
    level: 'INFO',
    source: 'Timing Optimizer',
    event: 'peak_window_calculated',
    project: 'gnn-ai-studio',
    status: 'completed',
    text: 'SEO Engine optimization active: calculated optimal post time as 18:15 (+24.5% Gain).'
  }
];

export default function GnnControlPlane({ userRole, setUserRole, onNavigateTab }: GnnControlPlaneProps) {
  const [activeSubView, setActiveSubView] = useState<'architecture' | 'mcp_gateway' | 'auth_security' | 'telemetry' | 'database_schema'>('architecture');
  const [mcpList, setMcpList] = useState<McpServerItem[]>(INITIAL_MCP_SERVERS);
  const [telemetryLogs, setTelemetryLogs] = useState<StructuredTelemetryLog[]>(INITIAL_TELEMETRY_LOGS);
  const [isLiveListening, setIsLiveListening] = useState<boolean>(true);
  const [selectedMcpConfig, setSelectedMcpConfig] = useState<McpServerItem | null>(null);
  const [copiedKey, setCopiedKey] = useState<boolean>(false);
  const [filterSource, setFilterSource] = useState<string>('all');
  
  // SSH Key state (using user-provided key specification)
  const [sshKey, setSshKey] = useState<string>(
    'ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDQza5597369bb77a9197264... GNN-Studio-Agent@GNN-OS'
  );
  const [isGeneratingKey, setIsGeneratingKey] = useState<boolean>(false);

  // User Auth & RBAC state
  const [currentOsRole, setCurrentOsRole] = useState<OSUserRole>('ADMIN');
  const [mcpPermissions, setMcpPermissions] = useState<McpPermissionSet>({
    'github.read': true,
    'github.write': true,
    'github.deploy': true,
    'drive.read': true,
    'drive.write': true,
    'database.read': true,
    'database.write': true,
    'social.draft': true,
    'social.publish': true,
    'cloud.read': true,
    'cloud.scale': false,
  });

  // JWT Token & API Middleware State
  const [storedJwt, setStoredJwt] = useState<string | null>(getStoredJwtToken());
  const [decodedToken, setDecodedToken] = useState<GnnTokenPayload | null>(null);
  const [tokenStatus, setTokenStatus] = useState<{ valid: boolean; expired?: boolean; error?: string }>({ valid: false });
  const [executingActionId, setExecutingActionId] = useState<string | null>(null);
  const [lastActionResult, setLastActionResult] = useState<GnnActionResult | null>(null);
  const [isSigningToken, setIsSigningToken] = useState<boolean>(false);
  const [selectedActionCategory, setSelectedActionCategory] = useState<string>('all');
  const [middlewareLogs, setMiddlewareLogs] = useState<{ id: string; time: string; type: 'ALLOW' | 'BLOCK' | 'ERROR'; action: string; scope: string; reason: string }[]>([]);

  // Refresh token information from localStorage
  const refreshStoredTokenState = () => {
    const val = validateLocalStorageToken();
    setStoredJwt(val.token);
    setDecodedToken(val.payload);
    setTokenStatus({ valid: val.valid, expired: val.expired, error: val.error });
  };

  useEffect(() => {
    refreshStoredTokenState();
  }, []);

  // Sync / Re-sign JWT Token with current active scope selection
  const handleSignTokenWithActiveScopes = async (overrideScopes?: string[], overrideRole?: OSUserRole) => {
    setIsSigningToken(true);
    const roleToUse = overrideRole || currentOsRole;
    try {
      const activeScopes = overrideScopes || Object.entries(mcpPermissions)
        .filter(([_, enabled]) => enabled)
        .map(([scope]) => scope);

      const res = await generateAndStoreGnnJwt(
        `GNN-${roleToUse}-Director`,
        roleToUse,
        activeScopes
      );

      setStoredJwt(res.token);
      setDecodedToken(res.payload);
      setTokenStatus({ valid: true });

      const timeStr = new Date().toTimeString().split(' ')[0];
      setTelemetryLogs(prev => [
        {
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          level: 'SUCCESS',
          source: 'Workflow Engine',
          event: 'jwt_token_minted',
          project: 'gnn-ai-studio',
          status: 'completed',
          text: `GNN Auth Service: Signed fresh JWT token in localStorage with ${activeScopes.length} scopes [${activeScopes.join(', ')}] for role [${roleToUse}].`
        },
        ...prev
      ]);
    } catch (err: any) {
      console.error('Failed to sign JWT token:', err);
    } finally {
      setIsSigningToken(false);
    }
  };

  // Simulate missing token from localStorage
  const handleClearToken = () => {
    removeStoredJwtToken();
    refreshStoredTokenState();
    const timeStr = new Date().toTimeString().split(' ')[0];
    setTelemetryLogs(prev => [
      {
        id: `log-${Date.now()}`,
        timestamp: timeStr,
        level: 'WARN',
        source: 'Workflow Engine',
        event: 'jwt_token_cleared',
        project: 'gnn-ai-studio',
        status: 'completed',
        text: 'Operator intentionally removed JWT token from localStorage to test unauthenticated rejection.'
      },
      ...prev
    ]);
  };

  // Simulate corrupt token in localStorage
  const handleCorruptToken = () => {
    storeJwtToken('invalid.corrupted.jwt_token_signature_fail_9981');
    refreshStoredTokenState();
    const timeStr = new Date().toTimeString().split(' ')[0];
    setTelemetryLogs(prev => [
      {
        id: `log-${Date.now()}`,
        timestamp: timeStr,
        level: 'WARN',
        source: 'Workflow Engine',
        event: 'jwt_token_corrupted',
        project: 'gnn-ai-studio',
        status: 'completed',
        text: 'Operator stored corrupted JWT string in localStorage to test format/signature security rejection.'
      },
      ...prev
    ]);
  };

  // Quick Scope Presets
  const applyScopePreset = (presetName: 'devops' | 'auditor' | 'restricted' | 'owner') => {
    let newScopes: McpPermissionSet;
    let newOsRole: OSUserRole;

    if (presetName === 'devops') {
      // Has github.read, github.write, cloud.read, cloud.scale
      newScopes = {
        'github.read': true,
        'github.write': true,
        'github.deploy': true,
        'drive.read': true,
        'drive.write': false,
        'database.read': true,
        'database.write': true,
        'social.draft': false,
        'social.publish': false,
        'cloud.read': true,
        'cloud.scale': true,
      };
      newOsRole = 'DEVELOPER';
    } else if (presetName === 'auditor') {
      // Read-only: lacks cloud.scale, lacks github.write
      newScopes = {
        'github.read': true,
        'github.write': false,
        'github.deploy': false,
        'drive.read': true,
        'drive.write': false,
        'database.read': true,
        'database.write': false,
        'social.draft': false,
        'social.publish': false,
        'cloud.read': true,
        'cloud.scale': false,
      };
      newOsRole = 'VIEWER';
    } else if (presetName === 'restricted') {
      // No sensitive scopes at all
      newScopes = {
        'github.read': false,
        'github.write': false,
        'github.deploy': false,
        'drive.read': false,
        'drive.write': false,
        'database.read': false,
        'database.write': false,
        'social.draft': false,
        'social.publish': false,
        'cloud.read': false,
        'cloud.scale': false,
      };
      newOsRole = 'VIEWER';
    } else {
      // Owner wildcard
      newScopes = {
        'github.read': true,
        'github.write': true,
        'github.deploy': true,
        'drive.read': true,
        'drive.write': true,
        'database.read': true,
        'database.write': true,
        'social.draft': true,
        'social.publish': true,
        'cloud.read': true,
        'cloud.scale': true,
      };
      newOsRole = 'OWNER';
    }

    setMcpPermissions(newScopes);
    setCurrentOsRole(newOsRole);

    const activeList = presetName === 'owner' 
      ? ['*'] 
      : Object.entries(newScopes).filter(([_, v]) => v).map(([k]) => k);

    handleSignTokenWithActiveScopes(activeList, newOsRole);
  };

  // Execute Sensitive Action through the API Middleware Wrapper
  const handleExecuteSensitiveAction = async (actionKey: string) => {
    const config = SENSITIVE_GNN_ACTIONS[actionKey];
    if (!config) return;

    setExecutingActionId(actionKey);
    const timeStr = new Date().toTimeString().split(' ')[0];

    try {
      // Execute through the middleware wrapper
      const result = await executeGnnOsAction({
        action: actionKey,
        payload: config.defaultPayload
      });

      setLastActionResult(result);

      if (result.success) {
        setTelemetryLogs(prev => [
          {
            id: `log-${Date.now()}`,
            timestamp: timeStr,
            level: 'SUCCESS',
            source: actionKey.startsWith('github') ? 'GitHub MCP' : actionKey.startsWith('cloud') ? 'Cloud' : actionKey.startsWith('database') ? 'Database' : 'Workflow Engine',
            event: `${actionKey.replace('.', '_')}_executed`,
            project: 'gnn-ai-studio',
            status: 'completed',
            text: `API Middleware [PERMITTED]: Action [${config.name}] executed under verified scope [${result.requiredScopes.join(', ')}]. Audit: ${result.auditId || 'logged'}.`
          },
          ...prev
        ]);

        setMiddlewareLogs(prev => [
          {
            id: `mw-${Date.now()}`,
            time: timeStr,
            type: 'ALLOW',
            action: config.name,
            scope: result.requiredScopes.join(', '),
            reason: `Scope authorized in localStorage token and verified by backend. Action executed successfully.`
          },
          ...prev.slice(0, 24)
        ]);
      } else {
        setTelemetryLogs(prev => [
          {
            id: `log-${Date.now()}`,
            timestamp: timeStr,
            level: 'WARN',
            source: 'Workflow Engine',
            event: `${actionKey.replace('.', '_')}_blocked`,
            project: 'gnn-ai-studio',
            status: 'blocked',
            text: `API Middleware [BLOCKED]: Execution of [${config.name}] rejected. ${result.error}`
          },
          ...prev
        ]);

        setMiddlewareLogs(prev => [
          {
            id: `mw-${Date.now()}`,
            time: timeStr,
            type: 'BLOCK',
            action: config.name,
            scope: result.requiredScopes.join(', '),
            reason: result.error || 'Blocked by middleware security scope check'
          },
          ...prev.slice(0, 24)
        ]);
      }
    } catch (err: any) {
      console.error('Action error:', err);
    } finally {
      setExecutingActionId(null);
    }
  };

  // Simulated live event pump
  useEffect(() => {
    if (!isLiveListening) return;

    const interval = setInterval(() => {
      const sources: StructuredTelemetryLog['source'][] = [
        'AI Planner', 'MCP Gateway', 'Database', 'Workflow Engine', 'Cloud', 'Social Gateway', 'GitHub MCP', 'Timing Optimizer'
      ];
      const randomSource = sources[Math.floor(Math.random() * sources.length)];
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0];

      const sampleEvents = [
        { source: 'AI Planner', event: 'demographic_refinement', text: 'AI Planner: Tuned Bangladesh market retention weights for portrait video loops.' },
        { source: 'MCP Gateway', event: 'health_check_ping', text: 'MCP Gateway: Health check verified on 12 active servers. Roundtrip latency: 18ms.' },
        { source: 'Database', event: 'metrics_sync_cycle', text: 'Database MCP: Telemetry metrics written to PostgreSQL production partition.' },
        { source: 'Workflow Engine', event: 'approval_gate_check', text: 'Workflow Engine: Evaluated user role permissions before triggering background job.' },
        { source: 'Social Gateway', event: 'queue_telemetry', text: 'Ocoya Gateway: Queue depth nominal (1 queued, 0 retrying).' },
        { source: 'GitHub MCP', event: 'branch_sync', text: 'GitHub MCP: Checked remote branch origin/main — up to date with SSH credentials.' },
        { source: 'Cloud', event: 'ingress_route_ok', text: 'Cloud MCP: Google Cloud Run ingress telemetry streaming on port 3000.' },
        { source: 'Timing Optimizer', event: 'recalculate_window', text: 'Timing Optimizer: Confirmed optimal publish window for Tech & Security remains 18:15.' }
      ];

      const match = sampleEvents.find(e => e.source === randomSource) || sampleEvents[0];
      const newLog: StructuredTelemetryLog = {
        id: `log-${Date.now()}`,
        timestamp: timeStr,
        level: Math.random() > 0.85 ? 'SUCCESS' : 'INFO',
        source: randomSource,
        event: match.event,
        project: 'gnn-ai-studio',
        status: 'completed',
        text: match.text
      };

      setTelemetryLogs(prev => [newLog, ...prev.slice(0, 49)]);
    }, 4500);

    return () => clearInterval(interval);
  }, [isLiveListening]);

  const handleCopySshKey = () => {
    navigator.clipboard.writeText(sshKey);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleRegenerateKey = () => {
    setIsGeneratingKey(true);
    setTimeout(() => {
      setSshKey('ssh-rsa AAAAB3NzaC1yc2EAAAADAQABAAACAQDQza5597369bb77a9197264... GNN-Studio-Agent@GNN-OS');
      setIsGeneratingKey(false);
      
      const timeStr = new Date().toTimeString().split(' ')[0];
      setTelemetryLogs(prev => [
        {
          id: `log-${Date.now()}`,
          timestamp: timeStr,
          level: 'SUCCESS',
          source: 'GitHub MCP',
          event: 'ssh_key_regenerated',
          project: 'gnn-ai-studio',
          status: 'completed',
          text: 'GitHub MCP: Generated fresh RSA 4096-bit public keypair. Private key securely stored in Google Secret Manager.'
        },
        ...prev
      ]);
    }, 700);
  };

  const handlePingMcp = (id: string) => {
    setMcpList(prev => prev.map(m => {
      if (m.id === id) {
        return {
          ...m,
          latencyMs: Math.floor(Math.random() * 25) + 10,
          lastSync: 'Just now'
        };
      }
      return m;
    }));

    const target = mcpList.find(m => m.id === id);
    const timeStr = new Date().toTimeString().split(' ')[0];
    setTelemetryLogs(prev => [
      {
        id: `log-${Date.now()}`,
        timestamp: timeStr,
        level: 'SUCCESS',
        source: 'MCP Gateway',
        event: 'manual_ping_handshake',
        project: 'gnn-ai-studio',
        status: 'completed',
        text: `MCP Gateway: Handshake ping successful for [${target?.name}]. Verified latency: ${target?.latencyMs}ms.`
      },
      ...prev
    ]);
  };

  const filteredLogs = filterSource === 'all' 
    ? telemetryLogs 
    : telemetryLogs.filter(l => l.source.toLowerCase().includes(filterSource.toLowerCase()));

  return (
    <div className="space-y-6">
      {/* Header Banner: GNN AI OS Unified Control Layer */}
      <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-cyan-500 to-emerald-500" />
        
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="px-2 py-0.5 rounded bg-red-600/10 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                GNN AI OS Core
              </span>
              <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                Control Layer v1.0
              </span>
              <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live Telemetry Active
              </span>
            </div>
            
            <h2 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <Cpu className="w-6 h-6 text-red-500" />
              GNN AI Operating System & Control Plane
            </h2>
            <p className="text-xs text-slate-400 font-mono mt-1">
              Unified Master AI, Model Context Protocol (MCP) Gateway, RBAC Security Suite & Timing Optimizer
            </p>
          </div>

          {/* Quick Sub-navigation tabs */}
          <div className="flex flex-wrap items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 text-xs font-mono">
            {[
              { id: 'architecture', label: 'Architecture & Engine', icon: Layers },
              { id: 'mcp_gateway', label: 'MCP Gateway (12)', icon: Server },
              { id: 'auth_security', label: 'Auth, RBAC & JWT Middleware', icon: Shield },
              { id: 'telemetry', label: 'System Telemetry', icon: Activity },
              { id: 'database_schema', label: 'DB Schema', icon: Database }
            ].map(tab => {
              const Icon = tab.icon;
              const isActive = activeSubView === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveSubView(tab.id as any)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-red-600 text-white font-bold shadow-lg shadow-red-950/40' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* --- SUBVIEW 1: UNIFIED ARCHITECTURE & MASTER AI --- */}
      {activeSubView === 'architecture' && (
        <div className="space-y-6">
          {/* Architecture Visualizer Card */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Workflow className="w-5 h-5 text-cyan-400" />
                  Unified GNN AI OS Architectural Hierarchy
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Master AI coordinates Planning, Memory, Reasoning, Workflow execution, and MCP Gateways
                </p>
              </div>
              <span className="text-xs font-mono text-slate-500 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                Core State: <strong className="text-emerald-400">NOMINAL (100%)</strong>
              </span>
            </div>

            {/* Visual Node Hierarchy */}
            <div className="bg-slate-900/40 border border-slate-900 rounded-xl p-6 font-mono">
              {/* Top Node: GNN AI OS */}
              <div className="flex justify-center mb-4">
                <div className="bg-gradient-to-r from-red-600 to-red-700 text-white font-bold px-6 py-2.5 rounded-xl shadow-lg shadow-red-950/50 border border-red-500/40 text-center">
                  <div className="text-sm">GNN AI OS</div>
                  <div className="text-[10px] text-red-200 font-normal">Unified Operating System Core</div>
                </div>
              </div>

              {/* Connecting line */}
              <div className="w-px h-6 bg-slate-700 mx-auto" />
              <div className="w-2/3 h-px bg-slate-700 mx-auto" />

              {/* Level 2: GNN Master AI vs OS Control Plane */}
              <div className="grid grid-cols-2 gap-8 my-4">
                {/* Left Branch: GNN Master AI */}
                <div className="space-y-3">
                  <div className="bg-slate-900 border border-cyan-500/40 rounded-xl p-4 text-center shadow-lg shadow-cyan-950/20">
                    <div className="text-cyan-400 font-bold text-xs uppercase flex items-center justify-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      GNN Master AI
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Autonomous Agent Orchestration</div>
                  </div>

                  {/* Tri-split: Planner, Memory, Reasoner */}
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-center">
                      <span className="text-emerald-400 block font-bold">Planner</span>
                      <span className="text-slate-500 text-[9px]">Goal Decomp</span>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-center">
                      <span className="text-purple-400 block font-bold">Memory</span>
                      <span className="text-slate-500 text-[9px]">Episodic & Vector</span>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-center">
                      <span className="text-yellow-400 block font-bold">Reasoner</span>
                      <span className="text-slate-500 text-[9px]">Multi-Step LLM</span>
                    </div>
                  </div>

                  <div className="w-px h-4 bg-slate-700 mx-auto" />

                  {/* Workflow Engine Node */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                    <div className="text-white font-bold text-xs flex items-center justify-center gap-1.5">
                      <Workflow className="w-3.5 h-3.5 text-red-400" />
                      Workflow Engine
                    </div>
                    <div className="text-[9px] text-slate-400">Task Queues · Schedulers · Approval Gates</div>
                  </div>
                </div>

                {/* Right Branch: OS Control Plane */}
                <div className="space-y-3">
                  <div className="bg-slate-900 border border-emerald-500/40 rounded-xl p-4 text-center shadow-lg shadow-emerald-950/20">
                    <div className="text-emerald-400 font-bold text-xs uppercase flex items-center justify-center gap-1.5">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      OS Control Plane
                    </div>
                    <div className="text-[10px] text-slate-400 mt-0.5">Policy & System Telemetry Core</div>
                  </div>

                  {/* Tri-split: Telemetry, Security, Config */}
                  <div className="grid grid-cols-3 gap-2 text-[10px]">
                    <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-center">
                      <span className="text-cyan-400 block font-bold">Telemetry</span>
                      <span className="text-slate-500 text-[9px]">Real-time Logs</span>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-center">
                      <span className="text-red-400 block font-bold">Security</span>
                      <span className="text-slate-500 text-[9px]">RBAC & SSH</span>
                    </div>
                    <div className="bg-slate-950 border border-slate-800 p-2 rounded-lg text-center">
                      <span className="text-amber-400 block font-bold">Config</span>
                      <span className="text-slate-500 text-[9px]">Secrets & Env</span>
                    </div>
                  </div>

                  <div className="w-px h-4 bg-slate-700 mx-auto" />

                  {/* Permission Layer Guard */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 text-center">
                    <div className="text-white font-bold text-xs flex items-center justify-center gap-1.5">
                      <FolderLock className="w-3.5 h-3.5 text-emerald-400" />
                      Permission Layer Guard
                    </div>
                    <div className="text-[9px] text-slate-400">Policy Authorization · Rate Limiting · Audit Log</div>
                  </div>
                </div>
              </div>

              {/* Connecting to MCP Gateway */}
              <div className="w-px h-6 bg-slate-700 mx-auto" />

              {/* MCP Gateway Hub */}
              <div className="bg-gradient-to-r from-cyan-950/40 via-slate-900 to-blue-950/40 border border-cyan-500/30 rounded-xl p-4 text-center">
                <div className="text-cyan-400 font-bold text-sm flex items-center justify-center gap-2">
                  <Server className="w-4 h-4" />
                  Model Context Protocol (MCP) Gateway Hub
                </div>
                <p className="text-[10px] text-slate-400 mt-1">
                  12 Enterprise MCP Handshakes: GitHub · Drive · Gmail · Calendar · Notion · Figma · Blender · Ocoya · DB · Docker · K8s · Cloud
                </p>
              </div>
            </div>
          </div>

          {/* 7 OS Subsystems Matrix */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                title: 'AI OS',
                icon: Cpu,
                color: 'text-red-400',
                border: 'border-red-500/30',
                items: ['Master AI', 'Planner Engine', 'Memory Store', 'Reasoner', 'Agent Runtime']
              },
              {
                title: 'MCP OS',
                icon: Server,
                color: 'text-cyan-400',
                border: 'border-cyan-500/30',
                items: ['Server Registry', 'OAuth Gateway', 'Permissions Matrix', 'Tool Discovery', 'Health Handshakes']
              },
              {
                title: 'Workflow OS',
                icon: Workflow,
                color: 'text-purple-400',
                border: 'border-purple-500/30',
                items: ['Task Queues', 'Priority Schedulers', 'Approval Policies', 'Background Workers', 'Retry Deadletters']
              },
              {
                title: 'Media & SEO OS',
                icon: Sparkles,
                color: 'text-yellow-400',
                border: 'border-yellow-500/30',
                items: ['News Scraper', 'Timing Optimizer (18:15)', 'Social Publisher (Ocoya)', 'Analytics Desk', 'Auto-Captions']
              }
            ].map((sub, i) => (
              <div key={i} className={`bg-slate-950 border ${sub.border} rounded-xl p-4 shadow-lg`}>
                <div className="flex items-center gap-2 mb-3">
                  <sub.icon className={`w-4 h-4 ${sub.color}`} />
                  <h4 className="text-xs font-bold text-white uppercase tracking-wider">{sub.title}</h4>
                </div>
                <ul className="space-y-1.5 font-mono text-[10px] text-slate-400">
                  {sub.items.map((item, idx) => (
                    <li key={idx} className="flex items-center gap-1.5">
                      <span className="w-1 h-1 rounded-full bg-slate-600" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* --- SUBVIEW 2: REAL-TIME MCP GATEWAY REGISTRY --- */}
      {activeSubView === 'mcp_gateway' && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 shadow-xl">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Server className="w-5 h-5 text-cyan-400" />
                  Model Context Protocol (MCP) Server Registry
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Live connection states, roundtrip latency telemetry, and fine-grained authorization gates
                </p>
              </div>

              <div className="flex items-center gap-2 text-xs font-mono">
                <span className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-lg">
                  8 Connected / Active
                </span>
                <span className="px-3 py-1 bg-slate-800 text-slate-400 rounded-lg">
                  4 Idle Standby
                </span>
              </div>
            </div>

            {/* MCP Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {mcpList.map(mcp => (
                <div 
                  key={mcp.id}
                  className="bg-slate-900/40 border border-slate-850 hover:border-slate-750 rounded-xl p-4 transition-all relative overflow-hidden flex flex-col justify-between"
                >
                  <div className={`absolute top-0 left-0 right-0 h-1 ${
                    mcp.status === 'active' ? 'bg-emerald-500' :
                    mcp.status === 'connected' ? 'bg-cyan-500' : 'bg-slate-700'
                  }`} />

                  <div>
                    <div className="flex justify-between items-start mb-2 pt-1">
                      <div>
                        <span className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                          {mcp.type}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1">{mcp.name}</h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <span className={`w-2 h-2 rounded-full ${
                          mcp.status === 'active' ? 'bg-emerald-400 animate-pulse' :
                          mcp.status === 'connected' ? 'bg-cyan-400' : 'bg-slate-500'
                        }`} />
                        <span className="text-[10px] font-mono text-slate-400 capitalize">{mcp.status}</span>
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 font-mono leading-relaxed mb-3">
                      {mcp.desc}
                    </p>
                  </div>

                  <div className="space-y-2 pt-2 border-t border-slate-850 text-[10px] font-mono">
                    <div className="flex justify-between text-slate-400">
                      <span>Auth Method:</span>
                      <span className="text-slate-200 font-semibold">{mcp.authMethod}</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Latency:</span>
                      <span className="text-cyan-400 font-semibold">{mcp.latencyMs}ms</span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Last Sync:</span>
                      <span className="text-slate-300">{mcp.lastSync}</span>
                    </div>

                    <div className="flex gap-2 pt-1">
                      <button
                        onClick={() => handlePingMcp(mcp.id)}
                        className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 py-1.5 rounded text-[10px] font-bold transition-colors cursor-pointer flex items-center justify-center gap-1"
                      >
                        <RefreshCw className="w-3 h-3" />
                        <span>Ping Handshake</span>
                      </button>
                      <button
                        onClick={() => setSelectedMcpConfig(mcp)}
                        className="px-2.5 bg-slate-800 hover:bg-slate-750 text-cyan-400 py-1.5 rounded text-[10px] font-bold transition-colors cursor-pointer"
                      >
                        Config
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- SUBVIEW 3: AUTH, RBAC & SSH KEY MANAGEMENT --- */}
      {activeSubView === 'auth_security' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            
            {/* Identity & RBAC Matrix Card */}
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="border-b border-slate-900 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <UserCheck className="w-5 h-5 text-red-500" />
                    Role-Based Access Control (RBAC) & Identity
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    User identity, session management, and role hierarchies
                  </p>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-red-600/10 border border-red-500/20 text-red-400 font-bold">
                  {currentOsRole} MODE
                </span>
              </div>

              {/* Role Selector */}
              <div>
                <label className="block text-xs font-mono text-slate-400 uppercase mb-2">Switch Active OS Role</label>
                <div className="grid grid-cols-3 gap-2">
                  {(['OWNER', 'ADMIN', 'DEVELOPER', 'EDITOR', 'USER', 'VIEWER'] as OSUserRole[]).map(role => (
                    <button
                      key={role}
                      onClick={() => {
                        setCurrentOsRole(role);
                        const isHigh = role === 'OWNER' || role === 'ADMIN' || role === 'DEVELOPER';
                        setUserRole({
                          role: role === 'VIEWER' ? 'viewer' : role === 'EDITOR' ? 'editor' : 'admin',
                          osRole: role,
                          permissions: {
                            canPublish: role === 'OWNER' || role === 'ADMIN',
                            canGenerateAI: role !== 'VIEWER',
                            canEditRepository: isHigh,
                            canManageUsers: role === 'OWNER' || role === 'ADMIN'
                          }
                        });
                      }}
                      className={`p-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer text-center ${
                        currentOsRole === role
                          ? 'bg-red-600 text-white shadow-lg shadow-red-950/40 border border-red-500/40'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {role}
                    </button>
                  ))}
                </div>
              </div>

              {/* Granular Permission Matrix */}
              <div className="space-y-2 pt-2">
                <span className="text-xs font-mono text-slate-400 uppercase block">Fine-Grained MCP Permissions</span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  {Object.entries(mcpPermissions).map(([key, val]) => (
                    <label 
                      key={key} 
                      className="p-2.5 bg-slate-900/60 border border-slate-850 rounded-lg flex items-center justify-between cursor-pointer hover:bg-slate-900"
                    >
                      <span className="text-slate-300">{key}</span>
                      <input 
                        type="checkbox"
                        checked={val}
                        onChange={(e) => {
                          setMcpPermissions(prev => ({ ...prev, [key]: e.target.checked }));
                        }}
                        className="rounded text-red-600 focus:ring-red-500 bg-slate-950 border-slate-700"
                      />
                    </label>
                  ))}
                </div>
              </div>

              {/* Approval Policy Notice */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl p-3.5 text-xs font-mono text-amber-300 flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <p>
                  <strong>Approval Policy Active:</strong> High-risk operations (Publish, Deploy, Branch Push, DB Mutation, Infrastructure Scaling) require explicit operator sign-off before Master AI execution.
                </p>
              </div>
            </div>

            {/* GitHub OAuth & SSH Key Management Card */}
            <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 shadow-xl space-y-5">
              <div className="border-b border-slate-900 pb-3 flex justify-between items-start">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Github className="w-5 h-5 text-white" />
                    GitHub Developer Mode & SSH Key
                  </h3>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    Cloning repositories, pulling commits, triggers
                  </p>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 font-bold">
                  RSA 4096-BIT
                </span>
              </div>

              {/* Public SSH Key Output Box */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs font-mono">
                  <span className="text-slate-400 uppercase">Public Key (Add to your GitHub Settings)</span>
                  <span className="text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> ✓ SSH Key generation complete
                  </span>
                </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3.5 font-mono text-[11px] text-slate-300 break-all leading-relaxed relative group select-all">
                  {sshKey}
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleCopySshKey}
                    className="flex-1 bg-slate-800 hover:bg-slate-750 text-white font-mono text-xs font-bold py-2 px-3 rounded-lg transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                  >
                    {copiedKey ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Key Copied to Clipboard!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-slate-400" />
                        <span>Copy Key</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={handleRegenerateKey}
                    disabled={isGeneratingKey}
                    className="bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 font-mono text-xs py-2 px-3 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isGeneratingKey ? 'animate-spin text-cyan-400' : ''}`} />
                    <span>Generate RSA SSH Key</span>
                  </button>
                </div>
              </div>

              {/* Security Guideline Callout */}
              <div className="bg-slate-900/80 border border-slate-850 rounded-xl p-4 space-y-2 text-xs font-mono">
                <div className="text-slate-300 font-bold flex items-center gap-1.5">
                  <Key className="w-4 h-4 text-cyan-400" />
                  KMS Private Key Protection
                </div>
                <p className="text-slate-400 leading-relaxed text-[11px]">
                  Private keys are never exposed in browser runtime or client bundles. Private keys are encrypted via Google Cloud KMS / Secret Manager. Git push/pull operations occur through secure server-side worker containers.
                </p>
                <div className="pt-2 text-[10px] text-slate-500">
                  Authorized Callback URI: <code>https://auth.gnnaistudio.com/oauth/github/callback</code>
                </div>
              </div>
            </div>

          </div>

          {/* ========================================================================================= */}
          {/* SENSITIVE GNN AI OS ACTIONS & JWT API MIDDLEWARE SECURITY GATE */}
          {/* ========================================================================================= */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 shadow-2xl space-y-6">
            
            {/* Section Header */}
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-slate-900 pb-5">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="px-2 py-0.5 rounded bg-red-600/10 border border-red-500/30 text-red-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                    API Security Wrapper
                  </span>
                  <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-[10px] font-mono font-bold uppercase tracking-wider">
                    localStorage JWT Guard
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-bold uppercase tracking-wider flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    Zero-Bypass Policy
                  </span>
                </div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <LockKeyhole className="w-5 h-5 text-red-500" />
                  API Middleware Wrapper & Sensitive GNN AI OS Actions Security Gate
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Validates signed JWT tokens from <code>localStorage</code> and enforces strict permission scopes (e.g. <code>github.read</code>, <code>cloud.scale</code>, <code>database.write</code>) before allowing execution of sensitive operating system operations.
                </p>
              </div>

              {/* Live Token Status Badge */}
              <div className="flex items-center gap-2">
                {tokenStatus.valid && decodedToken ? (
                  <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3.5 py-2 text-right">
                    <div className="text-[10px] font-mono text-emerald-400 font-bold flex items-center justify-end gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      JWT VALIDATED IN LOCALSTORAGE
                    </div>
                    <div className="text-xs font-mono text-slate-300">
                      Operator: <span className="text-white font-bold">{decodedToken.login}</span> ({decodedToken.role})
                    </div>
                  </div>
                ) : tokenStatus.expired ? (
                  <div className="bg-amber-500/10 border border-amber-500/30 rounded-xl px-3.5 py-2 text-right">
                    <div className="text-[10px] font-mono text-amber-400 font-bold flex items-center justify-end gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      TOKEN EXPIRED
                    </div>
                    <div className="text-xs font-mono text-slate-400">Re-signing required</div>
                  </div>
                ) : (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-3.5 py-2 text-right">
                    <div className="text-[10px] font-mono text-red-400 font-bold flex items-center justify-end gap-1.5">
                      <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                      NO VALID TOKEN (HTTP 401)
                    </div>
                    <div className="text-xs font-mono text-slate-400">Missing from localStorage</div>
                  </div>
                )}
              </div>
            </div>

            {/* Token Inspector & Scope Quick Presets */}
            <div className="bg-slate-900/60 border border-slate-850 rounded-xl p-4 space-y-4">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="text-xs font-mono text-slate-300 font-bold flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-cyan-400" />
                  <span>localStorage Key: <code className="text-cyan-300 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">gnn_jwt_token</code></span>
                </div>

                {/* Scope Presets for fast testing */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                  <span className="text-slate-500 text-[11px] mr-1">Testing Presets:</span>
                  <button
                    onClick={() => applyScopePreset('devops')}
                    className="bg-slate-800 hover:bg-slate-750 text-cyan-300 border border-cyan-500/30 px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-all hover:border-cyan-400"
                    title="Grants github.read, github.write, cloud.read, cloud.scale"
                  >
                    DevOps Role (Has cloud.scale)
                  </button>
                  <button
                    onClick={() => applyScopePreset('auditor')}
                    className="bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-all hover:border-amber-400"
                    title="Read-only: lacks cloud.scale & github.write to test middleware rejection"
                  >
                    Auditor Role (Lacks cloud.scale)
                  </button>
                  <button
                    onClick={() => applyScopePreset('owner')}
                    className="bg-slate-800 hover:bg-slate-750 text-emerald-300 border border-emerald-500/30 px-2.5 py-1 rounded text-[11px] font-bold cursor-pointer transition-all hover:border-emerald-400"
                    title="Owner superuser wildcard (*)"
                  >
                    Owner (*)
                  </button>
                  <button
                    onClick={handleCorruptToken}
                    className="bg-slate-800 hover:bg-red-950/40 text-rose-400 border border-rose-500/30 px-2.5 py-1 rounded text-[11px] cursor-pointer transition-all hover:border-rose-400 flex items-center gap-1"
                    title="Test format/signature rejection"
                  >
                    <Ban className="w-3 h-3" />
                    Corrupt Token
                  </button>
                  <button
                    onClick={handleClearToken}
                    className="bg-slate-800 hover:bg-red-950/40 text-red-400 border border-red-500/30 px-2.5 py-1 rounded text-[11px] cursor-pointer transition-all hover:border-red-400 flex items-center gap-1"
                    title="Test unauthenticated 401 rejection"
                  >
                    <Trash2 className="w-3 h-3" />
                    Clear Token
                  </button>
                </div>
              </div>

              {/* Decoded Granted Scopes in current token */}
              <div className="pt-2 border-t border-slate-850 flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
                <div className="space-y-1.5 flex-1">
                  <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2">
                    <span>Active Granted Scopes in Decoded Token ({decodedToken?.scopes?.length || 0}):</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {decodedToken?.scopes && decodedToken.scopes.length > 0 ? (
                      decodedToken.scopes.map(sc => (
                        <span 
                          key={sc}
                          className={`text-[11px] font-mono px-2 py-0.5 rounded font-bold border ${
                            sc === '*' 
                              ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40' 
                              : sc.includes('scale') || sc.includes('write')
                              ? 'bg-cyan-500/15 text-cyan-300 border-cyan-500/30'
                              : 'bg-slate-800 text-slate-300 border-slate-700'
                          }`}
                        >
                          {sc}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] font-mono text-slate-500 italic">
                        No active scopes in token. Actions requiring permission will be blocked.
                      </span>
                    )}
                  </div>
                </div>

                {/* Re-sign button */}
                <button
                  onClick={() => handleSignTokenWithActiveScopes()}
                  disabled={isSigningToken}
                  className="bg-red-600 hover:bg-red-500 text-white text-xs font-mono font-bold px-3.5 py-2 rounded-lg transition-all cursor-pointer shadow-lg shadow-red-950/40 border border-red-500/40 flex items-center gap-1.5 shrink-0 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSigningToken ? 'animate-spin' : ''}`} />
                  <span>Re-Sign Token from RBAC Matrix</span>
                </button>
              </div>
            </div>

            {/* Category Filter Chips */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-1.5 text-xs font-mono">
                <span className="text-slate-500 text-xs mr-1">Action Categories:</span>
                {(['all', 'Developer & Git', 'Cloud Infrastructure', 'Database', 'Social Gateway', 'Broadcast'] as const).map(cat => (
                  <button
                    key={cat}
                    onClick={() => setSelectedActionCategory(cat)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono cursor-pointer transition-all ${
                      selectedActionCategory === cat
                        ? 'bg-slate-800 text-white font-bold border border-slate-700'
                        : 'text-slate-400 hover:text-white bg-slate-900/60 border border-slate-900'
                    }`}
                  >
                    {cat === 'all' ? 'All Sensitive Actions (8)' : cat}
                  </button>
                ))}
              </div>

              <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-cyan-400" />
                <span>Pre-flight evaluated dynamically against current localStorage token</span>
              </div>
            </div>

            {/* Sensitive Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(SENSITIVE_GNN_ACTIONS)
                .filter(([_, act]) => selectedActionCategory === 'all' || act.category === selectedActionCategory)
                .map(([key, act]) => {
                  // Live preflight evaluation
                  const preflight = verifyTokenAndScopes(act.requiredScopes);
                  const isExecuting = executingActionId === key;

                  return (
                    <div 
                      key={key}
                      className={`bg-slate-900/70 border rounded-xl p-4 flex flex-col justify-between space-y-4 transition-all ${
                        preflight.allowed 
                          ? 'border-slate-800 hover:border-slate-700' 
                          : 'border-red-950/60 hover:border-red-900/80 bg-red-950/10'
                      }`}
                    >
                      <div className="space-y-2">
                        {/* Top Meta Line */}
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700">
                            {act.category}
                          </span>
                          
                          <div className="flex items-center gap-1.5">
                            <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded border ${
                              act.riskLevel === 'CRITICAL' 
                                ? 'bg-red-500/20 text-red-300 border-red-500/30'
                                : act.riskLevel === 'HIGH'
                                ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                                : 'bg-cyan-500/20 text-cyan-300 border-cyan-500/30'
                            }`}>
                              RISK: {act.riskLevel}
                            </span>
                          </div>
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h4 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
                            {act.name}
                          </h4>
                          <p className="text-xs text-slate-400 font-mono mt-1 leading-relaxed">
                            {act.description}
                          </p>
                        </div>

                        {/* Required Scope Badge & Pre-flight Gate Status */}
                        <div className="pt-2 flex flex-wrap items-center justify-between gap-2 border-t border-slate-850/80 text-xs font-mono">
                          <div className="flex items-center gap-1.5">
                            <span className="text-slate-500 text-[11px]">Required Scope:</span>
                            {act.requiredScopes.map(scope => (
                              <span 
                                key={scope}
                                className="px-2 py-0.5 rounded bg-slate-950 text-cyan-300 border border-cyan-500/40 font-bold text-[11px]"
                              >
                                {scope}
                              </span>
                            ))}
                          </div>

                          {/* Pre-flight verdict */}
                          {preflight.allowed ? (
                            <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              Permitted
                            </span>
                          ) : (
                            <span className="text-[10px] font-bold text-rose-400 bg-rose-500/10 border border-rose-500/30 px-2 py-0.5 rounded flex items-center gap-1">
                              <ShieldAlert className="w-3 h-3 text-rose-400" />
                              Blocked by Scope
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Execute Button */}
                      <button
                        onClick={() => handleExecuteSensitiveAction(key)}
                        disabled={isExecuting}
                        className={`w-full py-2 px-3 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center justify-center gap-2 ${
                          preflight.allowed
                            ? 'bg-slate-800 hover:bg-slate-750 text-white border border-slate-700 hover:border-slate-600'
                            : 'bg-red-950/30 hover:bg-red-950/60 text-red-300 border border-red-900/60'
                        } disabled:opacity-50`}
                      >
                        {isExecuting ? (
                          <>
                            <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                            <span>Validating Token & Executing...</span>
                          </>
                        ) : (
                          <>
                            <Play className={`w-3.5 h-3.5 ${preflight.allowed ? 'text-emerald-400' : 'text-red-400'}`} />
                            <span>
                              {preflight.allowed ? 'Execute via API Middleware' : 'Attempt Execution (Test Block)'}
                            </span>
                          </>
                        )}
                      </button>
                    </div>
                  );
                })}
            </div>

            {/* Live Execution Output & Security Interception Terminal */}
            {lastActionResult && (
              <motion.div 
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`rounded-xl p-5 border font-mono space-y-3 ${
                  lastActionResult.success 
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-200'
                    : 'bg-rose-950/20 border-rose-500/40 text-rose-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 border-b border-white/10 pb-3">
                  <div className="flex items-center gap-2">
                    {lastActionResult.success ? (
                      <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                    ) : (
                      <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
                    )}
                    <div>
                      <h4 className="text-sm font-bold text-white">
                        {lastActionResult.success 
                          ? `Execution Permitted & Succeeded: [${lastActionResult.action}]`
                          : `Execution Blocked by Security Middleware: [${lastActionResult.action}]`
                        }
                      </h4>
                      <div className="text-[11px] opacity-80">
                        Response Code: <strong className="text-white">{lastActionResult.code}</strong> • Timestamp: {new Date(lastActionResult.timestamp).toLocaleTimeString()}
                      </div>
                    </div>
                  </div>

                  <div className="text-xs">
                    Operator: <strong className="text-white">{lastActionResult.executedBy || 'Unknown'}</strong>
                  </div>
                </div>

                {/* Details / Message */}
                {lastActionResult.success ? (
                  <div className="space-y-2">
                    <p className="text-xs text-emerald-300">
                      {lastActionResult.message || 'Action execution completed.'} Verified Scopes: <code>[{lastActionResult.requiredScopes.join(', ')}]</code>
                    </p>
                    {lastActionResult.auditId && (
                      <div className="text-[11px] text-emerald-400/80">
                        Cloud SQL Audit Entry Created: <code>{lastActionResult.auditId}</code>
                      </div>
                    )}
                    {lastActionResult.data && (
                      <div className="bg-slate-950/90 border border-slate-900 rounded-lg p-3 text-[11px] text-slate-300 overflow-x-auto max-h-48">
                        <pre>{JSON.stringify(lastActionResult.data, null, 2)}</pre>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="space-y-2">
                    <p className="text-xs text-rose-300 leading-relaxed font-bold">
                      {lastActionResult.error}
                    </p>
                    <div className="text-[11px] text-rose-300/80 bg-rose-950/40 p-2.5 rounded border border-rose-900/50 leading-relaxed">
                      <strong>Security Policy:</strong> The requested action required scope <code>[{lastActionResult.requiredScopes.join(' OR ')}]</code>. 
                      The user token in <code>localStorage</code> only possesses: <code>[{lastActionResult.grantedScopes?.length > 0 ? lastActionResult.grantedScopes.join(', ') : 'NONE'}]</code>.
                      The execution was blocked by the client middleware wrapper and refused by the backend.
                    </div>
                  </div>
                )}
              </motion.div>
            )}

            {/* Interception Audit History Log Table */}
            {middlewareLogs.length > 0 && (
              <div className="space-y-2 pt-2 border-t border-slate-900">
                <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                  <span className="uppercase font-bold flex items-center gap-1.5">
                    <FileTerminal className="w-3.5 h-3.5 text-cyan-400" />
                    Recent Middleware Interception Stream ({middlewareLogs.length})
                  </span>
                  <button 
                    onClick={() => setMiddlewareLogs([])}
                    className="text-[10px] text-slate-500 hover:text-slate-300 cursor-pointer"
                  >
                    Clear Log
                  </button>
                </div>

                <div className="bg-slate-900/60 border border-slate-850 rounded-xl overflow-hidden text-xs font-mono">
                  <div className="divide-y divide-slate-850 max-h-56 overflow-y-auto">
                    {middlewareLogs.map(log => (
                      <div key={log.id} className="p-2.5 flex items-center justify-between gap-3 hover:bg-slate-850/50">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            log.type === 'ALLOW' 
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' 
                              : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                          }`}>
                            {log.type}
                          </span>
                          <span className="text-slate-400 text-[11px] shrink-0">{log.time}</span>
                          <span className="text-white font-bold truncate text-[11px]">{log.action}</span>
                          <span className="text-cyan-400 text-[10px] bg-slate-950 px-1 rounded border border-slate-800 shrink-0">
                            {log.scope}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400 truncate max-w-xs text-right">
                          {log.reason}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

          </div>
        </div>
      )}

      {/* --- SUBVIEW 4: STRUCTURED SYSTEM TELEMETRY EVENT STREAM --- */}
      {activeSubView === 'telemetry' && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-900 pb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-5 h-5 text-cyan-400" />
                  Live Structured System Telemetry Stream
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Real-time event logging across AI Planner, MCP Gateways, DB indexes, and Cloud workers
                </p>
              </div>

              <div className="flex items-center gap-3">
                {/* Filter source */}
                <select
                  value={filterSource}
                  onChange={(e) => setFilterSource(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs font-mono text-slate-300 outline-none"
                >
                  <option value="all">All Sources</option>
                  <option value="AI Planner">AI Planner</option>
                  <option value="MCP Gateway">MCP Gateway</option>
                  <option value="GitHub MCP">GitHub MCP</option>
                  <option value="Database">Database MCP</option>
                  <option value="Timing Optimizer">Timing Optimizer</option>
                </select>

                {/* Live listening toggle */}
                <button
                  onClick={() => setIsLiveListening(!isLiveListening)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                    isLiveListening 
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <span className={`w-2 h-2 rounded-full ${isLiveListening ? 'bg-emerald-400 animate-ping' : 'bg-slate-500'}`} />
                  <span>{isLiveListening ? 'Live Listening' : 'Stream Paused'}</span>
                </button>
              </div>
            </div>

            {/* High-density Terminal Body */}
            <div className="bg-slate-950 rounded-xl border border-slate-900 p-4 font-mono text-xs max-h-96 overflow-y-auto space-y-2 scrollbar-thin">
              {filteredLogs.map(log => (
                <div 
                  key={log.id} 
                  className="flex items-start gap-2.5 p-2 rounded hover:bg-slate-900/40 transition-colors"
                >
                  <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 ${
                    log.level === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    log.level === 'WARN' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'
                  }`}>
                    {log.level}
                  </span>
                  <span className="text-slate-400 font-bold shrink-0">[{log.source}]:</span>
                  <span className="text-slate-200 flex-1">{log.text}</span>
                </div>
              ))}
            </div>

            {/* Live System Status Ticker */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
              {[
                { label: 'AI Planner', status: 'RUNNING', color: 'text-emerald-400' },
                { label: 'MCP Gateway', status: 'RUNNING', color: 'text-emerald-400' },
                { label: 'Database Indexer', status: 'RUNNING', color: 'text-emerald-400' },
                { label: 'Workflow Engine', status: 'RUNNING', color: 'text-emerald-400' }
              ].map((s, idx) => (
                <div key={idx} className="bg-slate-900/50 p-2.5 rounded-lg border border-slate-850 flex items-center justify-between font-mono text-xs">
                  <span className="text-slate-400">{s.label}</span>
                  <span className={`font-bold flex items-center gap-1 ${s.color}`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    {s.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* --- SUBVIEW 5: DATABASE SCHEMA & TABLES --- */}
      {activeSubView === 'database_schema' && (
        <div className="space-y-6">
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-6 shadow-xl space-y-4">
            <div className="border-b border-slate-900 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Database className="w-5 h-5 text-purple-400" />
                GNN AI OS Database Entity Schema
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                PostgreSQL schema definition for users, encrypted OAuth accounts, sessions, and audit logs
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 font-mono text-xs">
              {[
                {
                  table: 'users',
                  columns: ['id (UUID, PK)', 'email (VARCHAR, UNIQUE)', 'display_name (VARCHAR)', 'avatar_url (TEXT)', 'created_at (TIMESTAMP)']
                },
                {
                  table: 'oauth_accounts',
                  columns: ['id (UUID, PK)', 'user_id (UUID, FK)', 'provider (VARCHAR)', 'provider_account_id (VARCHAR)', 'access_token_encrypted (TEXT)', 'refresh_token_encrypted (TEXT)', 'expires_at (TIMESTAMP)', 'scopes (TEXT[])']
                },
                {
                  table: 'sessions',
                  columns: ['id (UUID, PK)', 'user_id (UUID, FK)', 'token_hash (VARCHAR)', 'expires_at (TIMESTAMP)', 'ip_address (INET)', 'user_agent (TEXT)']
                },
                {
                  table: 'roles & permissions',
                  columns: ['role_id (VARCHAR, PK)', 'permission_key (VARCHAR, PK)', 'description (TEXT)', 'created_at (TIMESTAMP)']
                },
                {
                  table: 'mcp_connections',
                  columns: ['id (UUID, PK)', 'mcp_server_id (VARCHAR)', 'status (VARCHAR)', 'auth_method (VARCHAR)', 'endpoint (TEXT)', 'latency_ms (INT)', 'last_ping (TIMESTAMP)']
                },
                {
                  table: 'audit_logs',
                  columns: ['id (UUID, PK)', 'user_id (UUID)', 'action (VARCHAR)', 'target_entity (VARCHAR)', 'mcp_server (VARCHAR)', 'payload (JSONB)', 'timestamp (TIMESTAMP)']
                }
              ].map((t, idx) => (
                <div key={idx} className="bg-slate-900/60 border border-slate-850 rounded-xl p-4 space-y-2">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-purple-400 font-bold text-sm flex items-center gap-1.5">
                      <Code2 className="w-4 h-4 text-purple-400" />
                      {t.table}
                    </span>
                    <span className="text-[10px] text-slate-500">PostgreSQL</span>
                  </div>
                  <ul className="space-y-1 text-[11px] text-slate-400">
                    {t.columns.map((col, cIdx) => (
                      <li key={cIdx} className="flex items-center gap-1.5">
                        <span className="w-1 h-1 rounded-full bg-slate-600" />
                        <span className={col.includes('encrypted') ? 'text-amber-400 font-semibold' : ''}>
                          {col}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* MCP Configuration Modal */}
      <AnimatePresence>
        {selectedMcpConfig && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2.5">
                  <Server className="w-5 h-5 text-cyan-400" />
                  <div>
                    <h3 className="text-base font-bold text-white">{selectedMcpConfig.name} Configuration</h3>
                    <p className="text-xs text-slate-400 font-mono">{selectedMcpConfig.endpoint}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedMcpConfig(null)}
                  className="text-slate-400 hover:text-white font-mono text-xs cursor-pointer"
                >
                  ✕ Close
                </button>
              </div>

              <div className="space-y-3 text-xs font-mono">
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 space-y-1.5">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Status:</span>
                    <span className="text-emerald-400 font-bold capitalize">{selectedMcpConfig.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Auth Method:</span>
                    <span className="text-slate-200">{selectedMcpConfig.authMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Roundtrip Latency:</span>
                    <span className="text-cyan-400">{selectedMcpConfig.latencyMs}ms</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-slate-400 uppercase text-[10px] block">Required Scopes</label>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedMcpConfig.scopesRequired.map((sc, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-300 text-[10px]">
                        {sc}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-3 border-t border-slate-800">
                <button
                  onClick={() => {
                    handlePingMcp(selectedMcpConfig.id);
                    setSelectedMcpConfig(null);
                  }}
                  className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white font-mono text-xs font-bold py-2.5 rounded-xl transition-colors cursor-pointer"
                >
                  Ping Handshake & Save
                </button>
                <button
                  onClick={() => setSelectedMcpConfig(null)}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-300 font-mono text-xs py-2.5 px-4 rounded-xl cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
