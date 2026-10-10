import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FolderHeart,
  HardDrive,
  Search,
  ArrowUpDown,
  RefreshCw,
  Check,
  Plus,
  ExternalLink,
  FileVideo,
  FileAudio,
  FileImage,
  FileText,
  File,
  X,
  AlertCircle,
  Loader2,
  LogOut,
  Layers,
  Sparkles,
  CheckSquare,
  Square,
  ShieldCheck,
  Folder
} from 'lucide-react';
import { User } from 'firebase/auth';
import {
  GoogleDriveFile,
  signInWithGoogleDrive,
  signOutGoogleDrive,
  fetchGoogleDriveFiles,
  mapDriveFileToRepositoryAsset,
  SAMPLE_GOOGLE_DRIVE_FILES,
  getDriveAccessToken,
  initDriveAuth
} from '../utils/googleDriveService';
import { RepositoryAsset } from '../types';

interface GoogleDriveConnectorProps {
  onLinkAsset: (asset: RepositoryAsset) => void;
  linkedAssets: RepositoryAsset[];
  triggerToast?: (msg: string) => void;
}

export default function GoogleDriveConnector({
  onLinkAsset,
  linkedAssets,
  triggerToast
}: GoogleDriveConnectorProps) {
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [isAuthenticating, setIsAuthenticating] = useState<boolean>(false);
  const [isLoadingFiles, setIsLoadingFiles] = useState<boolean>(false);
  const [files, setFiles] = useState<GoogleDriveFile[]>(SAMPLE_GOOGLE_DRIVE_FILES);
  const [isUsingLiveDrive, setIsUsingLiveDrive] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Search & Filter state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [fileTypeFilter, setFileTypeFilter] = useState<string>('all');
  const [sortOption, setSortOption] = useState<string>('date-desc'); // date-desc, date-asc, name-asc, name-desc, size-desc

  // Bulk selection state
  const [selectedFileIds, setSelectedFileIds] = useState<string[]>([]);

  const notify = (msg: string) => {
    if (triggerToast) triggerToast(msg);
  };

  // Initialize Auth state listener
  useEffect(() => {
    const unsubscribe = initDriveAuth(
      (user, token) => {
        setCurrentUser(user);
        setAccessToken(token);
        setIsUsingLiveDrive(true);
        loadLiveDriveFiles(token);
      },
      () => {
        setCurrentUser(null);
        setAccessToken(null);
        setIsUsingLiveDrive(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Fetch live files from Google Drive
  const loadLiveDriveFiles = async (token?: string) => {
    const tokenToUse = token || accessToken;
    if (!tokenToUse) {
      setFiles(SAMPLE_GOOGLE_DRIVE_FILES);
      return;
    }

    setIsLoadingFiles(true);
    setAuthError(null);
    try {
      const driveFiles = await fetchGoogleDriveFiles(tokenToUse);
      if (driveFiles.length > 0) {
        setFiles(driveFiles);
        setIsUsingLiveDrive(true);
        notify(`Loaded ${driveFiles.length} files from Google Drive`);
      } else {
        // Fallback to sample files if Drive is completely empty
        setFiles(SAMPLE_GOOGLE_DRIVE_FILES);
        notify('Google Drive connected (Storage is currently empty, loaded sample files)');
      }
    } catch (err: any) {
      console.warn('[Google Drive API] Live fetch error:', err);
      setAuthError(err.message || 'Failed to fetch files from Google Drive');
      // Graceful fallback to sample files so user is never blocked
      setFiles(SAMPLE_GOOGLE_DRIVE_FILES);
      notify('Notice: Displaying cached/sample Drive storage');
    } finally {
      setIsLoadingFiles(false);
    }
  };

  // Handle Sign In with Google Drive
  const handleSignIn = async () => {
    setIsAuthenticating(true);
    setAuthError(null);
    try {
      const { user, accessToken: token } = await signInWithGoogleDrive();
      setCurrentUser(user);
      setAccessToken(token);
      setIsUsingLiveDrive(true);
      notify(`Authenticated as ${user.displayName || user.email || 'Google User'}`);
      await loadLiveDriveFiles(token);
    } catch (err: any) {
      console.error('[Google Drive] Sign In failed:', err);
      setAuthError(err.message || 'Authentication was canceled or encountered an error');
      notify(`Authentication note: ${err.message || 'Sign in failed'}`);
    } finally {
      setIsAuthenticating(false);
    }
  };

  // Handle Disconnect / Sign Out
  const handleSignOut = async () => {
    try {
      await signOutGoogleDrive();
      setCurrentUser(null);
      setAccessToken(null);
      setIsUsingLiveDrive(false);
      setFiles(SAMPLE_GOOGLE_DRIVE_FILES);
      notify('Disconnected from Google Drive');
    } catch (err: any) {
      console.error('[Google Drive] Sign Out failed:', err);
    }
  };

  // Check if a file is already linked in the repository
  const isFileLinked = (fileId: string, fileName: string) => {
    return linkedAssets.some(
      (a) => a.id === `drive-${fileId}` || a.name === fileName
    );
  };

  // Link single asset to Repository
  const handleLinkSingleAsset = (file: GoogleDriveFile) => {
    const asset = mapDriveFileToRepositoryAsset(file);
    onLinkAsset(asset);
    notify(`Linked "${file.name}" to Repository`);
  };

  // Link multiple selected assets
  const handleLinkSelectedAssets = () => {
    const filesToLink = files.filter((f) => selectedFileIds.includes(f.id));
    if (filesToLink.length === 0) return;

    filesToLink.forEach((file) => {
      const asset = mapDriveFileToRepositoryAsset(file);
      onLinkAsset(asset);
    });

    notify(`Successfully linked ${filesToLink.length} Google Drive asset(s) to Repository`);
    setSelectedFileIds([]);
  };

  // Toggle selection of a file
  const toggleSelectFile = (fileId: string) => {
    setSelectedFileIds((prev) =>
      prev.includes(fileId) ? prev.filter((id) => id !== fileId) : [...prev, fileId]
    );
  };

  // Toggle select all filtered files
  const toggleSelectAll = () => {
    if (selectedFileIds.length === filteredAndSortedFiles.length) {
      setSelectedFileIds([]);
    } else {
      setSelectedFileIds(filteredAndSortedFiles.map((f) => f.id));
    }
  };

  // Filter and sort files based on search, type, and sort selection
  const filteredAndSortedFiles = useMemo(() => {
    let result = files.filter((file) => {
      // Search query filter by filename
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        if (!file.name.toLowerCase().includes(query)) {
          return false;
        }
      }

      // Type filter
      if (fileTypeFilter !== 'all') {
        const mime = (file.mimeType || '').toLowerCase();
        const name = (file.name || '').toLowerCase();
        if (fileTypeFilter === 'video') {
          return mime.includes('video') || name.endsWith('.mp4') || name.endsWith('.mov') || name.endsWith('.webm');
        }
        if (fileTypeFilter === 'image') {
          return mime.includes('image') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.jpeg') || name.endsWith('.webp');
        }
        if (fileTypeFilter === 'audio') {
          return mime.includes('audio') || name.endsWith('.mp3') || name.endsWith('.wav') || name.endsWith('.aac');
        }
        if (fileTypeFilter === 'script' || fileTypeFilter === 'doc') {
          return (
            mime.includes('document') ||
            mime.includes('text') ||
            name.endsWith('.docx') ||
            name.endsWith('.txt') ||
            name.endsWith('.pdf') ||
            name.endsWith('.srt')
          );
        }
      }

      return true;
    });

    // Apply Sorting by 'Date Modified' and 'Filename' (and size)
    result.sort((a, b) => {
      if (sortOption === 'date-desc') {
        return new Date(b.modifiedTime).getTime() - new Date(a.modifiedTime).getTime();
      }
      if (sortOption === 'date-asc') {
        return new Date(a.modifiedTime).getTime() - new Date(b.modifiedTime).getTime();
      }
      if (sortOption === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortOption === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      if (sortOption === 'size-desc') {
        const sizeA = parseInt(a.size || '0', 10);
        const sizeB = parseInt(b.size || '0', 10);
        return sizeB - sizeA;
      }
      return 0;
    });

    return result;
  }, [files, searchQuery, fileTypeFilter, sortOption]);

  // Count already linked drive files
  const linkedCount = useMemo(() => {
    return linkedAssets.filter((a) => a.id.startsWith('drive-') || a.category === 'Google Drive').length;
  }, [linkedAssets]);

  // Helper to get file type icon
  const getFileIcon = (mimeType: string, fileName: string) => {
    const mime = (mimeType || '').toLowerCase();
    const name = (fileName || '').toLowerCase();
    if (mime.includes('video') || name.endsWith('.mp4') || name.endsWith('.mov') || name.endsWith('.webm')) {
      return <FileVideo className="w-4 h-4 text-rose-400 shrink-0" />;
    }
    if (mime.includes('image') || name.endsWith('.png') || name.endsWith('.jpg') || name.endsWith('.webp')) {
      return <FileImage className="w-4 h-4 text-emerald-400 shrink-0" />;
    }
    if (mime.includes('audio') || name.endsWith('.mp3') || name.endsWith('.wav')) {
      return <FileAudio className="w-4 h-4 text-purple-400 shrink-0" />;
    }
    if (mime.includes('document') || name.endsWith('.docx') || name.endsWith('.pdf') || name.endsWith('.txt')) {
      return <FileText className="w-4 h-4 text-blue-400 shrink-0" />;
    }
    return <File className="w-4 h-4 text-amber-400 shrink-0" />;
  };

  // Helper to format file size
  const formatFileSize = (sizeBytes?: string) => {
    if (!sizeBytes) return '1.2 MB';
    const bytes = parseInt(sizeBytes, 10);
    if (isNaN(bytes) || bytes === 0) return '—';
    if (bytes > 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`;
    if (bytes > 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    return `${(bytes / 1024).toFixed(0)} KB`;
  };

  return (
    <>
      {/* Google Drive Connector Module Header Pill / Button */}
      <div id="google-drive-connector-module" className="relative inline-flex items-center">
        <button
          id="google-drive-connector-btn"
          type="button"
          onClick={() => setIsOpen(true)}
          title={
            currentUser
              ? `Google Drive Connected (${currentUser.email || currentUser.displayName}) • Click to browse files & link assets`
              : 'Connect Google Drive • Browse files & link studio assets directly into the repository'
          }
          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer select-none border shadow-sm group ${
            currentUser
              ? 'bg-blue-500/15 hover:bg-blue-500/25 border-blue-500/50 text-blue-200 ring-1 ring-blue-500/30'
              : 'bg-slate-900/95 hover:bg-slate-800 border-slate-700/90 text-slate-200 hover:text-white hover:border-blue-500/40'
          }`}
        >
          {/* Official Google Drive icon SVG */}
          <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-110" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
            <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
            <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
            <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.5l5.85 10.15z" fill="#ea4335"/>
            <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
            <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
            <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
          </svg>

          <span className="font-semibold hidden sm:inline">Google Drive</span>
          
          {currentUser ? (
            <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-1.5 py-0.2 rounded-full font-bold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              <span>Connected</span>
            </span>
          ) : (
            <span className="text-[10px] text-blue-400 bg-blue-500/10 border border-blue-500/20 px-1.5 py-0.2 rounded-full">
              Connect
            </span>
          )}

          {linkedCount > 0 && (
            <span
              id="google-drive-linked-count-badge"
              className="text-[9px] font-mono px-1.5 py-0.2 bg-blue-950 text-blue-300 border border-blue-500/40 rounded-full font-bold"
              title={`${linkedCount} asset(s) linked from Google Drive`}
            >
              {linkedCount} linked
            </span>
          )}
        </button>
      </div>

      {/* Google Drive File Explorer Component Modal / Panel within #workspace-card */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            id="google-drive-file-explorer"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/85 backdrop-blur-md"
            onClick={(e) => {
              if (e.target === e.currentTarget) setIsOpen(false);
            }}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="w-full max-w-4xl max-h-[92vh] flex flex-col bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl overflow-hidden font-mono text-xs"
            >
            {/* Top Bar Header */}
            <div className="flex items-center justify-between px-4 sm:px-6 py-3.5 border-b border-slate-800 bg-slate-950/90 shrink-0">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-blue-500/15 border border-blue-500/30 shadow-inner">
                  {/* Google Drive Logo */}
                  <svg className="w-5 h-5" viewBox="0 0 87.3 78" xmlns="http://www.w3.org/2000/svg">
                    <path d="m6.6 66.85 3.85 6.65c.8 1.4 1.95 2.5 3.3 3.3l13.75-23.8h-27.5c0 1.55.4 3.1 1.2 4.5z" fill="#0066da"/>
                    <path d="m43.65 25-13.75-23.8c-1.35.8-2.5 1.9-3.3 3.3l-25.4 44c-.8 1.4-1.2 2.95-1.2 4.5h27.5z" fill="#00ac47"/>
                    <path d="m73.55 76.8c1.35-.8 2.5-1.9 3.3-3.3l1.6-2.75 7.65-13.25c.8-1.4 1.2-2.95 1.2-4.5h-27.5l5.85 10.15z" fill="#ea4335"/>
                    <path d="m43.65 25 13.75-23.8c-1.35-.8-2.9-1.2-4.5-1.2h-18.5c-1.6 0-3.15.45-4.5 1.2z" fill="#00832d"/>
                    <path d="m59.8 53h-32.3l-13.75 23.8c1.35.8 2.9 1.2 4.5 1.2h50.8c1.6 0 3.15-.45 4.5-1.2z" fill="#2684fc"/>
                    <path d="m73.4 26.5-12.7-22c-.8-1.4-1.95-2.5-3.3-3.3l-13.75 23.8 16.15 28h27.45c0-1.55-.4-3.1-1.2-4.5z" fill="#ffba00"/>
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-sans font-black text-sm text-white tracking-wide">
                      Google Drive Connector & File Explorer
                    </h3>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                      v3 API
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-400">
                    Browse files and link broadcast assets directly from your Drive storage into the GNN repository
                  </p>
                </div>
              </div>

              {/* Account Status & Close Button */}
              <div className="flex items-center gap-2">
                {currentUser ? (
                  <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="User avatar"
                        className="w-4 h-4 rounded-full border border-slate-700"
                      />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                    )}
                    <span className="text-[10px] text-slate-300 font-bold max-w-[140px] truncate">
                      {currentUser.email || currentUser.displayName || 'Authorized User'}
                    </span>
                    <button
                      type="button"
                      id="google-drive-signout-btn"
                      onClick={handleSignOut}
                      title="Disconnect Google Drive session"
                      className="text-slate-500 hover:text-red-400 p-0.5 rounded transition-colors cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    id="google-drive-header-login-btn"
                    onClick={handleSignIn}
                    disabled={isAuthenticating}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-sm transition-all cursor-pointer"
                  >
                    {isAuthenticating ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <HardDrive className="w-3.5 h-3.5" />
                    )}
                    <span>Sign in with Google</span>
                  </button>
                )}

                <button
                  type="button"
                  id="google-drive-close-btn"
                  onClick={() => setIsOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
                  title="Close file explorer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Authentication Prompt Banner when Not Signed In */}
            {!currentUser && (
              <div
                id="google-drive-auth-banner"
                className="bg-gradient-to-r from-blue-950/70 via-slate-900 to-indigo-950/60 border-b border-blue-500/20 px-4 sm:px-6 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div className="flex items-start sm:items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-blue-400 shrink-0 mt-0.5 sm:mt-0" />
                  <div>
                    <span className="text-white font-bold">
                      Connect your Google Drive account to access live cloud storage:
                    </span>
                    <span className="text-slate-400 block sm:inline sm:ml-1">
                      Browse media files, scripts, and production graphics with user permission.
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    id="google-drive-auth-connect-action-btn"
                    onClick={handleSignIn}
                    disabled={isAuthenticating}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white hover:bg-slate-100 text-slate-900 font-sans font-bold text-xs shadow-md transition-all cursor-pointer"
                  >
                    {/* Google standard colorful 'G' logo */}
                    <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                      <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                      <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                      <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                    </svg>
                    <span>{isAuthenticating ? 'Signing in...' : 'Sign in with Google'}</span>
                  </button>
                  <span className="text-[10px] text-blue-300/80 font-mono">
                    (or explore sample files below)
                  </span>
                </div>
              </div>
            )}

            {/* Controls Bar: Search Filter Input, Sort Options, Type Filters, and Actions */}
            <div className="p-4 border-b border-slate-800 bg-slate-950/60 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 shrink-0">
              {/* Search & Filter Input by Filename */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 w-3.5 h-3.5 text-slate-500" />
                <input
                  id="google-drive-search-input"
                  type="text"
                  placeholder="Search assets by filename in Google Drive..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-750 focus:border-blue-400 focus:ring-1 focus:ring-blue-400/30 rounded-xl pl-9 pr-8 py-2 text-xs font-mono text-white placeholder:text-slate-500 outline-none transition-all"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-2.5 top-2 text-slate-500 hover:text-white p-0.5 cursor-pointer"
                    title="Clear search"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Sort Options by 'Date Modified' and 'Filename' */}
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-750 rounded-xl px-2.5 py-1.5">
                  <ArrowUpDown className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                  <label htmlFor="google-drive-sort-select" className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                    Sort:
                  </label>
                  <select
                    id="google-drive-sort-select"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-transparent text-slate-200 text-xs font-mono font-semibold focus:outline-none cursor-pointer pr-1"
                  >
                    <option value="date-desc" className="bg-slate-900 text-white">Date Modified (Newest First)</option>
                    <option value="date-asc" className="bg-slate-900 text-white">Date Modified (Oldest First)</option>
                    <option value="name-asc" className="bg-slate-900 text-white">Filename (A – Z)</option>
                    <option value="name-desc" className="bg-slate-900 text-white">Filename (Z – A)</option>
                    <option value="size-desc" className="bg-slate-900 text-white">File Size (Largest)</option>
                  </select>
                </div>

                {/* Refresh Live Drive Files Button */}
                <button
                  type="button"
                  id="google-drive-refresh-btn"
                  onClick={() => loadLiveDriveFiles()}
                  disabled={isLoadingFiles}
                  title="Refresh files from Google Drive"
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-slate-750 bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white cursor-pointer transition-colors"
                >
                  <RefreshCw className={`w-3.5 h-3.5 text-blue-400 ${isLoadingFiles ? 'animate-spin' : ''}`} />
                  <span className="hidden sm:inline">Refresh</span>
                </button>
              </div>
            </div>

            {/* Sub-bar: Type Quick Filters & Bulk Actions */}
            <div className="px-4 py-2 bg-slate-950/40 border-b border-slate-800/80 flex items-center justify-between gap-2 flex-wrap">
              {/* Type Category Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto py-0.5">
                {[
                  { id: 'all', label: 'All Files' },
                  { id: 'video', label: 'Videos' },
                  { id: 'image', label: 'Images' },
                  { id: 'audio', label: 'Audio' },
                  { id: 'doc', label: 'Docs & Scripts' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setFileTypeFilter(tab.id)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-bold transition-all cursor-pointer whitespace-nowrap ${
                      fileTypeFilter === tab.id
                        ? 'bg-blue-500 text-white shadow-xs'
                        : 'text-slate-400 hover:text-slate-200 bg-slate-900/60 hover:bg-slate-800 border border-slate-800'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Bulk Link Selected Files Action */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={toggleSelectAll}
                  className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  {selectedFileIds.length > 0 && selectedFileIds.length === filteredAndSortedFiles.length ? (
                    <CheckSquare className="w-3.5 h-3.5 text-blue-400" />
                  ) : (
                    <Square className="w-3.5 h-3.5" />
                  )}
                  <span>Select All ({filteredAndSortedFiles.length})</span>
                </button>

                {selectedFileIds.length > 0 && (
                  <button
                    type="button"
                    id="link-selected-drive-assets-btn"
                    onClick={handleLinkSelectedAssets}
                    className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-[10px] transition-all cursor-pointer shadow-md shadow-emerald-950/50"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Link Selected ({selectedFileIds.length}) to Repository</span>
                  </button>
                )}
              </div>
            </div>

            {/* Error Message if any */}
            {authError && (
              <div className="mx-4 mt-3 p-2.5 rounded-xl bg-red-500/10 border border-red-500/30 text-red-300 text-[11px] flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
                <span className="flex-1">{authError}</span>
              </div>
            )}

            {/* File List / Explorer Content Table */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 min-h-[280px]">
              {isLoadingFiles ? (
                <div className="py-16 text-center text-slate-400 space-y-2">
                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin mx-auto" />
                  <p className="font-semibold text-white">Accessing Google Drive storage...</p>
                  <p className="text-[10px]">Retrieving files and metadata via Google Drive v3 API</p>
                </div>
              ) : filteredAndSortedFiles.length === 0 ? (
                <div className="py-16 text-center text-slate-400 space-y-2 border border-dashed border-slate-800 rounded-xl">
                  <Folder className="w-8 h-8 text-slate-600 mx-auto" />
                  <p className="text-white font-semibold">No files match your search criteria</p>
                  <p className="text-[10px] text-slate-500">
                    Try adjusting your search query or switching file type filters.
                  </p>
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => setSearchQuery('')}
                      className="px-3 py-1 rounded bg-slate-800 text-slate-300 hover:text-white text-[10px] cursor-pointer"
                    >
                      Clear search
                    </button>
                  )}
                </div>
              ) : (
                filteredAndSortedFiles.map((file) => {
                  const alreadyLinked = isFileLinked(file.id, file.name);
                  const isSelected = selectedFileIds.includes(file.id);

                  return (
                    <div
                      key={file.id}
                      id={`drive-file-item-${file.id}`}
                      className={`group p-3 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                        alreadyLinked
                          ? 'bg-slate-900/40 border-slate-800/80 hover:border-slate-700'
                          : isSelected
                          ? 'bg-blue-500/10 border-blue-500/50 shadow-sm ring-1 ring-blue-500/30'
                          : 'bg-slate-900/80 hover:bg-slate-850 border-slate-800 hover:border-blue-500/30'
                      }`}
                    >
                      {/* Checkbox and Icon */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={() => toggleSelectFile(file.id)}
                          className="text-slate-500 hover:text-blue-400 cursor-pointer p-0.5"
                          title={isSelected ? 'Deselect file' : 'Select file for batch linking'}
                        >
                          {isSelected ? (
                            <CheckSquare className="w-4 h-4 text-blue-400" />
                          ) : (
                            <Square className="w-4 h-4" />
                          )}
                        </button>

                        <div className="p-2 rounded-lg bg-slate-950 border border-slate-800">
                          {getFileIcon(file.mimeType, file.name)}
                        </div>

                        {/* File Details */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200 group-hover:text-white truncate">
                              {file.name}
                            </span>
                            {alreadyLinked && (
                              <span className="text-[9px] font-mono px-1.5 py-0.2 bg-emerald-500/15 text-emerald-300 border border-emerald-500/40 rounded-full font-bold shrink-0">
                                Linked
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono mt-0.5 flex-wrap">
                            <span>{formatFileSize(file.size)}</span>
                            <span>•</span>
                            <span>
                              Modified: {new Date(file.modifiedTime).toLocaleDateString([], {
                                year: 'numeric',
                                month: 'short',
                                day: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })}
                            </span>
                            <span>•</span>
                            <span className="truncate max-w-[150px] text-slate-600">
                              {file.mimeType.split('/').pop() || 'file'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Actions: View in Drive & Link to Repository */}
                      <div className="flex items-center gap-2 shrink-0">
                        {file.webViewLink && (
                          <a
                            href={file.webViewLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 text-slate-400 hover:text-blue-300 hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                            title="Open in Google Drive"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}

                        <button
                          type="button"
                          id={`link-asset-${file.id}`}
                          onClick={() => handleLinkSingleAsset(file)}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-bold transition-all cursor-pointer ${
                            alreadyLinked
                              ? 'bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700'
                              : 'bg-blue-600 hover:bg-blue-500 text-white shadow-sm shadow-blue-950/50'
                          }`}
                        >
                          {alreadyLinked ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span>Re-link Asset</span>
                            </>
                          ) : (
                            <>
                              <Plus className="w-3 h-3" />
                              <span>Link to Repository</span>
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-4 sm:px-6 py-3 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 shrink-0">
              <div className="flex items-center gap-2 text-[10px]">
                <HardDrive className="w-3.5 h-3.5 text-blue-400" />
                <span>
                  Showing {filteredAndSortedFiles.length} file(s) in Drive view
                </span>
                <span className="text-slate-600">•</span>
                <span className="text-emerald-400 font-bold">
                  {linkedCount} linked in studio repository
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  id="google-drive-done-btn"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
      </AnimatePresence>
    </>
  );
}
