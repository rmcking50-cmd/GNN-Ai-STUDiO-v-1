import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2, 
  Globe, 
  Sparkles, 
  Check, 
  Bookmark, 
  Youtube, 
  Instagram, 
  MessageSquare,
  Facebook,
  Twitter,
  AlertCircle,
  Share2
} from 'lucide-react';
import { SocialPost, GeneratedScript, UserRolePayload, RepositoryAsset } from '../types';
import FacebookAutomationHub from './FacebookAutomationHub';

interface SocialSchedulerProps {
  userRole: UserRolePayload;
  scripts: GeneratedScript[];
  posts: SocialPost[];
  setPosts: React.Dispatch<React.SetStateAction<SocialPost[]>>;
  assets?: RepositoryAsset[];
  triggerToast?: (msg: string) => void;
}

export default function SocialScheduler({ 
  userRole, 
  scripts, 
  posts, 
  setPosts,
  assets = [],
  triggerToast
}: SocialSchedulerProps) {
  const [activeView, setActiveView] = useState<'facebook' | 'multi_social'>('facebook');
  const [newPostCaption, setNewPostCaption] = useState('');
  const [selectedScriptId, setSelectedScriptId] = useState('');
  const [scheduledTargetTime, setScheduledTargetTime] = useState('18:15');
  const [scheduledTargetDate, setScheduledTargetDate] = useState(new Date().toISOString().split('T')[0]);
  
  // Platform multi-select
  const [selectedPlatforms, setSelectedPlatforms] = useState<('youtube' | 'tiktok' | 'instagram' | 'facebook' | 'twitter')[]>(['youtube']);

  // Generative optimizing AI prompt helper
  const [generatingCaption, setGeneratingCaption] = useState(false);

  const togglePlatform = (platform: 'youtube' | 'tiktok' | 'instagram' | 'facebook' | 'twitter') => {
    if (selectedPlatforms.includes(platform)) {
      setSelectedPlatforms(selectedPlatforms.filter(p => p !== platform));
    } else {
      setSelectedPlatforms([...selectedPlatforms, platform]);
    }
  };

  // AI Optimal Caption Formulator via prompt
  const handleAIMagicCaption = () => {
    if (!userRole.permissions.canGenerateAI) {
      alert('Your authorized role does not have AI generation privileges.');
      return;
    }
    setGeneratingCaption(true);
    setTimeout(() => {
      let optimalCaption = '🚨 BREAKING GLOBAL DEVELOPMENTS 🚨\n\nWe are currently tracking significant updates on the technology front. This has huge implications for current systems globally! \n\nWhat are your thoughts on this? Tell us in comments below! 👇';
      
      const relatedScript = scripts.find(s => s.id === selectedScriptId);
      if (relatedScript) {
        optimalCaption = `🚨 BREAKING: ${relatedScript.headline.toUpperCase()} 🚨\n\n${relatedScript.hook}\n\nOur GNN research team has compiled comprehensive coverage details. Ensure to view our upcoming live feed for the complete scoop! Web link in bio.`;
      }

      setNewPostCaption(optimalCaption);
      setGeneratingCaption(false);
    }, 1200);
  };

  // Create scheduled slot
  const handleSchedulePost = () => {
    if (!newPostCaption) {
      alert('Caption text parameters cannot be empty.');
      return;
    }
    const newPost: SocialPost = {
      id: `post-${Date.now()}`,
      scriptId: selectedScriptId || undefined,
      platforms: selectedPlatforms,
      caption: newPostCaption,
      tags: ['#breakingnews', '#gnn', '#viral', '#journalism'],
      scheduledTime: `${scheduledTargetDate} ${scheduledTargetTime}`,
      status: 'scheduled',
    };

    setPosts([newPost, ...posts]);
    setNewPostCaption('');
    setSelectedScriptId('');
    alert('Campaign successfully queued to social scheduler matrix!');
  };

  const handleDeletePost = (id: string) => {
    setPosts(posts.filter(p => p.id !== id));
  };

  return (
    <div className="space-y-6 text-slate-200">
      
      {/* Sub Navigation Bar: Facebook Page Studio vs Multi-Platform Scheduler */}
      <div className="flex flex-wrap items-center gap-2.5 border-b border-slate-900 pb-3">
        <button
          type="button"
          id="tab-facebook-hub"
          onClick={() => setActiveView('facebook')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeView === 'facebook'
              ? 'bg-blue-600 text-white shadow-lg shadow-blue-950/50'
              : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Facebook className="w-4 h-4" />
          <span>ফেসবুক পেজ অটোমেশন (Facebook Page Studio)</span>
          <span className="px-1.5 py-0.2 rounded-full text-[9px] font-mono bg-blue-500/20 text-blue-300 font-extrabold border border-blue-400/30">
            AUTO
          </span>
        </button>

        <button
          type="button"
          id="tab-multi-social"
          onClick={() => setActiveView('multi_social')}
          className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition-all cursor-pointer ${
            activeView === 'multi_social'
              ? 'bg-red-650 text-white shadow-lg shadow-red-950/50'
              : 'bg-slate-900/60 border border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>মাল্টি-প্ল্যাটফর্ম শিডিউলার (Social Campaigns)</span>
        </button>
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={activeView}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2, ease: "easeOut" }}
          className="w-full"
        >
          {activeView === 'facebook' ? (
        <FacebookAutomationHub
          scripts={scripts}
          assets={assets}
          userRole={userRole}
          triggerToast={triggerToast}
        />
      ) : (
        /* Upper Grid Layout */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Form: Queue Campaigns */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-red-500" /> social campaign builder
            </h3>
            <p className="text-xs text-slate-400">Assemble campaign notes, link saved television scripts, and map targets globally.</p>
          </div>

          <div className="space-y-4 p-4 bg-slate-900/40 rounded-lg border border-slate-850">
            {/* Script linker option */}
            <div className="space-y-1">
              <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold">Link Compiled News Script</label>
              <select
                value={selectedScriptId}
                onChange={(e) => setSelectedScriptId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded p-2 outline-none focus:border-red-500"
              >
                <option value="">-- Or compose a custom topic script --</option>
                {scripts.map(s => (
                  <option key={s.id} value={s.id}>[GNN Script] {s.headline.substring(0, 40)}...</option>
                ))}
              </select>
            </div>

            {/* Platform Selectors */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold">Target Social Channels</label>
              <div className="flex flex-wrap gap-2 pt-1">
                {(['youtube', 'tiktok', 'instagram', 'facebook', 'twitter'] as const).map((platform) => {
                  const active = selectedPlatforms.includes(platform);
                  return (
                    <button
                      key={platform}
                      onClick={() => togglePlatform(platform)}
                      className={`px-3 py-1.5 rounded-lg border text-xs font-semibold flex items-center gap-1.5 cursor-pointer transition-all ${
                        active 
                          ? 'bg-slate-900 border-red-500 text-white shadow' 
                          : 'bg-slate-950 border-slate-900 text-slate-500 hover:border-slate-800'
                      }`}
                    >
                      {platform === 'youtube' && <Youtube className="w-3.5 h-3.5 text-red-500" />}
                      {platform === 'tiktok' && <Bookmark className="w-3.5 h-3.5 text-cyan-400" />}
                      {platform === 'instagram' && <Instagram className="w-3.5 h-3.5 text-purple-400" />}
                      {platform === 'facebook' && <Facebook className="w-3.5 h-3.5 text-blue-500" />}
                      {platform === 'twitter' && <Twitter className="w-3.5 h-3.5 text-sky-400" />}
                      <span className="capitalize">{platform}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Optimal AI Caption */}
            <div className="space-y-1">
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] font-mono tracking-widest text-slate-400 uppercase font-bold">Campaign Caption</label>
                <button
                  onClick={handleAIMagicCaption}
                  disabled={generatingCaption}
                  className="text-[10px] font-semibold text-yellow-400 bg-yellow-500/10 hover:bg-yellow-500/25 px-2 py-0.5 rounded border border-yellow-500/20 flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>{generatingCaption ? 'Formulating...' : 'AI Optimal Caption'}</span>
                </button>
              </div>
              <textarea
                value={newPostCaption}
                onChange={(e) => setNewPostCaption(e.target.value)}
                rows={4}
                placeholder="Insert custom captions, hook messages, tags..."
                className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded p-3 focus:outline-none focus:border-red-500 font-sans leading-relaxed"
              />
            </div>

            {/* Time slot picker */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase">Target Date</label>
                <input 
                  type="date"
                  value={scheduledTargetDate}
                  onChange={(e) => setScheduledTargetDate(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded p-2 focus:outline-none focus:border-red-500"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-slate-500 uppercase">Publish Time Target</label>
                <input 
                  type="time"
                  value={scheduledTargetTime}
                  onChange={(e) => setScheduledTargetTime(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded p-2 focus:outline-none focus:border-red-500 animate-pulse"
                />
              </div>
            </div>

            <button
              onClick={handleSchedulePost}
              className="w-full bg-red-650 hover:bg-red-700 text-white text-xs font-bold py-2.5 rounded hover:shadow-lg hover:shadow-red-650/15 transition-all cursor-pointer"
            >
              Queue Social Campaign Card
            </button>
          </div>
        </div>

        {/* Right Panel: Scheduled Calendar Timeline */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
          <div className="space-y-1 border-b border-slate-900 pb-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">queued broadcast timeline</span>
            <p className="text-xs text-slate-400">Upcoming campaign updates and scheduled anchors ready to pilot.</p>
          </div>

          {posts.length === 0 ? (
            <div className="text-center p-8 m-auto">
              <AlertCircle className="w-8 h-8 text-slate-700 mx-auto mb-2" />
              <p className="text-xs text-slate-500 font-mono">No campaigns scheduled inside current queue. Deploy campaign card on the left.</p>
            </div>
          ) : (
            <div className="space-y-3 max-h-[440px] overflow-y-auto pr-1">
              {posts.map((post) => (
                <div 
                  key={post.id}
                  className="p-3 bg-slate-900/50 rounded-lg border border-slate-850 hover:border-slate-800 transition-colors space-y-2.5 relative"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center space-x-1.5">
                      <Clock className="w-3.5 h-3.5 text-yellow-400" />
                      <span className="text-[10px] font-mono tracking-wide text-slate-400">{post.scheduledTime}</span>
                      <span className="text-[9px] bg-red-500/10 text-red-400 px-1.5 py-0.2 rounded font-mono uppercase font-semibold">
                        {post.status}
                      </span>
                    </div>

                    <button
                      onClick={() => handleDeletePost(post.id)}
                      className="text-slate-500 hover:text-red-400 p-1 rounded hover:bg-slate-950"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Caption summary */}
                  <p className="text-xs text-slate-300 leading-relaxed line-clamp-2 whitespace-pre-wrap">
                    {post.caption}
                  </p>

                  {/* Channel icon chips */}
                  <div className="flex items-center space-x-2 pt-1.5 border-t border-slate-950">
                    <span className="text-[9px] font-mono text-slate-500 uppercase">Target Channels:</span>
                    <div className="flex space-x-1.5">
                      {post.platforms.map((p) => (
                        <span key={p} className="p-1 bg-slate-950 rounded border border-slate-900" title={p}>
                          {p === 'youtube' && <Youtube className="w-3.5 h-3.5 text-red-500" />}
                          {p === 'tiktok' && <Bookmark className="w-3.5 h-3.5 text-cyan-400" />}
                          {p === 'instagram' && <Instagram className="w-3.5 h-3.5 text-purple-500" />}
                          {p === 'facebook' && <Facebook className="w-3.5 h-3.5 text-blue-500" />}
                          {p === 'twitter' && <Twitter className="w-3.5 h-3.5 text-sky-400" />}
                        </span>
                      ))}
                    </div>
                  </div>

                </div>
              ))}
            </div>
          )}
        </div>

        </div>
      )}
        </motion.div>
      </AnimatePresence>

    </div>
  );
}
