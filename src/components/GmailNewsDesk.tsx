import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Mail, 
  Send, 
  Inbox, 
  Star, 
  Trash2, 
  Archive, 
  Search, 
  RefreshCw, 
  FileText, 
  Sparkles, 
  AlertCircle, 
  CheckCircle2, 
  User as UserIcon, 
  LogOut, 
  Plus, 
  X, 
  ExternalLink, 
  ShieldAlert, 
  Tag, 
  ChevronRight, 
  Clock, 
  Paperclip,
  Check,
  Radio,
  FilePlus,
  MessageSquare,
  Image as ImageIcon,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  ChevronLeft,
  Download,
  Copy,
  Filter,
  Eye,
  CheckCheck,
  Layers,
  FolderPlus
} from 'lucide-react';
import { User } from 'firebase/auth';
import { 
  GmailMessageDetail, 
  EmailAttachment,
  fetchGmailMessagesList, 
  fetchGmailMessageDetail, 
  sendGmailMessage, 
  trashGmailMessage, 
  modifyGmailMessage, 
  signInWithGoogleWorkspace, 
  signOutGoogleWorkspace, 
  getGmailAccessToken, 
  initGmailAuth, 
  SAMPLE_GMAIL_MESSAGES,
  SendEmailPayload
} from '../utils/gmailService';
import { GeneratedScript, UserRolePayload } from '../types';

interface GmailNewsDeskProps {
  userRole: UserRolePayload;
  onAddScript?: (script: GeneratedScript) => void;
  onAddAsset?: (asset: any) => void;
  triggerToast: (msg: string) => void;
  onNavigateToNews?: (draftData?: Partial<GeneratedScript>) => void;
}

export default function GmailNewsDesk({
  userRole,
  onAddScript,
  onAddAsset,
  triggerToast,
  onNavigateToNews
}: GmailNewsDeskProps) {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Email listing states
  const [messages, setMessages] = useState<GmailMessageDetail[]>(SAMPLE_GMAIL_MESSAGES);
  const [selectedMessage, setSelectedMessage] = useState<GmailMessageDetail | null>(SAMPLE_GMAIL_MESSAGES[0]);
  const [activeFolder, setActiveFolder] = useState<'INBOX' | 'IMPORTANT' | 'STARRED' | 'SENT' | 'TRASH'>('INBOX');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [isLiveConnected, setIsLiveConnected] = useState(false);

  // Compose modal state
  const [showComposeModal, setShowComposeModal] = useState(false);
  const [composeTo, setComposeTo] = useState('');
  const [composeSubject, setComposeSubject] = useState('');
  const [composeBody, setComposeBody] = useState('');
  const [composeCc, setComposeCc] = useState('');
  const [isSending, setIsSending] = useState(false);

  // Confirmation dialogs (Mandatory for mutating/destructive operations per skill rules)
  const [confirmSendModal, setConfirmSendModal] = useState(false);
  const [confirmDeleteModal, setConfirmDeleteModal] = useState<string | null>(null); // messageId
  const [isDeleting, setIsDeleting] = useState(false);

  // Attachment Gallery States
  const [attachmentCategory, setAttachmentCategory] = useState<'ALL' | 'IMAGE' | 'DOCUMENT'>('ALL');
  const [attachmentScope, setAttachmentScope] = useState<'SELECTED' | 'ALL'>('SELECTED');
  const [addedAssetIds, setAddedAssetIds] = useState<Set<string>>(new Set());
  const [readerViewTab, setReaderViewTab] = useState<'CONTENT' | 'GALLERY'>('CONTENT');

  // Lightbox Preview Modal States
  const [previewImage, setPreviewImage] = useState<EmailAttachment | null>(null);
  const [previewZoom, setPreviewZoom] = useState<number>(1);
  const [isCopiedUrl, setIsCopiedUrl] = useState(false);

  // Initialize auth listener on mount
  useEffect(() => {
    const unsubscribe = initGmailAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        setIsLiveConnected(true);
        loadLiveGmailMessages(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setIsLiveConnected(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch real emails from Gmail API
  const loadLiveGmailMessages = async (tokenToUse: string, folder = activeFolder, query = searchQuery) => {
    setLoadingMessages(true);
    try {
      let q = query || '';
      if (folder === 'STARRED') q = (q ? q + ' ' : '') + 'is:starred';
      else if (folder === 'IMPORTANT') q = (q ? q + ' ' : '') + 'is:important';
      else if (folder === 'SENT') q = (q ? q + ' ' : '') + 'in:sent';
      else if (folder === 'TRASH') q = (q ? q + ' ' : '') + 'in:trash';
      else q = (q ? q + ' ' : '') + 'in:inbox';

      const listResult = await fetchGmailMessagesList(tokenToUse, { query: q, maxResults: 15 });
      if (listResult.messages.length === 0) {
        setMessages([]);
        setSelectedMessage(null);
        return;
      }

      // Fetch details in parallel with limit
      const detailPromises = listResult.messages.slice(0, 15).map(m => 
        fetchGmailMessageDetail(tokenToUse, m.id).catch(() => null)
      );
      const detailed = (await Promise.all(detailPromises)).filter(Boolean) as GmailMessageDetail[];
      setMessages(detailed);
      if (detailed.length > 0) {
        setSelectedMessage(detailed[0]);
      } else {
        setSelectedMessage(null);
      }
      triggerToast(`Synced ${detailed.length} emails from Gmail`);
    } catch (err: any) {
      console.warn('Gmail fetch notice:', err.message);
      triggerToast(`Notice: ${err.message || 'Could not fetch live emails. Using studio cache.'}`);
    } finally {
      setLoadingMessages(false);
    }
  };

  // Sign in with Google Workspace
  const handleSignIn = async () => {
    setIsAuthenticating(true);
    try {
      const { user, accessToken: token } = await signInWithGoogleWorkspace();
      setCurrentUser(user);
      setAccessToken(token);
      setIsLiveConnected(true);
      triggerToast(`Signed in to Gmail as ${user.email}`);
      await loadLiveGmailMessages(token);
    } catch (err: any) {
      console.error('Sign-in failed:', err);
      triggerToast(`Authentication cancelled or failed: ${err.message}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Sign out
  const handleSignOut = async () => {
    try {
      await signOutGoogleWorkspace();
      setCurrentUser(null);
      setAccessToken(null);
      setIsLiveConnected(false);
      setMessages(SAMPLE_GMAIL_MESSAGES);
      setSelectedMessage(SAMPLE_GMAIL_MESSAGES[0]);
      triggerToast('Signed out from Google Workspace.');
    } catch (err: any) {
      triggerToast(`Sign out notice: ${err.message}`);
    }
  };

  // Filter messages based on search & folder
  const filteredMessages = useMemo(() => {
    return messages.filter(msg => {
      // Folder filtering for offline sample data
      if (!isLiveConnected) {
        if (activeFolder === 'STARRED' && !msg.isStarred) return false;
        if (activeFolder === 'IMPORTANT' && !msg.labelIds.includes('IMPORTANT')) return false;
      }
      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase();
      return (
        msg.subject.toLowerCase().includes(q) ||
        msg.from.toLowerCase().includes(q) ||
        msg.snippet.toLowerCase().includes(q)
      );
    });
  }, [messages, activeFolder, searchQuery, isLiveConnected]);

  // Star/Unstar an email
  const handleToggleStar = async (msg: GmailMessageDetail, e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStarred = !msg.isStarred;
    setMessages(prev => prev.map(m => m.id === msg.id ? { ...m, isStarred: nextStarred } : m));
    if (selectedMessage?.id === msg.id) {
      setSelectedMessage(prev => prev ? { ...prev, isStarred: nextStarred } : null);
    }

    if (accessToken && isLiveConnected) {
      try {
        await modifyGmailMessage(accessToken, msg.id, {
          addLabelIds: nextStarred ? ['STARRED'] : [],
          removeLabelIds: nextStarred ? [] : ['STARRED']
        });
      } catch (err) {
        console.warn('Failed to update star on server:', err);
      }
    }
    triggerToast(nextStarred ? 'Email starred' : 'Removed from starred');
  };

  // Execute email send (called ONLY after explicit user confirmation!)
  const handleConfirmSend = async () => {
    if (!composeTo.trim() || !composeSubject.trim()) {
      triggerToast('Please provide recipient and subject.');
      return;
    }
    setIsSending(true);
    setConfirmSendModal(false);

    try {
      if (accessToken && isLiveConnected) {
        await sendGmailMessage(accessToken, {
          to: composeTo,
          subject: composeSubject,
          body: composeBody,
          cc: composeCc || undefined
        });
        triggerToast(`Email dispatched to ${composeTo} via Gmail!`);
      } else {
        // Studio offline simulation
        const mockNew: GmailMessageDetail = {
          id: `sent-${Date.now()}`,
          threadId: `thread-${Date.now()}`,
          subject: composeSubject,
          from: currentUser?.email ? `${currentUser.displayName || 'GNN Studio'} <${currentUser.email}>` : 'GNN Studio Anchor <newsdesk@gnn-news.tv>',
          to: composeTo,
          date: 'Just now',
          internalDate: Date.now().toString(),
          snippet: composeBody.substring(0, 80) + '...',
          bodyText: composeBody,
          labelIds: ['SENT'],
          isRead: true,
          isStarred: false
        };
        setMessages(prev => [mockNew, ...prev]);
        setSelectedMessage(mockNew);
        triggerToast(`Dispatch sent to ${composeTo} (Local Studio Archive)`);
      }

      // Reset compose state
      setShowComposeModal(false);
      setComposeTo('');
      setComposeSubject('');
      setComposeBody('');
      setComposeCc('');
    } catch (err: any) {
      triggerToast(`Failed to send email: ${err.message}`);
    } finally {
      setIsSending(false);
    }
  };

  // Execute delete/trash message (called ONLY after user confirmation dialog!)
  const handleConfirmDelete = async () => {
    if (!confirmDeleteModal) return;
    setIsDeleting(true);
    const msgId = confirmDeleteModal;

    try {
      if (accessToken && isLiveConnected) {
        await trashGmailMessage(accessToken, msgId);
      }
      setMessages(prev => prev.filter(m => m.id !== msgId));
      if (selectedMessage?.id === msgId) {
        setSelectedMessage(messages.find(m => m.id !== msgId) || null);
      }
      triggerToast('Email moved to Trash.');
    } catch (err: any) {
      triggerToast(`Error trashing email: ${err.message}`);
    } finally {
      setIsDeleting(false);
      setConfirmDeleteModal(null);
    }
  };

  // Convert email press release into a News Script
  const handleConvertToScript = (msg: GmailMessageDetail) => {
    const headline = msg.subject.replace(/^(re:|fwd:|breaking:|press:)\s*/i, '').trim();
    const newScript: GeneratedScript = {
      id: `script-${Date.now()}`,
      title: `Broadcast Wire: ${headline.substring(0, 35)}...`,
      headline: headline,
      hook: `Breaking coverage from GNN newsroom. We have received an official transmission from ${msg.from.split('<')[0].trim()}.`,
      body: msg.bodyText.substring(0, 600),
      outro: 'Stay tuned to GNN Studio for continuing developments on this wire report.',
      voiceoverText: `Breaking coverage from GNN newsroom. ${headline}. ${msg.snippet} Stay tuned to GNN Studio for continuing developments.`,
      language: 'English',
      status: 'draft',
      createdAt: new Date().toLocaleDateString(),
      author: userRole.osRole ? `GNN ${userRole.osRole}` : 'News Desk Wire',
    };

    if (onAddScript) {
      onAddScript(newScript);
    }
    triggerToast(`Created draft broadcast script: "${headline.substring(0, 30)}..."`);
    if (onNavigateToNews) {
      onNavigateToNews(newScript);
    }
  };

  // Gather attachments based on scope (SELECTED vs ALL)
  const currentAttachments = useMemo(() => {
    if (attachmentScope === 'SELECTED') {
      return selectedMessage?.attachments || [];
    }
    const allAtts: EmailAttachment[] = [];
    messages.forEach(msg => {
      if (msg.attachments && msg.attachments.length > 0) {
        allAtts.push(...msg.attachments);
      }
    });
    return allAtts;
  }, [selectedMessage, messages, attachmentScope]);

  // Filter attachments by selected category (All, Images, Documents)
  const filteredAttachments = useMemo(() => {
    if (attachmentCategory === 'IMAGE') {
      return currentAttachments.filter(a => a.type === 'image');
    }
    if (attachmentCategory === 'DOCUMENT') {
      return currentAttachments.filter(a => a.type === 'document');
    }
    return currentAttachments;
  }, [currentAttachments, attachmentCategory]);

  const imageCount = useMemo(() => currentAttachments.filter(a => a.type === 'image').length, [currentAttachments]);
  const docCount = useMemo(() => currentAttachments.filter(a => a.type === 'document').length, [currentAttachments]);

  // Images available for Lightbox navigation
  const availableImages = useMemo(() => {
    return currentAttachments.filter(a => a.type === 'image');
  }, [currentAttachments]);

  const currentPreviewIndex = useMemo(() => {
    if (!previewImage) return -1;
    return availableImages.findIndex(img => img.id === previewImage.id);
  }, [availableImages, previewImage]);

  const handleNextImage = () => {
    if (availableImages.length === 0) return;
    const nextIdx = (currentPreviewIndex + 1) % availableImages.length;
    setPreviewImage(availableImages[nextIdx]);
    setPreviewZoom(1);
  };

  const handlePrevImage = () => {
    if (availableImages.length === 0) return;
    const prevIdx = (currentPreviewIndex - 1 + availableImages.length) % availableImages.length;
    setPreviewImage(availableImages[prevIdx]);
    setPreviewZoom(1);
  };

  // Keyboard navigation for Lightbox Preview Modal
  useEffect(() => {
    if (!previewImage) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setPreviewImage(null);
        setPreviewZoom(1);
      } else if (e.key === 'ArrowRight') {
        handleNextImage();
      } else if (e.key === 'ArrowLeft') {
        handlePrevImage();
      } else if (e.key === '+' || e.key === '=') {
        setPreviewZoom(z => Math.min(z + 0.25, 3));
      } else if (e.key === '-') {
        setPreviewZoom(z => Math.max(z - 0.25, 0.5));
      } else if (e.key === '0') {
        setPreviewZoom(1);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [previewImage, availableImages, currentPreviewIndex]);

  // Add attachment to Media Repository
  const handleAddAttachmentToRepository = (att: EmailAttachment) => {
    if (addedAssetIds.has(att.id)) {
      triggerToast(`"${att.filename}" is already in Media Repository.`);
      return;
    }

    const newAsset = {
      id: `asset-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: att.filename,
      type: att.type === 'image' ? 'image' : 'script',
      url: att.url,
      dataUrl: att.url.startsWith('data:') ? att.url : undefined,
      size: att.size,
      resolution: att.dimensions || (att.type === 'image' ? '1920 × 1080' : undefined),
      createdAt: new Date().toISOString(),
      status: 'Ready' as const,
      category: att.type === 'image' ? 'Wire Press Photo' : 'Wire Wire Documents',
      lyrics_or_text: att.description || `Extracted from email: ${selectedMessage?.subject || 'Wire Dispatch'}`
    };

    if (onAddAsset) {
      onAddAsset(newAsset);
    }
    setAddedAssetIds(prev => new Set(prev).add(att.id));
    triggerToast(`Added "${att.filename}" to Media Repository`);
  };

  const handleCopyImageUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setIsCopiedUrl(true);
    triggerToast('Copied full-size image URL to clipboard');
    setTimeout(() => setIsCopiedUrl(false), 2000);
  };

  return (
    <div className="space-y-6 text-slate-200">
      
      {/* Top Header & Google Workspace Authorization Bar */}
      <div className="bg-slate-950 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400">
              <Mail className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <span>Gmail News Desk & Wire Communications</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-red-500/15 text-red-300 border border-red-500/30 font-bold">
                  WORKSPACE
                </span>
              </h2>
              <p className="text-xs text-slate-400">
                Live editorial press inbox, field reporter transmissions, and official broadcast dispatches.
              </p>
            </div>
          </div>
        </div>

        {/* Auth / Account State & Action Controls */}
        <div className="flex items-center gap-2.5 flex-wrap">
          {currentUser ? (
            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-xl">
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName || 'User'} 
                  className="w-7 h-7 rounded-full border border-slate-700 object-cover" 
                />
              ) : (
                <div className="w-7 h-7 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center font-bold text-xs">
                  {currentUser.email?.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="text-left hidden sm:block">
                <div className="text-xs font-bold text-white leading-tight truncate max-w-[150px]">
                  {currentUser.displayName || 'Authorized Anchor'}
                </div>
                <div className="text-[10px] font-mono text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>{currentUser.email}</span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleSignOut}
                title="Disconnect Google Workspace session"
                className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            /* Official Google Sign-In Button (formatted per Material design guidelines in SKILL.md) */
            <button
              type="button"
              onClick={handleSignIn}
              disabled={isAuthenticating}
              title="Connect real Gmail account to read and send studio emails"
              className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-800 font-semibold text-xs shadow-md transition-all cursor-pointer disabled:opacity-50 group hover:shadow-lg hover:shadow-white/10"
            >
              <svg className="w-4 h-4" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
              </svg>
              <span>{isAuthenticating ? 'Connecting to Google...' : 'Sign in with Google'}</span>
            </button>
          )}

          {/* Sync / Refresh Button */}
          {accessToken && (
            <button
              type="button"
              onClick={() => loadLiveGmailMessages(accessToken)}
              disabled={loadingMessages}
              className="p-2 rounded-xl bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Refresh Gmail Feed"
            >
              <RefreshCw className={`w-4 h-4 ${loadingMessages ? 'animate-spin text-red-400' : ''}`} />
            </button>
          )}

          {/* Compose Dispatch Button */}
          <button
            type="button"
            onClick={() => setShowComposeModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-red-650 hover:bg-red-700 text-white font-bold text-xs shadow-md shadow-red-950/40 transition-all cursor-pointer hover:scale-[1.02]"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Compose Dispatch</span>
          </button>
        </div>
      </div>

      {/* Main Mail Grid: Sidebar Folders + Message List + Message Detail Reader */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 min-h-[640px]">
        
        {/* Left Col: Folders & Search (Col span 3) */}
        <div className="lg:col-span-3 space-y-4">
          
          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && accessToken && isLiveConnected) {
                  loadLiveGmailMessages(accessToken);
                }
              }}
              placeholder="Search wire emails..."
              className="w-full bg-slate-950 border border-slate-850 rounded-xl pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 font-sans"
            />
          </div>

          {/* Folder tabs */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-2.5 space-y-1">
            {[
              { id: 'INBOX', label: 'Inbox / Wire News', icon: Inbox, count: messages.filter(m => !m.isRead).length },
              { id: 'IMPORTANT', label: 'High Priority / Urgent', icon: AlertCircle },
              { id: 'STARRED', label: 'Starred Archive', icon: Star, count: messages.filter(m => m.isStarred).length },
              { id: 'SENT', label: 'Sent Dispatches', icon: Send },
              { id: 'TRASH', label: 'Trash Bin', icon: Trash2 },
            ].map(f => {
              const Icon = f.icon;
              const isActive = activeFolder === f.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  onClick={() => {
                    setActiveFolder(f.id as any);
                    if (accessToken && isLiveConnected) {
                      loadLiveGmailMessages(accessToken, f.id as any);
                    }
                  }}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-sans transition-all cursor-pointer ${
                    isActive 
                      ? 'bg-red-500/15 border border-red-500/30 text-white font-bold' 
                      : 'text-slate-400 hover:text-white hover:bg-slate-900 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-red-400' : 'text-slate-500'}`} />
                    <span>{f.label}</span>
                  </div>
                  {f.count !== undefined && f.count > 0 && (
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded-full bg-red-500/20 text-red-300 font-bold">
                      {f.count}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Quick status box */}
          <div className="bg-slate-950/60 border border-slate-900 rounded-2xl p-4 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-400 font-mono text-[10px]">
              <span>GMAIL STATUS</span>
              <span className={`flex items-center gap-1 font-bold ${isLiveConnected ? 'text-emerald-400' : 'text-amber-400'}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${isLiveConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                {isLiveConnected ? 'OAUTH ACTIVE' : 'PREVIEW MODE'}
              </span>
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
              {isLiveConnected 
                ? 'Connected directly to Google Gmail API via OAuth bearer credentials. Actions update your real mailbox.' 
                : 'Showing studio wire demonstration messages. Sign in with Google to access and search your real Gmail inbox.'}
            </p>
          </div>
        </div>

        {/* Center Col: Email Message List (Col span 4) */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-2xl p-3 flex flex-col space-y-2 overflow-hidden max-h-[720px]">
          <div className="flex items-center justify-between px-2 py-1 text-slate-400 text-[10px] font-mono border-b border-slate-850">
            <span>SHOWING {filteredMessages.length} MESSAGES</span>
            <span>{activeFolder}</span>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {loadingMessages ? (
              <div className="text-center py-12 space-y-3">
                <RefreshCw className="w-6 h-6 mx-auto animate-spin text-red-400" />
                <p className="text-xs text-slate-400 font-mono">Syncing messages from Gmail...</p>
              </div>
            ) : filteredMessages.length === 0 ? (
              <div className="text-center py-16 text-slate-500 space-y-2">
                <Inbox className="w-8 h-8 mx-auto text-slate-600" />
                <p className="text-xs font-mono">No emails found in this view.</p>
              </div>
            ) : (
              filteredMessages.map((msg) => {
                const isSelected = selectedMessage?.id === msg.id;
                return (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className={`p-3 rounded-xl border text-left transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-slate-900 border-red-500/50 shadow-md'
                        : msg.isRead
                        ? 'bg-slate-950/50 border-slate-900 hover:border-slate-850'
                        : 'bg-slate-900/40 border-red-500/20 hover:border-red-500/40 font-semibold'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1 mb-1">
                      <span className="text-xs text-slate-300 font-sans truncate max-w-[180px]">
                        {msg.from.split('<')[0].trim()}
                      </span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => handleToggleStar(msg, e)}
                          className="text-slate-500 hover:text-amber-400 transition-colors p-0.5"
                          title={msg.isStarred ? 'Unstar' : 'Star'}
                        >
                          <Star className={`w-3.5 h-3.5 ${msg.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                        <span className="text-[10px] font-mono text-slate-500">
                          {msg.date.includes(',') ? msg.date.split(',')[1]?.trim() : msg.date}
                        </span>
                      </div>
                    </div>

                    <h4 className="text-xs font-bold text-white line-clamp-1 mb-1">
                      {msg.subject}
                    </h4>

                    <p className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">
                      {msg.snippet}
                    </p>

                    <div className="flex items-center justify-between pt-2 mt-1 border-t border-slate-900/80">
                      <div className="flex items-center gap-1.5">
                        {msg.hasAttachments && (
                          <Paperclip className="w-3 h-3 text-slate-500" />
                        )}
                        {msg.labelIds.includes('IMPORTANT') && (
                          <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-amber-500/15 text-amber-300">
                            Urgent
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleConvertToScript(msg);
                        }}
                        className="opacity-0 group-hover:opacity-100 transition-opacity text-[10px] font-mono font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                        title="Create draft news script from this email"
                      >
                        <FilePlus className="w-3 h-3" />
                        <span>Script</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Selected Email Reader & Wire Actions (Col span 5) */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-900 rounded-2xl p-5 flex flex-col justify-between overflow-hidden max-h-[720px]">
          {selectedMessage ? (
            <div className="space-y-4 flex-1 overflow-y-auto pr-1">
              {/* Message Header */}
              <div className="space-y-2 border-b border-slate-850 pb-4">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-base font-bold text-white font-sans leading-snug">
                    {selectedMessage.subject}
                  </h3>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={(e) => handleToggleStar(selectedMessage, e)}
                      className="p-1.5 text-slate-400 hover:text-amber-400 rounded-lg hover:bg-slate-900 transition-colors"
                      title={selectedMessage.isStarred ? 'Unstar' : 'Star'}
                    >
                      <Star className={`w-4 h-4 ${selectedMessage.isStarred ? 'fill-amber-400 text-amber-400' : ''}`} />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteModal(selectedMessage.id)}
                      className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-900 transition-colors"
                      title="Move email to trash (requires confirmation)"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                  <div className="space-y-0.5">
                    <div>
                      From: <strong className="text-white">{selectedMessage.from}</strong>
                    </div>
                    {selectedMessage.to && (
                      <div className="text-[11px] text-slate-500">
                        To: {selectedMessage.to}
                      </div>
                    )}
                  </div>
                  <div className="text-[11px] font-mono text-slate-500">
                    {selectedMessage.date}
                  </div>
                </div>

                {/* Reader View Switcher Tabs */}
                <div className="flex items-center gap-2 pt-2 border-t border-slate-900">
                  <button
                    type="button"
                    onClick={() => setReaderViewTab('CONTENT')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      readerViewTab === 'CONTENT'
                        ? 'bg-red-500/15 text-red-300 border border-red-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span>Wire Dispatch</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReaderViewTab('GALLERY')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                      readerViewTab === 'GALLERY'
                        ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30'
                        : 'text-slate-400 hover:text-white hover:bg-slate-900'
                    }`}
                  >
                    <Paperclip className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Attachment Gallery</span>
                    <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-slate-800 text-slate-300 font-mono">
                      {currentAttachments.length}
                    </span>
                  </button>
                </div>
              </div>

              {readerViewTab === 'CONTENT' ? (
                <>
                  {/* Message Body Content */}
                  <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-850 text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-wrap selection:bg-red-500/30">
                    {selectedMessage.bodyText}
                  </div>

                  {/* Inline Attachment Gallery Preview Strip if attachments exist */}
                  {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                    <div id="attachment-gallery" className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs font-mono font-bold text-white">
                          <Paperclip className="w-4 h-4 text-cyan-400" />
                          <span>Attachment Gallery ({selectedMessage.attachments.length})</span>
                        </div>
                        <button
                          type="button"
                          onClick={() => setReaderViewTab('GALLERY')}
                          className="text-[11px] font-mono text-cyan-400 hover:text-cyan-300 flex items-center gap-1 cursor-pointer"
                        >
                          <span>Full Gallery & Filters</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      {/* Category Filter Pills */}
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono text-slate-500 uppercase mr-1">Filter:</span>
                        {(['ALL', 'IMAGE', 'DOCUMENT'] as const).map(cat => {
                          const count = cat === 'ALL' 
                            ? selectedMessage.attachments?.length || 0 
                            : selectedMessage.attachments?.filter(a => a.type === (cat === 'IMAGE' ? 'image' : 'document')).length || 0;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setAttachmentCategory(cat)}
                              className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold transition-all cursor-pointer ${
                                attachmentCategory === cat
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                                  : 'bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
                              }`}
                            >
                              {cat === 'ALL' ? 'All' : cat === 'IMAGE' ? 'Images' : 'Documents'} ({count})
                            </button>
                          );
                        })}
                      </div>

                      {/* Inline Cards Grid */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
                        {filteredAttachments.slice(0, 4).map(att => {
                          const isImg = att.type === 'image';
                          const isAdded = addedAssetIds.has(att.id);
                          return (
                            <div
                              key={att.id}
                              className="bg-slate-950/70 border border-slate-850 hover:border-slate-750 rounded-xl p-2.5 flex flex-col justify-between gap-2 transition-all group"
                            >
                              {isImg ? (
                                <div className="space-y-1.5">
                                  <div 
                                    className="relative h-28 w-full rounded-lg overflow-hidden bg-slate-900 cursor-pointer group/img"
                                    onClick={() => {
                                      setPreviewImage(att);
                                      setPreviewZoom(1);
                                    }}
                                  >
                                    <img
                                      src={att.thumbnailUrl || att.url}
                                      alt={att.filename}
                                      className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                                      loading="lazy"
                                    />
                                    <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                      <span className="px-2.5 py-1 rounded-lg bg-slate-900/90 text-white font-mono text-[10px] flex items-center gap-1.5 shadow-lg border border-slate-700">
                                        <Eye className="w-3.5 h-3.5 text-cyan-400" />
                                        <span>Preview</span>
                                      </span>
                                    </div>
                                    <span className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded bg-slate-950/80 text-[9px] font-mono text-cyan-300 border border-slate-800">
                                      {att.dimensions || 'Image'}
                                    </span>
                                  </div>
                                  <p className="text-[11px] font-mono text-slate-300 line-clamp-1 font-bold" title={att.filename}>
                                    {att.filename}
                                  </p>
                                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                                    <span>{att.size}</span>
                                    <span>JPEG/PNG</span>
                                  </div>
                                </div>
                              ) : (
                                <div className="space-y-1.5">
                                  <div className="h-28 w-full rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col items-center justify-center p-3 text-center space-y-1">
                                    <FileText className="w-8 h-8 text-amber-400/80" />
                                    <span className="text-[10px] font-mono text-slate-400">PDF / Document</span>
                                    <span className="text-[9px] font-mono text-slate-500">{att.size}</span>
                                  </div>
                                  <p className="text-[11px] font-mono text-slate-300 line-clamp-1 font-bold" title={att.filename}>
                                    {att.filename}
                                  </p>
                                </div>
                              )}

                              <div className="flex items-center gap-1.5 pt-1 border-t border-slate-900">
                                {isImg && (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setPreviewImage(att);
                                      setPreviewZoom(1);
                                    }}
                                    className="py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white text-[10px] font-mono flex items-center gap-1 transition-colors cursor-pointer"
                                    title="Open Fullscreen Lightbox Preview"
                                  >
                                    <Eye className="w-3 h-3 text-cyan-400" />
                                    <span>Preview</span>
                                  </button>
                                )}
                                <button
                                  type="button"
                                  onClick={() => handleAddAttachmentToRepository(att)}
                                  className={`flex-1 py-1 px-2 rounded-lg text-[10px] font-mono font-bold flex items-center justify-center gap-1 transition-all cursor-pointer ${
                                    isAdded
                                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                      : 'bg-red-650/80 hover:bg-red-650 text-white shadow-sm'
                                  }`}
                                  title="Extract into GNN Media Repository"
                                >
                                  {isAdded ? (
                                    <>
                                      <CheckCheck className="w-3 h-3 text-emerald-400" />
                                      <span>In Repository</span>
                                    </>
                                  ) : (
                                    <>
                                      <FolderPlus className="w-3 h-3" />
                                      <span>Add to Repository</span>
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Studio Newsroom Action Bar */}
                  <div className="bg-slate-900/90 border border-cyan-500/30 rounded-xl p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-[11px] font-mono font-bold text-cyan-300 uppercase tracking-wider flex items-center gap-1.5">
                        <Sparkles className="w-3.5 h-3.5" />
                        Newsroom Action Engine
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        Draft script from email body
                      </span>
                    </div>
                    
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Extract headline, key developments, and quotes directly from this incoming wire message into the Grounded News teleprompter editor.
                    </p>

                    <div className="flex gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => handleConvertToScript(selectedMessage)}
                        className="flex-1 py-2 px-3 rounded-lg bg-gradient-to-r from-red-650 to-blue-650 hover:from-red-600 hover:to-blue-600 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-red-950/40 transition-all cursor-pointer hover:scale-[1.01]"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Convert to News Script</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setComposeTo(selectedMessage.from.match(/<([^>]+)>/)?.[1] || selectedMessage.from);
                          setComposeSubject(`Re: ${selectedMessage.subject}`);
                          setComposeBody(`\n\n--- On ${selectedMessage.date}, ${selectedMessage.from} wrote ---\n> ${selectedMessage.snippet}`);
                          setShowComposeModal(true);
                        }}
                        className="py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white font-semibold text-xs flex items-center gap-1.5 transition-colors cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Reply</span>
                      </button>
                    </div>
                  </div>
                </>
              ) : (
                /* Dedicated Attachment Gallery View in Reader */
                <div id="attachment-gallery" className="space-y-4">
                  {/* Gallery Controls Header */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div>
                        <h4 className="text-sm font-bold text-white flex items-center gap-2">
                          <Paperclip className="w-4 h-4 text-cyan-400" />
                          <span>Email Attachment Gallery</span>
                        </h4>
                        <p className="text-xs text-slate-400">
                          Extract high-resolution media and documents into the central Media Repository.
                        </p>
                      </div>

                      {/* Scope Toggle: Current Message vs All Messages */}
                      <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-850">
                        <button
                          type="button"
                          onClick={() => setAttachmentScope('SELECTED')}
                          className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                            attachmentScope === 'SELECTED'
                              ? 'bg-slate-800 text-cyan-300 font-bold'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          This Message ({selectedMessage.attachments?.length || 0})
                        </button>
                        <button
                          type="button"
                          onClick={() => setAttachmentScope('ALL')}
                          className={`px-2.5 py-1 rounded text-[10px] font-mono transition-colors cursor-pointer ${
                            attachmentScope === 'ALL'
                              ? 'bg-slate-800 text-cyan-300 font-bold'
                              : 'text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          All Wire Thread ({messages.reduce((acc, m) => acc + (m.attachments?.length || 0), 0)})
                        </button>
                      </div>
                    </div>

                    {/* Category Filter Pills: All, Images, Documents */}
                    <div className="flex items-center justify-between flex-wrap gap-2 pt-2 border-t border-slate-850">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="text-[10px] font-mono text-slate-500 uppercase mr-1">Category Filter:</span>
                        {(['ALL', 'IMAGE', 'DOCUMENT'] as const).map(cat => {
                          const count = cat === 'ALL' ? currentAttachments.length : cat === 'IMAGE' ? imageCount : docCount;
                          return (
                            <button
                              key={cat}
                              type="button"
                              onClick={() => setAttachmentCategory(cat)}
                              className={`px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                                attachmentCategory === cat
                                  ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-sm'
                                  : 'bg-slate-950 hover:bg-slate-850 text-slate-400 hover:text-slate-200 border border-slate-800'
                              }`}
                            >
                              {cat === 'ALL' ? (
                                <Layers className="w-3 h-3" />
                              ) : cat === 'IMAGE' ? (
                                <ImageIcon className="w-3 h-3 text-cyan-400" />
                              ) : (
                                <FileText className="w-3 h-3 text-amber-400" />
                              )}
                              <span>{cat === 'ALL' ? 'All' : cat === 'IMAGE' ? 'Images' : 'Documents'}</span>
                              <span className="px-1.5 py-0.2 rounded-full bg-slate-900 text-[10px]">
                                {count}
                              </span>
                            </button>
                          );
                        })}
                      </div>

                      <span className="text-[10px] font-mono text-slate-500">
                        {filteredAttachments.length} item(s) matching filter
                      </span>
                    </div>
                  </div>

                  {/* Attachment Cards Grid */}
                  {filteredAttachments.length === 0 ? (
                    <div className="text-center py-16 bg-slate-900/40 border border-slate-850 rounded-xl space-y-2">
                      <Paperclip className="w-8 h-8 mx-auto text-slate-600" />
                      <p className="text-xs font-mono text-slate-400">
                        No {attachmentCategory.toLowerCase()} attachments found for this filter.
                      </p>
                      <button
                        type="button"
                        onClick={() => setAttachmentCategory('ALL')}
                        className="text-xs font-mono text-cyan-400 hover:underline cursor-pointer"
                      >
                        Reset category filter to All
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {filteredAttachments.map(att => {
                        const isImg = att.type === 'image';
                        const isAdded = addedAssetIds.has(att.id);
                        return (
                          <div
                            key={att.id}
                            className="bg-slate-900/70 border border-slate-850 hover:border-slate-750 rounded-xl p-3 flex flex-col justify-between gap-3 transition-all group"
                          >
                            {isImg ? (
                              <div className="space-y-2">
                                <div 
                                  className="relative h-36 w-full rounded-lg overflow-hidden bg-slate-950 cursor-pointer group/img"
                                  onClick={() => {
                                    setPreviewImage(att);
                                    setPreviewZoom(1);
                                  }}
                                >
                                  <img
                                    src={att.thumbnailUrl || att.url}
                                    alt={att.filename}
                                    className="w-full h-full object-cover transition-transform duration-300 group-hover/img:scale-105"
                                    loading="lazy"
                                  />
                                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                    <span className="px-3 py-1.5 rounded-lg bg-slate-900/90 text-white font-mono text-xs flex items-center gap-1.5 shadow-xl border border-slate-700">
                                      <Eye className="w-3.5 h-3.5 text-cyan-400" />
                                      <span>Click to Preview Lightbox</span>
                                    </span>
                                  </div>
                                  <span className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-slate-950/80 text-[10px] font-mono text-cyan-300 border border-slate-800">
                                    {att.dimensions || '1920 × 1080'}
                                  </span>
                                </div>

                                <div className="space-y-1">
                                  <h5 className="text-xs font-mono font-bold text-white line-clamp-1" title={att.filename}>
                                    {att.filename}
                                  </h5>
                                  {att.description && (
                                    <p className="text-[11px] text-slate-400 line-clamp-2">
                                      {att.description}
                                    </p>
                                  )}
                                  <div className="flex items-center justify-between text-[10px] font-mono text-slate-500">
                                    <span>Size: {att.size}</span>
                                    <span>Type: {att.mimeType.split('/')[1]?.toUpperCase() || 'IMAGE'}</span>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className="space-y-2">
                                <div className="h-32 w-full rounded-lg bg-slate-950/80 border border-slate-850 flex flex-col items-center justify-center p-3 text-center space-y-1.5">
                                  <FileText className="w-9 h-9 text-amber-400/80" />
                                  <span className="text-xs font-mono text-slate-300 font-semibold">
                                    {att.mimeType.includes('pdf') ? 'PDF Document' : 'Office Document'}
                                  </span>
                                  <span className="text-[10px] font-mono text-slate-500">{att.size}</span>
                                </div>

                                <div className="space-y-1">
                                  <h5 className="text-xs font-mono font-bold text-white line-clamp-1" title={att.filename}>
                                    {att.filename}
                                  </h5>
                                  {att.description && (
                                    <p className="text-[11px] text-slate-400 line-clamp-2">
                                      {att.description}
                                    </p>
                                  )}
                                </div>
                              </div>
                            )}

                            {/* Card Footer Actions */}
                            <div className="flex items-center gap-2 pt-2 border-t border-slate-850">
                              {isImg && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setPreviewImage(att);
                                    setPreviewZoom(1);
                                  }}
                                  className="py-1.5 px-3 rounded-lg bg-slate-800 hover:bg-slate-750 text-slate-200 hover:text-white text-xs font-mono flex items-center gap-1.5 transition-colors cursor-pointer"
                                  title="Open Lightbox Preview"
                                >
                                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                                  <span>Preview</span>
                                </button>
                              )}

                              <button
                                type="button"
                                onClick={() => handleAddAttachmentToRepository(att)}
                                className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-mono font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                  isAdded
                                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                                    : 'bg-gradient-to-r from-red-650 to-blue-650 hover:from-red-600 hover:to-blue-600 text-white shadow-md shadow-red-950/40'
                                }`}
                                title="Add one-click to GNN Media Repository"
                              >
                                {isAdded ? (
                                  <>
                                    <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                                    <span>Added to Repository</span>
                                  </>
                                ) : (
                                  <>
                                    <FolderPlus className="w-3.5 h-3.5" />
                                    <span>Add to Repository</span>
                                  </>
                                )}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

            </div>
          ) : (
            <div className="text-center py-32 text-slate-500 space-y-3 m-auto">
              <Mail className="w-12 h-12 mx-auto text-slate-700" />
              <p className="text-xs font-mono">Select an incoming email to view full content and wire actions.</p>
            </div>
          )}

          {/* Bottom Security / Privacy Footer Notice */}
          <div className="pt-3 border-t border-slate-900 text-[10px] font-mono text-slate-500 flex justify-between items-center">
            <span>OAuth Token: In-Memory Only</span>
            <span>Gmail v1 REST</span>
          </div>
        </div>

      </div>

      {/* ------------------------------------------------------------- */}
      {/* COMPOSE EMAIL MODAL                                           */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {showComposeModal && (
          <motion.div
            key="compose-modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={(e) => {
              if (e.target === e.currentTarget && !isSending) setShowComposeModal(false);
            }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", duration: 0.28, bounce: 0.12 }}
              className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                <h3 className="text-sm font-sans font-bold text-white flex items-center gap-2">
                  <Send className="w-4 h-4 text-red-500" />
                  <span>Compose Studio Email Dispatch</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="text-slate-400 hover:text-white text-xs font-mono cursor-pointer"
                >
                  ✕
                </button>
              </div>

              {/* Predefined Templates */}
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-[10px] font-mono text-slate-500 uppercase">Templates:</span>
                {[
                  { label: 'Press Query', subj: 'PRESS INQUIRY: GNN Newsroom request for statement', body: 'Dear Media Team,\n\nGNN Broadcast Studio is currently preparing coverage on recent developments. Could your office provide an official on-record statement before today\'s broadcast cutoff?\n\nSincerely,\nGNN News Desk' },
                  { label: 'Field Assignment', subj: 'ASSIGNMENT: Live breaking reporting slot confirmation', body: 'Field Correspondent,\n\nYou are scheduled for a live remote hit at the top of the hour. Please confirm vMix SRT link and latency check.\n\nMaster Control Room' },
                  { label: 'Breaking Flash', subj: 'FLASH: Breaking news bulletin dispatch alert', body: 'URGENT NOTIFICATION:\n\nBreaking developments reported. All broadcast anchors review teleprompter feed ID: FLASH-01.\n\nEditorial Directorate' }
                ].map(tmpl => (
                  <button
                    key={tmpl.label}
                    type="button"
                    onClick={() => {
                      setComposeSubject(tmpl.subj);
                      setComposeBody(tmpl.body);
                    }}
                    className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white transition-colors cursor-pointer border border-slate-700"
                  >
                    {tmpl.label}
                  </button>
                ))}
              </div>

              <div className="space-y-3 font-sans">
                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">To (Recipient)</label>
                  <input
                    type="email"
                    placeholder="e.g. wire@reuters.com, editor@bloomberg.net"
                    value={composeTo}
                    onChange={(e) => setComposeTo(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Subject</label>
                  <input
                    type="text"
                    placeholder="Enter email subject line..."
                    value={composeSubject}
                    onChange={(e) => setComposeSubject(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs text-white focus:outline-none focus:border-red-500 font-sans"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-mono text-slate-400 uppercase mb-1">Message Body</label>
                  <textarea
                    rows={6}
                    placeholder="Compose studio broadcast statement, press response or inquiry..."
                    value={composeBody}
                    onChange={(e) => setComposeBody(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs text-white focus:outline-none focus:border-red-500 font-sans leading-relaxed resize-none"
                  />
                </div>
              </div>

              {/* Action Buttons: Triggers Mandatory User Confirmation Dialog before sending! */}
              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setShowComposeModal(false)}
                  className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-200 py-2.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  disabled={!composeTo.trim() || !composeSubject.trim()}
                  onClick={() => setConfirmSendModal(true)}
                  className="flex-1 bg-red-650 hover:bg-red-700 text-white py-2.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shadow-md shadow-red-950/40 disabled:opacity-40"
                >
                  Review & Send Email
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* MANDATORY USER CONFIRMATION DIALOG: SEND EMAIL                */}
      {/* (Required by Workspace Integration rules before mutating data)*/}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {confirmSendModal && (
          <motion.div
            key="confirm-send-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", duration: 0.28, bounce: 0.12 }}
              className="w-full max-w-md bg-slate-900 border border-amber-500/40 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="p-2.5 bg-amber-500/15 border border-amber-500/30 text-amber-400 rounded-xl shrink-0">
                  <ShieldAlert className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-sans">
                    Confirm Sending Email via Gmail
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    Operation will send a real email from your authorized Gmail account.
                  </p>
                </div>
              </div>

              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-2 text-xs font-mono">
                <div>
                  <span className="text-slate-500">To:</span> <strong className="text-white">{composeTo}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Subject:</span> <strong className="text-cyan-300">{composeSubject}</strong>
                </div>
                <div className="text-[11px] text-slate-400 line-clamp-3 font-sans border-t border-slate-900 pt-2 mt-1">
                  {composeBody}
                </div>
              </div>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmSendModal(false)}
                  disabled={isSending}
                  className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 py-2.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmSend}
                  disabled={isSending}
                  className="flex-1 bg-red-650 hover:bg-red-700 text-white py-2.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shadow-lg shadow-red-950/50 flex items-center justify-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isSending ? 'Sending...' : 'Confirm & Dispatch'}</span>
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* MANDATORY USER CONFIRMATION DIALOG: DELETE / TRASH EMAIL      */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {confirmDeleteModal && (
          <motion.div
            key="confirm-delete-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.94, y: 16 }}
              transition={{ type: "spring", duration: 0.28, bounce: 0.12 }}
              className="w-full max-w-md bg-slate-900 border border-red-500/40 rounded-2xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 border-b border-slate-800 pb-3">
                <div className="p-2.5 bg-red-500/15 border border-red-500/30 text-red-400 rounded-xl shrink-0">
                  <Trash2 className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-sm font-bold text-white font-sans">
                    Move Message to Trash?
                  </h4>
                  <p className="text-[11px] text-slate-400">
                    This email will be removed from your inbox and moved to Gmail Trash.
                  </p>
                </div>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed font-sans">
                Are you sure you want to trash this email? This action updates your mailbox on Google servers.
              </p>

              <div className="flex gap-2.5 pt-2">
                <button
                  type="button"
                  onClick={() => setConfirmDeleteModal(null)}
                  disabled={isDeleting}
                  className="flex-1 bg-slate-800 hover:bg-slate-750 text-slate-300 py-2.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDelete}
                  disabled={isDeleting}
                  className="flex-1 bg-red-650 hover:bg-red-700 text-white py-2.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer shadow-lg shadow-red-950/50"
                >
                  {isDeleting ? 'Trashing...' : 'Confirm Trash'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ------------------------------------------------------------- */}
      {/* LIGHTBOX-STYLE 'PREVIEW' MODAL FOR ATTACHMENT GALLERY IMAGES  */}
      {/* ------------------------------------------------------------- */}
      <AnimatePresence>
        {previewImage && (
          <motion.div
            key="attachment-lightbox-backdrop"
            id="attachment-lightbox-modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => {
              if (e.target === e.currentTarget) {
                setPreviewImage(null);
                setPreviewZoom(1);
              }
            }}
            className="fixed inset-0 z-50 flex flex-col justify-between bg-slate-950/95 backdrop-blur-md p-3 sm:p-5 select-none"
          >
            {/* Top Navigation & Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-900/90 border border-slate-800 rounded-2xl px-4 py-3 shadow-2xl backdrop-blur-md shrink-0">
              {/* Image Info & Meta */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-xl bg-red-500/15 border border-red-500/30 text-red-400 shrink-0">
                  <ImageIcon className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-xs sm:max-w-md font-mono" title={previewImage.filename}>
                      {previewImage.filename}
                    </h4>
                    {availableImages.length > 1 && (
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-slate-800 text-cyan-300 border border-slate-700">
                        {currentPreviewIndex + 1} / {availableImages.length}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2 text-[10px] font-mono text-slate-400">
                    <span>{previewImage.dimensions || '1920 × 1080'}</span>
                    <span>•</span>
                    <span>{previewImage.size}</span>
                    <span>•</span>
                    <span className="text-slate-500 uppercase">{previewImage.mimeType.split('/')[1] || 'IMAGE'}</span>
                  </div>
                </div>
              </div>

              {/* Controls: Zoom, Actions, Close */}
              <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
                {/* Zoom Controls */}
                <div className="flex items-center bg-slate-950 border border-slate-800 rounded-lg p-0.5">
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(z => Math.max(z - 0.25, 0.5))}
                    disabled={previewZoom <= 0.5}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-850 disabled:opacity-30 transition-colors cursor-pointer"
                    title="Zoom Out (-)"
                  >
                    <ZoomOut className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(1)}
                    className="px-2 py-1 text-[10px] font-mono font-bold text-slate-300 hover:text-white rounded hover:bg-slate-850 transition-colors cursor-pointer"
                    title="Reset Zoom to 100% (0)"
                  >
                    {Math.round(previewZoom * 100)}%
                  </button>
                  <button
                    type="button"
                    onClick={() => setPreviewZoom(z => Math.min(z + 0.25, 3))}
                    disabled={previewZoom >= 3}
                    className="p-1.5 text-slate-400 hover:text-white rounded hover:bg-slate-850 disabled:opacity-30 transition-colors cursor-pointer"
                    title="Zoom In (+)"
                  >
                    <ZoomIn className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Add to Repository Button */}
                <button
                  type="button"
                  id="lightbox-add-to-repo-btn"
                  onClick={() => handleAddAttachmentToRepository(previewImage)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                    addedAssetIds.has(previewImage.id)
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                      : 'bg-gradient-to-r from-red-650 to-blue-650 hover:from-red-600 hover:to-blue-600 text-white shadow-md shadow-red-950/40'
                  }`}
                  title="Add full-size asset to GNN Media Repository"
                >
                  {addedAssetIds.has(previewImage.id) ? (
                    <>
                      <CheckCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span className="hidden sm:inline">In Repository</span>
                    </>
                  ) : (
                    <>
                      <FolderPlus className="w-3.5 h-3.5" />
                      <span>Add to Repository</span>
                    </>
                  )}
                </button>

                {/* Copy Image URL */}
                <button
                  type="button"
                  onClick={() => handleCopyImageUrl(previewImage.url)}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors cursor-pointer"
                  title="Copy full-resolution image URL"
                >
                  {isCopiedUrl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>

                {/* Open in New Window */}
                <a
                  href={previewImage.url}
                  target="_blank"
                  rel="noreferrer"
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-950 border border-slate-800 hover:border-slate-700 transition-colors"
                  title="Open image in new browser window"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>

                {/* Close Button */}
                <button
                  type="button"
                  id="lightbox-close-btn"
                  onClick={() => {
                    setPreviewImage(null);
                    setPreviewZoom(1);
                  }}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-950 hover:bg-red-500/20 border border-slate-800 hover:border-red-500/40 text-xs font-mono transition-colors cursor-pointer flex items-center gap-1"
                  title="Close Preview (Escape)"
                >
                  <X className="w-4 h-4" />
                  <span className="text-[10px] hidden sm:inline text-slate-500">Esc</span>
                </button>
              </div>
            </div>

            {/* Center Canvas Viewport */}
            <div className="flex-1 flex items-center justify-between gap-2 sm:gap-4 my-2 relative min-h-0 overflow-hidden">
              {/* Previous Image Button */}
              {availableImages.length > 1 ? (
                <button
                  type="button"
                  id="lightbox-prev-btn"
                  onClick={handlePrevImage}
                  className="p-2.5 sm:p-3 rounded-full bg-slate-900/80 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all shadow-xl cursor-pointer z-10 shrink-0"
                  title="Previous Image (← Left Arrow)"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              ) : (
                <div className="w-10 shrink-0" />
              )}

              {/* Image Viewport */}
              <div 
                className="flex-1 flex items-center justify-center p-2 sm:p-4 overflow-auto max-h-full max-w-full"
                onClick={(e) => {
                  if (e.target === e.currentTarget) {
                    setPreviewImage(null);
                    setPreviewZoom(1);
                  }
                }}
              >
                <motion.div
                  key={previewImage.id}
                  initial={{ opacity: 0, scale: 0.94 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.94 }}
                  transition={{ type: 'spring', duration: 0.28, bounce: 0.1 }}
                  className="relative flex items-center justify-center"
                >
                  <img
                    src={previewImage.url}
                    alt={previewImage.filename}
                    style={{ transform: `scale(${previewZoom})` }}
                    className="max-h-[62vh] max-w-[80vw] object-contain rounded-xl border border-slate-800 shadow-2xl transition-transform duration-150 select-none cursor-zoom-in"
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewZoom(z => (z >= 2 ? 1 : z + 0.5));
                    }}
                  />
                </motion.div>
              </div>

              {/* Next Image Button */}
              {availableImages.length > 1 ? (
                <button
                  type="button"
                  id="lightbox-next-btn"
                  onClick={handleNextImage}
                  className="p-2.5 sm:p-3 rounded-full bg-slate-900/80 hover:bg-slate-850 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 transition-all shadow-xl cursor-pointer z-10 shrink-0"
                  title="Next Image (→ Right Arrow)"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
              ) : (
                <div className="w-10 shrink-0" />
              )}
            </div>

            {/* Bottom Caption & Thumbnail Ribbon */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-3 shadow-2xl backdrop-blur-md space-y-2 shrink-0">
              <div className="flex flex-wrap items-center justify-between text-xs text-slate-400 gap-2">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-cyan-300 font-bold">SOURCE:</span>
                  <span className="text-white font-sans truncate max-w-sm sm:max-w-md">
                    {selectedMessage?.subject || 'News Wire Dispatch'}
                  </span>
                  <span className="text-slate-500 font-mono hidden md:inline">({selectedMessage?.from})</span>
                </div>

                <div className="text-[10px] font-mono text-slate-500 hidden sm:flex items-center gap-3">
                  <span>[← / →] Navigate</span>
                  <span>[+/-] Zoom</span>
                  <span>[0] 100%</span>
                  <span>[Esc] Close</span>
                </div>
              </div>

              {previewImage.description && (
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans line-clamp-2">
                  {previewImage.description}
                </p>
              )}

              {/* Thumbnail Strip Ribbon */}
              {availableImages.length > 1 && (
                <div className="flex items-center gap-2 pt-2 border-t border-slate-850 overflow-x-auto py-1">
                  {availableImages.map((img, idx) => {
                    const isCurrent = img.id === previewImage.id;
                    return (
                      <button
                        key={img.id}
                        type="button"
                        onClick={() => {
                          setPreviewImage(img);
                          setPreviewZoom(1);
                        }}
                        className={`relative h-12 w-16 rounded-lg overflow-hidden shrink-0 border transition-all cursor-pointer ${
                          isCurrent
                            ? 'ring-2 ring-red-500 border-transparent scale-105 shadow-md'
                            : 'border-slate-800 opacity-60 hover:opacity-100 hover:border-slate-700'
                        }`}
                        title={img.filename}
                      >
                        <img
                          src={img.thumbnailUrl || img.url}
                          alt={img.filename}
                          className="h-full w-full object-cover"
                        />
                        <span className="absolute bottom-0 right-0 px-1 py-0.2 bg-slate-950/80 text-[8px] font-mono text-white">
                          #{idx + 1}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}
