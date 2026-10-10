import React, { useState, createContext, useContext, useEffect, useRef, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar, { ROLES } from './components/Sidebar';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import NewsEditor from './components/NewsEditor';
import StudioDirector from './components/StudioDirector';
import AudioTools from './components/AudioTools';
import ManualEditPanel from './components/ManualEditPanel';
import AssetRepository from './components/AssetRepository';
import SocialScheduler from './components/SocialScheduler';
import ChatAssistant from './components/ChatAssistant';
import AiBrainStudio from './components/AiBrainStudio';
import GnnControlPlane from './components/GnnControlPlane';
import ScriptApprovalHub from './components/ScriptApprovalHub';
import FastMcpVmixStudio from './components/FastMcpVmixStudio';
import EmptyState from './components/EmptyState';
import GnnBrainLogViewer from './components/GnnBrainLogViewer';
import GoogleDriveConnector from './components/GoogleDriveConnector';
import GmailNewsDesk from './components/GmailNewsDesk';
import ExpoMobileCompanion from './components/ExpoMobileCompanion';
import { 
  Mail,
  Search, 
  Sparkles, 
  Plus, 
  FileText, 
  Image, 
  Trash2, 
  HelpCircle, 
  Tv, 
  Zap, 
  RefreshCw, 
  Check, 
  X,
  PlusCircle,
  Eye,
  EyeOff,
  Github,
  Lock,
  Unlock,
  ShieldCheck,
  LogOut,
  LayoutGrid,
  List,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowUpDown,
  Download,
  GitCommit,
  AlertTriangle,
  CheckCircle2,
  Copy,
  GitMerge,
  Palette,
  MoveVertical,
  RotateCcw,
  Sliders,
  Settings,
  Maximize2,
  Minimize2,
  Bookmark,
  Layers,
  Proportions,
  Smartphone
} from 'lucide-react';
import { RepositoryAsset, GeneratedScript, SocialPost, ChatMessage, UserRolePayload } from './types';

// WORKSPACE BORDER CATEGORY COLOR THEMES
export type WorkspaceBorderColorId = 'default' | 'red' | 'blue' | 'green' | 'amber' | 'purple';

export interface BorderColorTheme {
  id: WorkspaceBorderColorId;
  label: string;
  category: string;
  description: string;
  borderClass: string;
  dotClass: string;
  badgeClass: string;
  glowClass: string;
}

export const BORDER_COLOR_THEMES: Record<WorkspaceBorderColorId, BorderColorTheme> = {
  default: {
    id: 'default',
    label: 'Default',
    category: 'Studio Slate',
    description: 'Neutral Slate Studio Standard',
    borderClass: 'border-white/10 hover:border-white/20',
    dotClass: 'bg-slate-400 border border-slate-300',
    badgeClass: 'bg-slate-950 border-slate-800 text-slate-300 hover:text-white',
    glowClass: 'hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),0_0_25px_rgba(239,68,68,0.1)]',
  },
  red: {
    id: 'red',
    label: 'Red',
    category: 'Editorial',
    description: 'Editorial & Breaking News',
    borderClass: 'border-red-500/70 hover:border-red-400 shadow-[0_0_25px_rgba(239,68,68,0.25)] ring-1 ring-red-500/40',
    dotClass: 'bg-red-500 border border-red-300 shadow-[0_0_8px_rgba(239,68,68,0.8)]',
    badgeClass: 'bg-red-500/20 text-red-300 border-red-500/40 hover:bg-red-500/30',
    glowClass: 'hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),0_0_35px_rgba(239,68,68,0.4)]',
  },
  blue: {
    id: 'blue',
    label: 'Blue',
    category: 'Live Ops',
    description: 'Live Broadcast & Operations',
    borderClass: 'border-blue-500/70 hover:border-blue-400 shadow-[0_0_25px_rgba(59,130,246,0.25)] ring-1 ring-blue-500/40',
    dotClass: 'bg-blue-500 border border-blue-300 shadow-[0_0_8px_rgba(59,130,246,0.8)]',
    badgeClass: 'bg-blue-500/20 text-blue-300 border-blue-500/40 hover:bg-blue-500/30',
    glowClass: 'hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),0_0_35px_rgba(59,130,246,0.4)]',
  },
  green: {
    id: 'green',
    label: 'Green',
    category: 'Approved',
    description: 'Approved & Verified Deliverables',
    borderClass: 'border-emerald-500/70 hover:border-emerald-400 shadow-[0_0_25px_rgba(16,185,129,0.25)] ring-1 ring-emerald-500/40',
    dotClass: 'bg-emerald-500 border border-emerald-300 shadow-[0_0_8px_rgba(16,185,129,0.8)]',
    badgeClass: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30',
    glowClass: 'hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),0_0_35px_rgba(16,185,129,0.4)]',
  },
  amber: {
    id: 'amber',
    label: 'Amber',
    category: 'In Review',
    description: 'Pending Review & High Priority',
    borderClass: 'border-amber-500/70 hover:border-amber-400 shadow-[0_0_25px_rgba(245,158,11,0.25)] ring-1 ring-amber-500/40',
    dotClass: 'bg-amber-500 border border-amber-300 shadow-[0_0_8px_rgba(245,158,11,0.8)]',
    badgeClass: 'bg-amber-500/20 text-amber-300 border-amber-500/40 hover:bg-amber-500/30',
    glowClass: 'hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),0_0_35px_rgba(245,158,11,0.4)]',
  },
  purple: {
    id: 'purple',
    label: 'Purple',
    category: 'AI Brain',
    description: 'AI Synthesis & Automated Workflows',
    borderClass: 'border-purple-500/70 hover:border-purple-400 shadow-[0_0_25px_rgba(168,85,247,0.25)] ring-1 ring-purple-500/40',
    dotClass: 'bg-purple-500 border border-purple-300 shadow-[0_0_8px_rgba(168,85,247,0.8)]',
    badgeClass: 'bg-purple-500/20 text-purple-300 border-purple-500/40 hover:bg-purple-500/30',
    glowClass: 'hover:shadow-[0_25px_50px_-12px_rgba(0,0,0,0.7),0_0_35px_rgba(168,85,247,0.4)]',
  },
};

// AUTHENTICATION CONTEXT & PROVIDER
export interface AuthUser {
  id: string;
  login: string;
  name: string;
  avatarUrl: string;
  role: string;
  scopes: string[];
}

interface AuthContextType {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithGitHub: () => void;
  logout: () => void;
  hasPermission: (scope: string) => boolean;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      localStorage.setItem('gnn_jwt_token', urlToken);
      window.history.replaceState({}, document.title, window.location.pathname);
      setToken(urlToken);
    } else {
      const storedToken = localStorage.getItem('gnn_jwt_token');
      if (storedToken) {
        setToken(storedToken);
      } else {
        // Auto-provision initial valid operator token with default scopes into localStorage
        fetch('/api/auth/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            login: 'GNN-Station-Director',
            role: 'ADMIN',
            customScopes: [
              'github.read',
              'github.write',
              'github.deploy',
              'drive.read',
              'drive.write',
              'database.read',
              'database.write',
              'social.draft',
              'social.publish',
              'cloud.read',
              'cloud.scale',
              'system:configure',
              'scripts:read',
              'scripts:write'
            ]
          })
        })
          .then(res => res.json())
          .then(data => {
            if (data.success && data.token) {
              localStorage.setItem('gnn_jwt_token', data.token);
              setToken(data.token);
            }
          })
          .catch(err => console.warn('[Auth Boot] Token auto-provision warning:', err));
      }
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetch('/api/auth/me', {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success && data.user) {
            setUser(data.user);
          } else {
            localStorage.removeItem('gnn_jwt_token');
            setToken(null);
            setUser(null);
          }
        })
        .catch(() => {
          setUser({
            id: 'gh-user-9981',
            login: 'GNN-Studio-Agent',
            name: 'GNN Station Director',
            avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
            role: 'OWNER',
            scopes: ['github.read', 'github.write', 'github.deploy', 'drive.read', 'drive.write', 'database.read', 'database.write', 'social.draft', 'social.publish', 'cloud.read', 'cloud.scale']
          });
        })
        .finally(() => setIsLoading(false));
    } else {
      setUser({
        id: 'gh-user-9981',
        login: 'GNN-Studio-Agent',
        name: 'GNN Station Director',
        avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80',
        role: 'OWNER',
        scopes: ['github.read', 'github.write', 'github.deploy', 'drive.read', 'drive.write', 'database.read', 'database.write', 'social.draft', 'social.publish', 'cloud.read', 'cloud.scale']
      });
      setIsLoading(false);
    }
  }, [token]);

  const loginWithGitHub = () => {
    window.location.href = '/api/auth/github/callback?code=mock_github_auth_code_9981';
  };

  const logout = () => {
    localStorage.removeItem('gnn_jwt_token');
    setToken(null);
    setUser(null);
  };

  const hasPermission = (scope: string) => {
    if (!user) return false;
    if (user.role === 'OWNER' || user.role === 'ADMIN') return true;
    return user.scopes?.includes(scope) || user.scopes?.includes('*');
  };

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user, isLoading, loginWithGitHub, logout, hasPermission }}>
      {children}
    </AuthContext.Provider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

function MainAppContent() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [userRole, setUserRole] = useState<UserRolePayload>(ROLES.admin);

  // Initial High Fidelity Assets
  const [assets, setAssets] = useState<RepositoryAsset[]>([
    {
      id: 'asset-video-init',
      name: 'GNN News Intro Loop (Landscape)',
      type: 'video',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-news-studio-studio-desk-broadcasting-41554-large.mp4',
      duration: '0:12',
      size: '3.4 MB',
      resolution: '1080p',
      createdAt: '2026-06-19',
      status: 'Ready',
      folder: 'Studio Intros',
    },
    {
      id: 'asset-video-init-portrait',
      name: 'Mobile Anchor Intro (Portrait)',
      type: 'video',
      url: 'https://assets.mixkit.co/videos/preview/mixkit-news-anchor-on-chroma-key-studio-41551-large.mp4',
      duration: '0:15',
      size: '2.9 MB',
      resolution: '720p',
      createdAt: '2026-06-19',
      status: 'Processing',
      folder: 'Field & Mobile',
    },
    {
      id: 'asset-img-init',
      name: 'Dynamic Studio Backdrop Plate',
      type: 'image',
      url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000&auto=format&fit=crop&q=80',
      size: '1.2 MB',
      resolution: '2560x1440',
      createdAt: '2026-06-19',
      status: 'Ready',
      folder: 'Studio Backdrops',
    },
    {
      id: 'asset-audio-init',
      name: 'GNN Studio Intro Jingle Master Track',
      type: 'audio',
      url: 'https://assets.mixkit.co/active_storage/sfx/2869/2869-preview.mp3',
      duration: '0:06',
      size: '142 KB',
      createdAt: '2026-06-19',
      status: 'Ready',
      category: 'Studio Promo',
      folder: 'Audio Jingles',
    },
    {
      id: 'asset-sub-init',
      name: 'Bengali Caption Template SRT',
      type: 'subtitles',
      url: '#',
      size: '2 KB',
      createdAt: '2026-06-19',
      lyrics_or_text: "1\n00:00:01,000 --> 00:00:05,000\nজিএনএন বাংলা স্টুডিও থেকে সরাসরি সম্প্রচারিত তথ্য।\n\n2\n00:00:05,100 --> 00:00:10,000\nআজকের প্রধান খবরগুলো নিয়ে আমি আপনাদের সাথে আছি কাহিনুর রহমান।",
      language: 'Bangla',
      status: 'Error',
      folder: 'Captions',
    }
  ]);

  // Initial High-Fidelity News Scripts
  const [scripts, setScripts] = useState<GeneratedScript[]>([
    {
      id: 'script-init-1',
      title: 'Breakthrough Fusion Grid Accomplishes Net Thermal Yield',
      headline: 'Breakthrough Fusion Grid Accomplishes Net Thermal Yield',
      hook: 'Welcome to GNN Science desk. Today, we bring you historical developments on clean energy.',
      body: 'Leading experimental physics centers stabilized high-energy core fusion plasma for over 18 minutes, demonstrating feasibility of thermal containment models.',
      outro: 'Stay tuned with GNN networks for local updates. GNN studio.',
      voiceoverText: 'Welcome to GNN Science desk. Today, we bring you historical developments on clean energy. Leading experimental physics centers stabilized high-energy core fusion plasma for over 18 minutes, demonstrating feasibility of thermal containment models. Stay tuned with GNN networks for local updates.',
      language: 'English',
      status: 'pending_review',
      createdAt: '2026-06-19',
      author: 'Chief Science Correspondent',
      submittedForReviewAt: new Date(Date.now() - 3600000).toISOString(),
    },
    {
      id: 'script-demo-bangla',
      title: 'Bangladesh Tech Growth Hits Record Benchmark',
      headline: 'Bangladesh Tech Growth Hits Record Benchmark',
      hook: 'জিএনএন বাংলা টেক ডেস্কে আপনাদের স্বাগত জানাচ্ছি।',
      body: 'বাংলাদেশ ডিজিটাল ফ্রিল্যান্সিং এবং সফটওয়্যার রপ্তানিতে নতুন মাইলফলক স্পর্শ করেছে। তথ্যপ্রযুক্তি খাতে গত প্রান্তিকে রেকর্ড প্রবৃদ্ধি অর্জিত হয়েছে।',
      outro: 'জিএনএন স্টুডিওর সাথে থাকুন। ধন্যবাদ।',
      voiceoverText: 'জিএনএন বাংলা টেক ডেস্কে আপনাদের স্বাগত জানাচ্ছি। বাংলাদেশ ডিজিটাল ফ্রিল্যান্সিং এবং সফটওয়্যার রপ্তানিতে নতুন মাইলফলক স্পর্শ করেছে। তথ্যপ্রযুক্তি খাতে গত প্রান্তিকে রেকর্ড প্রবৃদ্ধি অর্জিত হয়েছে। জিএনএন স্টুডিওর সাথে থাকুন। ধন্যবাদ।',
      language: 'Bangla',
      status: 'approved',
      createdAt: '2026-06-20',
      author: 'Kahinur Rahman (Lead Anchor)',
      reviewedBy: 'Executive Producer',
      reviewedAt: new Date(Date.now() - 7200000).toISOString(),
      reviewNotes: 'Verified fact checks and pronunciation cues. Ready for prime slot.'
    },
    {
      id: 'script-demo-climate',
      title: 'Global Solar Array Grid Interconnection Milestone',
      headline: 'Global Solar Array Grid Interconnection Milestone',
      hook: 'Breaking international climate news from the GNN World Desk.',
      body: 'Over 450 gigawatts of unified renewable infrastructure connected today across Mediterranean and North African power superhighways.',
      outro: 'Reporting live for GNN Global Studio.',
      voiceoverText: 'Breaking international climate news from the GNN World Desk. Over 450 gigawatts of unified renewable infrastructure connected today across Mediterranean and North African power superhighways.',
      language: 'English',
      status: 'draft',
      createdAt: '2026-06-21',
      author: 'GNN Eco Reporter'
    }
  ]);

  // Sync scripts from backend on load
  useEffect(() => {
    fetch('/api/scripts')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.scripts && data.scripts.length > 0) {
          setScripts(data.scripts);
        }
      })
      .catch(err => console.warn('Could not sync backend scripts on start:', err));
  }, []);

  // Initial Scheduled Posts
  const [posts, setPosts] = useState<SocialPost[]>([
    {
      id: 'post-init-1',
      scriptId: 'script-init-1',
      platforms: ['youtube', 'tiktok'],
      caption: "🚨 CLEAN ENERGY RECORD SHATTERED 🚨\n\nNet-positive fusion trial containment reaches historic 18+ minute marker!\n\n#science #cleanpower #energy #breaking #gnntv",
      tags: ['#science', '#cleanpower', '#energy', '#breaking'],
      scheduledTime: `${new Date().getFullYear()}-06-25 18:15`,
      status: 'scheduled',
    }
  ]);

  // Chat Conversational assistant messages
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'chat-welcome',
      role: 'model',
      parts: [{ text: "Hello! Welcome to the GNN Newsroom Assistant. Select a specialist model (Lead TV Producer, Viral Marketer, Voice Coach) on the left panel, and let us shape highly engaging broad media layouts together!" }],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    }
  ]);

  // Helpers to push to global states
  const handleAddScript = (newScript: GeneratedScript) => {
    setScripts((prev) => [newScript, ...prev]);
  };

  const handleAddAsset = (newAsset: any) => {
    setAssets((prev) => [newAsset, ...prev]);
  };

  const handleAddMessage = (text: string) => {
    const customMsg: ChatMessage = {
      id: `chat-${Date.now()}`,
      role: 'model',
      parts: [{ text }],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, customMsg]);
  };

  // Additional UX States
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAssetType, setSelectedAssetType] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date-desc' | 'date-asc' | 'status-asc' | 'status-desc'>('date-desc');
  const [isEmptyStateActive, setIsEmptyStateActive] = useState<boolean>(false);
  const [isAutoRefreshActive, setIsAutoRefreshActive] = useState<boolean>(false);
  const [workspaceViewMode, setWorkspaceViewMode] = useState<'grid' | 'list'>('list');

  useEffect(() => {
    if (!isAutoRefreshActive) return;
    const interval = setInterval(() => {
      setAssets(prev => prev.map(a => {
        if (a.status === 'Processing') {
          return { ...a, status: 'Ready' };
        }
        return a;
      }));
      triggerToast('Auto-refresh synced: Repository asset states verified.');
    }, 6000);
    return () => clearInterval(interval);
  }, [isAutoRefreshActive]);
  const [showQuickActionMenu, setShowQuickActionMenu] = useState<boolean>(false);
  const [showNewScriptModal, setShowNewScriptModal] = useState<boolean>(false);
  const [showNewAssetModal, setShowNewAssetModal] = useState<boolean>(false);
  const [showExpoModal, setShowExpoModal] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Workspace card collapse state for dense layouts
  const [isWorkspaceCollapsed, setIsWorkspaceCollapsed] = useState<boolean>(false);

  // Workspace Card Dynamic Height & Draggable Resize State
  const workspaceCardRef = useRef<HTMLDivElement | null>(null);
  const [cardHeight, setCardHeight] = useState<number | null>(null);
  const [isResizingCard, setIsResizingCard] = useState<boolean>(false);
  const [isWorkspaceHeightLocked, setIsWorkspaceHeightLocked] = useState<boolean>(false);

  // Snap to Grid Configuration (aligns card dimensions to common layout intervals, dynamically adjustable from 10px to 200px)
  const [isSnapToGrid, setIsSnapToGrid] = useState<boolean>(true);
  const [snapGridInterval, setSnapGridInterval] = useState<number>(50);
  const [showGridOverlay, setShowGridOverlay] = useState<boolean>(false);
  const snapToGridRef = useRef<boolean>(true);
  const snapGridIntervalRef = useRef<number>(50);

  // Temporary snap-to-grid toggle state via keyboard shortcut ('Alt' + drag) while resizing workspace card
  const [isAltSnapToggled, setIsAltSnapToggled] = useState<boolean>(false);

  // Aspect Ratio Lock configuration (e.g. 16:9 for media player consistency, 4:3, 21:9, 1:1, 9:16)
  const [isAspectRatioLocked, setIsAspectRatioLocked] = useState<boolean>(false);
  const [aspectRatioValue, setAspectRatioValue] = useState<string>('16:9');
  const [cardWidth, setCardWidth] = useState<number | null>(null);
  const [showAspectRatioMenu, setShowAspectRatioMenu] = useState<boolean>(false);
  const isAspectRatioLockedRef = useRef<boolean>(false);
  const aspectRatioValueRef = useRef<string>('16:9');

  const ASPECT_RATIO_PRESETS = [
    { id: '16:9', label: '16:9 Broadcast', ratio: 16 / 9, desc: 'Widescreen HD/4K television & video streaming standard', icon: '📺' },
    { id: '4:3', label: '4:3 Classic', ratio: 4 / 3, desc: 'Retro studio teleprompter & legacy broadcast display', icon: '📹' },
    { id: '21:9', label: '21:9 Ultrawide', ratio: 21 / 9, desc: 'Cinematic master monitor & control room console', icon: '🎬' },
    { id: '1:1', label: '1:1 Square', ratio: 1 / 1, desc: 'Social square stream feed & thumbnail reference', icon: '⏹️' },
    { id: '9:16', label: '9:16 Vertical', ratio: 9 / 16, desc: 'Mobile shorts & vertical mobile news bulletin', icon: '📱' },
  ];

  useEffect(() => {
    isAspectRatioLockedRef.current = isAspectRatioLocked;
  }, [isAspectRatioLocked]);

  useEffect(() => {
    aspectRatioValueRef.current = aspectRatioValue;
  }, [aspectRatioValue]);

  // Outside click listener to dismiss aspect ratio menu
  useEffect(() => {
    if (!showAspectRatioMenu) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#workspace-aspect-ratio-lock-btn') && !target.closest('#workspace-aspect-ratio-menu-btn') && !target.closest('#workspace-aspect-ratio-menu') && !target.closest('#context-menu-aspect-ratio-btn')) {
        setShowAspectRatioMenu(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [showAspectRatioMenu]);

  // Toggle or assign Aspect Ratio Lock
  const toggleAspectRatioLock = (newRatioId?: string) => {
    if (isWorkspaceHeightLocked) {
      triggerToast('Workspace dimensions are locked. Unlock height/dimensions first.');
      return;
    }

    const targetRatioId = newRatioId || aspectRatioValue;
    if (newRatioId) {
      setAspectRatioValue(newRatioId);
      aspectRatioValueRef.current = newRatioId;
    }

    const nextLocked = newRatioId ? true : !isAspectRatioLocked;
    setIsAspectRatioLocked(nextLocked);
    isAspectRatioLockedRef.current = nextLocked;

    if (nextLocked) {
      const targetPreset = ASPECT_RATIO_PRESETS.find(p => p.id === targetRatioId) || ASPECT_RATIO_PRESETS[0];
      const cardEl = workspaceCardRef.current;
      const currentHeight = cardHeight || cardEl?.getBoundingClientRect().height || 600;
      const parentWidth = cardEl?.parentElement?.getBoundingClientRect().width || window.innerWidth;

      let newHeight = currentHeight;
      let newWidth = Math.round(newHeight * targetPreset.ratio);

      if (newWidth > parentWidth) {
        newWidth = Math.round(parentWidth);
        newHeight = Math.round(newWidth / targetPreset.ratio);
      }

      newHeight = Math.max(minHeightRef.current, Math.min(maxHeightRef.current, newHeight));
      newWidth = Math.round(newHeight * targetPreset.ratio);

      if (snapToGridRef.current) {
        const interval = snapGridIntervalRef.current || 50;
        newHeight = Math.round(newHeight / interval) * interval;
        newWidth = Math.round(newHeight * targetPreset.ratio);
      }

      setCardHeight(newHeight);
      setCardWidth(newWidth);
      triggerToast(`Aspect Ratio Locked: ${targetPreset.label} (${newWidth} × ${newHeight}px)`);
    } else {
      setCardWidth(null);
      triggerToast('Aspect Ratio Lock disabled. Card dimensions returned to freeform.');
    }
  };

  useEffect(() => {
    snapToGridRef.current = isSnapToGrid;
  }, [isSnapToGrid]);

  useEffect(() => {
    snapGridIntervalRef.current = snapGridInterval;
  }, [snapGridInterval]);

  // Default limits for workspace card height constraints
  const DEFAULT_MIN_HEIGHT = 260;
  const DEFAULT_MAX_HEIGHT = 3200;

  // Preset Height Profile Interface & Predefined Layouts
  interface PresetHeightProfile {
    id: string;
    name: string;
    minHeight: number;
    maxHeight: number;
    targetHeight: number;
    description: string;
    isCustom?: boolean;
  }

  const PREDEFINED_HEIGHT_PROFILES: PresetHeightProfile[] = [
    {
      id: 'compact-desktop',
      name: 'Compact Desktop',
      minHeight: 200,
      maxHeight: 750,
      targetHeight: 480,
      description: 'Single-screen dense workspace view (200px – 750px)'
    },
    {
      id: 'full-studio-stack',
      name: 'Full Studio Stack',
      minHeight: 500,
      maxHeight: 2200,
      targetHeight: 1050,
      description: 'Multi-deck broadcast & production suite (500px – 2200px)'
    },
    {
      id: 'dual-screen-mode',
      name: 'Dual Screen Mode',
      minHeight: 800,
      maxHeight: 3800,
      targetHeight: 1800,
      description: 'Expansive multi-monitor canvas (800px – 3800px)'
    }
  ];

  // Minimum/Maximum Height Constraints Configuration State
  const [minHeightConstraint, setMinHeightConstraint] = useState<number>(DEFAULT_MIN_HEIGHT);
  const [maxHeightConstraint, setMaxHeightConstraint] = useState<number>(DEFAULT_MAX_HEIGHT);
  const minHeightRef = useRef<number>(DEFAULT_MIN_HEIGHT);
  const maxHeightRef = useRef<number>(DEFAULT_MAX_HEIGHT);

  // Custom Saved Height Profiles State (Persisted in localStorage)
  const [customHeightProfiles, setCustomHeightProfiles] = useState<PresetHeightProfile[]>(() => {
    try {
      const saved = localStorage.getItem('gnn_preset_height_profiles');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.error('Failed to parse saved height profiles:', e);
    }
    return [];
  });
  const [newProfileName, setNewProfileName] = useState<string>('');
  const [isSavingNewProfile, setIsSavingNewProfile] = useState<boolean>(false);

  useEffect(() => {
    minHeightRef.current = minHeightConstraint;
  }, [minHeightConstraint]);

  useEffect(() => {
    maxHeightRef.current = maxHeightConstraint;
  }, [maxHeightConstraint]);

  // Workspace Card Settings Menu Popover State
  const [showWorkspaceSettingsMenu, setShowWorkspaceSettingsMenu] = useState<boolean>(false);

  // Outside click listener to dismiss workspace card settings menu
  useEffect(() => {
    if (!showWorkspaceSettingsMenu) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#workspace-card-settings-btn') && !target.closest('#workspace-card-settings-menu') && !target.closest('#workspace-snap-grid-bounds-btn') && !target.closest('#context-menu-height-constraints')) {
        setShowWorkspaceSettingsMenu(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [showWorkspaceSettingsMenu]);

  // Setter function for Minimum/Maximum Height Constraints with validation and automatic clamping
  const handleSetHeightConstraints = (newMin: number, newMax: number, toastMsg?: string) => {
    const clampedMin = Math.max(150, Math.min(newMin, newMax - 50));
    const clampedMax = Math.min(5000, Math.max(newMax, clampedMin + 50));
    setMinHeightConstraint(clampedMin);
    setMaxHeightConstraint(clampedMax);
    minHeightRef.current = clampedMin;
    maxHeightRef.current = clampedMax;

    // Immediately enforce new bounds if card has an explicit manual height
    if (cardHeight !== null) {
      if (cardHeight < clampedMin) {
        setCardHeight(clampedMin);
      } else if (cardHeight > clampedMax) {
        setCardHeight(clampedMax);
      }
    }

    if (toastMsg) {
      triggerToast(toastMsg);
    }
  };

  // Apply a Preset Height Profile (adjusts bounds + sets optimal target layout height)
  const handleApplyHeightProfile = (profile: PresetHeightProfile) => {
    handleSetHeightConstraints(
      profile.minHeight,
      profile.maxHeight,
      `Applied "${profile.name}" layout (Min: ${profile.minHeight}px, Max: ${profile.maxHeight}px, Target: ${profile.targetHeight}px)`
    );
    setCardHeight(profile.targetHeight);
  };

  // Save current workspace layout as a new custom preset profile
  const handleSaveCustomProfile = () => {
    const trimmed = newProfileName.trim() || `Layout ${customHeightProfiles.length + 1} (${minHeightConstraint}-${maxHeightConstraint}px)`;
    const effectiveTarget = cardHeight ? Math.round(cardHeight) : Math.round((minHeightConstraint + maxHeightConstraint) / 2);
    const newProfile: PresetHeightProfile = {
      id: `custom-profile-${Date.now()}`,
      name: trimmed,
      minHeight: minHeightConstraint,
      maxHeight: maxHeightConstraint,
      targetHeight: effectiveTarget,
      description: `Custom layout: ${minHeightConstraint}px – ${maxHeightConstraint}px (Target: ${effectiveTarget}px)`,
      isCustom: true
    };
    const updated = [...customHeightProfiles, newProfile];
    setCustomHeightProfiles(updated);
    try {
      localStorage.setItem('gnn_preset_height_profiles', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save height profile:', e);
    }
    setNewProfileName('');
    setIsSavingNewProfile(false);
    triggerToast(`Saved custom profile "${newProfile.name}"`);
  };

  // Delete a saved custom preset profile
  const handleDeleteCustomProfile = (id: string, name: string) => {
    const updated = customHeightProfiles.filter(p => p.id !== id);
    setCustomHeightProfiles(updated);
    try {
      localStorage.setItem('gnn_preset_height_profiles', JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to delete height profile:', e);
    }
    triggerToast(`Deleted profile "${name}"`);
  };

  // Workspace Card Category Border Color-Coding State
  const [workspaceBorderColor, setWorkspaceBorderColor] = useState<WorkspaceBorderColorId>('default');
  const [showColorPicker, setShowColorPicker] = useState<boolean>(false);

  // Outside click listener to dismiss color picker popover
  useEffect(() => {
    if (!showColorPicker) return;
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('#workspace-category-color-selector') && !target.closest('#workspace-color-picker-dropdown')) {
        setShowColorPicker(false);
      }
    };
    window.addEventListener('click', handleOutsideClick);
    return () => window.removeEventListener('click', handleOutsideClick);
  }, [showColorPicker]);

  // Draggable resize mouse handler to adjust workspace card dimensions dynamically
  const handleResizeMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (isWorkspaceHeightLocked) {
      triggerToast('Workspace height is locked. Unlock to resize.');
      return;
    }
    setIsResizingCard(true);
    const startX = e.clientX;
    const startY = e.clientY;
    const startRect = workspaceCardRef.current?.getBoundingClientRect();
    const startHeight = startRect?.height || 600;
    const startWidth = startRect?.width || 1000;
    const parentWidth = workspaceCardRef.current?.parentElement?.getBoundingClientRect().width || window.innerWidth;

    if (cardHeight === null) {
      setCardHeight(Math.round(startHeight));
    }
    if (isAspectRatioLockedRef.current && cardWidth === null) {
      setCardWidth(Math.round(startWidth));
    }

    let lastClientX = e.clientX;
    let lastClientY = e.clientY;
    const initialAlt = Boolean(e.altKey);
    setIsAltSnapToggled(initialAlt);

    // Dynamic dimension calculation that supports aspect ratio constraints & keyboard snap toggle
    const updateDimensions = (clientX: number, clientY: number, altPressed: boolean) => {
      lastClientX = clientX;
      lastClientY = clientY;
      setIsAltSnapToggled(altPressed);

      // Invert snap-to-grid behavior while 'Alt' is held (precision vs free-form)
      const effectiveSnap = altPressed ? !snapToGridRef.current : snapToGridRef.current;
      const deltaX = clientX - startX;
      const deltaY = clientY - startY;

      if (isAspectRatioLockedRef.current) {
        const targetPreset = ASPECT_RATIO_PRESETS.find(p => p.id === aspectRatioValueRef.current) || ASPECT_RATIO_PRESETS[0];
        const ratio = targetPreset.ratio; // e.g. 16/9

        // Calculate proportional diagonal scaling delta
        const delta = Math.abs(deltaY) > Math.abs(deltaX / ratio) ? deltaY : (deltaX / ratio);
        let calculatedHeight = startHeight + delta;
        if (effectiveSnap) {
          const interval = snapGridIntervalRef.current || 50;
          calculatedHeight = Math.round(calculatedHeight / interval) * interval;
        }

        let newH = Math.max(minHeightRef.current, Math.min(maxHeightRef.current, calculatedHeight));
        let newW = Math.round(newH * ratio);

        // Constrain to parent container width so it doesn't overflow viewport
        if (newW > parentWidth) {
          newW = Math.round(parentWidth);
          newH = Math.round(newW / ratio);
        }
        if (newH < minHeightRef.current) {
          newH = minHeightRef.current;
          newW = Math.round(newH * ratio);
        }

        setCardHeight(Math.round(newH));
        setCardWidth(Math.round(newW));
      } else {
        let calculatedHeight = startHeight + deltaY;
        if (effectiveSnap) {
          const interval = snapGridIntervalRef.current || 50;
          calculatedHeight = Math.round(calculatedHeight / interval) * interval;
        }
        const newHeight = Math.max(minHeightRef.current, Math.min(maxHeightRef.current, calculatedHeight));
        setCardHeight(newHeight);
      }
    };

    if (initialAlt) {
      updateDimensions(startX, startY, true);
    }

    const handleMouseMove = (moveEvent: MouseEvent) => {
      updateDimensions(moveEvent.clientX, moveEvent.clientY, Boolean(moveEvent.altKey));
    };

    const handleKeyDown = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === 'Alt') {
        keyEvent.preventDefault();
        updateDimensions(lastClientX, lastClientY, true);
      }
    };

    const handleKeyUp = (keyEvent: KeyboardEvent) => {
      if (keyEvent.key === 'Alt') {
        updateDimensions(lastClientX, lastClientY, false);
      }
    };

    const handleMouseUp = () => {
      setIsResizingCard(false);
      setIsAltSnapToggled(false);
      document.body.style.cursor = '';
      document.body.style.userSelect = '';
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('blur', handleMouseUp);
    };

    document.body.style.cursor = 'se-resize';
    document.body.style.userSelect = 'none';
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('blur', handleMouseUp);
  };

  // Whether the snap grid overlay and slider HUD is actively shown (during resize or when explicitly opened)
  const isOverlayVisible = isResizingCard || showGridOverlay;

  // Effective snap state: whether snap-to-grid is currently active (taking into account temporary Alt toggle during resize)
  const isEffectiveSnapActive = isResizingCard
    ? (isAltSnapToggled ? !isSnapToGrid : isSnapToGrid)
    : isSnapToGrid;

  // Active height and grid interval for #workspace-snap-grid-overlay numerical dimension indicators
  const activeCardHeight = Math.round(
    cardHeight || (workspaceCardRef.current?.getBoundingClientRect().height ?? 600)
  );
  const activeGridInterval = snapGridInterval || 50;

  // Dynamic snap interval handler (adjustable from 10px to 200px)
  const handleSnapIntervalChange = (newInterval: number) => {
    const clamped = Math.max(10, Math.min(200, Math.round(newInterval)));
    setSnapGridInterval(clamped);
    snapGridIntervalRef.current = clamped;
    if (cardHeight !== null && snapToGridRef.current) {
      setCardHeight(Math.max(minHeightRef.current, Math.min(maxHeightRef.current, Math.round(cardHeight / clamped) * clamped)));
    }
  };

  // Compute grid line heights within the card's active bounds for numerical height indicators alongside grid lines
  const gridLineHeights = useMemo(() => {
    const heights: number[] = [];
    const interval = Math.max(10, activeGridInterval);
    for (let h = interval; h < activeCardHeight - 15; h += interval) {
      heights.push(h);
    }
    return heights;
  }, [activeCardHeight, activeGridInterval]);

  // State indicating if the workspace card is currently animating back to auto height
  const [isResettingHeight, setIsResettingHeight] = useState<boolean>(false);

  // Smoothly animate card height back to default auto-fit state instead of snapping instantly
  const handleResetCardHeight = () => {
    if (isWorkspaceHeightLocked) {
      triggerToast('Workspace height is locked. Unlock before restoring default height.');
      return;
    }
    const card = workspaceCardRef.current;
    if (!card || cardHeight === null || isResettingHeight) return;

    setIsResettingHeight(true);

    // 1. Temporarily measure unconstrained natural auto-fit height
    const currentExplicitHeight = card.offsetHeight;
    
    card.style.transition = 'none';
    card.style.height = 'auto';
    const targetAutoHeight = card.offsetHeight;
    
    // 2. Restore current starting height and force DOM reflow
    card.style.height = `${currentExplicitHeight}px`;
    void card.offsetHeight; // force browser reflow

    // 3. Apply smooth height transition to targetAutoHeight
    card.style.transition = 'height 420ms cubic-bezier(0.25, 1, 0.5, 1)';
    card.style.height = `${targetAutoHeight}px`;

    const handleTransitionComplete = () => {
      card.removeEventListener('transitionend', handleTransitionComplete);
      card.style.transition = '';
      card.style.height = '';
      setCardHeight(null);
      setCardWidth(null);
      setIsAspectRatioLocked(false);
      isAspectRatioLockedRef.current = false;
      setIsResettingHeight(false);
    };

    card.addEventListener('transitionend', handleTransitionComplete, { once: true });

    // Fallback safety timer in case transitionend event doesn't trigger
    setTimeout(() => {
      card.removeEventListener('transitionend', handleTransitionComplete);
      card.style.transition = '';
      card.style.height = '';
      setCardHeight(null);
      setCardWidth(null);
      setIsAspectRatioLocked(false);
      isAspectRatioLockedRef.current = false;
      setIsResettingHeight(false);
    }, 450);

    triggerToast('Workspace height smoothly restored to default auto-fit.');
  };

  // Custom context menu state for #workspace-card
  const [contextMenu, setContextMenu] = useState<{ visible: boolean; x: number; y: number }>({
    visible: false,
    x: 0,
    y: 0,
  });

  // Context menu dismissal listeners (click outside, Escape, scroll)
  useEffect(() => {
    if (!contextMenu.visible) return;
    const handleClose = () => setContextMenu(prev => ({ ...prev, visible: false }));
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setContextMenu(prev => ({ ...prev, visible: false }));
    };
    window.addEventListener('click', handleClose);
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('scroll', handleClose, true);
    return () => {
      window.removeEventListener('click', handleClose);
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleClose, true);
    };
  }, [contextMenu.visible]);

  // Context Menu shortcuts
  const handleRefreshWorkspace = () => {
    setAssets(prev => prev.map(a => {
      if (a.status === 'Processing') {
        return { ...a, status: 'Ready' };
      }
      return a;
    }));
    triggerToast('Workspace refreshed: all local states and media feeds synchronized.');
  };

  const handleClearWorkspace = () => {
    setSearchQuery('');
    setSelectedAssetType('all');
    setIsEmptyStateActive(true);
    triggerToast('Workspace cleared: clean slate activated. Use Empty Workspace deck to start or populate.');
  };

  // GitHub Synchronization Status state
  const [githubSyncStatus, setGithubSyncStatus] = useState<'Synced' | 'Pending Commits' | 'Conflict'>('Synced');
  const [showSyncMenu, setShowSyncMenu] = useState<boolean>(false);
  const [copiedSha, setCopiedSha] = useState<boolean>(false);
  const copyTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const mockLastCommitSha = '8f4c21a';

  useEffect(() => {
    return () => {
      if (copyTimeoutRef.current) {
        clearTimeout(copyTimeoutRef.current);
      }
    };
  }, []);

  const triggerToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleCycleGitHubSyncStatus = () => {
    setGithubSyncStatus(prev => {
      if (prev === 'Synced') {
        triggerToast('GitHub Sync: 2 uncommitted changes pending push (origin/main)');
        return 'Pending Commits';
      }
      if (prev === 'Pending Commits') {
        triggerToast('GitHub Sync: Merge conflict detected in .github/workflows/ci.yml!');
        return 'Conflict';
      }
      triggerToast('GitHub Sync: Resolved conflict & cleanly synchronized with origin/main');
      return 'Synced';
    });
  };

  const handleResolveConflict = () => {
    setGithubSyncStatus('Synced');
    setShowSyncMenu(false);
    triggerToast('Success: Conflict resolved and repository cleanly synchronized with origin/main (SHA: 8f4c21a).');
  };

  const handleCopyLastCommitSha = async (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(mockLastCommitSha);
      } else {
        throw new Error('Clipboard API unavailable');
      }
    } catch {
      const textArea = document.createElement('textarea');
      textArea.value = mockLastCommitSha;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
    }
    setCopiedSha(true);
    triggerToast(`Copied commit SHA (${mockLastCommitSha}) to clipboard!`);
    
    if (copyTimeoutRef.current) {
      clearTimeout(copyTimeoutRef.current);
    }
    copyTimeoutRef.current = setTimeout(() => {
      setCopiedSha(false);
      copyTimeoutRef.current = null;
    }, 2000);
  };

  // Quick Action Forms local state
  const [quickScriptTitle, setQuickScriptTitle] = useState<string>('');
  const [quickScriptBody, setQuickScriptBody] = useState<string>('');
  const [quickScriptLang, setQuickScriptLang] = useState<string>('Bangla');
  
  const [quickAssetName, setQuickAssetName] = useState<string>('');
  const [quickAssetType, setQuickAssetType] = useState<'video' | 'image' | 'audio' | 'subtitles'>('video');

  const handleCreateQuickScript = () => {
    if (!quickScriptTitle.trim()) return;
    const bodyText = quickScriptBody || 'জিএনএন গ্লোবাল নেটওয়ার্ক সরাসরি সম্প্রচার।';
    const newScript: GeneratedScript = {
      id: `script-quick-${Date.now()}`,
      title: quickScriptTitle,
      headline: quickScriptTitle,
      hook: `স্বাগতম জিএনএন বাংলা নিউজ ডেস্কে। আজকের বিশেষ খবর...`,
      body: bodyText,
      outro: 'জিএনএন বাংলা স্টুডিও, ঢাকা।',
      voiceoverText: `স্বাগতম জিএনএন বাংলা নিউজ ডেস্কে। আজকের বিশেষ খবর... ${bodyText} জিএনএন বাংলা স্টুডিও, ঢাকা।`,
      language: quickScriptLang,
      status: 'pending_review',
      createdAt: new Date().toISOString().split('T')[0],
      author: userRole.osRole ? `GNN ${userRole.osRole}` : 'Broadcast Desk',
      submittedForReviewAt: new Date().toISOString(),
    };

    fetch('/api/scripts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ script: newScript }),
    }).catch(e => console.warn('Sync script error:', e));

    handleAddScript(newScript);
    triggerToast(`Success! Injected script "${quickScriptTitle}" into the Approval Queue.`);
    setQuickScriptTitle('');
    setQuickScriptBody('');
    setShowNewScriptModal(false);
    setShowQuickActionMenu(false);
  };

  const handleCreateQuickAsset = () => {
    if (!quickAssetName.trim()) return;
    const sizeMap = { video: '5.2 MB', image: '1.4 MB', audio: '2.1 MB', subtitles: '3 KB' };
    const resMap = { video: '1080p', image: '1920x1080', audio: 'Stereo Hi-Fi', subtitles: 'SRT Template' };
    const placeholderUrl = quickAssetType === 'image' 
      ? 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1000'
      : 'https://assets.mixkit.co/videos/preview/mixkit-news-studio-studio-desk-broadcasting-41554-large.mp4';

    const newAsset: RepositoryAsset = {
      id: `asset-quick-${Date.now()}`,
      name: quickAssetName,
      type: quickAssetType,
      url: placeholderUrl,
      size: sizeMap[quickAssetType],
      resolution: resMap[quickAssetType],
      createdAt: new Date().toISOString().split('T')[0]
    };
    handleAddAsset(newAsset);
    triggerToast(`Success! Injected media asset "${quickAssetName}" to repository.`);
    setQuickAssetName('');
    setShowNewAssetModal(false);
    setShowQuickActionMenu(false);
  };

  const handlePopulateDemo = () => {
    const demoScripts: GeneratedScript[] = [
      {
        id: `script-demo-${Date.now()}-1`,
        title: 'Bangladesh Tech Growth Hits Record Benchmark',
        headline: 'Bangladesh Tech Growth Hits Record Benchmark',
        hook: 'জিএনএন বাংলা টেক ডেস্কে আপনাদের স্বাগত জানাচ্ছি।',
        body: 'বাংলাদেশ ডিজিটাল ফ্রিল্যান্সিং এবং সফটওয়্যার রপ্তানিতে নতুন মাইলফলক স্পর্শ করেছে। তথ্যপ্রযুক্তি খাতে গত প্রান্তিকে রেকর্ড প্রবৃদ্ধি অর্জিত হয়েছে।',
        outro: 'জিএনএন স্টুডিওর সাথে থাকুন। ধন্যবাদ।',
        voiceoverText: 'জিএনএন বাংলা টেক ডেস্কে আপনাদের স্বাগত জানাচ্ছি। বাংলাদেশ ডিজিটাল ফ্রিল্যান্সিং এবং সফটওয়্যার রপ্তানিতে নতুন মাইলফলক স্পর্শ করেছে। তথ্যপ্রযুক্তি খাতে গত প্রান্তিকে রেকর্ড প্রবৃদ্ধি অর্জিত হয়েছে। জিএনএন স্টুডিওর সাথে থাকুন। ধন্যবাদ।',
        language: 'Bangla',
        status: 'approved',
        createdAt: new Date().toISOString().split('T')[0]
      }
    ];

    demoScripts.forEach(s => handleAddScript(s));
    setIsEmptyStateActive(false);
    triggerToast('Perfect! Pre-loaded high fidelity GNN Bangla demo templates.');
  };

  // Dynamic filter and sorting query selectors
  const filteredScripts = scripts
    .filter(s => 
      s.headline.toLowerCase().includes(searchQuery.toLowerCase()) || 
      (s.body && s.body.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.title && s.title.toLowerCase().includes(searchQuery.toLowerCase()))
    )
    .sort((a, b) => {
      if (sortBy === 'date-desc') {
        const timeA = new Date(a.createdAt || 0).getTime() || 0;
        const timeB = new Date(b.createdAt || 0).getTime() || 0;
        return timeB - timeA;
      }
      if (sortBy === 'date-asc') {
        const timeA = new Date(a.createdAt || 0).getTime() || 0;
        const timeB = new Date(b.createdAt || 0).getTime() || 0;
        return timeA - timeB;
      }
      if (sortBy === 'status-asc') {
        return (a.status || '').localeCompare(b.status || '');
      }
      if (sortBy === 'status-desc') {
        return (b.status || '').localeCompare(a.status || '');
      }
      return 0;
    });

  const filteredPosts = posts.filter(p => 
    p.caption.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const filteredAssets = assets
    .filter(a => {
      const matchesSearch = 
        a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        a.type.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesType = selectedAssetType === 'all' || a.type.toLowerCase() === selectedAssetType.toLowerCase();
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      if (sortBy === 'date-desc') {
        const timeA = new Date(a.createdAt || 0).getTime() || 0;
        const timeB = new Date(b.createdAt || 0).getTime() || 0;
        return timeB - timeA;
      }
      if (sortBy === 'date-asc') {
        const timeA = new Date(a.createdAt || 0).getTime() || 0;
        const timeB = new Date(b.createdAt || 0).getTime() || 0;
        return timeA - timeB;
      }
      if (sortBy === 'status-asc') {
        return (a.status || 'Ready').localeCompare(b.status || 'Ready');
      }
      if (sortBy === 'status-desc') {
        return (b.status || 'Ready').localeCompare(a.status || 'Ready');
      }
      return 0;
    });

  // Export current filtered scripts and assets state as a JSON production snapshot
  const handleDownloadWorkspaceSnapshot = () => {
    const snapshotPayload = {
      manifestType: 'gnn_workspace_production_snapshot',
      version: '1.0.0',
      exportedAt: new Date().toISOString(),
      workspaceMeta: {
        activeTab,
        searchQuery: searchQuery || null,
        selectedAssetType,
        sortBy,
        exportedBy: userRole.role.toUpperCase(),
        totalFilteredScripts: filteredScripts.length,
        totalFilteredAssets: filteredAssets.length,
        totalAllScripts: scripts.length,
        totalAllAssets: assets.length
      },
      filteredScripts,
      filteredAssets
    };

    const jsonString = JSON.stringify(snapshotPayload, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const aTag = document.createElement('a');
    aTag.href = url;
    aTag.download = `gnn_workspace_snapshot_${activeTab}_${Date.now()}.json`;
    document.body.appendChild(aTag);
    aTag.click();
    document.body.removeChild(aTag);
    URL.revokeObjectURL(url);

    triggerToast(`Workspace snapshot downloaded: ${filteredScripts.length} scripts & ${filteredAssets.length} assets`);
  };

  return (
    <div className="flex bg-slate-950 font-sans min-h-screen text-slate-150">
      
      {/* Drawer Section */}
      <Sidebar 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        userRole={userRole} 
        setUserRole={setUserRole} 
      />

      {/* Primary Workspace screen */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto space-y-6 relative">
        
        {/* Workspace Card Container - Styled with High-Fidelity Glassmorphism & Subtle 3D Lift on Hover */}
        <motion.div 
          ref={workspaceCardRef}
          id="workspace-card" 
          initial={{ opacity: 0, y: 16, scale: 0.995 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
          style={{
            ...(cardHeight ? { height: `${cardHeight}px` } : {}),
            ...(isAspectRatioLocked && cardWidth ? { width: `${cardWidth}px`, maxWidth: '100%', marginLeft: 'auto', marginRight: 'auto' } : {}),
          }}
          onContextMenu={(e) => {
            e.preventDefault();
            const menuWidth = 260;
            const menuHeight = 310;
            const clickX = e.clientX;
            const clickY = e.clientY;
            const x = clickX + menuWidth > window.innerWidth ? Math.max(10, window.innerWidth - menuWidth - 16) : clickX;
            const y = clickY + menuHeight > window.innerHeight ? Math.max(10, window.innerHeight - menuHeight - 16) : clickY;
            setContextMenu({ visible: true, x, y });
          }}
          className={`bg-slate-900/35 backdrop-blur-xl border shadow-2xl rounded-2xl p-4 md:p-6 ease-out will-change-transform relative ${
            isResizingCard 
              ? 'transition-none select-none' 
              : isResettingHeight 
              ? 'transition-[height] duration-500 ease-out' 
              : 'transition-all duration-300 hover:-translate-y-1'
          } ${BORDER_COLOR_THEMES[workspaceBorderColor].borderClass} ${BORDER_COLOR_THEMES[workspaceBorderColor].glowClass} ${
            cardHeight ? 'overflow-y-auto' : ''
          }`}
        >

          {/* Snap-to-Grid visual layout guideline overlay with numerical height indicators and dynamic interval slider */}
          <div 
            id="workspace-snap-grid-overlay"
            className={`absolute inset-0 rounded-2xl z-20 overflow-hidden select-none transition-opacity duration-200 ${
              isOverlayVisible ? 'opacity-100 pointer-events-none' : 'opacity-0 pointer-events-none'
            }`}
            style={{
              backgroundImage: `linear-gradient(to bottom, rgba(6, 182, 212, 0.08) 1px, transparent 1px)`,
              backgroundSize: `100% ${activeGridInterval}px`
            }}
          >
            {/* Dynamic Snap Grid Interval Slider Control HUD Panel within #workspace-snap-grid-overlay */}
            <div
              id="workspace-snap-grid-slider-panel"
              className={`absolute top-3 left-1/2 -translate-x-1/2 z-30 flex flex-wrap items-center justify-center gap-2 sm:gap-3 px-3.5 py-1.5 rounded-xl bg-slate-950/95 border border-cyan-500/50 shadow-2xl backdrop-blur-md text-xs font-mono text-cyan-200 transition-all max-w-[95%] sm:max-w-none ${
                isOverlayVisible ? 'pointer-events-auto' : 'pointer-events-none'
              }`}
            >
              <div className="flex items-center gap-1.5 text-cyan-400 font-bold whitespace-nowrap">
                <Sliders className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Snap Interval:</span>
                <span className="text-white font-mono font-extrabold text-xs bg-cyan-950/90 px-2 py-0.5 rounded-md border border-cyan-400/60 shadow-[0_0_8px_rgba(6,182,212,0.4)]">
                  {snapGridInterval}px
                </span>
              </div>

              {/* Dynamic Slider Component (10px to 200px) */}
              <div className="flex items-center gap-2">
                <span className="text-[10px] text-slate-400 font-semibold">10px</span>
                <input
                  id="workspace-snap-grid-interval-slider"
                  type="range"
                  min={10}
                  max={200}
                  step={5}
                  value={snapGridInterval}
                  onChange={(e) => handleSnapIntervalChange(Number(e.target.value))}
                  onInput={(e) => handleSnapIntervalChange(Number((e.target as HTMLInputElement).value))}
                  className="w-20 sm:w-28 md:w-36 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400 hover:accent-cyan-300 focus:outline-none focus:ring-1 focus:ring-cyan-400"
                  title={`Dynamically adjust snap interval: ${snapGridInterval}px (10px to 200px)`}
                />
                <span className="text-[10px] text-slate-400 font-semibold">200px</span>
              </div>

              {/* Row of buttons for common snap interval presets: 25px, 50px, 100px, and 150px */}
              <div 
                id="workspace-snap-grid-presets-row" 
                className="flex items-center gap-1 border-l border-slate-800 pl-2"
              >
                <span className="text-[10px] text-slate-400 font-semibold mr-0.5 hidden xl:inline">Presets:</span>
                {[25, 50, 100, 150].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    id={`workspace-snap-preset-${preset}px`}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleSnapIntervalChange(preset);
                      triggerToast(`Snap interval set to ${preset}px preset`);
                    }}
                    className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-all ${
                      snapGridInterval === preset
                        ? 'bg-cyan-500 text-slate-950 shadow-[0_0_8px_rgba(6,182,212,0.6)] ring-1 ring-cyan-300 scale-105'
                        : 'text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-750 hover:border-cyan-500/40'
                    }`}
                    title={`Quick set snap interval to ${preset}px`}
                  >
                    {preset}px
                  </button>
                ))}
              </div>

              {/* Height Constraints quick open button within slider panel */}
              <button
                type="button"
                id="workspace-snap-grid-bounds-btn"
                onClick={() => setShowWorkspaceSettingsMenu(true)}
                title={`Configure Height Constraints (Min: ${minHeightConstraint}px, Max: ${maxHeightConstraint}px)`}
                className="hidden lg:flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-all text-slate-300 hover:text-white bg-slate-900/90 hover:bg-slate-800 border border-slate-750 hover:border-cyan-500/40"
              >
                <Settings className="w-3 h-3 text-cyan-400" />
                <span>Bounds: {minHeightConstraint}–{maxHeightConstraint}px</span>
              </button>

              {/* Keyboard Shortcut Indicator & Live Alt Toggle State Badge */}
              <div
                id="workspace-snap-grid-alt-shortcut-hint"
                className={`flex items-center gap-1.5 px-2 py-0.5 rounded-lg border text-[10px] font-mono transition-all select-none ${
                  isAltSnapToggled
                    ? 'bg-amber-500/20 text-amber-300 border-amber-400/80 shadow-[0_0_10px_rgba(245,158,11,0.4)] ring-1 ring-amber-400/50 animate-pulse'
                    : 'bg-slate-900/80 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
                title="Hold 'Alt' while dragging the resize handle to temporarily invert Snap to Grid (switch between grid snap and free-form adjustments)"
              >
                <kbd className="px-1 py-0.2 bg-slate-800 border border-slate-700 rounded text-[9px] text-cyan-300 font-bold uppercase shadow-xs">
                  Alt
                </kbd>
                <span className="text-slate-400">+ drag:</span>
                {isAltSnapToggled ? (
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
                    {isEffectiveSnapActive ? `Alt: Snap (${activeGridInterval}px)` : 'Alt: Freeform'}
                  </span>
                ) : (
                  <span className="text-slate-300">
                    {isSnapToGrid ? 'Freeform' : 'Snap Grid'}
                  </span>
                )}
              </div>

              {/* Close overlay preview button if opened via button */}
              {showGridOverlay && !isResizingCard && (
                <button
                  type="button"
                  id="workspace-snap-grid-close-preview-btn"
                  onClick={() => setShowGridOverlay(false)}
                  title="Close grid overlay preview"
                  className="ml-1 p-0.5 rounded hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Subtle vertical alignment guide rails */}
            <div className="absolute left-16 top-0 bottom-0 w-px bg-cyan-500/15 pointer-events-none" />
            <div className="absolute right-16 top-0 bottom-0 w-px bg-cyan-500/15 pointer-events-none" />

            {/* Grid Lines with Numerical Height Indicators alongside each grid line */}
            {gridLineHeights.map((h) => (
              <div
                key={h}
                id={`workspace-snap-grid-line-${h}px`}
                className="workspace-snap-grid-line absolute inset-x-0 pointer-events-none"
                style={{ top: `${h}px` }}
              >
                {/* Subtle horizontal grid guideline line */}
                <div className="absolute inset-x-0 h-px bg-cyan-400/20 shadow-[0_0_4px_rgba(6,182,212,0.25)]" />

                {/* Left Numerical Height Indicator alongside grid line */}
                <div className="workspace-snap-grid-indicator-left absolute left-2 -translate-y-1/2 flex items-center gap-1.5 z-10">
                  <span className="px-1.5 py-0.5 rounded bg-slate-950/90 border border-cyan-500/30 text-cyan-400/80 font-mono text-[9px] font-semibold shadow-sm backdrop-blur-xs">
                    {h}px
                  </span>
                  <span className="w-2.5 h-px bg-cyan-400/50" />
                </div>

                {/* Right Numerical Height Indicator alongside grid line */}
                <div 
                  id={`workspace-snap-grid-indicator-${h}px`}
                  className="workspace-snap-grid-indicator absolute right-2 -translate-y-1/2 flex items-center gap-1.5 z-10"
                >
                  <span className="w-2.5 h-px bg-cyan-400/50" />
                  <span className="px-2 py-0.5 rounded bg-slate-950/95 border border-cyan-500/50 text-cyan-300 font-mono text-[10px] font-bold shadow-md shadow-black/80 backdrop-blur-xs flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400/80" />
                    {h}px
                  </span>
                </div>
              </div>
            ))}

            {/* Bottom snap alignment baseline marker */}
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_12px_rgba(6,182,212,0.9)]" />

            {/* Prominent Current Height Dimension Indicator alongside the baseline */}
            <div 
              id="workspace-snap-grid-current-indicator"
              className={`workspace-snap-grid-indicator absolute bottom-2 right-28 sm:right-32 flex items-center gap-2 font-mono text-xs font-bold text-white bg-slate-950/95 border px-3 py-1 rounded-full backdrop-blur-md z-30 pointer-events-none transition-all ${
                isAltSnapToggled
                  ? 'border-amber-400 shadow-[0_0_16px_rgba(245,158,11,0.7)]'
                  : 'border-cyan-400/90 shadow-[0_0_16px_rgba(6,182,212,0.7)]'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${isAltSnapToggled ? 'bg-amber-400 animate-pulse' : 'bg-cyan-400 animate-ping'}`} />
              <span className={`text-[11px] ${isAltSnapToggled ? 'text-amber-300' : 'text-cyan-300'}`}>Current:</span>
              <span className="text-white text-xs font-black tracking-wide">{activeCardHeight}px</span>
              {isEffectiveSnapActive ? (
                <span className={`text-[9px] font-medium border px-1.5 py-0.5 rounded-full ${
                  isAltSnapToggled
                    ? 'text-amber-300 bg-amber-500/20 border-amber-500/40'
                    : 'text-cyan-300/90 bg-cyan-500/20 border-cyan-500/40'
                }`}>
                  {activeGridInterval}px snap
                </span>
              ) : (
                <span className={`text-[9px] font-medium px-1.5 py-0.5 rounded-full ${
                  isAltSnapToggled
                    ? 'text-amber-300 bg-amber-500/20 border border-amber-500/40'
                    : 'text-slate-400 bg-slate-800'
                }`}>
                  freeform
                </span>
              )}
              {isAltSnapToggled && (
                <span 
                  id="workspace-snap-grid-alt-badge"
                  className="text-[9px] font-mono font-bold bg-amber-400 text-slate-950 px-1.5 py-0.5 rounded uppercase tracking-wider shadow-xs"
                >
                  Alt: {isEffectiveSnapActive ? 'Snap ON' : 'Freeform'}
                </span>
              )}
            </div>
          </div>

          {/* Persistent 'Auto-height' Indicator Badge in Top-Right Corner of #workspace-card */}
          {cardHeight !== null && (
            <div
              id="workspace-auto-height-badge"
              className="absolute -top-3 right-5 z-30 inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900/95 border border-amber-500/60 text-amber-300 shadow-xl shadow-black/70 font-mono text-[11px] backdrop-blur-md animate-in fade-in slide-in-from-top-1 duration-200"
            >
              <div className="flex items-center gap-1.5">
                {isWorkspaceHeightLocked ? (
                  <Lock className="w-3 h-3 text-amber-400 shrink-0" />
                ) : (
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(245,158,11,0.8)]" />
                )}
                <span className="text-slate-400 font-medium">Auto-height:</span>
                <span className="font-bold text-amber-300">
                  Manual ({cardWidth && isAspectRatioLocked ? `${Math.round(cardWidth)} × ` : ''}${Math.round(cardHeight)}px)
                  {isAspectRatioLocked ? ` [${aspectRatioValue} Ratio]` : ''}
                  {isWorkspaceHeightLocked ? ' [Locked]' : ''}
                  {isSnapToGrid ? ` [Grid: ${snapGridInterval}px]` : ''}
                  {minHeightConstraint !== DEFAULT_MIN_HEIGHT || maxHeightConstraint !== DEFAULT_MAX_HEIGHT
                    ? ` [Bounds: ${minHeightConstraint}–${maxHeightConstraint}px]`
                    : ''}
                </span>
              </div>
              <span className="text-slate-700">|</span>
              <button
                id="workspace-badge-bounds-btn"
                type="button"
                onClick={() => setShowWorkspaceSettingsMenu(true)}
                title={`Configure Workspace Height Bounds (Min: ${minHeightConstraint}px, Max: ${maxHeightConstraint}px)`}
                className="inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full border transition-all text-[10px] shadow-xs text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border-slate-700 hover:border-cyan-400 cursor-pointer"
              >
                <Settings className="w-2.5 h-2.5 text-cyan-400" />
                <span>Bounds</span>
              </button>
              <button
                id="workspace-reset-height-badge-btn"
                type="button"
                onClick={handleResetCardHeight}
                disabled={isResettingHeight || isWorkspaceHeightLocked}
                title={
                  isWorkspaceHeightLocked
                    ? "Workspace height is locked. Unlock to restore auto-fit height."
                    : "Restore default auto-fit card height with smooth transition"
                }
                className={`inline-flex items-center gap-1 font-bold px-2 py-0.5 rounded-full border transition-all text-[10px] shadow-xs ${
                  isWorkspaceHeightLocked
                    ? 'opacity-40 cursor-not-allowed bg-slate-850 text-slate-500 border-slate-750'
                    : 'text-cyan-300 hover:text-white bg-cyan-500/15 hover:bg-cyan-500/25 border-cyan-500/40 hover:border-cyan-400 cursor-pointer hover:shadow-cyan-950/50'
                }`}
              >
                <RotateCcw className={`w-3 h-3 ${isResettingHeight ? 'animate-spin' : ''}`} />
                <span>Reset to Default</span>
              </button>
            </div>
          )}
          
          {/* Header of workspace card */}
          <div className={`flex flex-col xl:flex-row xl:items-center justify-between gap-4 border-b border-white/5 pb-4 ${isWorkspaceCollapsed ? 'mb-2' : 'mb-6'}`}>
            
            {/* Header info */}
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-red-500/10 border border-red-500/30 flex items-center justify-center shrink-0">
                <Tv className="w-5 h-5 text-red-500 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <h2 className="text-sm font-sans font-black tracking-wider text-white uppercase flex items-center gap-1.5">
                    Workspace
                    <motion.span 
                      key={activeTab}
                      initial={{ opacity: 0, scale: 0.88, y: -2 }}
                      animate={{ opacity: 1, scale: 1, y: 0 }}
                      transition={{ duration: 0.2 }}
                      className="text-[10px] bg-red-600/10 border border-red-650/20 text-red-400 px-2 py-0.5 rounded-full font-mono uppercase font-bold inline-block"
                    >
                      {activeTab}
                    </motion.span>
                  </h2>

                  {/* GitHub Synchronization Status Indicator Badge with small green/orange/red icon */}
                  <div className="relative inline-flex items-center">
                    <button
                      type="button"
                      id="github-sync-status-indicator"
                      onClick={() => setShowSyncMenu(prev => !prev)}
                      title={`GitHub Synchronization: ${githubSyncStatus} • Click to inspect or change sync state`}
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full border text-[10px] font-mono font-bold transition-all cursor-pointer select-none shadow-xs relative overflow-hidden ${
                        githubSyncStatus === 'Synced'
                          ? 'bg-emerald-500/15 hover:bg-emerald-500/25 border-emerald-500/40 text-emerald-300 ring-1 ring-emerald-500/20'
                          : githubSyncStatus === 'Pending Commits'
                          ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300 ring-1 ring-amber-500/20'
                          : 'bg-red-500/20 hover:bg-red-500/30 border-red-500/60 text-red-100 ring-1 ring-red-500/40 conflict-glow-animation'
                      }`}
                    >
                      {/* Subtle CSS Shimmer Effect (Active ONLY in Conflict mode to draw immediate attention) */}
                      {githubSyncStatus === 'Conflict' && (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-0 -translate-x-full conflict-shimmer-sheen bg-gradient-to-r from-transparent via-white/25 via-red-200/30 to-transparent"
                        />
                      )}

                      {/* Small green/orange/red icon */}
                      <span className="relative z-10 shrink-0">
                        {githubSyncStatus === 'Synced' ? (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        ) : githubSyncStatus === 'Pending Commits' ? (
                          <GitCommit className="w-3 h-3 text-amber-400" />
                        ) : (
                          <AlertTriangle className="w-3 h-3 text-red-400" />
                        )}
                      </span>

                      <span className="relative z-10 flex items-center gap-1">
                        <Github className="w-2.5 h-2.5 opacity-70" />
                        <span>{githubSyncStatus}</span>
                      </span>

                      {/* Small green/orange/red dot beacon */}
                      <span className={`relative z-10 w-1.5 h-1.5 rounded-full shrink-0 ${
                        githubSyncStatus === 'Synced'
                          ? 'bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.9)]'
                          : githubSyncStatus === 'Pending Commits'
                          ? 'bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(251,191,36,0.9)]'
                          : 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.9)]'
                      }`} />
                    </button>

                    {/* Interactive Dropdown / Quick Switcher */}
                    {showSyncMenu && (
                      <div className="absolute left-0 top-full mt-1.5 z-50 w-72 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-xl p-2 shadow-2xl space-y-1 font-mono text-xs">
                        <div className="flex items-center justify-between px-2 py-1 text-[10px] text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
                          <span className="flex items-center gap-1.5">
                            <Github className="w-3 h-3 text-slate-300" />
                            GitHub Sync Status
                          </span>
                          <span className="text-slate-500">origin/main</span>
                        </div>
                        
                        <button
                          type="button"
                          id="sync-option-synced"
                          onClick={() => {
                            setGithubSyncStatus('Synced');
                            setShowSyncMenu(false);
                            triggerToast('GitHub Sync: Clean tree, synced with origin/main (SHA: 8f4c21a)');
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                            githubSyncStatus === 'Synced' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>Synced</span>
                          </span>
                          <span className="text-[10px] text-emerald-400 font-mono">0 pending</span>
                        </button>

                        <button
                          type="button"
                          id="sync-option-pending"
                          onClick={() => {
                            setGithubSyncStatus('Pending Commits');
                            setShowSyncMenu(false);
                            triggerToast('GitHub Sync: 2 commits pending push to origin/main');
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                            githubSyncStatus === 'Pending Commits' ? 'bg-amber-500/20 text-amber-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <GitCommit className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                            <span>Pending Commits</span>
                          </span>
                          <span className="text-[10px] text-amber-400 font-mono">+2 ahead</span>
                        </button>

                        <button
                          type="button"
                          id="sync-option-conflict"
                          onClick={() => {
                            setGithubSyncStatus('Conflict');
                            setShowSyncMenu(false);
                            triggerToast('GitHub Sync: Merge conflict detected in .github/workflows/ci.yml');
                          }}
                          className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer ${
                            githubSyncStatus === 'Conflict' ? 'bg-red-500/20 text-red-300 font-bold' : 'text-slate-300 hover:bg-slate-800'
                          }`}
                        >
                          <span className="flex items-center gap-2">
                            <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                            <span>Conflict</span>
                          </span>
                          <span className="text-[10px] text-red-400 font-mono">conflict!</span>
                        </button>

                        {/* Workflow Actions Section */}
                        <div className="pt-1.5 mt-1.5 border-t border-slate-800 space-y-1">
                          <div className="px-2 py-0.5 text-[9px] text-slate-500 uppercase tracking-wider font-semibold">
                            Workflow Actions
                          </div>

                          {/* Resolve Conflict Button */}
                          <button
                            type="button"
                            id="resolve-conflict-btn"
                            onClick={handleResolveConflict}
                            title="Resolve conflict automatically and synchronize repository back to Synced"
                            className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-all cursor-pointer font-medium ${
                              githubSyncStatus === 'Conflict'
                                ? 'bg-red-500/25 hover:bg-red-500/35 text-red-100 border border-red-500/60 shadow-xs ring-1 ring-red-500/40 animate-pulse'
                                : 'text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800'
                            }`}
                          >
                            <span className="flex items-center gap-2">
                              <GitMerge className={`w-3.5 h-3.5 shrink-0 ${githubSyncStatus === 'Conflict' ? 'text-red-400' : 'text-slate-400'}`} />
                              <span className="font-semibold">Resolve Conflict</span>
                            </span>
                            <span className="text-[10px] font-mono text-emerald-400 font-bold">
                              {githubSyncStatus === 'Conflict' ? 'Auto-merge' : 'Simulate'}
                            </span>
                          </button>

                          {/* Copy Last Commit SHA Button */}
                          <button
                            type="button"
                            id="copy-last-commit-sha-btn"
                            onClick={handleCopyLastCommitSha}
                            title="Copy last commit SHA (8f4c21a) to clipboard"
                            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-left transition-colors cursor-pointer text-slate-300 hover:text-white hover:bg-slate-800/80 border border-slate-800"
                          >
                            <span className="flex items-center gap-2">
                              {copiedSha ? (
                                <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                              ) : (
                                <Copy className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                              )}
                              <span>Copy Last Commit SHA</span>
                            </span>
                            <span className="text-[10px] font-mono text-slate-300 bg-slate-800/90 px-1.5 py-0.5 rounded border border-slate-700/60 font-semibold">
                              {copiedSha ? 'Copied!' : mockLastCommitSha}
                            </span>
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                <p className="text-[10px] text-slate-400 font-mono">GNN TV News Operating Suite</p>
              </div>
            </div>

            {/* Filter Search bar, Type Dropdown, and Sort Dropdown */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 flex-1 max-w-2xl">
              {/* Filter Search bar */}
              <div className="relative flex-1">
                <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-500" />
                <input 
                  type="text"
                  placeholder={`Filter elements in ${activeTab.toUpperCase()} tab...`}
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950/70 border border-slate-800/80 focus:border-red-500/40 focus:ring-1 focus:ring-red-500/10 rounded-xl pl-10 pr-8 py-2 text-xs font-mono text-slate-200 outline-none transition-all placeholder:text-slate-650"
                />
                {searchQuery && (
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3.5 top-2 text-slate-500 hover:text-white font-mono text-xs cursor-pointer"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Type Filter Dropdown Menu */}
              <div className="relative shrink-0">
                <div className="relative flex items-center">
                  <Filter className="absolute left-3 w-3.5 h-3.5 text-red-400 pointer-events-none" />
                  <select
                    id="workspace-asset-type-filter"
                    aria-label="Filter assets by type"
                    value={selectedAssetType}
                    onChange={(e) => {
                      setSelectedAssetType(e.target.value);
                      triggerToast(`Filtered assets by: ${e.target.value === 'all' ? 'All Types' : e.target.value.toUpperCase()}`);
                    }}
                    className="w-full sm:w-auto bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 text-slate-200 text-xs font-mono rounded-xl pl-8 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:border-red-500/50 focus:ring-1 focus:ring-red-500/20 transition-all shadow-inner"
                  >
                    <option value="all" className="bg-slate-950 text-slate-200">All Types</option>
                    <option value="video" className="bg-slate-950 text-slate-200">Video</option>
                    <option value="image" className="bg-slate-950 text-slate-200">Image</option>
                    <option value="audio" className="bg-slate-950 text-slate-200">Audio</option>
                    <option value="subtitles" className="bg-slate-950 text-slate-200">Subtitles</option>
                    <option value="script" className="bg-slate-950 text-slate-200">Script</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                </div>
              </div>

              {/* Sort Dropdown Menu */}
              <div className="relative shrink-0">
                <div className="relative flex items-center">
                  <ArrowUpDown className="absolute left-3 w-3.5 h-3.5 text-blue-400 pointer-events-none" />
                  <select
                    id="workspace-sort-dropdown"
                    aria-label="Sort workspace content"
                    value={sortBy}
                    onChange={(e) => {
                      const val = e.target.value as 'date-desc' | 'date-asc' | 'status-asc' | 'status-desc';
                      setSortBy(val);
                      const labels = {
                        'date-desc': 'Date Created (Newest)',
                        'date-asc': 'Date Created (Oldest)',
                        'status-asc': 'Status (Alphabetical A-Z)',
                        'status-desc': 'Status (Alphabetical Z-A)',
                      };
                      triggerToast(`Sorted by: ${labels[val]}`);
                    }}
                    className="w-full sm:w-auto bg-slate-950/80 border border-slate-800/80 hover:border-slate-700 text-slate-200 text-xs font-mono rounded-xl pl-8 pr-8 py-2 appearance-none cursor-pointer focus:outline-none focus:border-blue-500/50 focus:ring-1 focus:ring-blue-500/20 transition-all shadow-inner"
                  >
                    <option value="date-desc" className="bg-slate-950 text-slate-200">Date Created (Newest)</option>
                    <option value="date-asc" className="bg-slate-950 text-slate-200">Date Created (Oldest)</option>
                    <option value="status-asc" className="bg-slate-950 text-slate-200">Status (A-Z)</option>
                    <option value="status-desc" className="bg-slate-950 text-slate-200">Status (Z-A)</option>
                  </select>
                  <ChevronDown className="absolute right-2.5 w-3.5 h-3.5 text-slate-500 pointer-events-none" />
                </div>
              </div>
            </div>

            {/* Right side actions (Google Drive Connector, Download Workspace Snapshot, Layout toggle, Auto-refresh toggle & Empty state toggle) */}
            <div className="flex items-center gap-2 flex-wrap">
              {/* Google Drive Connector Module */}
              <GoogleDriveConnector
                onLinkAsset={handleAddAsset}
                linkedAssets={assets}
                triggerToast={triggerToast}
              />

              {/* Gmail News Desk Quick Trigger */}
              <button
                id="workspace-gmail-trigger-btn"
                type="button"
                onClick={() => {
                  setActiveTab('gmail');
                  triggerToast('Switched to Gmail News Desk');
                }}
                title="Open Gmail News Desk to read press releases and dispatch studio emails"
                className="flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border bg-slate-900 hover:bg-slate-850 border-red-500/40 hover:border-red-400 text-red-300 hover:text-white transition-all shadow-sm hover:shadow-red-950/40 cursor-pointer"
              >
                <Mail className="w-3.5 h-3.5 text-red-400" />
                <span>Gmail News Desk</span>
              </button>

              {/* Expo Go Mobile Companion Quick Trigger */}
              <button
                id="workspace-expo-trigger-btn"
                type="button"
                onClick={() => {
                  setShowExpoModal(true);
                  triggerToast('Opened Expo Mobile Companion (@aigaming)');
                }}
                title="Scan QR Code or Launch Mobile Companion (exp://exp.host/@aigaming/gnn-ai-studio)"
                className="flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border bg-slate-900 hover:bg-slate-850 border-indigo-500/40 hover:border-indigo-400 text-indigo-300 hover:text-white transition-all shadow-sm hover:shadow-indigo-950/40 cursor-pointer"
              >
                <Smartphone className="w-3.5 h-3.5 text-indigo-400" />
                <span>Mobile App (Expo Go)</span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              </button>

              {/* Download Workspace Snapshot */}
              <button
                id="download-workspace-snapshot-btn"
                type="button"
                onClick={handleDownloadWorkspaceSnapshot}
                title={`Download JSON snapshot containing ${filteredScripts.length} scripts and ${filteredAssets.length} assets`}
                className="flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border bg-slate-900 hover:bg-slate-850 border-cyan-500/40 hover:border-cyan-400 text-cyan-300 hover:text-white transition-all shadow-sm hover:shadow-cyan-950/40 cursor-pointer group/snap"
              >
                <Download className="w-3.5 h-3.5 text-cyan-400 group-hover/snap:scale-110 transition-transform" />
                <span>Download Workspace Snapshot</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 font-normal">
                  {filteredScripts.length + filteredAssets.length}
                </span>
              </button>

              <button
                onClick={() => {
                  const nextMode = workspaceViewMode === 'list' ? 'grid' : 'list';
                  setWorkspaceViewMode(nextMode);
                  triggerToast(`Switched workspace layout to ${nextMode.toUpperCase()} view`);
                }}
                className="flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border bg-slate-950 border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
              >
                {workspaceViewMode === 'list' ? <LayoutGrid className="w-3.5 h-3.5 text-red-400" /> : <List className="w-3.5 h-3.5 text-red-400" />}
                <span>Layout: {workspaceViewMode.toUpperCase()}</span>
              </button>

              <button
                onClick={() => {
                  setIsAutoRefreshActive(!isAutoRefreshActive);
                  triggerToast(isAutoRefreshActive ? 'Auto-refresh disabled' : 'Auto-refresh enabled (6s polling interval)');
                }}
                className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isAutoRefreshActive 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isAutoRefreshActive ? 'animate-spin' : ''}`} />
                <span>Auto-refresh: {isAutoRefreshActive ? 'ON' : 'OFF'}</span>
              </button>

              <button
                onClick={() => {
                  setIsEmptyStateActive(!isEmptyStateActive);
                  triggerToast(isEmptyStateActive ? 'Switched to active workspace tab view' : 'Switched to Empty Workspace Guidance Deck');
                }}
                className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isEmptyStateActive 
                    ? 'bg-red-500/10 border-red-500/30 text-red-400' 
                    : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {isEmptyStateActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                <span>{isEmptyStateActive ? 'Show Content' : 'Force Empty State'}</span>
              </button>

              {/* Category Color-Coding Selector for Card Border */}
              <div className="relative inline-flex items-center">
                <button
                  id="workspace-category-color-selector"
                  type="button"
                  onClick={() => setShowColorPicker(prev => !prev)}
                  title={`Card Border Category: ${BORDER_COLOR_THEMES[workspaceBorderColor].label} (${BORDER_COLOR_THEMES[workspaceBorderColor].category}) • Click to select category color`}
                  className={`flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer shadow-xs ${BORDER_COLOR_THEMES[workspaceBorderColor].badgeClass}`}
                >
                  <Palette className="w-3.5 h-3.5 opacity-90" />
                  <span className="hidden sm:inline">Color:</span>
                  <span className={`w-2.5 h-2.5 rounded-full shrink-0 ${BORDER_COLOR_THEMES[workspaceBorderColor].dotClass}`} />
                  <span className="capitalize">{BORDER_COLOR_THEMES[workspaceBorderColor].label}</span>
                  <ChevronDown className="w-3 h-3 opacity-60 ml-0.5" />
                </button>

                {showColorPicker && (
                  <div
                    id="workspace-color-picker-dropdown"
                    className="absolute right-0 top-full mt-2 z-50 w-72 bg-slate-900/98 backdrop-blur-2xl border border-slate-700/80 rounded-xl p-2 shadow-2xl space-y-1 font-mono text-xs animate-in fade-in zoom-in-95 duration-100"
                  >
                    <div className="flex items-center justify-between px-2.5 py-1.5 text-[10px] text-slate-400 border-b border-slate-800 font-bold uppercase tracking-wider">
                      <span className="flex items-center gap-1.5 text-white">
                        <Palette className="w-3.5 h-3.5 text-red-400" />
                        Border Category Color
                      </span>
                      <span className="text-[9px] text-slate-500">Visual Organization</span>
                    </div>

                    <div className="py-1 space-y-0.5">
                      {(Object.keys(BORDER_COLOR_THEMES) as WorkspaceBorderColorId[]).map((key) => {
                        const theme = BORDER_COLOR_THEMES[key];
                        const isSelected = workspaceBorderColor === key;
                        return (
                          <button
                            key={theme.id}
                            type="button"
                            id={`color-option-${theme.id}`}
                            onClick={() => {
                              setWorkspaceBorderColor(theme.id);
                              setShowColorPicker(false);
                              triggerToast(`Workspace card assigned ${theme.label} border (${theme.category})`);
                            }}
                            className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-left transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-slate-800/90 text-white font-bold ring-1 ring-white/20'
                                : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                            }`}
                          >
                            <span className="flex items-center gap-2.5">
                              <span className={`w-3.5 h-3.5 rounded-full shrink-0 ${theme.dotClass}`} />
                              <span className="font-semibold">{theme.label}</span>
                              <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-950 border border-slate-800 text-slate-400 font-normal">
                                {theme.category}
                              </span>
                            </span>
                            {isSelected && (
                              <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    <div className="px-2 pt-1.5 pb-0.5 border-t border-slate-800 text-[10px] text-slate-500 flex items-center justify-between">
                      <span>Active: {BORDER_COLOR_THEMES[workspaceBorderColor].description}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Workspace Card Settings Menu with Minimum/Maximum Height Constraints */}
              <div className="relative inline-flex items-center">
                <button
                  id="workspace-card-settings-btn"
                  type="button"
                  onClick={() => setShowWorkspaceSettingsMenu(prev => !prev)}
                  title={`Workspace Card Settings • Height Bounds: ${minHeightConstraint}px - ${maxHeightConstraint}px`}
                  className={`flex items-center gap-1.5 text-xs font-mono font-bold px-2.5 py-1.5 rounded-lg border transition-all cursor-pointer shadow-xs ${
                    showWorkspaceSettingsMenu
                      ? 'bg-cyan-500/20 text-cyan-300 border-cyan-500/50 ring-1 ring-cyan-500/40'
                      : minHeightConstraint !== DEFAULT_MIN_HEIGHT || maxHeightConstraint !== DEFAULT_MAX_HEIGHT
                      ? 'bg-slate-900 border-cyan-500/40 text-cyan-300 hover:text-white'
                      : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                >
                  <Settings className={`w-3.5 h-3.5 ${showWorkspaceSettingsMenu ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Settings</span>
                  {minHeightConstraint !== DEFAULT_MIN_HEIGHT || maxHeightConstraint !== DEFAULT_MAX_HEIGHT ? (
                    <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse" />
                  ) : null}
                  <ChevronDown className={`w-3 h-3 opacity-60 ml-0.5 transition-transform ${showWorkspaceSettingsMenu ? 'rotate-180' : ''}`} />
                </button>

                {showWorkspaceSettingsMenu && (
                  <div
                    id="workspace-card-settings-menu"
                    className="absolute right-0 top-full mt-2 z-50 w-80 sm:w-96 bg-slate-900/98 backdrop-blur-2xl border border-slate-700/80 rounded-2xl p-3 shadow-2xl space-y-3 font-mono text-xs animate-in fade-in zoom-in-95 duration-100 max-h-[85vh] overflow-y-auto"
                  >
                    {/* Header */}
                    <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                      <div className="flex items-center gap-2">
                        <div className="p-1 rounded-md bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
                          <Settings className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-xs uppercase tracking-wider">Workspace Card Settings</h4>
                          <p className="text-[10px] text-slate-400">Configure sizing, constraints & layout</p>
                        </div>
                      </div>
                      <button
                        type="button"
                        id="workspace-close-settings-menu-btn"
                        onClick={() => setShowWorkspaceSettingsMenu(false)}
                        className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 cursor-pointer"
                        title="Close settings menu"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>

                    {/* Minimum/Maximum Height Constraints Configuration Panel */}
                    <div
                      id="workspace-height-constraints-panel"
                      className="bg-slate-950/90 border border-cyan-500/30 rounded-xl p-3 space-y-3 shadow-inner"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 text-cyan-300 font-bold text-xs">
                          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                          <span>Minimum/Maximum Height Constraints</span>
                        </div>
                        {minHeightConstraint !== DEFAULT_MIN_HEIGHT || maxHeightConstraint !== DEFAULT_MAX_HEIGHT ? (
                          <span className="text-[9px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 px-1.5 py-0.5 rounded-full font-bold">
                            Custom Bounds
                          </span>
                        ) : (
                          <span className="text-[9px] bg-slate-800 text-slate-400 border border-slate-700 px-1.5 py-0.5 rounded-full">
                            Default Limits
                          </span>
                        )}
                      </div>

                      <p className="text-[10px] text-slate-400 leading-relaxed">
                        Define specific bounds for the workspace height that override the default limits (260px min, 3200px max).
                      </p>

                      {/* Visual Bounds Range Track */}
                      <div className="bg-slate-900/90 rounded-lg p-2 border border-slate-800 space-y-1">
                        <div className="flex items-center justify-between text-[10px] text-slate-300 font-bold">
                          <span className="flex items-center gap-1 text-cyan-300">
                            <Minimize2 className="w-3 h-3" /> Min: {minHeightConstraint}px
                          </span>
                          <span className="text-slate-400">
                            Active: {cardHeight ? `${Math.round(cardHeight)}px` : 'Auto'}
                          </span>
                          <span className="flex items-center gap-1 text-cyan-300">
                            <Maximize2 className="w-3 h-3" /> Max: {maxHeightConstraint}px
                          </span>
                        </div>
                        <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden flex">
                          <div
                            className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                            style={{
                              width: `${Math.min(100, Math.max(10, ((maxHeightConstraint - minHeightConstraint) / 4800) * 100))}%`
                            }}
                          />
                        </div>
                      </div>

                      {/* Minimum Height Constraint Control */}
                      <div id="workspace-min-height-control" className="space-y-1.5">
                        <div className="flex items-center justify-between text-[11px]">
                          <label htmlFor="workspace-min-height-input" className="text-slate-300 font-semibold flex items-center gap-1">
                            <span>Min Height Floor:</span>
                          </label>
                          <div className="flex items-center gap-1">
                            <input
                              id="workspace-min-height-input"
                              type="number"
                              min={150}
                              max={maxHeightConstraint - 50}
                              step={10}
                              value={minHeightConstraint}
                              onChange={(e) => handleSetHeightConstraints(Number(e.target.value), maxHeightConstraint)}
                              className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-white text-right text-xs font-bold focus:border-cyan-400 focus:outline-none"
                            />
                            <span className="text-slate-400 text-[10px]">px</span>
                          </div>
                        </div>

                        <input
                          id="workspace-min-height-slider"
                          type="range"
                          min={150}
                          max={Math.min(1500, maxHeightConstraint - 50)}
                          step={10}
                          value={minHeightConstraint}
                          onChange={(e) => handleSetHeightConstraints(Number(e.target.value), maxHeightConstraint)}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />

                        {/* Quick Floor Chips */}
                        <div className="flex items-center gap-1 flex-wrap pt-0.5">
                          {[200, 260, 350, 500].map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => handleSetHeightConstraints(v, maxHeightConstraint, `Min height set to ${v}px`)}
                              className={`px-1.5 py-0.5 rounded text-[9px] cursor-pointer transition-all ${
                                minHeightConstraint === v
                                  ? 'bg-cyan-500 text-slate-950 font-bold'
                                  : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800'
                              }`}
                            >
                              {v}px{v === DEFAULT_MIN_HEIGHT ? ' (Def)' : ''}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Maximum Height Constraint Control */}
                      <div id="workspace-max-height-control" className="space-y-1.5 pt-1 border-t border-slate-800/80">
                        <div className="flex items-center justify-between text-[11px]">
                          <label htmlFor="workspace-max-height-input" className="text-slate-300 font-semibold flex items-center gap-1">
                            <span>Max Height Ceiling:</span>
                          </label>
                          <div className="flex items-center gap-1">
                            <input
                              id="workspace-max-height-input"
                              type="number"
                              min={minHeightConstraint + 50}
                              max={5000}
                              step={50}
                              value={maxHeightConstraint}
                              onChange={(e) => handleSetHeightConstraints(minHeightConstraint, Number(e.target.value))}
                              className="w-16 px-1.5 py-0.5 rounded bg-slate-900 border border-slate-700 text-white text-right text-xs font-bold focus:border-cyan-400 focus:outline-none"
                            />
                            <span className="text-slate-400 text-[10px]">px</span>
                          </div>
                        </div>

                        <input
                          id="workspace-max-height-slider"
                          type="range"
                          min={Math.max(500, minHeightConstraint + 50)}
                          max={5000}
                          step={50}
                          value={maxHeightConstraint}
                          onChange={(e) => handleSetHeightConstraints(minHeightConstraint, Number(e.target.value))}
                          className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
                        />

                        {/* Quick Ceiling Chips */}
                        <div className="flex items-center gap-1 flex-wrap pt-0.5">
                          {[800, 1200, 1800, 2400, 3200, 4500].map((v) => (
                            <button
                              key={v}
                              type="button"
                              onClick={() => handleSetHeightConstraints(minHeightConstraint, v, `Max height set to ${v}px`)}
                              className={`px-1.5 py-0.5 rounded text-[9px] cursor-pointer transition-all ${
                                maxHeightConstraint === v
                                  ? 'bg-cyan-500 text-slate-950 font-bold'
                                  : 'text-slate-400 hover:text-white bg-slate-900 hover:bg-slate-800 border border-slate-800'
                              }`}
                            >
                              {v}px{v === DEFAULT_MAX_HEIGHT ? ' (Def)' : ''}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Preset Height Profiles Section */}
                      <div 
                        id="workspace-preset-height-profiles-section" 
                        className="pt-2.5 border-t border-slate-800/80 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-1.5 text-slate-200 font-bold text-[11px]">
                            <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Preset Height Profiles</span>
                          </div>
                          <span className="text-[9px] text-cyan-400/80 font-mono bg-cyan-950/60 border border-cyan-500/20 px-1.5 py-0.5 rounded-full">
                            {PREDEFINED_HEIGHT_PROFILES.length + customHeightProfiles.length} Layouts
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-400 leading-tight">
                          Save and switch between predefined workspace layouts and custom viewport configurations.
                        </p>

                        {/* List of Predefined Height Profiles */}
                        <div className="space-y-1.5 pt-0.5">
                          {PREDEFINED_HEIGHT_PROFILES.map((profile) => {
                            const isProfileActive = 
                              minHeightConstraint === profile.minHeight && 
                              maxHeightConstraint === profile.maxHeight;

                            return (
                              <button
                                key={profile.id}
                                type="button"
                                id={`workspace-profile-${profile.id}`}
                                onClick={() => handleApplyHeightProfile(profile)}
                                className={`w-full p-2 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between gap-2 group ${
                                  isProfileActive
                                    ? 'bg-cyan-500/15 border-cyan-400/80 text-white shadow-[0_0_12px_rgba(6,182,212,0.25)] ring-1 ring-cyan-400/50'
                                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/80'
                                }`}
                              >
                                <div className="min-w-0 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-[11px] text-white flex items-center gap-1.5">
                                      <Layers className="w-3 h-3 text-cyan-400 group-hover:scale-110 transition-transform" />
                                      {profile.name}
                                    </span>
                                    {isProfileActive && (
                                      <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 bg-cyan-500 text-slate-950 font-extrabold rounded-full font-mono">
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[9px] text-slate-400 truncate mt-0.5">
                                    {profile.description}
                                  </p>
                                </div>
                                <div className="text-right shrink-0">
                                  <span className="text-[9px] font-mono font-bold text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded block">
                                    {profile.minHeight}–{profile.maxHeight}px
                                  </span>
                                  <span className="text-[8px] text-slate-500 font-mono mt-0.5 block">
                                    Target: {profile.targetHeight}px
                                  </span>
                                </div>
                              </button>
                            );
                          })}

                          {/* Custom Saved Height Profiles */}
                          {customHeightProfiles.map((profile) => {
                            const isProfileActive = 
                              minHeightConstraint === profile.minHeight && 
                              maxHeightConstraint === profile.maxHeight;

                            return (
                              <div
                                key={profile.id}
                                className={`w-full p-2 rounded-xl border text-left transition-all flex items-center justify-between gap-2 group ${
                                  isProfileActive
                                    ? 'bg-purple-500/15 border-purple-400/80 text-white shadow-[0_0_12px_rgba(168,85,247,0.25)] ring-1 ring-purple-400/50'
                                    : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 text-slate-300 hover:bg-slate-800/80'
                                }`}
                              >
                                <button
                                  type="button"
                                  onClick={() => handleApplyHeightProfile(profile)}
                                  className="min-w-0 flex-1 text-left cursor-pointer"
                                >
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-[11px] text-white flex items-center gap-1.5">
                                      <Bookmark className="w-3 h-3 text-purple-400" />
                                      {profile.name}
                                    </span>
                                    <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 bg-purple-500/20 text-purple-300 border border-purple-500/40 font-bold rounded-full font-mono">
                                      Custom
                                    </span>
                                    {isProfileActive && (
                                      <span className="text-[8px] uppercase tracking-wider px-1.5 py-0.5 bg-cyan-500 text-slate-950 font-extrabold rounded-full font-mono">
                                        Active
                                      </span>
                                    )}
                                  </div>
                                  <p className="text-[9px] text-slate-400 truncate mt-0.5">
                                    {profile.description}
                                  </p>
                                </button>
                                <div className="flex items-center gap-2 shrink-0">
                                  <div className="text-right">
                                    <span className="text-[9px] font-mono font-bold text-purple-300 bg-purple-950/60 border border-purple-500/30 px-1.5 py-0.5 rounded block">
                                      {profile.minHeight}–{profile.maxHeight}px
                                    </span>
                                  </div>
                                  <button
                                    type="button"
                                    onClick={() => handleDeleteCustomProfile(profile.id, profile.name)}
                                    title="Delete custom profile"
                                    className="p-1 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              </div>
                            );
                          })}
                        </div>

                        {/* Save Current Layout as Preset Height Profile */}
                        <div className="pt-2 border-t border-slate-800/60">
                          {isSavingNewProfile ? (
                            <div className="space-y-2 bg-slate-900/90 p-2.5 rounded-xl border border-cyan-500/40">
                              <label htmlFor="workspace-save-profile-input" className="text-[10px] font-bold text-cyan-300 block">
                                Name New Height Profile:
                              </label>
                              <div className="flex items-center gap-1.5">
                                <input
                                  id="workspace-save-profile-input"
                                  type="text"
                                  value={newProfileName}
                                  onChange={(e) => setNewProfileName(e.target.value)}
                                  placeholder="e.g. Broadcast Rig, Multi-Feed Desk"
                                  className="flex-1 px-2 py-1 rounded bg-slate-950 border border-slate-700 text-white text-xs font-mono focus:border-cyan-400 focus:outline-none"
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter') handleSaveCustomProfile();
                                    if (e.key === 'Escape') setIsSavingNewProfile(false);
                                  }}
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  id="workspace-confirm-save-profile-btn"
                                  onClick={handleSaveCustomProfile}
                                  className="px-2.5 py-1 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] rounded cursor-pointer transition-all shadow"
                                >
                                  Save
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setIsSavingNewProfile(false)}
                                  className="p-1 text-slate-400 hover:text-white rounded cursor-pointer"
                                >
                                  <X className="w-3.5 h-3.5" />
                                </button>
                              </div>
                              <span className="text-[9px] text-slate-400 block font-mono">
                                Will save bounds: {minHeightConstraint}px – {maxHeightConstraint}px (Height: {cardHeight ? `${Math.round(cardHeight)}px` : 'Auto'})
                              </span>
                            </div>
                          ) : (
                            <button
                              type="button"
                              id="workspace-save-profile-btn"
                              onClick={() => {
                                setNewProfileName(`Layout ${customHeightProfiles.length + 1} (${minHeightConstraint}-${maxHeightConstraint}px)`);
                                setIsSavingNewProfile(true);
                              }}
                              className="w-full py-1.5 px-2 rounded-lg border border-dashed border-cyan-500/40 hover:border-cyan-400 bg-cyan-950/20 hover:bg-cyan-950/40 text-cyan-300 text-[10px] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer group"
                            >
                              <Plus className="w-3 h-3 text-cyan-400 group-hover:rotate-90 transition-transform" />
                              <span>Save Current Layout as Profile</span>
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Reset to Default Limits Button */}
                      <div className="pt-2 border-t border-slate-800 flex items-center justify-between gap-2">
                        <button
                          type="button"
                          id="workspace-reset-constraints-btn"
                          onClick={() => handleSetHeightConstraints(DEFAULT_MIN_HEIGHT, DEFAULT_MAX_HEIGHT, 'Reset constraints to default limits (260px – 3200px)')}
                          disabled={minHeightConstraint === DEFAULT_MIN_HEIGHT && maxHeightConstraint === DEFAULT_MAX_HEIGHT}
                          className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all ${
                            minHeightConstraint === DEFAULT_MIN_HEIGHT && maxHeightConstraint === DEFAULT_MAX_HEIGHT
                              ? 'opacity-40 cursor-not-allowed bg-slate-900 text-slate-500 border border-slate-800'
                              : 'cursor-pointer bg-slate-900 hover:bg-slate-800 text-amber-300 hover:text-white border border-amber-500/30'
                          }`}
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Reset to Default Limits</span>
                        </button>

                        <button
                          type="button"
                          id="workspace-apply-constraints-btn"
                          onClick={() => {
                            setShowWorkspaceSettingsMenu(false);
                            triggerToast(`Height constraints applied: Min ${minHeightConstraint}px, Max ${maxHeightConstraint}px`);
                          }}
                          className="flex items-center gap-1 px-3 py-1 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-[10px] cursor-pointer shadow-md shadow-cyan-950/50"
                        >
                          <Check className="w-3 h-3" />
                          <span>Done</span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Expand / Collapse Header Toggle Button */}
              <button
                id="workspace-collapse-toggle-btn"
                type="button"
                onClick={() => {
                  setIsWorkspaceCollapsed(prev => !prev);
                  triggerToast(isWorkspaceCollapsed ? 'Workspace body expanded' : 'Workspace body collapsed for dense layout');
                }}
                title={isWorkspaceCollapsed ? "Expand workspace body content" : "Collapse workspace body content"}
                className={`flex items-center gap-1.5 text-xs font-mono font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isWorkspaceCollapsed
                    ? 'bg-amber-500/15 hover:bg-amber-500/25 border-amber-500/40 text-amber-300 ring-1 ring-amber-500/30'
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {isWorkspaceCollapsed ? (
                  <>
                    <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                    <span>Expand</span>
                  </>
                ) : (
                  <>
                    <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                    <span>Collapse</span>
                  </>
                )}
              </button>
            </div>

          </div>

          {/* Workspace Card Body Content (Collapsible) */}
          {isWorkspaceCollapsed ? (
            <div 
              id="workspace-card-collapsed-notice"
              onClick={() => {
                setIsWorkspaceCollapsed(false);
                triggerToast('Workspace body expanded');
              }}
              className="py-8 px-4 text-center cursor-pointer border border-dashed border-slate-800/80 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950/60 rounded-xl transition-all group select-none"
            >
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 text-xs font-mono text-slate-400 group-hover:text-slate-200">
                <ChevronDown className="w-4 h-4 text-amber-400 animate-bounce" />
                <span className="font-semibold text-slate-300">Workspace body collapsed for dense dashboard focus.</span>
                <span className="text-slate-500">Click to expand or right-click anywhere for quick shortcuts.</span>
              </div>
            </div>
          ) : (
            <div id="workspace-card-body" className="space-y-6">
              {/* Quick Pending Review Notification Strip inside Workspace Card */}
          {activeTab !== 'approvals' && scripts.some(s => s.status === 'pending_review') && (
            <div className="mb-6 bg-gradient-to-r from-amber-500/15 via-amber-500/10 to-slate-950 border border-amber-500/30 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-lg shadow-amber-950/20 animate-fade-in">
              <div className="flex items-center gap-2.5 text-amber-300">
                <span className="relative flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-amber-500"></span>
                </span>
                <span className="font-mono font-bold">
                  {scripts.filter(s => s.status === 'pending_review').length} Broadcast Script(s) Pending Editorial Review
                </span>
                <span className="text-slate-400 hidden md:inline">— Requires producer authorization before broadcast transmission.</span>
              </div>
              <button
                onClick={() => setActiveTab('approvals')}
                className="px-3.5 py-1.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-bold font-sans rounded-lg text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer shadow-md shadow-amber-950/40 shrink-0"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>Open Approval Queue</span>
              </button>
            </div>
          )}

          {/* Active Workspace View / Empty state fallback with Framer Motion internal component transitions */}
          <AnimatePresence mode="wait">
            {isEmptyStateActive ? (
              <motion.div
                key="empty-workspace-deck"
                initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                <EmptyState 
                  onPopulateDemo={handlePopulateDemo} 
                  onOpenQuickScript={() => setShowNewScriptModal(true)} 
                  onOpenQuickAsset={() => setShowNewAssetModal(true)} 
                />
              </motion.div>
            ) : (
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8, filter: 'blur(3px)' }}
                animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
                exit={{ opacity: 0, y: -6, filter: 'blur(2px)' }}
                transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                className="w-full"
              >
                {activeTab === 'dashboard' && (
                  <AnalyticsDashboard 
                    scripts={filteredScripts} 
                    posts={filteredPosts} 
                  />
                )}
                {activeTab === 'gnn_os' && (
                  <GnnControlPlane 
                    userRole={userRole}
                    setUserRole={setUserRole}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                  />
                )}
                {activeTab === 'aibrain' && (
                  <AiBrainStudio />
                )}
                {activeTab === 'approvals' && (
                  <ScriptApprovalHub
                    userRole={userRole}
                    scripts={filteredScripts}
                    setScripts={setScripts}
                    onAddAsset={handleAddAsset}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                    triggerToast={triggerToast}
                  />
                )}
                {activeTab === 'news' && (
                  <NewsEditor 
                    userRole={userRole} 
                    onAddScript={handleAddScript} 
                    onAddAsset={handleAddAsset} 
                    onAddMessage={handleAddMessage} 
                  />
                )}
                {activeTab === 'gmail' && (
                  <GmailNewsDesk
                    userRole={userRole}
                    onAddScript={handleAddScript}
                    onAddAsset={handleAddAsset}
                    triggerToast={triggerToast}
                    onNavigateToNews={() => {
                      setActiveTab('news');
                    }}
                  />
                )}
                {activeTab === 'studio' && (
                  <StudioDirector 
                    userRole={userRole} 
                    onAddAsset={handleAddAsset} 
                  />
                )}
                {activeTab === 'fastmcp_vmix' && (
                  <FastMcpVmixStudio
                    userRole={userRole}
                    scripts={scripts}
                    assets={assets}
                    onAddAsset={handleAddAsset}
                    triggerToast={triggerToast}
                  />
                )}
                {activeTab === 'mobile_companion' && (
                  <ExpoMobileCompanion
                    scripts={scripts}
                    onAddAsset={handleAddAsset}
                    triggerToast={triggerToast}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                    initialUrl="exp://exp.host/@aigaming/gnn-ai-studio"
                  />
                )}
                {activeTab === 'audio' && (
                  <AudioTools 
                    userRole={userRole} 
                    onAddAsset={handleAddAsset} 
                  />
                )}
                {activeTab === 'manual_edit' && (
                  <ManualEditPanel 
                    userRole={userRole} 
                    onAddAsset={handleAddAsset} 
                  />
                )}
                {activeTab === 'repository' && (
                  <AssetRepository 
                    userRole={userRole} 
                    assets={filteredAssets} 
                    setAssets={setAssets} 
                    viewMode={workspaceViewMode}
                    triggerToast={triggerToast}
                  />
                )}
                {activeTab === 'scheduler' && (
                  <SocialScheduler 
                    userRole={userRole} 
                    scripts={filteredScripts} 
                    posts={filteredPosts} 
                    setPosts={setPosts} 
                    assets={assets}
                    triggerToast={triggerToast}
                  />
                )}
                {activeTab === 'chat' && (
                  <ChatAssistant 
                    userRole={userRole} 
                    messages={messages} 
                    setMessages={setMessages} 
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Expandable GNN AI Brain Real-Time Agent Telemetry Log Viewer Panel */}
          <GnnBrainLogViewer defaultExpanded={false} />

          {/* Floating 'Quick Action' FAB Menu */}
          <div className="absolute bottom-6 right-6 z-40 flex flex-col items-end gap-2">
            {showQuickActionMenu && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-2.5 shadow-2xl flex flex-col gap-1 text-xs font-mono animate-fade-in text-slate-300 w-44">
                <span className="text-[9px] text-slate-500 uppercase tracking-widest p-1 border-b border-slate-900 block mb-1">
                  ⚡ Quick Action
                </span>
                
                <button 
                  onClick={() => {
                    setShowNewScriptModal(true);
                    setShowQuickActionMenu(false);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-red-500/5 hover:text-red-400 transition-colors text-left cursor-pointer"
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>📝 New Script</span>
                </button>

                <button 
                  onClick={() => {
                    setShowNewAssetModal(true);
                    setShowQuickActionMenu(false);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-red-500/5 hover:text-red-400 transition-colors text-left cursor-pointer"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>🎨 New Asset</span>
                </button>

                <button 
                  onClick={() => {
                    setIsEmptyStateActive(!isEmptyStateActive);
                    setShowQuickActionMenu(false);
                  }}
                  className="flex items-center gap-2 p-1.5 rounded hover:bg-red-500/5 hover:text-red-400 transition-colors text-left cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>🔄 Empty Workspace</span>
                </button>
              </div>
            )}

            <button 
              onClick={() => setShowQuickActionMenu(!showQuickActionMenu)}
              className="w-12 h-12 rounded-full bg-red-650 hover:bg-red-700 text-white flex items-center justify-center shadow-xl shadow-red-950/45 cursor-pointer transition-transform hover:scale-110 border border-red-500/30"
              title="Quick GNN Menu"
            >
              {showQuickActionMenu ? <X className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
            </button>
          </div>

        </div>
      )}

      {/* Right-click Custom Context Menu for #workspace-card */}
      {contextMenu.visible && (
        <div
          id="workspace-context-menu"
          style={{ top: `${contextMenu.y}px`, left: `${contextMenu.x}px` }}
          className="fixed z-50 w-64 bg-slate-900/95 backdrop-blur-xl border border-slate-700/80 rounded-xl shadow-2xl p-1.5 font-mono text-xs text-slate-200 select-none animate-in fade-in zoom-in-95 duration-100"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-2.5 py-1.5 border-b border-slate-800 text-[10px] uppercase tracking-wider text-slate-400 font-bold flex items-center justify-between">
            <span className="flex items-center gap-1.5 text-slate-300">
              <Tv className="w-3 h-3 text-red-500" />
              Workspace Actions
            </span>
            <span className="text-[9px] text-slate-500 font-normal">Context Menu</span>
          </div>

          <div className="py-1 space-y-0.5">
            {/* Refresh Shortcut */}
            <button
              id="context-menu-refresh"
              type="button"
              onClick={() => {
                handleRefreshWorkspace();
                setContextMenu(prev => ({ ...prev, visible: false }));
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-200 hover:text-white hover:bg-slate-800/90 transition-colors cursor-pointer text-left group"
            >
              <span className="flex items-center gap-2">
                <RefreshCw className="w-3.5 h-3.5 text-emerald-400 group-hover:rotate-180 transition-transform duration-500" />
                <span className="font-semibold">Refresh</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Sync state</span>
            </button>

            {/* Clear Workspace Shortcut */}
            <button
              id="context-menu-clear-workspace"
              type="button"
              onClick={() => {
                handleClearWorkspace();
                setContextMenu(prev => ({ ...prev, visible: false }));
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-200 hover:text-red-300 hover:bg-red-500/10 transition-colors cursor-pointer text-left group"
            >
              <span className="flex items-center gap-2">
                <Trash2 className="w-3.5 h-3.5 text-red-400 group-hover:scale-110 transition-transform" />
                <span className="font-semibold">Clear Workspace</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">Clean slate</span>
            </button>

            {/* Download JSON Snapshot Shortcut */}
            <button
              id="context-menu-download-snapshot"
              type="button"
              onClick={() => {
                handleDownloadWorkspaceSnapshot();
                setContextMenu(prev => ({ ...prev, visible: false }));
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-200 hover:text-cyan-300 hover:bg-cyan-500/10 transition-colors cursor-pointer text-left group"
            >
              <span className="flex items-center gap-2">
                <Download className="w-3.5 h-3.5 text-cyan-400 group-hover:translate-y-0.5 transition-transform" />
                <span className="font-semibold">Download JSON Snapshot</span>
              </span>
              <span className="text-[10px] text-cyan-400 font-mono">Export</span>
            </button>
          </div>

          {/* Expand / Collapse shortcut in Context Menu */}
          <div className="pt-1 border-t border-slate-800/80">
            <button
              id="context-menu-toggle-collapse"
              type="button"
              onClick={() => {
                setIsWorkspaceCollapsed(prev => !prev);
                setContextMenu(prev => ({ ...prev, visible: false }));
                triggerToast(isWorkspaceCollapsed ? 'Workspace body expanded' : 'Workspace body collapsed for dense layout');
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer text-left group"
            >
              <span className="flex items-center gap-2">
                {isWorkspaceCollapsed ? (
                  <ChevronDown className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{isWorkspaceCollapsed ? 'Expand Workspace' : 'Collapse Workspace'}</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{isWorkspaceCollapsed ? 'Show body' : 'Hide body'}</span>
            </button>
          </div>

          {/* Lock / Unlock Workspace Height Option in Context Menu */}
          <div className="pt-1 border-t border-slate-800/80">
            <button
              id="context-menu-lock-height-toggle"
              type="button"
              onClick={() => {
                setContextMenu(prev => ({ ...prev, visible: false }));
                setIsWorkspaceHeightLocked(prev => {
                  const next = !prev;
                  triggerToast(
                    next
                      ? 'Workspace height locked. Manual resizing disabled.'
                      : 'Workspace height unlocked. Manual resizing enabled.'
                  );
                  return next;
                });
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer text-left group"
            >
              <span className="flex items-center gap-2">
                {isWorkspaceHeightLocked ? (
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                ) : (
                  <Unlock className="w-3.5 h-3.5 text-slate-400" />
                )}
                <span>{isWorkspaceHeightLocked ? 'Unlock Workspace Height' : 'Lock Workspace Height'}</span>
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isWorkspaceHeightLocked
                  ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  : 'text-slate-500 bg-slate-800/60'
              }`}>
                {isWorkspaceHeightLocked ? 'Locked' : 'Unlocked'}
              </span>
            </button>
          </div>

          {/* Snap to Grid Toggle in Context Menu */}
          <div className="pt-1 border-t border-slate-800/80">
            <button
              id="context-menu-snap-grid-toggle"
              type="button"
              onClick={() => {
                setContextMenu(prev => ({ ...prev, visible: false }));
                setIsSnapToGrid(prev => {
                  const next = !prev;
                  if (next && cardHeight !== null) {
                    setCardHeight(Math.max(minHeightRef.current, Math.min(maxHeightRef.current, Math.round(cardHeight / snapGridInterval) * snapGridInterval)));
                  }
                  triggerToast(
                    next
                      ? `Snap to Grid enabled (${snapGridInterval}px increments)`
                      : 'Snap to Grid disabled (freeform resizing)'
                  );
                  return next;
                });
              }}
              title="Toggle Snap to Grid • Tip: Hold 'Alt' while dragging resize handle to temporarily invert snap mode"
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer text-left group"
            >
              <span className="flex items-center gap-2">
                <LayoutGrid className="w-3.5 h-3.5 text-cyan-400" />
                <span>Snap to Grid ({snapGridInterval}px)</span>
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isSnapToGrid
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-500 bg-slate-800/60'
              }`}>
                {isSnapToGrid ? 'ON' : 'OFF'}
              </span>
            </button>
            <div className="px-2.5 pb-1 text-[9px] text-slate-500 font-mono flex items-center gap-1">
              <kbd className="px-1 py-0.2 bg-slate-800/80 border border-slate-700/60 rounded text-[8px] text-slate-400">Alt</kbd>
              <span>+ drag: invert snap temporarily</span>
            </div>
          </div>

          {/* Aspect Ratio Lock Option in Context Menu */}
          <div className="pt-1 border-t border-slate-800/80">
            <button
              id="context-menu-aspect-ratio-btn"
              type="button"
              onClick={() => {
                setContextMenu(prev => ({ ...prev, visible: false }));
                toggleAspectRatioLock();
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer text-left group"
            >
              <span className="flex items-center gap-2">
                <Proportions className="w-3.5 h-3.5 text-emerald-400" />
                <span>Aspect Ratio Lock ({aspectRatioValue})</span>
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                isAspectRatioLocked
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                  : 'text-slate-500 bg-slate-800/60'
              }`}>
                {isAspectRatioLocked ? 'LOCKED' : 'FREE'}
              </span>
            </button>
          </div>

          {/* Height Constraints Configuration Option in Context Menu */}
          <div className="pt-1 border-t border-slate-800/80">
            <button
              id="context-menu-height-constraints"
              type="button"
              onClick={() => {
                setContextMenu(prev => ({ ...prev, visible: false }));
                setShowWorkspaceSettingsMenu(true);
                triggerToast('Opened Minimum/Maximum Height Constraints configuration panel');
              }}
              className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer text-left group"
            >
              <span className="flex items-center gap-2">
                <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                <span>Height Constraints</span>
              </span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                minHeightConstraint !== DEFAULT_MIN_HEIGHT || maxHeightConstraint !== DEFAULT_MAX_HEIGHT
                  ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                  : 'text-slate-500 bg-slate-800/60'
              }`}>
                {minHeightConstraint}–{maxHeightConstraint}px
              </span>
            </button>
          </div>

          {/* Reset Height Option in Context Menu if customized */}
          {cardHeight !== null && (
            <div className="pt-1 border-t border-slate-800/80">
              <button
                id="context-menu-reset-height"
                type="button"
                onClick={() => {
                  setContextMenu(prev => ({ ...prev, visible: false }));
                  handleResetCardHeight();
                }}
                className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800/80 transition-colors cursor-pointer text-left group"
              >
                <span className="flex items-center gap-2">
                  <RotateCcw className="w-3.5 h-3.5 text-blue-400" />
                  <span>Reset to Default (Auto)</span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">{Math.round(cardHeight)}px</span>
              </button>
            </div>
          )}

          {/* Category Border Color Quick Selector in Context Menu */}
          <div className="pt-1.5 border-t border-slate-800/80 px-2 py-1">
            <div className="text-[10px] text-slate-400 uppercase tracking-wider mb-1.5 flex items-center justify-between font-bold">
              <span className="flex items-center gap-1.5 text-slate-300">
                <Palette className="w-3 h-3 text-red-400" />
                Border Category
              </span>
              <span className="capitalize text-slate-400 font-normal">{workspaceBorderColor}</span>
            </div>
            <div className="grid grid-cols-6 gap-1 pt-0.5">
              {(Object.keys(BORDER_COLOR_THEMES) as WorkspaceBorderColorId[]).map((key) => {
                const theme = BORDER_COLOR_THEMES[key];
                const isSelected = workspaceBorderColor === key;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => {
                      setWorkspaceBorderColor(theme.id);
                      setContextMenu(prev => ({ ...prev, visible: false }));
                      triggerToast(`Workspace border assigned: ${theme.label} (${theme.category})`);
                    }}
                    title={`${theme.label} • ${theme.category}`}
                    className={`h-6 rounded-md flex items-center justify-center transition-all cursor-pointer border ${
                      isSelected
                        ? 'border-white ring-1 ring-white/50 scale-105 shadow-sm'
                        : 'border-white/10 hover:border-white/40 opacity-80 hover:opacity-100 hover:scale-110'
                    } bg-slate-950`}
                  >
                    <span className={`w-2.5 h-2.5 rounded-full ${theme.dotClass}`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Draggable Resize Handle & Lock Workspace Height Control Area */}
      <div
        id="workspace-card-resize-area"
        className="absolute bottom-1.5 right-1.5 z-40 flex items-center gap-1.5 bg-slate-950/95 backdrop-blur-md px-2 py-1 rounded-xl border border-slate-800 shadow-xl transition-all"
      >
        {/* Real-time Resizing HUD badge */}
        {isResizingCard && (
          <div
            id="workspace-resize-hud"
            className="absolute bottom-full mb-2 right-0 z-50 pointer-events-none flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-950/98 border border-cyan-500/50 shadow-2xl backdrop-blur-md text-xs font-mono animate-in fade-in zoom-in-95 duration-75 whitespace-nowrap"
          >
            <div className="flex items-center gap-1.5 text-cyan-300 font-bold">
              {isAspectRatioLocked ? (
                <Proportions className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              ) : isSnapToGrid ? (
                <LayoutGrid className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
              ) : (
                <MoveVertical className="w-3.5 h-3.5 text-slate-400" />
              )}
              <span>
                {isAspectRatioLocked && cardWidth
                  ? `${Math.round(cardWidth)} × ${Math.round(cardHeight || 600)}px`
                  : `${Math.round(cardHeight || 600)}px`}
              </span>
            </div>
            {isAspectRatioLocked && (
              <span className="text-[10px] text-emerald-300 bg-emerald-500/15 border border-emerald-500/40 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Ratio: {aspectRatioValue}
              </span>
            )}
            {isSnapToGrid && !isAspectRatioLocked && (
              <span className="text-[10px] text-cyan-300 bg-cyan-500/15 border border-cyan-500/40 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                Grid: {snapGridInterval}px
              </span>
            )}
            {!isSnapToGrid && !isAspectRatioLocked && (
              <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded">
                Freeform
              </span>
            )}
          </div>
        )}

        {/* Snap to Grid Toggle Button */}
        <button
          id="workspace-snap-grid-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsSnapToGrid(prev => {
              const next = !prev;
              if (next && cardHeight !== null) {
                setCardHeight(Math.max(minHeightRef.current, Math.min(maxHeightRef.current, Math.round(cardHeight / snapGridInterval) * snapGridInterval)));
              }
              triggerToast(
                next
                  ? `Snap to Grid enabled (${snapGridInterval}px increments)`
                  : 'Snap to Grid disabled (freeform resizing)'
              );
              return next;
            });
          }}
          title={
            isSnapToGrid
              ? `Snap to Grid is active (${snapGridInterval}px increments) • Click to disable • Hold 'Alt' while dragging to temporarily toggle snap`
              : "Enable Snap to Grid (aligns card height to increments) • Hold 'Alt' while dragging to temporarily toggle snap"
          }
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer select-none ${
            isSnapToGrid
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-xs hover:bg-cyan-500/30 ring-1 ring-cyan-500/30'
              : 'bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-750'
          }`}
        >
          <LayoutGrid className={`w-3 h-3 shrink-0 ${isSnapToGrid ? 'text-cyan-400' : 'text-slate-400'}`} />
          <span>{isSnapToGrid ? `Snap: ${snapGridInterval}px` : 'Snap: Off'}</span>
        </button>

        {/* Dynamic Snap Interval Selector & Slider when Snap is Active (replaces fixed intervals) */}
        {isSnapToGrid && (
          <div 
            id="workspace-snap-interval-selector"
            className="flex items-center gap-1.5 bg-slate-900/90 rounded-lg px-2 py-0.5 border border-slate-750 text-[9px] font-mono"
          >
            <Sliders className="w-2.5 h-2.5 text-cyan-400 shrink-0" />
            <input
              id="workspace-snap-interval-slider-dock"
              type="range"
              min={10}
              max={200}
              step={5}
              value={snapGridInterval}
              onChange={(e) => handleSnapIntervalChange(Number(e.target.value))}
              onInput={(e) => handleSnapIntervalChange(Number((e.target as HTMLInputElement).value))}
              title={`Adjust snap interval: ${snapGridInterval}px (10px to 200px)`}
              className="w-16 h-1 bg-slate-800 rounded appearance-none cursor-pointer accent-cyan-400"
            />
            <button
              type="button"
              id="workspace-snap-grid-overlay-toggle-btn"
              onClick={(e) => {
                e.stopPropagation();
                setShowGridOverlay(prev => !prev);
              }}
              title={showGridOverlay ? "Hide grid overlay" : "Show grid overlay & interval slider"}
              className={`px-1.5 py-0.5 rounded cursor-pointer font-bold transition-all ${
                showGridOverlay 
                  ? 'bg-cyan-500 text-slate-950 shadow-xs' 
                  : 'text-cyan-300 hover:text-white bg-slate-800/80 hover:bg-slate-800'
              }`}
            >
              {snapGridInterval}px
            </button>
          </div>
        )}

        {/* Lock Workspace Height Button */}
        <button
          id="workspace-lock-height-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsWorkspaceHeightLocked(prev => {
              const next = !prev;
              triggerToast(
                next
                  ? 'Workspace height locked. Manual resizing disabled.'
                  : 'Workspace height unlocked. Manual resizing enabled.'
              );
              return next;
            });
          }}
          title={
            isWorkspaceHeightLocked
              ? 'Workspace height is locked (resizing disabled) • Click to unlock'
              : 'Lock Workspace Height to prevent accidental resizing and layout shifts'
          }
          className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer select-none ${
            isWorkspaceHeightLocked
              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/50 shadow-xs hover:bg-amber-500/30 ring-1 ring-amber-500/30'
              : 'bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-750'
          }`}
        >
          {isWorkspaceHeightLocked ? (
            <Lock className="w-3 h-3 text-amber-400 shrink-0" />
          ) : (
            <Unlock className="w-3 h-3 text-slate-400 shrink-0" />
          )}
          <span>{isWorkspaceHeightLocked ? 'Height Locked' : 'Lock Workspace Height'}</span>
        </button>

        {/* Bounds Settings Quick Trigger in Bottom Dock */}
        <button
          id="workspace-bounds-settings-btn"
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setShowWorkspaceSettingsMenu(prev => !prev);
          }}
          title={`Height Constraints: Min ${minHeightConstraint}px, Max ${maxHeightConstraint}px • Click to configure bounds`}
          className={`flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-mono font-bold transition-all cursor-pointer select-none ${
            showWorkspaceSettingsMenu || minHeightConstraint !== DEFAULT_MIN_HEIGHT || maxHeightConstraint !== DEFAULT_MAX_HEIGHT
              ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/50 shadow-xs'
              : 'bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-750'
          }`}
        >
          <Settings className="w-3 h-3 text-cyan-400 shrink-0" />
          <span className="hidden sm:inline">Bounds:</span>
          <span>{minHeightConstraint}–{maxHeightConstraint}px</span>
        </button>

        {/* Aspect Ratio Lock Button in #workspace-card-resize-handle Area */}
        <div className="relative flex items-center">
          <button
            id="workspace-aspect-ratio-lock-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleAspectRatioLock();
            }}
            title={
              isAspectRatioLocked
                ? `Aspect Ratio is locked to ${aspectRatioValue} (Constrained Width & Height for media player consistency) • Click to unlock • Click arrow to choose preset (16:9, 4:3, 21:9, 1:1, 9:16)`
                : `Lock Workspace to fixed Aspect Ratio (${aspectRatioValue}, e.g. 16:9 widescreen) for media player layout consistency`
            }
            className={`flex items-center gap-1.5 px-2 py-1 rounded-l-lg text-[10px] font-mono font-bold transition-all cursor-pointer select-none ${
              isAspectRatioLocked
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 shadow-xs hover:bg-emerald-500/30 ring-1 ring-emerald-500/30'
                : 'bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-750'
            }`}
          >
            <Proportions className={`w-3 h-3 shrink-0 ${isAspectRatioLocked ? 'text-emerald-400' : 'text-slate-400'}`} />
            <span>{isAspectRatioLocked ? `Ratio: ${aspectRatioValue}` : `${aspectRatioValue} Lock`}</span>
          </button>

          {/* Aspect Ratio Presets Selector Toggle */}
          <button
            id="workspace-aspect-ratio-menu-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setShowAspectRatioMenu(prev => !prev);
            }}
            title="Choose aspect ratio preset (16:9 Broadcast, 4:3 Classic, 21:9 Ultrawide, 1:1 Square, 9:16 Vertical)"
            className={`h-full px-1.5 py-1 rounded-r-lg border-y border-r text-[9px] font-mono transition-colors cursor-pointer select-none flex items-center ${
              isAspectRatioLocked
                ? 'bg-emerald-500/30 text-emerald-200 border-emerald-500/50 hover:bg-emerald-500/40'
                : 'bg-slate-850 text-slate-400 border-slate-750 hover:text-white hover:bg-slate-800'
            }`}
          >
            <ChevronUp className={`w-2.5 h-2.5 transition-transform ${showAspectRatioMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Aspect Ratio Presets Menu Popover */}
          {showAspectRatioMenu && (
            <div 
              id="workspace-aspect-ratio-menu"
              onClick={(e) => e.stopPropagation()}
              className="absolute bottom-full mb-2 right-0 z-50 w-64 bg-slate-950/98 border border-slate-800 rounded-xl shadow-2xl p-2.5 space-y-1.5 backdrop-blur-xl animate-in fade-in zoom-in-95"
            >
              <div className="flex items-center justify-between border-b border-slate-850 pb-1.5 px-1">
                <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Proportions className="w-3.5 h-3.5 text-emerald-400" />
                  Media Aspect Ratios
                </span>
                <span className="text-[9px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  {isAspectRatioLocked ? 'Active' : 'Unlocked'}
                </span>
              </div>

              <div className="space-y-1 pt-0.5">
                {ASPECT_RATIO_PRESETS.map((preset) => {
                  const isSelected = aspectRatioValue === preset.id;
                  return (
                    <button
                      key={preset.id}
                      type="button"
                      onClick={() => {
                        toggleAspectRatioLock(preset.id);
                        setShowAspectRatioMenu(false);
                      }}
                      className={`w-full flex items-center justify-between px-2 py-1.5 rounded-lg text-left text-xs transition-colors cursor-pointer ${
                        isSelected && isAspectRatioLocked
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold'
                          : isSelected
                          ? 'bg-slate-800 text-white font-semibold'
                          : 'text-slate-400 hover:text-white hover:bg-slate-900'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{preset.icon}</span>
                        <div>
                          <div className="font-mono text-xs">{preset.label}</div>
                          <div className="text-[9px] text-slate-500 font-sans line-clamp-1">{preset.desc}</div>
                        </div>
                      </div>
                      {isSelected && isAspectRatioLocked && (
                        <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              <div className="pt-1.5 border-t border-slate-850 flex justify-between items-center text-[9px] font-mono text-slate-400 px-1">
                <span>Media consistency</span>
                <button
                  type="button"
                  onClick={() => {
                    setIsAspectRatioLocked(false);
                    isAspectRatioLockedRef.current = false;
                    setCardWidth(null);
                    setShowAspectRatioMenu(false);
                    triggerToast('Aspect Ratio Lock disabled.');
                  }}
                  className="text-red-400 hover:text-red-300 cursor-pointer"
                >
                  Clear Lock
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Draggable Resize Handle in Bottom-Right Corner of #workspace-card */}
        <div
          id="workspace-card-resize-handle"
          data-alt-snap={isAltSnapToggled ? 'true' : 'false'}
          data-aspect-ratio-locked={isAspectRatioLocked ? 'true' : 'false'}
          onMouseDown={isWorkspaceHeightLocked ? undefined : handleResizeMouseDown}
          onDoubleClick={isWorkspaceHeightLocked ? () => triggerToast('Workspace height is locked. Unlock to reset or resize.') : handleResetCardHeight}
          title={
            isWorkspaceHeightLocked
              ? 'Workspace height is locked. Resizing is disabled to prevent accidental layout shifts.'
              : isAspectRatioLocked
              ? `Drag to resize card with locked ${aspectRatioValue} aspect ratio (${Math.round(cardWidth || 960)} × ${Math.round(cardHeight || 540)}px • Bounds: ${minHeightConstraint}px - ${maxHeightConstraint}px) • Double-click to reset`
              : cardHeight
              ? `Drag to resize card height (Current: ${Math.round(cardHeight)}px${isEffectiveSnapActive ? ` • Snapped to ${activeGridInterval}px grid` : ' • Free-form'} • Bounds: ${minHeightConstraint}px - ${maxHeightConstraint}px) • Hold 'Alt' + drag to temporarily toggle snap mode • Double-click to reset to default auto-fit`
              : `Drag to dynamically resize workspace height${isEffectiveSnapActive ? ` (${activeGridInterval}px grid)` : ' (free-form)'} • Hold 'Alt' + drag to toggle snap (Bounds: ${minHeightConstraint}px - ${maxHeightConstraint}px) • Double-click to reset`
          }
          className={`group/resize w-6 h-6 flex items-center justify-center select-none rounded-md transition-all ${
            isWorkspaceHeightLocked
              ? 'cursor-not-allowed opacity-35 text-slate-600 bg-slate-900/30'
              : isResizingCard
              ? isAspectRatioLocked
                ? 'cursor-se-resize bg-emerald-500 text-slate-950 ring-2 ring-emerald-400 shadow-lg scale-110'
                : isAltSnapToggled
                ? 'cursor-se-resize bg-amber-500 text-slate-950 ring-2 ring-amber-400 shadow-lg scale-110'
                : 'cursor-se-resize bg-red-500 text-white ring-2 ring-red-400 shadow-lg scale-110'
              : isAspectRatioLocked
              ? 'cursor-se-resize bg-slate-900/90 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 border border-emerald-500/50 shadow-md hover:scale-105'
              : 'cursor-se-resize bg-slate-900/90 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-700/80 shadow-md hover:scale-105'
          }`}
        >
          {/* Corner Diagonal Grip Icon with subtle resize-icon-pulse animation on hover (only active when unlocked) */}
          <svg
            className={`w-3.5 h-3.5 fill-current transition-opacity pointer-events-none ${
              isWorkspaceHeightLocked
                ? 'opacity-20'
                : 'opacity-70 group-hover/resize:opacity-100 group-hover/resize:animate-[resize-icon-pulse_1.2s_ease-in-out_infinite]'
            }`}
            viewBox="0 0 16 16"
          >
            <path d="M14 14v-2h-2v2h2zm0-4v-2h-2v2h2zm-4 4v-2H8v2h2zm4-8V4h-2v2h2zm-4 4V8H8v2h2zm-4 4v-2H4v2h2z" />
          </svg>
        </div>
      </div>

    </motion.div>

  </main>

      {/* Instant New Script Overlay Modal */}
      <AnimatePresence>
        {showNewScriptModal && (
          <motion.div
            key="instant-new-script-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowNewScriptModal(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", duration: 0.28, bounce: 0.12 }}
              className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-sm font-sans font-black tracking-widest uppercase text-white flex items-center gap-2">
                  <FileText className="w-4 h-4 text-red-500 animate-pulse" /> Instant GNN News Script
                </h3>
                <button 
                  onClick={() => setShowNewScriptModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Script Title / Headline</label>
                  <input 
                    type="text"
                    placeholder="e.g. Fusion Reactor Breakthrough stable trail"
                    value={quickScriptTitle}
                    onChange={(e) => setQuickScriptTitle(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Body Text Content (Bengali / English)</label>
                  <textarea 
                    rows={4}
                    placeholder="এআই নিউজ স্টুডিওর মেইন বডি টেক্সট এখানে প্রদান করুন..."
                    value={quickScriptBody}
                    onChange={(e) => setQuickScriptBody(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-red-500 font-mono resize-none"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Language</label>
                  <select 
                    value={quickScriptLang}
                    onChange={(e) => setQuickScriptLang(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-300 outline-none cursor-pointer"
                  >
                    <option value="Bangla">Bangla (বাংলা)</option>
                    <option value="English">English</option>
                    <option value="Hindi">Hindi</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button 
                  onClick={() => setShowNewScriptModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateQuickScript}
                  className="flex-1 bg-red-650 hover:bg-red-700 text-white py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Inject Script
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Instant New Asset Overlay Modal */}
      <AnimatePresence>
        {showNewAssetModal && (
          <motion.div
            key="instant-new-asset-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowNewAssetModal(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", duration: 0.28, bounce: 0.12 }}
              className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-sm font-sans font-black tracking-widest uppercase text-white flex items-center gap-2">
                  <PlusCircle className="w-4 h-4 text-red-500 animate-pulse" /> Add Instant Media Asset
                </h3>
                <button 
                  onClick={() => setShowNewAssetModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Asset Name</label>
                  <input 
                    type="text"
                    placeholder="e.g. Bangladesh Anchor Chroma backdrop"
                    value={quickAssetName}
                    onChange={(e) => setQuickAssetName(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2.5 text-xs text-slate-200 outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-500 uppercase mb-1">Asset Category</label>
                  <select 
                    value={quickAssetType}
                    onChange={(e: any) => setQuickAssetType(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-850 rounded-lg p-2 text-xs text-slate-300 outline-none cursor-pointer"
                  >
                    <option value="video">🎥 News Studio Video clip</option>
                    <option value="image">🖼️ Backdrop High-Res image</option>
                    <option value="audio">🎵 Vocal voice-over track</option>
                    <option value="subtitles">📝 SRT Subtitles lyrics</option>
                  </select>
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button 
                  onClick={() => setShowNewAssetModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleCreateQuickAsset}
                  className="flex-1 bg-red-650 hover:bg-red-700 text-white py-2 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Add to Repository
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Expo Mobile Companion Overlay Modal */}
      <AnimatePresence>
        {showExpoModal && (
          <motion.div
            key="expo-mobile-companion-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) setShowExpoModal(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 overflow-y-auto"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 16 }}
              transition={{ type: 'spring', duration: 0.28, bounce: 0.1 }}
              className="w-full max-w-4xl bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-2xl space-y-4 max-h-[92vh] overflow-y-auto"
            >
              <ExpoMobileCompanion
                scripts={scripts}
                onAddAsset={handleAddAsset}
                triggerToast={triggerToast}
                onNavigateTab={(tab) => {
                  setShowExpoModal(false);
                  setActiveTab(tab);
                }}
                initialUrl="exp://exp.host/@aigaming/gnn-ai-studio"
                isModalView={true}
                onCloseModal={() => setShowExpoModal(false)}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Styled success toast notification */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            key="toast-notification"
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 15, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 left-6 z-50 bg-slate-950 border border-emerald-500/40 px-4 py-3 rounded-xl shadow-2xl flex items-center gap-2.5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span className="text-xs font-mono text-slate-200">{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
