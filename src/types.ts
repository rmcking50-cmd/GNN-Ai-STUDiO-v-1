export type AssetType = 'video' | 'image' | 'audio' | 'script' | 'subtitles';

export interface RepositoryAsset {
  id: string;
  name: string;
  type: AssetType;
  url: string; // Blob URL, base64 data, or remote url
  dataUrl?: string;
  duration?: string;
  size?: string;
  createdAt: string;
  resolution?: string;
  lyrics_or_text?: string;
  language?: string;
  status?: 'Ready' | 'Processing' | 'Error';
  category?: string;
}

export interface NewsArticle {
  id: string;
  title: string;
  summary: string;
  source: string;
  url?: string;
  publishedDate: string;
  category: string;
}

export type ScriptApprovalStatus = 'draft' | 'pending_review' | 'approved' | 'rejected' | 'published';

export interface ScriptAuditLog {
  id: string;
  scriptId: string;
  scriptTitle: string;
  action: 'CREATED' | 'SUBMITTED_FOR_REVIEW' | 'APPROVED' | 'REJECTED' | 'PUBLISHED' | 'EDITED' | 'STATUS_CHANGED';
  previousStatus?: ScriptApprovalStatus;
  newStatus: ScriptApprovalStatus;
  reviewer: string;
  reviewerRole?: string;
  notes?: string;
  reason?: string;
  timestamp: string;
}

export interface GeneratedScript {
  id: string;
  articleId?: string;
  title: string;
  headline: string;
  hook: string;
  body: string;
  outro: string;
  voiceoverText: string;
  language: string;
  status: ScriptApprovalStatus;
  createdAt: string;
  author?: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  rejectionReason?: string;
  submittedForReviewAt?: string;
}

export interface SocialPost {
  id: string;
  scriptId?: string;
  assetId?: string;
  platforms: ('youtube' | 'tiktok' | 'instagram' | 'facebook' | 'twitter')[];
  caption: string;
  tags: string[];
  scheduledTime: string;
  status: 'draft' | 'scheduled' | 'published';
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  parts: { text: string }[];
  timestamp: string;
}

export type OSUserRole = 'OWNER' | 'ADMIN' | 'DEVELOPER' | 'EDITOR' | 'USER' | 'VIEWER';

export interface UserRolePayload {
  role: 'admin' | 'editor' | 'creator' | 'viewer';
  osRole?: OSUserRole;
  permissions: {
    canPublish: boolean;
    canGenerateAI: boolean;
    canEditRepository: boolean;
    canManageUsers: boolean;
  };
}

export interface McpPermissionSet {
  'github.read': boolean;
  'github.write': boolean;
  'github.deploy': boolean;
  'drive.read': boolean;
  'drive.write': boolean;
  'database.read': boolean;
  'database.write': boolean;
  'social.draft': boolean;
  'social.publish': boolean;
  'cloud.read': boolean;
  'cloud.scale': boolean;
}

export interface McpServerItem {
  id: string;
  name: string;
  type: string;
  status: 'connected' | 'active' | 'idle' | 'error';
  desc: string;
  latencyMs: number;
  scopesRequired: (keyof McpPermissionSet)[];
  endpoint?: string;
  lastSync?: string;
  authMethod: 'OAuth 2.0' | 'SSH Key' | 'API Key' | 'IAM Role';
}

export interface StructuredTelemetryLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'SUCCESS' | 'WARN' | 'ERROR';
  source: 'AI Planner' | 'MCP Gateway' | 'Database' | 'Workflow Engine' | 'Cloud' | 'Social Gateway' | 'GitHub MCP' | 'Google Drive MCP' | 'Ocoya MCP' | 'Timing Optimizer';
  event: string;
  project: string;
  status: 'running' | 'completed' | 'pending' | 'blocked';
  text: string;
}

export interface TimingOptimizationPlan {
  industryStream: 'Local/National News' | 'Tech & Security' | 'Sports Broadcaster' | 'Viral Creator';
  targetHour: string;
  engagementGain: string;
  retentionScore: number;
  optimalDays: string[];
  audienceHotspot: string;
  recommendation: string;
}

export interface VideoGenerationStatus {
  id: string;
  operationName: string;
  prompt: string;
  aspectRatio: '16:9' | '9:16';
  quality: string;
  status: 'pending' | 'success' | 'failed';
  error?: string;
  resultUrl?: string;
}

// FastMCP vMix Integration & Automation Types
export interface FastMcpAttachment {
  id: string;
  inputNumber: number;
  assetId?: string;
  name: string;
  type: 'video' | 'image' | 'audio' | 'title' | 'camera' | 'script';
  url: string;
  mimeType: string;
  attachedAt: string;
  token: string;
  autoPlay?: boolean;
  loop?: boolean;
  meta?: Record<string, any>;
}

export interface VmixInputItem {
  number: number;
  key: string;
  name: string;
  type: 'Video' | 'Image' | 'Title' | 'Camera' | 'Audio' | 'VirtualSet' | 'Browser';
  state: 'Paused' | 'Playing' | 'Running' | 'Completed';
  durationMs?: number;
  positionMs?: number;
  loop?: boolean;
  muted?: boolean;
  volume?: number;
  tally: 'program' | 'preview' | 'safe';
  attachment?: FastMcpAttachment;
  titleFields?: Record<string, string>; // e.g. Headline, Subtitle, Reporter, Location
}

export interface VmixWorkflowCue {
  id: string;
  stepNumber: number;
  stepName: string;
  action: 'switch_input' | 'trigger_overlay' | 'attach_media' | 'set_text' | 'play_audio' | 'transition' | 'duck_audio';
  targetInput: number;
  transitionType?: 'Cut' | 'Fade' | 'Zoom' | 'Wipe' | 'Stinger' | 'Merge';
  durationMs?: number;
  overlayChannel?: 1 | 2 | 3 | 4;
  overlayAction?: 'In' | 'Out' | 'Toggle';
  textPayload?: { field: string; value: string };
  delayAfterMs: number;
  status?: 'pending' | 'active' | 'completed' | 'skipped';
  logNote?: string;
}

export interface VmixAutoWorkflow {
  id: string;
  name: string;
  description: string;
  category: 'Breaking News' | 'Standard Bulletin' | 'Interview' | 'Script-to-Air' | 'Custom';
  triggerEvent: 'manual' | 'script_approved' | 'video_ready' | 'scheduler_fire';
  cues: VmixWorkflowCue[];
  totalEstimatedDuration: number;
  status: 'idle' | 'running' | 'paused' | 'completed';
  activeCueIndex: number;
}

export interface FastMcpToolLog {
  id: string;
  timestamp: string;
  toolName: string;
  params: Record<string, any>;
  result: Record<string, any>;
  durationMs: number;
  success: boolean;
  source: 'FastMCP-Server' | 'AI-Auto-Director' | 'Manual-Console';
}

export interface FastMcpVmixServerState {
  connected: boolean;
  isSimulated: boolean;
  vmixHost: string;
  vmixPort: number;
  webApiEndpoint: string;
  fastMcpEndpoint: string;
  version: string;
  programInput: number;
  previewInput: number;
  isRecording: boolean;
  isStreaming: boolean;
  isExternalOut: boolean;
  audioMasterVolume: number;
  audioBuses: {
    master: { volume: number; muted: boolean; meterL: number; meterR: number };
    busA: { volume: number; muted: boolean; meterL: number; meterR: number }; // Voiceover
    busB: { volume: number; muted: boolean; meterL: number; meterR: number }; // Music Bed
  };
  activeOverlays: number[]; // e.g. [1, 2]
  inputs: VmixInputItem[];
  attachments: FastMcpAttachment[];
  activeWorkflow?: VmixAutoWorkflow;
  lastHeartbeat: string;
  latencyMs: number;
  recentLogs: FastMcpToolLog[];
}

export type GnnAutonomyTier = 'Level 1: Read' | 'Level 2: Propose' | 'Level 3: Execute' | 'Level 4: Production';

export type GnnAgentSubsystem =
  | 'Planner'
  | 'Reasoner'
  | 'Orchestrator'
  | 'MCP Gateway'
  | 'News Engine'
  | 'Creative Studio'
  | 'GitHub CI/CD'
  | 'EAS / Mobile'
  | 'Security Audit';

export interface GnnBrainLogEntry {
  id: string;
  timestamp: string;
  subsystem: GnnAgentSubsystem;
  tier: GnnAutonomyTier;
  level: 'INFO' | 'ACTION' | 'SUCCESS' | 'WARN' | 'ERROR';
  message: string;
  detail?: string;
  taskRef?: string;
}

