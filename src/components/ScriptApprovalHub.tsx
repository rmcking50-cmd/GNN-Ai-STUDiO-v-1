import React, { useState, useEffect } from 'react';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  FileText, 
  AlertCircle, 
  Send, 
  History, 
  Eye, 
  Search, 
  Filter, 
  ShieldCheck, 
  UserCheck, 
  RefreshCw, 
  Check, 
  X, 
  ChevronRight, 
  MessageSquare, 
  Sparkles,
  Calendar,
  Layers,
  ArrowRight,
  ExternalLink,
  Volume2
} from 'lucide-react';
import { GeneratedScript, ScriptApprovalStatus, ScriptAuditLog, UserRolePayload } from '../types';

interface ScriptApprovalHubProps {
  userRole: UserRolePayload;
  scripts: GeneratedScript[];
  setScripts: React.Dispatch<React.SetStateAction<GeneratedScript[]>>;
  onAddAsset?: (asset: any) => void;
  onNavigateTab?: (tab: string) => void;
  triggerToast: (msg: string) => void;
}

export default function ScriptApprovalHub({
  userRole,
  scripts,
  setScripts,
  onAddAsset,
  onNavigateTab,
  triggerToast
}: ScriptApprovalHubProps) {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedScript, setSelectedScript] = useState<GeneratedScript | null>(null);
  
  // Rejection modal state
  const [showRejectModal, setShowRejectModal] = useState<boolean>(false);
  const [rejectScriptTarget, setRejectScriptTarget] = useState<GeneratedScript | null>(null);
  const [rejectionReason, setRejectionReason] = useState<string>('');
  const [isSubmittingReview, setIsSubmittingReview] = useState<boolean>(false);

  // Approval modal / inline state
  const [approvalNotes, setApprovalNotes] = useState<string>('');
  const [showApproveModal, setShowApproveModal] = useState<boolean>(false);
  const [approveScriptTarget, setApproveScriptTarget] = useState<GeneratedScript | null>(null);

  // Audit log drawer / state
  const [showAuditLogs, setShowAuditLogs] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<ScriptAuditLog[]>([]);
  const [loadingAuditLogs, setLoadingAuditLogs] = useState<boolean>(false);

  // Teleprompter reader preview modal
  const [previewScript, setPreviewScript] = useState<GeneratedScript | null>(null);

  const isPrivileged = userRole.role === 'admin' || userRole.osRole === 'ADMIN' || userRole.osRole === 'OWNER' || userRole.osRole === 'EDITOR';

  // Fetch initial audit logs from server
  const fetchAuditLogs = async () => {
    setLoadingAuditLogs(true);
    try {
      const res = await fetch('/api/scripts/audit-logs');
      const data = await res.json();
      if (data.success && data.auditLogs) {
        setAuditLogs(data.auditLogs);
      }
    } catch (e) {
      console.error('Failed to fetch audit logs:', e);
    } finally {
      setLoadingAuditLogs(false);
    }
  };

  useEffect(() => {
    fetchAuditLogs();
  }, []);

  // Handler to execute script status review (Approve / Reject / Submit)
  const handleReviewAction = async (
    scriptId: string, 
    newStatus: ScriptApprovalStatus, 
    notes?: string, 
    reason?: string
  ) => {
    setIsSubmittingReview(true);
    const reviewerName = userRole.osRole === 'OWNER' ? 'Station Director' : (userRole.osRole === 'ADMIN' ? 'Executive Producer' : 'Editorial Reviewer');
    const reviewerRoleName = userRole.osRole || userRole.role.toUpperCase();

    try {
      const res = await fetch('/api/scripts/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          scriptId,
          status: newStatus,
          reviewer: reviewerName,
          reviewerRole: reviewerRoleName,
          notes: notes || '',
          reason: reason || '',
        }),
      });

      const data = await res.json();

      if (data.success) {
        // Update local script state
        setScripts(prev => prev.map(s => {
          if (s.id === scriptId) {
            return {
              ...s,
              status: newStatus,
              reviewedBy: (newStatus === 'approved' || newStatus === 'rejected') ? reviewerName : s.reviewedBy,
              reviewedAt: (newStatus === 'approved' || newStatus === 'rejected') ? new Date().toISOString() : s.reviewedAt,
              reviewNotes: notes || s.reviewNotes,
              rejectionReason: newStatus === 'rejected' ? (reason || 'Revisions requested') : undefined,
              submittedForReviewAt: newStatus === 'pending_review' ? new Date().toISOString() : s.submittedForReviewAt,
            };
          }
          return s;
        }));

        // Append to audit log state
        if (data.auditLog) {
          setAuditLogs(prev => [data.auditLog, ...prev]);
        }

        const actionText = 
          newStatus === 'approved' ? 'APPROVED for on-air broadcast' :
          newStatus === 'rejected' ? 'REJECTED with feedback' :
          newStatus === 'pending_review' ? 'SUBMITTED for review' : `Status updated to ${newStatus}`;

        triggerToast(`Success: Script ${actionText}. Recorded in backend audit trail.`);
      } else {
        triggerToast(`Review Error: ${data.error || 'Failed to update review status.'}`);
      }
    } catch (e: any) {
      console.error('Error executing script review:', e);
      triggerToast(`Network Error: ${e.message}`);
    } finally {
      setIsSubmittingReview(false);
      setShowRejectModal(false);
      setShowApproveModal(false);
      setRejectScriptTarget(null);
      setApproveScriptTarget(null);
      setRejectionReason('');
      setApprovalNotes('');
    }
  };

  // Status counts
  const countPending = scripts.filter(s => s.status === 'pending_review').length;
  const countApproved = scripts.filter(s => s.status === 'approved').length;
  const countRejected = scripts.filter(s => s.status === 'rejected').length;
  const countDraft = scripts.filter(s => s.status === 'draft' || !s.status).length;
  const countPublished = scripts.filter(s => s.status === 'published').length;

  const filteredScripts = scripts.filter(s => {
    const matchesFilter = 
      activeFilter === 'all' ? true :
      activeFilter === 'pending' ? s.status === 'pending_review' :
      activeFilter === 'approved' ? s.status === 'approved' :
      activeFilter === 'rejected' ? s.status === 'rejected' :
      activeFilter === 'draft' ? (s.status === 'draft' || !s.status) :
      activeFilter === 'published' ? s.status === 'published' : true;

    const matchesSearch = 
      (s.title && s.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.headline && s.headline.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.body && s.body.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.author && s.author.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (s.language && s.language.toLowerCase().includes(searchQuery.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const getStatusBadge = (status?: ScriptApprovalStatus) => {
    switch (status) {
      case 'pending_review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-amber-500/15 text-amber-400 border border-amber-500/30 animate-pulse">
            <Clock className="w-3 h-3" /> Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
            <CheckCircle2 className="w-3 h-3" /> Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-rose-500/15 text-rose-400 border border-rose-500/30">
            <XCircle className="w-3 h-3" /> Rejected
          </span>
        );
      case 'published':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-bold bg-purple-500/15 text-purple-400 border border-purple-500/30">
            <Sparkles className="w-3 h-3" /> Published
          </span>
        );
      case 'draft':
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-mono font-medium bg-slate-800/80 text-slate-300 border border-slate-700">
            <FileText className="w-3 h-3 text-slate-400" /> Draft
          </span>
        );
    }
  };

  return (
    <div className="space-y-6 text-slate-200" id="script-approval-flow-hub">
      
      {/* Top Banner / Metrics Overview */}
      <div className="bg-gradient-to-r from-slate-900/90 via-slate-900/70 to-slate-950 p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-mono font-bold uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
                Editorial Control Room
              </span>
              {countPending > 0 && (
                <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-bounce">
                  <AlertCircle className="w-3 h-3" /> {countPending} Awaiting Decision
                </span>
              )}
            </div>
            <h2 className="text-xl font-bold font-sans text-white tracking-tight flex items-center gap-2">
              <ShieldCheck className="w-6 h-6 text-emerald-400" /> Broadcast Script Approval Workflow
            </h2>
            <p className="text-xs text-slate-400 max-w-2xl leading-relaxed">
              Review and authorize teleprompter scripts before they proceed to TTS voice synthesis, social scheduling, or automated GNN broadcast transmissions.
            </p>
          </div>

          {/* Action buttons on top */}
          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => {
                setShowAuditLogs(!showAuditLogs);
                if (!showAuditLogs) fetchAuditLogs();
              }}
              className={`px-3.5 py-2 rounded-xl text-xs font-mono font-bold flex items-center gap-2 border transition-all cursor-pointer ${
                showAuditLogs 
                  ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-600/30' 
                  : 'bg-slate-950 hover:bg-slate-800 text-slate-300 border-slate-800'
              }`}
            >
              <History className="w-4 h-4 text-blue-400" />
              <span>Audit Log ({auditLogs.length})</span>
            </button>

            {onNavigateTab && (
              <button
                onClick={() => onNavigateTab('news')}
                className="px-3.5 py-2 rounded-xl text-xs font-sans font-bold bg-red-650 hover:bg-red-700 text-white flex items-center gap-1.5 shadow-lg shadow-red-950/40 border border-red-500/30 transition-all cursor-pointer"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Write / Generate Script</span>
              </button>
            )}
          </div>
        </div>

        {/* Workflow Metric Chips */}
        <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-2">
          <button
            onClick={() => setActiveFilter('pending')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeFilter === 'pending'
                ? 'bg-amber-500/15 border-amber-500/50 shadow-md ring-1 ring-amber-500/30'
                : 'bg-slate-950/60 border-slate-850 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-amber-400 mb-1">
              <span>Pending Review</span>
              <Clock className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">{countPending}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Needs producer signoff</div>
          </button>

          <button
            onClick={() => setActiveFilter('approved')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeFilter === 'approved'
                ? 'bg-emerald-500/15 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30'
                : 'bg-slate-950/60 border-slate-850 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-emerald-400 mb-1">
              <span>Approved</span>
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">{countApproved}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Cleared for broadcast</div>
          </button>

          <button
            onClick={() => setActiveFilter('rejected')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeFilter === 'rejected'
                ? 'bg-rose-500/15 border-rose-500/50 shadow-md ring-1 ring-rose-500/30'
                : 'bg-slate-950/60 border-slate-850 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-rose-400 mb-1">
              <span>Rejected</span>
              <XCircle className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">{countRejected}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Requires revisions</div>
          </button>

          <button
            onClick={() => setActiveFilter('draft')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeFilter === 'draft'
                ? 'bg-slate-800 border-slate-600 shadow-md ring-1 ring-slate-500/30'
                : 'bg-slate-950/60 border-slate-850 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
              <span>Drafts</span>
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">{countDraft}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">In composition</div>
          </button>

          <button
            onClick={() => setActiveFilter('all')}
            className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
              activeFilter === 'all'
                ? 'bg-blue-500/15 border-blue-500/50 shadow-md ring-1 ring-blue-500/30'
                : 'bg-slate-950/60 border-slate-850 hover:border-slate-700'
            }`}
          >
            <div className="flex items-center justify-between text-[11px] font-mono text-blue-400 mb-1">
              <span>All Scripts</span>
              <Layers className="w-3.5 h-3.5" />
            </div>
            <div className="text-2xl font-bold font-mono text-white">{scripts.length}</div>
            <div className="text-[10px] text-slate-400 mt-0.5">Total registered</div>
          </button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-950 p-3 rounded-xl border border-slate-900">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search scripts by headline, language, author..."
            className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-red-500 font-sans"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300 text-xs"
            >
              ✕
            </button>
          )}
        </div>

        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mr-1">Status:</span>
          {['all', 'pending', 'approved', 'rejected', 'draft'].map((filterKey) => (
            <button
              key={filterKey}
              onClick={() => setActiveFilter(filterKey)}
              className={`px-2.5 py-1 rounded-lg text-xs font-mono capitalize transition-all cursor-pointer ${
                activeFilter === filterKey
                  ? 'bg-slate-800 text-white font-bold border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              {filterKey === 'pending' ? 'Pending Review' : filterKey}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid: Scripts List */}
      <div className="space-y-4">
        {filteredScripts.length === 0 ? (
          <div className="bg-slate-950 border border-dashed border-slate-850 rounded-2xl p-12 text-center space-y-3">
            <AlertCircle className="w-8 h-8 mx-auto text-slate-600" />
            <h3 className="text-sm font-semibold text-slate-300">No scripts match the current filter</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {searchQuery ? `No scripts found matching "${searchQuery}".` : `There are no scripts in the "${activeFilter}" state.`}
            </p>
            {activeFilter !== 'all' && (
              <button
                onClick={() => { setActiveFilter('all'); setSearchQuery(''); }}
                className="text-xs text-blue-400 hover:underline font-mono"
              >
                Reset all filters
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            {filteredScripts.map((script) => {
              const isPending = script.status === 'pending_review';
              const isApproved = script.status === 'approved';
              const isRejected = script.status === 'rejected';

              return (
                <div
                  key={script.id}
                  id={`script-item-${script.id}`}
                  className={`bg-slate-950 rounded-2xl p-5 border transition-all space-y-4 shadow-lg ${
                    isPending 
                      ? 'border-amber-500/40 hover:border-amber-500/60 bg-gradient-to-r from-amber-500/5 via-slate-950 to-slate-950 ring-1 ring-amber-500/20' 
                      : isApproved
                      ? 'border-emerald-500/30 hover:border-emerald-500/50 bg-gradient-to-r from-emerald-500/5 via-slate-950 to-slate-950'
                      : isRejected
                      ? 'border-rose-500/30 hover:border-rose-500/50 bg-gradient-to-r from-rose-500/5 via-slate-950 to-slate-950'
                      : 'border-slate-850 hover:border-slate-750'
                  }`}
                >
                  {/* Header Row: Badges, Title & Meta */}
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        {getStatusBadge(script.status)}
                        <span className="text-[10px] font-mono font-bold bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800 uppercase">
                          {script.language || 'English'}
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          ID: <strong className="text-slate-400">{script.id}</strong>
                        </span>
                        <span className="text-[10px] font-mono text-slate-500">
                          Created: {script.createdAt}
                        </span>
                      </div>
                      <h3 className="text-base font-bold font-sans text-white tracking-tight">
                        {script.headline || script.title || 'Untitled Broadcast Script'}
                      </h3>
                      {script.author && (
                        <p className="text-xs text-slate-400 font-mono">
                          Author / Desk: <span className="text-slate-300">{script.author}</span>
                        </p>
                      )}
                    </div>

                    {/* Quick Preview Button */}
                    <button
                      onClick={() => setPreviewScript(script)}
                      className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-mono text-slate-300 hover:text-white bg-slate-900 hover:bg-slate-850 border border-slate-800 flex items-center gap-1.5 cursor-pointer transition-all self-start"
                    >
                      <Eye className="w-3.5 h-3.5 text-blue-400" />
                      <span>Teleprompter View</span>
                    </button>
                  </div>

                  {/* Body / Hook Preview */}
                  <div className="bg-slate-900/60 p-3.5 rounded-xl border border-slate-850/80 space-y-2 text-xs">
                    {script.hook && (
                      <p className="text-cyan-300/90 italic font-sans">
                        <strong className="text-cyan-400 not-italic font-mono uppercase text-[10px] tracking-wider block">Opening Hook:</strong>
                        "{script.hook}"
                      </p>
                    )}
                    <p className="text-slate-300 line-clamp-3 leading-relaxed font-sans">
                      {script.body}
                    </p>
                    {script.voiceoverText && (
                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800">
                        <span className="flex items-center gap-1">
                          <Volume2 className="w-3 h-3 text-slate-400" /> Teleprompter Stream: {script.voiceoverText.length} characters
                        </span>
                        <span>Estimated Audio Run: ~{Math.max(10, Math.round(script.voiceoverText.split(' ').length / 2.5))}s</span>
                      </div>
                    )}
                  </div>

                  {/* Review Notes / Rejection Reason Banners */}
                  {isRejected && script.rejectionReason && (
                    <div className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-xl text-xs space-y-1 text-rose-300">
                      <div className="flex items-center gap-1.5 font-bold font-mono text-[11px] text-rose-400 uppercase">
                        <XCircle className="w-3.5 h-3.5" /> Rejection Feedback ({script.reviewedBy || 'Editorial Director'})
                      </div>
                      <p className="font-sans leading-relaxed">{script.rejectionReason}</p>
                    </div>
                  )}

                  {isApproved && script.reviewedBy && (
                    <div className="bg-emerald-500/10 border border-emerald-500/30 p-2.5 rounded-xl text-xs flex items-center justify-between text-emerald-300">
                      <div className="flex items-center gap-1.5 font-mono text-[11px]">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Cleared for Broadcast by <strong>{script.reviewedBy}</strong></span>
                      </div>
                      {script.reviewedAt && (
                        <span className="text-[10px] font-mono text-emerald-400/70">
                          {new Date(script.reviewedAt).toLocaleDateString()}
                        </span>
                      )}
                    </div>
                  )}

                  {/* ACTION BUTTONS & WORKFLOW CONTROLS */}
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-850">
                    <div className="flex items-center gap-2 text-xs text-slate-400 font-mono">
                      <span>Status:</span>
                      <strong className="text-slate-200 capitalize">{script.status.replace('_', ' ')}</strong>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      
                      {/* WHEN PENDING REVIEW: APPROVE AND REJECT ACTION BUTTONS */}
                      {isPending ? (
                        <>
                          <button
                            id={`approve-btn-${script.id}`}
                            disabled={isSubmittingReview}
                            onClick={() => {
                              setApproveScriptTarget(script);
                              setShowApproveModal(true);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-emerald-650 to-teal-650 hover:from-emerald-600 hover:to-teal-600 text-white rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 shadow-lg shadow-emerald-950/40 border border-emerald-500/40 transition-all cursor-pointer hover:scale-[1.02] disabled:opacity-50"
                          >
                            <Check className="w-4 h-4" />
                            <span>Approve Script</span>
                          </button>

                          <button
                            id={`reject-btn-${script.id}`}
                            disabled={isSubmittingReview}
                            onClick={() => {
                              setRejectScriptTarget(script);
                              setRejectionReason('');
                              setShowRejectModal(true);
                            }}
                            className="px-4 py-2 bg-gradient-to-r from-rose-650 to-red-650 hover:from-rose-600 hover:to-red-600 text-white rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 shadow-lg shadow-rose-950/40 border border-rose-500/40 transition-all cursor-pointer hover:scale-[1.02] disabled:opacity-50"
                          >
                            <X className="w-4 h-4" />
                            <span>Reject Script</span>
                          </button>
                        </>
                      ) : null}

                      {/* WHEN DRAFT OR REJECTED: SUBMIT FOR REVIEW BUTTON */}
                      {(script.status === 'draft' || isRejected) && (
                        <button
                          id={`submit-review-btn-${script.id}`}
                          disabled={isSubmittingReview}
                          onClick={() => handleReviewAction(script.id, 'pending_review', 'Submitted script to editorial board')}
                          className="px-4 py-2 bg-gradient-to-r from-amber-650 to-orange-650 hover:from-amber-600 hover:to-orange-600 text-white rounded-xl text-xs font-sans font-bold flex items-center gap-1.5 shadow-lg shadow-amber-950/40 border border-amber-500/40 transition-all cursor-pointer hover:scale-[1.02] disabled:opacity-50"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Submit for Review</span>
                        </button>
                      )}

                      {/* WHEN APPROVED: SCHEDULE OR PUSH TO PRODUCTION */}
                      {isApproved && (
                        <>
                          {onNavigateTab && (
                            <button
                              onClick={() => onNavigateTab('scheduler')}
                              className="px-3.5 py-2 bg-slate-900 hover:bg-slate-850 text-blue-300 border border-blue-500/30 rounded-xl text-xs font-sans font-semibold flex items-center gap-1.5 cursor-pointer transition-all"
                            >
                              <Calendar className="w-3.5 h-3.5 text-blue-400" />
                              <span>Queue in Campaign</span>
                            </button>
                          )}
                          <button
                            disabled={isSubmittingReview}
                            onClick={() => handleReviewAction(script.id, 'pending_review', 'Re-opened approved script for editorial reassessment')}
                            className="px-3 py-2 bg-slate-950 hover:bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800 rounded-xl text-xs font-mono transition-all cursor-pointer"
                          >
                            Re-open Review
                          </button>
                        </>
                      )}

                      {/* Direct Single-Click Fast Approval (for Admins) */}
                      {isPending && isPrivileged && (
                        <button
                          title="Instant 1-Click Approval"
                          disabled={isSubmittingReview}
                          onClick={() => handleReviewAction(script.id, 'approved', 'Fast authorized by executive producer')}
                          className="p-2 bg-slate-900 hover:bg-emerald-500/20 text-slate-400 hover:text-emerald-400 rounded-xl border border-slate-800 transition-colors cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                        </button>
                      )}

                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* APPROVAL CONFIRMATION MODAL */}
      {showApproveModal && approveScriptTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Authorize Script Broadcast
              </h3>
              <button 
                onClick={() => setShowApproveModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                You are approving <strong>"{approveScriptTarget.headline}"</strong> for active production, TTS synthesis, and global broadcast.
              </p>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
                  Optional Approval Notes / Cues
                </label>
                <textarea
                  value={approvalNotes}
                  onChange={(e) => setApprovalNotes(e.target.value)}
                  placeholder="e.g. Teleprompter pacing approved. Clear for 6 PM prime slot."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-sans"
                />
              </div>

              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-[11px] font-mono text-emerald-300">
                ✓ Action will be permanently signed in the backend audit log under <strong>{userRole.osRole || userRole.role.toUpperCase()}</strong>.
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowApproveModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isSubmittingReview}
                onClick={() => handleReviewAction(approveScriptTarget.id, 'approved', approvalNotes || 'Broadcast approved')}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 shadow-lg shadow-emerald-900/40 cursor-pointer disabled:opacity-50"
              >
                <Check className="w-4 h-4" />
                <span>{isSubmittingReview ? 'Approving...' : 'Confirm Approval'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* REJECTION FEEDBACK MODAL */}
      {showRejectModal && rejectScriptTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-fade-in">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-sm font-sans font-bold uppercase tracking-wider text-rose-400 flex items-center gap-2">
                <XCircle className="w-4 h-4 text-rose-400" /> Request Script Revisions
              </h3>
              <button 
                onClick={() => setShowRejectModal(false)}
                className="text-slate-400 hover:text-white text-xs font-mono"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                Rejecting <strong>"{rejectScriptTarget.headline}"</strong> will return it to the writer with your specific revision requirements.
              </p>

              {/* Quick Reason Presets */}
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">
                  Quick Reason Presets
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Fact check verification required',
                    'Tone / pacing too fast for anchor',
                    'Missing local regional context',
                    'Headline exceeds character limit',
                  ].map((preset) => (
                    <button
                      key={preset}
                      type="button"
                      onClick={() => setRejectionReason(preset)}
                      className="text-[10px] font-mono bg-slate-950 hover:bg-slate-800 text-slate-300 px-2.5 py-1 rounded-lg border border-slate-800 cursor-pointer"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block mb-1">
                  Specific Rejection Feedback (Required)
                </label>
                <textarea
                  value={rejectionReason}
                  onChange={(e) => setRejectionReason(e.target.value)}
                  placeholder="Explain why this script is rejected and what needs to be changed..."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-rose-500 font-sans"
                />
              </div>

              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl text-[11px] font-mono text-rose-300">
                ⚠ The writer will see this reason in their script dashboard and can resubmit after revising.
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-2">
              <button
                onClick={() => setShowRejectModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-mono cursor-pointer"
              >
                Cancel
              </button>
              <button
                disabled={isSubmittingReview || !rejectionReason.trim()}
                onClick={() => handleReviewAction(rejectScriptTarget.id, 'rejected', '', rejectionReason)}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold font-sans flex items-center gap-1.5 shadow-lg shadow-rose-900/40 cursor-pointer disabled:opacity-50"
              >
                <X className="w-4 h-4" />
                <span>{isSubmittingReview ? 'Rejecting...' : 'Submit Rejection'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TELEPROMPTER FULL PREVIEW MODAL */}
      {previewScript && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-fade-in">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-4 max-h-[85vh] flex flex-col">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-cyan-400" />
                <h3 className="text-base font-bold text-white font-sans">
                  Teleprompter Reader & Script Breakdown
                </h3>
              </div>
              <button 
                onClick={() => setPreviewScript(null)}
                className="text-slate-400 hover:text-white text-sm font-mono cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 overflow-y-auto flex-1 pr-1 font-sans text-xs">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-850 space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">Broadcast Headline</span>
                  {getStatusBadge(previewScript.status)}
                </div>
                <h2 className="text-lg font-bold text-white tracking-tight">
                  {previewScript.headline}
                </h2>
              </div>

              {previewScript.hook && (
                <div className="p-3 bg-cyan-950/30 border border-cyan-800/40 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider block font-bold">1. Attention Hook</span>
                  <p className="text-cyan-200 text-sm leading-relaxed">{previewScript.hook}</p>
                </div>
              )}

              <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">2. Central Body</span>
                <p className="text-slate-200 text-sm leading-relaxed whitespace-pre-line">{previewScript.body}</p>
              </div>

              {previewScript.outro && (
                <div className="p-3 bg-slate-950 border border-slate-850 rounded-xl space-y-1">
                  <span className="text-[10px] font-mono text-slate-400 uppercase tracking-wider block font-bold">3. Sign-off Outro</span>
                  <p className="text-slate-300 text-sm leading-relaxed">{previewScript.outro}</p>
                </div>
              )}

              {previewScript.voiceoverText && (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <span className="text-[10px] font-mono text-red-400 uppercase tracking-wider block font-bold">Combined Teleprompter Vocal Stream</span>
                  <div className="p-3 bg-slate-900 rounded-lg text-sm text-slate-100 font-mono leading-relaxed select-all">
                    {previewScript.voiceoverText}
                  </div>
                </div>
              )}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-slate-800">
              <span className="text-[11px] font-mono text-slate-400">
                Language: <strong className="text-white">{previewScript.language || 'English'}</strong>
              </span>
              <button
                onClick={() => setPreviewScript(null)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-mono cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}

      {/* AUDIT LOG DRAWER / MODAL */}
      {showAuditLogs && (
        <div className="bg-slate-950 rounded-2xl p-5 border border-slate-850 shadow-2xl space-y-4 animate-fade-in">
          <div className="flex items-center justify-between border-b border-slate-850 pb-3">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-400" />
              <div>
                <h3 className="text-sm font-bold font-sans text-white uppercase tracking-wider">
                  Script Approval & Workflow Audit Trail
                </h3>
                <p className="text-[11px] text-slate-400">
                  Immutable record of script creations, submissions, approvals, and rejections.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={fetchAuditLogs}
                disabled={loadingAuditLogs}
                className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-lg border border-slate-800 cursor-pointer"
                title="Refresh Audit Logs"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loadingAuditLogs ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={() => setShowAuditLogs(false)}
                className="text-xs text-slate-400 hover:text-white px-2 py-1 bg-slate-900 rounded-lg border border-slate-800 cursor-pointer"
              >
                Hide
              </button>
            </div>
          </div>

          <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
            {auditLogs.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-500 font-mono">
                No audit log entries recorded yet.
              </div>
            ) : (
              auditLogs.map((log) => {
                const isApproved = log.action === 'APPROVED';
                const isRejected = log.action === 'REJECTED';
                const isSubmitted = log.action === 'SUBMITTED_FOR_REVIEW';

                return (
                  <div
                    key={log.id}
                    className="p-3 bg-slate-900/60 rounded-xl border border-slate-850 text-xs font-sans space-y-1.5"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                          isApproved ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          isRejected ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                          isSubmitted ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          'bg-blue-500/20 text-blue-300 border border-blue-500/40'
                        }`}>
                          {log.action}
                        </span>
                        <span className="font-semibold text-slate-200">{log.scriptTitle}</span>
                      </div>
                      <span className="text-[10px] font-mono text-slate-500">
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>Actor: <strong className="text-slate-300">{log.reviewer}</strong> ({log.reviewerRole || 'User'})</span>
                      <span>Target ID: <span className="text-slate-500">{log.scriptId}</span></span>
                    </div>

                    {(log.notes || log.reason) && (
                      <p className="text-[11px] text-slate-300 bg-slate-950/60 p-2 rounded border border-slate-850/60 font-sans">
                        {log.reason ? <span className="text-rose-400 font-semibold">Reason: </span> : null}
                        {log.reason || log.notes}
                      </p>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

    </div>
  );
}
