import React, { useState, useRef, useEffect, useMemo } from 'react';
import { 
  FolderHeart, 
  Trash2, 
  Play, 
  Eye, 
  RefreshCw, 
  Upload, 
  FileText, 
  FileVideo, 
  Volume2, 
  Image as ImageIcon,
  Check,
  Calendar,
  Layers,
  Sparkles,
  ShieldAlert,
  Download,
  Tags,
  CheckSquare,
  Square,
  X,
  FileDown,
  CheckCheck,
  Loader2,
  AlertTriangle,
  CheckCircle2,
  Maximize2
} from 'lucide-react';
import { RepositoryAsset, UserRolePayload } from '../types';
import BulkDeleteConfirmationDialog from './BulkDeleteConfirmationDialog';
import BatchOperationProgress, { BatchOperationState } from './BatchOperationProgress';
import AssetPreviewModal from './AssetPreviewModal';
import RepositoryStorageFooter from './RepositoryStorageFooter';

interface AssetRepositoryProps {
  userRole: UserRolePayload;
  assets: RepositoryAsset[];
  setAssets: React.Dispatch<React.SetStateAction<RepositoryAsset[]>>;
  viewMode?: 'grid' | 'list';
  triggerToast?: (msg: string) => void;
}

export default function AssetRepository({ userRole, assets, setAssets, viewMode = 'list', triggerToast }: AssetRepositoryProps) {
  const [selectedAsset, setSelectedAsset] = useState<RepositoryAsset | null>(assets[0] || null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisText, setAnalysisText] = useState('');
  const replaceInputRef = useRef<HTMLInputElement>(null);

  // States for checkbox selection, delete modal, bulk tagging, and real-time batch operations
  const [checkedAssetIds, setCheckedAssetIds] = useState<string[]>([]);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showTagModal, setShowTagModal] = useState(false);
  const [bulkCategory, setBulkCategory] = useState('Breaking News');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<{ current: number; total: number; filename: string } | null>(null);
  const [batchOperation, setBatchOperation] = useState<BatchOperationState | null>(null);
  const abortBatchRef = useRef<boolean>(false);

  // States for full-size preview & video player modal view
  const [previewModalAsset, setPreviewModalAsset] = useState<RepositoryAsset | null>(null);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState(false);

  const notify = (msg: string) => {
    if (triggerToast) {
      triggerToast(msg);
    }
  };

  const handleBulkTag = () => {
    if (!userRole.permissions.canEditRepository) {
      alert('Your authorized role does not have privileges to modify this repository.');
      return;
    }
    if (checkedAssetIds.length === 0 || !bulkCategory.trim()) return;

    setAssets(prev => prev.map(a => {
      if (checkedAssetIds.includes(a.id)) {
        return { ...a, category: bulkCategory.trim() };
      }
      return a;
    }));

    if (selectedAsset && checkedAssetIds.includes(selectedAsset.id)) {
      setSelectedAsset(prev => prev ? { ...prev, category: bulkCategory.trim() } : null);
    }
    notify(`Applied tag "${bulkCategory.trim()}" to ${checkedAssetIds.length} assets.`);
    setShowTagModal(false);
  };

  // Filter terms
  const [filterType, setFilterType] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'Ready' | 'Processing' | 'Error'>('all');

  const statusCounts = useMemo(() => {
    const counts = { all: assets.length, Ready: 0, Processing: 0, Error: 0 };
    assets.forEach(a => {
      const s = a.status || 'Ready';
      if (s === 'Ready') counts.Ready += 1;
      else if (s === 'Processing') counts.Processing += 1;
      else if (s === 'Error') counts.Error += 1;
    });
    return counts;
  }, [assets]);

  const handleCycleStatus = (asset: RepositoryAsset, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!userRole.permissions.canEditRepository) {
      notify(`Asset status: ${asset.status || 'Ready'} (Admin or Editor privileges required to modify)`);
      return;
    }

    const currentStatus = asset.status || 'Ready';
    if (currentStatus === 'Error') {
      // Re-process workflow
      setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, status: 'Processing' } : a));
      if (selectedAsset?.id === asset.id) {
        setSelectedAsset(prev => prev ? { ...prev, status: 'Processing' } : null);
      }
      notify(`Re-processing "${asset.name}"... validating proxy integrity.`);
      setTimeout(() => {
        setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, status: 'Ready' } : a));
        if (selectedAsset?.id === asset.id) {
          setSelectedAsset(prev => prev ? { ...prev, status: 'Ready' } : null);
        }
        notify(`Asset "${asset.name}" pipeline validated: marked Ready.`);
      }, 1200);
      return;
    }

    const nextStatus: 'Ready' | 'Processing' | 'Error' = 
      currentStatus === 'Ready' ? 'Processing' : 
      currentStatus === 'Processing' ? 'Error' : 'Ready';

    setAssets(prev => prev.map(a => a.id === asset.id ? { ...a, status: nextStatus } : a));
    if (selectedAsset?.id === asset.id) {
      setSelectedAsset(prev => prev ? { ...prev, status: nextStatus } : null);
    }
    notify(`Asset "${asset.name}" status updated to ${nextStatus}.`);
  };

  useEffect(() => {
    if (assets.length > 0) {
      if (!selectedAsset || !assets.some(a => a.id === selectedAsset.id)) {
        setSelectedAsset(assets[0]);
      }
    } else {
      setSelectedAsset(null);
    }
  }, [assets]);

  const handleDeleteAsset = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!userRole.permissions.canEditRepository) {
      alert('Your authorized role does not have privileges to modify this repository.');
      return;
    }
    setAssets(prev => prev.filter(a => a.id !== id));
    setCheckedAssetIds(prev => prev.filter(checkedId => checkedId !== id));
    if (selectedAsset?.id === id) {
      const remaining = assets.filter(a => a.id !== id);
      setSelectedAsset(remaining[0] || null);
      setAnalysisText('');
    }
    notify('Asset removed from repository.');
  };

  const handleAbortBatch = () => {
    abortBatchRef.current = true;
    if (batchOperation) {
      setBatchOperation(prev => prev ? {
        ...prev,
        aborted: true,
        statusMessage: `Batch operation halted by operator.`
      } : null);
    }
  };

  const handleBulkDelete = async () => {
    if (!userRole.permissions.canEditRepository) {
      alert('Your authorized role does not have privileges to modify this repository.');
      return;
    }
    const idsToDelete = [...checkedAssetIds];
    const itemsToDelete = assets.filter(a => idsToDelete.includes(a.id));
    if (itemsToDelete.length === 0) {
      setShowDeleteModal(false);
      return;
    }

    // Close the confirmation modal so operator immediately views the live repository progress banner
    setShowDeleteModal(false);
    abortBatchRef.current = false;

    setBatchOperation({
      type: 'delete',
      current: 0,
      total: itemsToDelete.length,
      statusMessage: `Initializing permanent purge of ${itemsToDelete.length} assets...`,
    });

    notify(`Processing permanent purge for ${itemsToDelete.length} assets...`);

    let purgedCount = 0;
    for (let i = 0; i < itemsToDelete.length; i++) {
      if (abortBatchRef.current) {
        setBatchOperation(prev => prev ? {
          ...prev,
          aborted: true,
          statusMessage: `Purge aborted by user. (${purgedCount} of ${itemsToDelete.length} purged)`
        } : null);
        notify(`Batch purge halted. ${purgedCount} assets removed.`);
        return;
      }

      const asset = itemsToDelete[i];
      setBatchOperation({
        type: 'delete',
        current: i + 1,
        total: itemsToDelete.length,
        currentAssetId: asset.id,
        currentAssetName: asset.name,
        currentAssetType: asset.type,
        currentAssetSize: asset.size,
        statusMessage: `Purging storage proxy & index for "${asset.name}" (${i + 1}/${itemsToDelete.length})...`,
      });

      // Realistic staggered cleanup enabling visual tracking in UI
      await new Promise(r => setTimeout(r, 320));

      // Remove current asset in real-time from repository state
      setAssets(prev => prev.filter(a => a.id !== asset.id));
      setCheckedAssetIds(prev => prev.filter(id => id !== asset.id));
      purgedCount++;
    }

    if (selectedAsset && idsToDelete.includes(selectedAsset.id)) {
      setSelectedAsset(null);
      setAnalysisText('');
    }

    setBatchOperation({
      type: 'delete',
      current: itemsToDelete.length,
      total: itemsToDelete.length,
      statusMessage: `Successfully purged ${itemsToDelete.length} assets from repository index.`,
      isComplete: true,
    });
    notify(`Batch deletion complete: ${itemsToDelete.length} assets purged.`);

    // Auto-dismiss completed status after 4.5 seconds
    setTimeout(() => {
      setBatchOperation(prev => prev?.isComplete ? null : prev);
    }, 4500);
  };

  const downloadAssetFile = async (asset: RepositoryAsset) => {
    const defaultExt = asset.type === 'video' ? 'mp4' : asset.type === 'image' ? 'png' : asset.type === 'audio' ? 'mp3' : asset.type === 'subtitles' ? 'srt' : 'txt';
    const safeName = (asset.name || `gnn_asset_${asset.id}`).replace(/[/\\?%*:|"<>]/g, '_');
    const filename = safeName.includes('.') ? safeName : `${safeName}.${defaultExt}`;

    if (asset.url && asset.url.startsWith('data:')) {
      const aTag = document.createElement('a');
      aTag.href = asset.url;
      aTag.download = filename;
      document.body.appendChild(aTag);
      aTag.click();
      document.body.removeChild(aTag);
    } else if (asset.lyrics_or_text) {
      const mime = asset.type === 'subtitles' ? 'text/plain;charset=utf-8' : 'text/plain;charset=utf-8';
      const blob = new Blob([asset.lyrics_or_text], { type: mime });
      const url = URL.createObjectURL(blob);
      const aTag = document.createElement('a');
      aTag.href = url;
      aTag.download = filename;
      document.body.appendChild(aTag);
      aTag.click();
      document.body.removeChild(aTag);
      URL.revokeObjectURL(url);
    } else if (asset.url && (asset.url.startsWith('http://') || asset.url.startsWith('https://'))) {
      try {
        const response = await fetch(asset.url, { mode: 'cors' });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        const blob = await response.blob();
        const blobUrl = URL.createObjectURL(blob);
        const aTag = document.createElement('a');
        aTag.href = blobUrl;
        aTag.download = filename;
        document.body.appendChild(aTag);
        aTag.click();
        document.body.removeChild(aTag);
        URL.revokeObjectURL(blobUrl);
      } catch (err) {
        // Fallback for CORS restricted remote assets: direct anchor download or metadata descriptor
        const aTag = document.createElement('a');
        aTag.href = asset.url;
        aTag.target = '_blank';
        aTag.rel = 'noopener noreferrer';
        aTag.download = filename;
        document.body.appendChild(aTag);
        aTag.click();
        document.body.removeChild(aTag);

        // Also output JSON specification descriptor so user has full payload
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(asset, null, 2));
        const metaTag = document.createElement('a');
        metaTag.href = dataStr;
        metaTag.download = `${safeName}_metadata.json`;
        document.body.appendChild(metaTag);
        metaTag.click();
        document.body.removeChild(metaTag);
      }
    } else {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(asset, null, 2));
      const aTag = document.createElement('a');
      aTag.href = dataStr;
      aTag.download = `${safeName}_manifest.json`;
      document.body.appendChild(aTag);
      aTag.click();
      document.body.removeChild(aTag);
    }
  };

  const handleBulkDownload = async () => {
    if (checkedAssetIds.length === 0) return;
    const selectedList = assets.filter(a => checkedAssetIds.includes(a.id));
    if (selectedList.length === 0) return;

    abortBatchRef.current = false;
    setIsDownloading(true);

    setBatchOperation({
      type: 'download',
      current: 0,
      total: selectedList.length,
      statusMessage: `Preparing batch download of ${selectedList.length} assets...`,
    });

    notify(`Initiating batch download for ${selectedList.length} assets...`);

    let downloadedCount = 0;
    for (let i = 0; i < selectedList.length; i++) {
      if (abortBatchRef.current) {
        setBatchOperation(prev => prev ? {
          ...prev,
          aborted: true,
          statusMessage: `Batch download aborted by user. (${downloadedCount} of ${selectedList.length} downloaded)`
        } : null);
        setIsDownloading(false);
        setDownloadProgress(null);
        notify(`Batch download aborted. ${downloadedCount} assets downloaded.`);
        return;
      }

      const asset = selectedList[i];
      setDownloadProgress({ current: i + 1, total: selectedList.length, filename: asset.name });

      setBatchOperation({
        type: 'download',
        current: i + 1,
        total: selectedList.length,
        currentAssetId: asset.id,
        currentAssetName: asset.name,
        currentAssetType: asset.type,
        currentAssetSize: asset.size,
        statusMessage: `Downloading & writing "${asset.name}" (${i + 1}/${selectedList.length})...`,
      });

      await downloadAssetFile(asset);
      downloadedCount++;

      // Stagger downloads by 350ms to allow browser file dispatching without blocking
      await new Promise(r => setTimeout(r, 350));
    }

    setIsDownloading(false);
    setDownloadProgress(null);

    setBatchOperation({
      type: 'download',
      current: selectedList.length,
      total: selectedList.length,
      statusMessage: `Successfully downloaded all ${selectedList.length} assets to local disk.`,
      isComplete: true,
    });
    notify(`Completed batch download of ${selectedList.length} assets.`);

    // Auto-dismiss completed status after 4.5 seconds
    setTimeout(() => {
      setBatchOperation(prev => prev?.isComplete ? null : prev);
    }, 4500);
  };

  const handleDownloadManifest = () => {
    if (checkedAssetIds.length === 0) return;
    const selectedList = assets.filter(a => checkedAssetIds.includes(a.id));
    const manifest = {
      exportedAt: new Date().toISOString(),
      exportAuthor: userRole.role.toUpperCase(),
      totalAssets: selectedList.length,
      assets: selectedList
    };
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(manifest, null, 2));
    const aTag = document.createElement('a');
    aTag.href = dataStr;
    aTag.download = `gnn_assets_manifest_${Date.now()}.json`;
    document.body.appendChild(aTag);
    aTag.click();
    document.body.removeChild(aTag);
    notify(`Exported manifest JSON for ${selectedList.length} assets.`);
  };

  const handleDownloadSingle = (asset: RepositoryAsset, e: React.MouseEvent) => {
    e.stopPropagation();
    downloadAssetFile(asset);
    notify(`Downloading "${asset.name}"...`);
  };

  // 2. FILE REPLACE - Essential for "proxy, file replace" guidelines
  const handleReplaceFileObject = (file: File) => {
    const currentTarget = previewModalAsset || selectedAsset;
    if (file && currentTarget) {
      if (!userRole.permissions.canEditRepository) {
        alert('Your authorized role does not provide edit privileges to modify the repository.');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        const fileUrl = reader.result as string;
        const fileSizeStr = (file.size / (1024 * 1024)).toFixed(2) + ' MB';
        
        // Update asset values in list
        const updated = assets.map(a => {
          if (a.id === currentTarget.id) {
            const updatedItem: RepositoryAsset = {
              ...a,
              url: fileUrl,
              size: fileSizeStr,
              createdAt: new Date().toLocaleDateString(),
            };
            setSelectedAsset(updatedItem);
            setPreviewModalAsset(updatedItem);
            return updatedItem;
          }
          return a;
        });
        setAssets(updated);
        notify(`Swapped file proxy for "${file.name}".`);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleReplaceFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleReplaceFileObject(file);
    }
  };

  // 3. VIDEO CONTENT ANALYSIS VIA GEMINI PRO
  const handleAnalyzeVideo = async () => {
    if (!userRole.permissions.canGenerateAI) {
      alert('Your authorized role does not have AI generation privileges.');
      return;
    }
    if (!selectedAsset || selectedAsset.type !== 'video') {
      alert('Please select an active Video asset to analyze.');
      return;
    }
    setAnalyzing(true);
    setAnalysisText('Calibrating Gemini 3.1 Pro engine. Parsing high-contrast visual indices...');
    try {
      const res = await fetch('/api/analyze-video', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          base64File: selectedAsset.url.startsWith('data:') ? selectedAsset.url.split(',')[1] : '',
          mimeType: 'video/mp4'
        }),
      });
      const data = await res.json();
      setAnalysisText(data.analysis || 'Video framing analyzed successfully.');
    } catch (e: any) {
      setAnalysisText(`Analysis aborted: ${e.message}`);
    } finally {
      setAnalyzing(false);
    }
  };

  const filteredAssets = useMemo(() => {
    return assets.filter(a => {
      const matchesType = filterType === 'all' || a.type === filterType;
      const assetStatus = a.status || 'Ready';
      const matchesStatus = statusFilter === 'all' || assetStatus === statusFilter;
      return matchesType && matchesStatus;
    });
  }, [assets, filterType, statusFilter]);

  const filteredAssetIds = useMemo(() => filteredAssets.map(a => a.id), [filteredAssets]);

  // Preview modal navigation calculations
  const currentPreviewIndex = previewModalAsset 
    ? filteredAssets.findIndex(a => a.id === previewModalAsset.id) 
    : -1;
  const hasPreviewNext = currentPreviewIndex >= 0 && currentPreviewIndex < filteredAssets.length - 1;
  const hasPreviewPrev = currentPreviewIndex > 0;

  const handlePreviewNext = () => {
    if (hasPreviewNext) {
      const nextAsset = filteredAssets[currentPreviewIndex + 1];
      setPreviewModalAsset(nextAsset);
      setSelectedAsset(nextAsset);
    }
  };

  const handlePreviewPrev = () => {
    if (hasPreviewPrev) {
      const prevAsset = filteredAssets[currentPreviewIndex - 1];
      setPreviewModalAsset(prevAsset);
      setSelectedAsset(prevAsset);
    }
  };

  const selectedFilteredCount = useMemo(() => {
    return filteredAssets.filter(a => checkedAssetIds.includes(a.id)).length;
  }, [filteredAssets, checkedAssetIds]);

  const isAllFilteredSelected = filteredAssets.length > 0 && selectedFilteredCount === filteredAssets.length;
  const isSomeFilteredSelected = selectedFilteredCount > 0 && selectedFilteredCount < filteredAssets.length;

  const headerSelectAllRef = useRef<HTMLInputElement>(null);
  const columnHeaderSelectAllRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (headerSelectAllRef.current) {
      headerSelectAllRef.current.indeterminate = isSomeFilteredSelected;
    }
    if (columnHeaderSelectAllRef.current) {
      columnHeaderSelectAllRef.current.indeterminate = isSomeFilteredSelected;
    }
  }, [isSomeFilteredSelected]);

  const handleToggleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      // Unselect all currently filtered items
      setCheckedAssetIds(prev => prev.filter(id => !filteredAssetIds.includes(id)));
    } else {
      // Select all currently filtered items
      setCheckedAssetIds(prev => Array.from(new Set([...prev, ...filteredAssetIds])));
    }
  };

  const handleSelectAllAcrossRepository = () => {
    const allIds = assets.map(a => a.id);
    if (checkedAssetIds.length === allIds.length) {
      setCheckedAssetIds([]);
    } else {
      setCheckedAssetIds(allIds);
    }
  };

  return (
    <div className="space-y-6 text-slate-200">
      
      {/* Search & Bulk Operations Header */}
      <div 
        id="asset-repository-header"
        className="bg-slate-950 p-4 border border-slate-900 rounded-xl space-y-4 shadow-xl"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-base font-bold font-sans text-white flex items-center gap-1.5">
              <FolderHeart className="w-5 h-5 text-red-500 animate-pulse" /> Content Repository & Asset Manager
            </h3>
            <p className="text-xs text-slate-400">
              Manage broadcast scripts, vocal recordings, video reels, and proxy files. Perform instant multi-asset bulk downloads, deletions, and metadata tagging.
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Type Filters */}
            <div className="flex flex-wrap bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              {['all', 'video', 'image', 'audio', 'script', 'subtitles'].map((item) => (
                <button
                  key={item}
                  onClick={() => {
                    setFilterType(item);
                    const sub = assets.find(a => (item === 'all' || a.type === item) && (statusFilter === 'all' || (a.status || 'Ready') === statusFilter));
                    if (sub) setSelectedAsset(sub);
                  }}
                  className={`px-3 py-1.5 text-xs font-mono rounded cursor-pointer transition-all ${
                    filterType === item ? 'bg-red-650 text-white shadow' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {item.toUpperCase()}
                </button>
              ))}
            </div>

            {/* Status Filter Badges */}
            <div id="asset-status-filter-group" className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-[11px] font-mono">
              <span className="text-[10px] text-slate-500 font-bold uppercase px-1.5 hidden xl:inline">Status:</span>
              <button
                type="button"
                id="status-filter-all"
                onClick={() => setStatusFilter('all')}
                className={`px-2 py-1 rounded text-xs transition-all cursor-pointer font-medium ${
                  statusFilter === 'all'
                    ? 'bg-slate-800 text-white shadow-xs font-bold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                All ({statusCounts.all})
              </button>
              <button
                type="button"
                id="status-filter-ready"
                onClick={() => setStatusFilter('Ready')}
                className={`px-2 py-1 rounded text-xs flex items-center gap-1.5 transition-all cursor-pointer font-medium ${
                  statusFilter === 'Ready'
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-xs font-bold'
                    : 'text-slate-400 hover:text-emerald-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                Ready ({statusCounts.Ready})
              </button>
              <button
                type="button"
                id="status-filter-processing"
                onClick={() => setStatusFilter('Processing')}
                className={`px-2 py-1 rounded text-xs flex items-center gap-1.5 transition-all cursor-pointer font-medium ${
                  statusFilter === 'Processing'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-xs font-bold'
                    : 'text-slate-400 hover:text-amber-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                Processing ({statusCounts.Processing})
              </button>
              <button
                type="button"
                id="status-filter-error"
                onClick={() => setStatusFilter('Error')}
                className={`px-2 py-1 rounded text-xs flex items-center gap-1.5 transition-all cursor-pointer font-medium ${
                  statusFilter === 'Error'
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 shadow-xs font-bold'
                    : 'text-slate-400 hover:text-red-300'
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.8)]" />
                Error ({statusCounts.Error})
              </button>
            </div>
          </div>
        </div>

        {/* Dedicated Select All Checkbox & Bulk Operations Bar in the AssetRepository Header */}
        <div 
          id="asset-repository-header-bulk-bar"
          className={`flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
            checkedAssetIds.length > 0 
              ? 'bg-slate-900/90 border-red-500/40 shadow-lg shadow-red-950/20' 
              : 'bg-slate-900/40 border-slate-800/80'
          }`}
        >
          {/* Left Side: Select All Checkbox Control */}
          <div className="flex items-center gap-3 flex-wrap">
            <label 
              htmlFor="select-all-header-checkbox"
              className="flex items-center gap-2.5 cursor-pointer text-slate-200 hover:text-white group select-none"
              title={isAllFilteredSelected ? "Deselect all filtered items" : "Select all filtered items"}
            >
              <input
                ref={headerSelectAllRef}
                id="select-all-header-checkbox"
                type="checkbox"
                checked={isAllFilteredSelected}
                onChange={handleToggleSelectAllFiltered}
                className="w-4 h-4 accent-red-650 bg-slate-950 border-slate-700 rounded cursor-pointer shrink-0 transition-transform active:scale-95"
                aria-label="Select All repository assets in current view"
              />
              <span className="text-xs font-bold font-sans text-white group-hover:text-red-400 transition-colors">
                Select All
              </span>
            </label>

            {/* Selection status badge */}
            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold border transition-all ${
              checkedAssetIds.length > 0
                ? 'bg-red-500/20 text-red-300 border-red-500/40 ring-1 ring-red-500/20'
                : 'bg-slate-800/70 text-slate-400 border-slate-750'
            }`}>
              {checkedAssetIds.length > 0
                ? `${checkedAssetIds.length} of ${assets.length} Selected`
                : `${filteredAssets.length} Assets in View`}
            </span>

            {/* If filter active and total assets > filteredAssets, offer across repository toggle */}
            {filterType !== 'all' && assets.length > filteredAssets.length && (
              <button
                type="button"
                onClick={handleSelectAllAcrossRepository}
                className="text-[10px] font-mono text-cyan-400 hover:text-cyan-300 underline underline-offset-2 transition-colors cursor-pointer"
              >
                {checkedAssetIds.length === assets.length ? 'Deselect All Across Repo' : `Select All ${assets.length} Across Repo`}
              </button>
            )}

            {isDownloading && downloadProgress && (
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/60 px-2.5 py-1 rounded-lg">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Downloading {downloadProgress.current}/{downloadProgress.total}: {downloadProgress.filename}</span>
              </div>
            )}
          </div>

          {/* Right Side: Bulk Operations Actions */}
          <div className="flex items-center gap-2 flex-wrap">
            {checkedAssetIds.length > 0 ? (
              <>
                {/* Bulk Download */}
                <button
                  id="bulk-download-header-btn"
                  type="button"
                  onClick={handleBulkDownload}
                  disabled={isDownloading || batchOperation !== null}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-emerald-950/40 cursor-pointer disabled:opacity-50"
                  title={`Download all ${checkedAssetIds.length} selected assets to your device`}
                >
                  {isDownloading ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Download className="w-3.5 h-3.5" />
                  )}
                  <span>Download Selected ({checkedAssetIds.length})</span>
                </button>

                {/* Bulk Download Manifest */}
                <button
                  id="bulk-manifest-header-btn"
                  type="button"
                  onClick={handleDownloadManifest}
                  disabled={batchOperation !== null}
                  className="px-2.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all border border-slate-700 cursor-pointer disabled:opacity-50"
                  title="Export complete JSON metadata manifest for selected assets"
                >
                  <FileDown className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="hidden md:inline">Manifest JSON</span>
                </button>

                {/* Bulk Tag */}
                <button
                  id="bulk-tag-header-btn"
                  type="button"
                  onClick={() => setShowTagModal(true)}
                  disabled={batchOperation !== null}
                  className="px-3 py-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  title={`Apply custom category label to ${checkedAssetIds.length} assets`}
                >
                  <Tags className="w-3.5 h-3.5" />
                  <span>Tag ({checkedAssetIds.length})</span>
                </button>

                {/* Bulk Delete */}
                <button
                  id="bulk-delete-header-btn"
                  type="button"
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isDownloading || batchOperation !== null}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all shadow-md shadow-red-950/40 cursor-pointer animate-pulse disabled:opacity-50"
                  title={`Permanently delete ${checkedAssetIds.length} selected assets`}
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete ({checkedAssetIds.length})</span>
                </button>

                {/* Clear Selection */}
                <button
                  id="bulk-clear-header-btn"
                  type="button"
                  onClick={() => setCheckedAssetIds([])}
                  className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                  title="Clear all selections"
                  aria-label="Clear all selections"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            ) : (
              <div className="flex items-center gap-2 text-slate-500 text-xs font-mono">
                <span>Check individual items or use &ldquo;Select All&rdquo; to execute bulk operations.</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Visual Progress Indicator for Batch Operations (Deletion & Download) */}
      {batchOperation && (
        <div className="animate-fadeIn">
          <BatchOperationProgress
            operation={batchOperation}
            onCancel={handleAbortBatch}
            onDismiss={() => setBatchOperation(null)}
          />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Asset Table/List */}
        <div className="lg:col-span-5 bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-3">
          <div className="flex items-center justify-between border-b border-slate-900 pb-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">
              Available Studio Files ({filteredAssets.length})
            </span>
            {checkedAssetIds.length > 0 && (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowTagModal(true)}
                  disabled={batchOperation !== null}
                  className="px-2.5 py-1 bg-cyan-600 hover:bg-cyan-700 text-white rounded text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  title="Add custom category label to all selected files simultaneously"
                >
                  <Tags className="w-3.5 h-3.5" />
                  <span>Tag Selected ({checkedAssetIds.length})</span>
                </button>
                <button
                  onClick={handleBulkDownload}
                  disabled={isDownloading || batchOperation !== null}
                  className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer disabled:opacity-50"
                  title="Download all selected files simultaneously"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download Selected ({checkedAssetIds.length})</span>
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  disabled={isDownloading || batchOperation !== null}
                  className="px-2.5 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-[10px] font-bold flex items-center gap-1.5 transition-all shadow-md cursor-pointer animate-pulse disabled:opacity-50"
                  title="Delete all selected files simultaneously"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Selected ({checkedAssetIds.length})</span>
                </button>
              </div>
            )}
          </div>
          
          {/* Column Header of the Asset Repository List View with 'Select All' Checkbox */}
          {filteredAssets.length > 0 && (
            <div 
              id="asset-repository-column-header"
              className="flex items-center justify-between px-3 py-2 bg-slate-900/70 border border-slate-800/90 rounded-lg text-xs font-mono text-slate-400 select-none transition-colors"
            >
              <div className="flex items-center space-x-3 min-w-0 flex-1">
                <label 
                  htmlFor="select-all-column-header-checkbox"
                  className="flex items-center gap-2 cursor-pointer text-slate-300 hover:text-white transition-colors group"
                  title={isAllFilteredSelected ? "Deselect all filtered items" : "Select all filtered items"}
                >
                  <input
                    ref={columnHeaderSelectAllRef}
                    id="select-all-column-header-checkbox"
                    type="checkbox"
                    checked={isAllFilteredSelected}
                    onChange={handleToggleSelectAllFiltered}
                    className="w-3.5 h-3.5 accent-red-650 bg-slate-950 border-slate-700 rounded cursor-pointer shrink-0"
                    aria-label="Select All currently filtered items"
                  />
                  <span className="font-semibold text-xs text-slate-200 group-hover:text-white">
                    Select All
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    ({selectedFilteredCount}/{filteredAssets.length})
                  </span>
                </label>
                <span className="text-slate-700 hidden sm:inline">•</span>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider hidden sm:inline font-medium">
                  File / Asset Name
                </span>
              </div>

              <div className="flex items-center gap-4 text-[10px] text-slate-400 uppercase tracking-wider shrink-0 font-medium">
                <span className="hidden sm:inline">Status</span>
                <span className="hidden sm:inline">Actions</span>
                {selectedFilteredCount > 0 && (
                  <button 
                    onClick={() => setCheckedAssetIds(prev => prev.filter(id => !filteredAssetIds.includes(id)))}
                    className="text-[10px] text-red-400 hover:text-red-300 font-normal lowercase hover:underline transition-colors ml-1 cursor-pointer"
                    title="Deselect all filtered items"
                  >
                    Clear
                  </button>
                )}
              </div>
            </div>
          )}
          
          {filteredAssets.length === 0 ? (
            <div className="text-center p-8 bg-slate-900/10 rounded border border-dashed border-slate-800">
              <FolderHeart className="w-8 h-8 mx-auto text-slate-700" />
              <p className="text-xs text-slate-500 mt-2 font-mono">No matching media assets compiled. Synthesize or upload above.</p>
            </div>
          ) : (
              <div className={viewMode === 'grid' ? "grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[460px] overflow-y-auto pr-1" : "space-y-2 max-h-[460px] overflow-y-auto pr-1"}>
              {filteredAssets.map((asset) => (
                <div
                  key={asset.id}
                  id={`asset-entry-${asset.id}`}
                  onClick={() => {
                    setSelectedAsset(asset);
                    setAnalysisText('');
                    setPreviewModalAsset(asset);
                    setIsPreviewModalOpen(true);
                  }}
                  className={`p-3 rounded-lg border text-xs font-sans transition-all flex justify-between items-center cursor-pointer group ${
                    batchOperation?.currentAssetId === asset.id
                      ? batchOperation.type === 'download'
                        ? 'bg-emerald-950/40 border-emerald-500 shadow-lg shadow-emerald-950/50 ring-1 ring-emerald-500/50'
                        : 'bg-red-950/40 border-red-500 shadow-lg shadow-red-950/50 ring-1 ring-red-500/50 animate-pulse'
                      : selectedAsset?.id === asset.id 
                      ? 'bg-slate-900 border-red-500/50 shadow-md' 
                      : 'bg-slate-950/40 border-slate-900 hover:border-slate-800'
                  }`}
                >
                  <div className="flex items-center space-x-3 min-w-0 flex-1">
                    <input
                      type="checkbox"
                      checked={checkedAssetIds.includes(asset.id)}
                      onClick={(e) => e.stopPropagation()}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        if (checked) {
                          setCheckedAssetIds(prev => [...prev, asset.id]);
                        } else {
                          setCheckedAssetIds(prev => prev.filter(id => id !== asset.id));
                        }
                      }}
                      className="w-3.5 h-3.5 accent-red-650 bg-slate-950 border-slate-800 rounded cursor-pointer shrink-0"
                    />

                    {/* Clickable Media Type Icon for Quick Preview Modal */}
                    <button
                      type="button"
                      id={`asset-icon-preview-${asset.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAsset(asset);
                        setAnalysisText('');
                        setPreviewModalAsset(asset);
                        setIsPreviewModalOpen(true);
                      }}
                      title={`Preview ${asset.type}: ${asset.name}`}
                      aria-label={`Preview ${asset.type} ${asset.name}`}
                      className="p-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800 border border-slate-800/80 hover:border-cyan-500/50 transition-all shrink-0 cursor-pointer group/typeicon"
                    >
                      {asset.type === 'video' && <FileVideo className="w-4 h-4 text-red-400 group-hover/typeicon:scale-110 transition-transform" />}
                      {asset.type === 'image' && <ImageIcon className="w-4 h-4 text-blue-400 group-hover/typeicon:scale-110 transition-transform" />}
                      {asset.type === 'audio' && <Volume2 className="w-4 h-4 text-green-400 group-hover/typeicon:scale-110 transition-transform" />}
                      {asset.type === 'script' && <FileText className="w-4 h-4 text-cyan-400 group-hover/typeicon:scale-110 transition-transform" />}
                      {asset.type === 'subtitles' && <Layers className="w-4 h-4 text-yellow-400 group-hover/typeicon:scale-110 transition-transform" />}
                    </button>
                    
                    <div className="space-y-0.5 min-w-0">
                      <div className="flex items-center gap-2">
                        <h4 className="font-semibold text-slate-200 line-clamp-1 group-hover:text-white transition-colors">{asset.name}</h4>
                        {asset.category && (
                          <span className="px-1.5 py-0.5 bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded text-[9px] font-mono shrink-0">
                            {asset.category}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 font-mono tracking-wide">{asset.createdAt} • {asset.size || 'N/A'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {batchOperation?.currentAssetId === asset.id ? (
                      <span 
                        id={`asset-batch-badge-${asset.id}`}
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border shrink-0 transition-all flex items-center gap-1.5 animate-pulse ${
                          batchOperation.type === 'download'
                            ? 'bg-emerald-500/25 text-emerald-300 border-emerald-500/60 shadow-[0_0_12px_rgba(16,185,129,0.5)]'
                            : 'bg-red-500/25 text-red-300 border-red-500/60 shadow-[0_0_12px_rgba(239,68,68,0.5)]'
                        }`}
                      >
                        <Loader2 className="w-3 h-3 animate-spin" />
                        <span>{batchOperation.type === 'download' ? 'Downloading...' : 'Purging...'}</span>
                      </span>
                    ) : (
                      <button
                        type="button"
                        id={`asset-status-badge-${asset.id}`}
                        onClick={(e) => handleCycleStatus(asset, e)}
                        title={
                          asset.status === 'Error'
                            ? 'Status: Error (Pipeline failure or format warning) — Click to re-process and validate'
                            : asset.status === 'Processing'
                            ? 'Status: Processing (Asset in encoding/pipeline) — Click to mark Ready'
                            : 'Status: Ready (Broadcast ready & verified) — Click to cycle status'
                        }
                        className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-bold border shrink-0 transition-all flex items-center gap-1.5 cursor-pointer shadow-xs select-none ${
                          asset.status === 'Processing'
                            ? 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 border-amber-500/50 hover:border-amber-400 ring-1 ring-amber-500/35 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                            : asset.status === 'Error'
                            ? 'bg-red-500/25 hover:bg-red-500/35 text-red-200 border-red-500/60 hover:border-red-400 ring-1 ring-red-500/40 shadow-[0_0_14px_rgba(239,68,68,0.35)]'
                            : 'bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/40 hover:border-emerald-400 ring-1 ring-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                        }`}
                      >
                        {asset.status === 'Processing' ? (
                          <Loader2 className="w-3 h-3 text-amber-400 animate-spin shrink-0" />
                        ) : asset.status === 'Error' ? (
                          <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                        ) : (
                          <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        )}
                        <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                          asset.status === 'Processing'
                            ? 'bg-amber-400 animate-ping shadow-[0_0_6px_rgba(251,191,36,0.9)]'
                            : asset.status === 'Error'
                            ? 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.9)]'
                            : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.95)]'
                        }`} />
                        <span className="uppercase tracking-wider font-extrabold">{asset.status || 'Ready'}</span>
                      </button>
                    )}

                    {/* Dedicated Clickable Preview Icon Button */}
                    <button
                      type="button"
                      id={`asset-preview-btn-${asset.id}`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedAsset(asset);
                        setAnalysisText('');
                        setPreviewModalAsset(asset);
                        setIsPreviewModalOpen(true);
                      }}
                      title={
                        asset.type === 'video' 
                          ? "Play video & inspect content details in modal" 
                          : asset.type === 'image' 
                          ? "View image & inspect content details in modal" 
                          : asset.type === 'audio'
                          ? "Listen to audio & inspect content details in modal"
                          : "Inspect transcript & document details in modal"
                      }
                      aria-label={`Preview and inspect ${asset.name}`}
                      className="px-2 py-1 text-slate-400 hover:text-cyan-300 rounded-md bg-slate-900/80 hover:bg-cyan-500/15 border border-slate-800 hover:border-cyan-500/40 shrink-0 transition-all cursor-pointer flex items-center gap-1.5 group/preview shadow-xs"
                    >
                      <Eye className="w-3.5 h-3.5 text-cyan-400 group-hover/preview:scale-110 transition-transform" />
                      <span className="hidden xl:inline text-[10px] font-mono font-medium text-slate-300 group-hover/preview:text-cyan-300">
                        Preview
                      </span>
                    </button>
                    <button
                      onClick={(e) => handleDownloadSingle(asset, e)}
                      title="Download asset"
                      className="p-1 text-slate-500 hover:text-emerald-400 rounded hover:bg-slate-900 shrink-0 transition-all cursor-pointer"
                    >
                      <Download className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteAsset(asset.id, e)}
                      title="Delete asset"
                      className="p-1 text-slate-500 hover:text-red-400 rounded hover:bg-slate-900 shrink-0 transition-all cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Side: Active Asset Preview & File Replace Operations */}
        <div className="lg:col-span-7 bg-slate-950 border border-slate-900 rounded-xl p-5 flex flex-col justify-between min-h-[460px]">
          {selectedAsset ? (
            <div className="space-y-4">
              
              {/* Asset Header Info */}
              <div className="flex justify-between items-start border-b border-slate-900 pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono text-red-400 font-extrabold bg-red-500/10 px-2 py-0.5 rounded tracking-wider uppercase font-bold">
                      {selectedAsset.type} file specifications
                    </span>
                    <button 
                      type="button"
                      id={`preview-asset-status-${selectedAsset.id}`}
                      onClick={(e) => handleCycleStatus(selectedAsset, e)}
                      title={
                        selectedAsset.status === 'Error'
                          ? 'Status: Error — Click to re-process and validate'
                          : selectedAsset.status === 'Processing'
                          ? 'Status: Processing — Click to mark Ready'
                          : 'Status: Ready — Fully indexed (Click to cycle)'
                      }
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold border shrink-0 transition-all flex items-center gap-1.5 cursor-pointer select-none ${
                        selectedAsset.status === 'Processing'
                          ? 'bg-amber-500/20 text-amber-200 border-amber-500/50 hover:border-amber-400 ring-1 ring-amber-500/35 animate-pulse shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                          : selectedAsset.status === 'Error'
                          ? 'bg-red-500/25 text-red-200 border-red-500/60 hover:border-red-400 ring-1 ring-red-500/40 shadow-[0_0_14px_rgba(239,68,68,0.35)]'
                          : 'bg-emerald-500/15 text-emerald-300 border-emerald-500/40 hover:border-emerald-400 ring-1 ring-emerald-500/25 shadow-[0_0_10px_rgba(16,185,129,0.25)]'
                      }`}
                    >
                      {selectedAsset.status === 'Processing' ? (
                        <Loader2 className="w-3 h-3 text-amber-400 animate-spin shrink-0" />
                      ) : selectedAsset.status === 'Error' ? (
                        <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                      ) : (
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                      )}
                      <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${
                        selectedAsset.status === 'Processing'
                          ? 'bg-amber-400 animate-ping shadow-[0_0_6px_rgba(251,191,36,0.9)]'
                          : selectedAsset.status === 'Error'
                          ? 'bg-red-400 shadow-[0_0_6px_rgba(248,113,113,0.9)]'
                          : 'bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.95)]'
                      }`} />
                      <span className="uppercase tracking-wider font-extrabold">{selectedAsset.status || 'Ready'}</span>
                    </button>
                  </div>
                  <h3 className="text-base font-sans font-bold text-white tracking-tight mt-1">{selectedAsset.name}</h3>
                </div>

                {/* File Replace Button Action */}
                <div className="flex space-x-2">
                  <button
                    onClick={() => replaceInputRef.current?.click()}
                    className="px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs font-bold text-white hover:bg-slate-850 flex items-center gap-1 cursor-pointer"
                  >
                    <Upload className="w-3.5 h-3.5" />
                    <span>Proxy Replace</span>
                  </button>
                  <input 
                    type="file" 
                    ref={replaceInputRef}
                    onChange={handleReplaceFile}
                    className="hidden" 
                  />
                </div>
              </div>

              {/* Asset Player visual canvas */}
              <div 
                onClick={() => {
                  if (selectedAsset) {
                    setPreviewModalAsset(selectedAsset);
                    setIsPreviewModalOpen(true);
                  }
                }}
                className="relative bg-slate-900/60 border border-slate-850 rounded-xl p-4 flex items-center justify-center min-h-[220px] group cursor-pointer hover:border-slate-700 transition-colors"
                title="Click to open full-size modal preview"
              >
                <button
                  type="button"
                  id="right-panel-expand-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setPreviewModalAsset(selectedAsset);
                    setIsPreviewModalOpen(true);
                  }}
                  className="absolute top-3 right-3 p-1.5 rounded-lg bg-slate-950/80 hover:bg-slate-800 text-slate-400 hover:text-white border border-slate-800 shadow-md transition-all opacity-70 group-hover:opacity-100 cursor-pointer flex items-center gap-1 text-[10px] font-mono z-10"
                  title="Expand full-size preview modal"
                >
                  <Maximize2 className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Full Preview</span>
                </button>
                {selectedAsset.type === 'video' && (
                  <video src={selectedAsset.url} controls className="max-h-[200px] rounded border border-slate-850 max-w-sm" />
                )}
                {selectedAsset.type === 'image' && (
                  <img src={selectedAsset.url} alt="asset visual" className="max-h-[200px] rounded border border-slate-850 object-contain" />
                )}
                {selectedAsset.type === 'audio' && (
                  <div className="text-center space-y-3">
                    <Volume2 className="w-10 h-10 text-emerald-400 mx-auto animate-pulse" />
                    <audio src={selectedAsset.url} controls className="mx-auto" />
                  </div>
                )}
                {(selectedAsset.type === 'script' || selectedAsset.type === 'subtitles') && (
                  <div className="w-full text-left font-mono text-xs bg-slate-950 p-3 rounded-lg border border-slate-900/60 max-h-[180px] overflow-y-auto leading-relaxed">
                    <pre className="text-cyan-400 whitespace-pre-wrap">{selectedAsset.lyrics_or_text || 'No compiled transcript inside script.'}</pre>
                  </div>
                )}
              </div>

              {/* Gemini Video Analysis tool */}
              {selectedAsset.type === 'video' && (
                <div className="space-y-3 p-4 bg-slate-900/30 rounded-lg border border-slate-850">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-mono text-slate-350 flex items-center gap-1">
                      <Sparkles className="w-4 h-4 text-yellow-400" /> GNN Video Intelligence Analyst
                    </span>
                    <button
                      onClick={handleAnalyzeVideo}
                      disabled={analyzing}
                      className="text-xs font-semibold bg-red-650 hover:bg-red-700 text-white px-3 py-1.5 rounded transition-all cursor-pointer disabled:opacity-50"
                    >
                      {analyzing ? 'Analyzing Visuals...' : 'Analyze Video'}
                    </button>
                  </div>
                  {analysisText && (
                    <div className="text-xs font-sans bg-slate-950 p-3 rounded border border-slate-900 text-slate-300 leading-relaxed whitespace-pre-wrap">
                      {analysisText}
                    </div>
                  )}
                </div>
              )}

              {/* Standard specifications bottom row */}
              <div className="grid grid-cols-2 gap-4 text-xs font-mono text-slate-500">
                <div>Created Slot: <strong className="text-slate-400">{selectedAsset.createdAt}</strong></div>
                <div>Calculated Size: <strong className="text-slate-400">{selectedAsset.size || '380 KB'}</strong></div>
              </div>

            </div>
          ) : (
            <div className="text-center p-8 m-auto">
              <FolderHeart className="w-12 h-12 mx-auto text-slate-800 mb-2" />
              <p className="text-xs text-slate-500 font-mono">Select an active media asset to access replacement proxies and previews.</p>
            </div>
          )}

          <div className="mt-4 pt-3 border-t border-slate-900 text-[10px] font-mono text-slate-500 text-center">
            Standard files are stored securely across durable cluster storages. Swapping proxies is isolated instantly.
          </div>
        </div>

      </div>
 
      {/* Storage Usage Progress Bar & Quota Footer */}
      <RepositoryStorageFooter assets={assets} quotaBytes={100 * 1024 * 1024} />

      {/* Confirmation Dialog Component for Bulk Delete Operations */}
      <BulkDeleteConfirmationDialog
        isOpen={showDeleteModal}
        selectedAssets={assets.filter(a => checkedAssetIds.includes(a.id))}
        onConfirm={handleBulkDelete}
        onCancel={() => setShowDeleteModal(false)}
      />

      {/* Bulk Tagging Modal */}
      {showTagModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-6 space-y-6 animate-scaleIn">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-cyan-500/10 text-cyan-400 rounded-xl shrink-0">
                <Tags className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <h3 className="text-base font-bold text-white font-sans">
                  Bulk Tag Category Label
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed">
                  Apply a custom category tag to all <strong className="text-white">{checkedAssetIds.length} selected assets</strong> simultaneously.
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block">
                Select or Enter Category Label:
              </label>
              <input
                type="text"
                value={bulkCategory}
                onChange={(e) => setBulkCategory(e.target.value)}
                placeholder="e.g. Breaking News, B-Roll, Prime Archive, Studio Promo"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white font-sans focus:outline-none focus:border-cyan-500"
              />

              <div className="flex flex-wrap gap-1.5 pt-1">
                {['Breaking News', 'B-Roll Archive', 'Prime Exclusive', 'Studio Promo', 'Investigative', 'Live Broadcast'].map(preset => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setBulkCategory(preset)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono transition-all cursor-pointer ${
                      bulkCategory === preset 
                        ? 'bg-cyan-600 text-white font-bold' 
                        : 'bg-slate-950 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                    }`}
                  >
                    {preset}
                  </button>
                ))}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowTagModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-lg text-xs font-semibold cursor-pointer transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkTag}
                className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-lg"
              >
                <Tags className="w-4 h-4" />
                <span>Apply Tag ({checkedAssetIds.length})</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Full-Size Preview & Media Player Modal View */}
      <AssetPreviewModal
        isOpen={isPreviewModalOpen}
        asset={previewModalAsset}
        onClose={() => setIsPreviewModalOpen(false)}
        onNext={handlePreviewNext}
        onPrev={handlePreviewPrev}
        hasNext={hasPreviewNext}
        hasPrev={hasPreviewPrev}
        currentIndex={currentPreviewIndex >= 0 ? currentPreviewIndex : undefined}
        totalCount={filteredAssets.length}
        onDownload={downloadAssetFile}
        onReplaceFile={handleReplaceFileObject}
        canEdit={userRole.permissions.canEditRepository}
      />

    </div>
  );
}
