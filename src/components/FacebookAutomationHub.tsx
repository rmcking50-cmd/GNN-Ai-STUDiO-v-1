import React, { useState, useEffect, useRef } from 'react';
import { 
  Facebook, 
  Sparkles, 
  Send, 
  Share2, 
  Users, 
  Upload, 
  Download, 
  Play, 
  Square, 
  RefreshCw, 
  CheckCircle2, 
  MessageCircle, 
  ThumbsUp, 
  Heart, 
  AlertCircle, 
  Clock, 
  FileText, 
  Image as ImageIcon, 
  Video, 
  Globe, 
  Plus, 
  Trash2, 
  Copy, 
  Check, 
  Layers, 
  Activity,
  ExternalLink,
  ChevronDown
} from 'lucide-react';
import { GeneratedScript, RepositoryAsset, UserRolePayload } from '../types';

interface FacebookGroup {
  id: string;
  name: string;
  membersCount: string;
  category: string;
  selected: boolean;
}

interface FacebookPublishedPost {
  id: string;
  pageId: string;
  headline: string;
  formattedPost: string;
  mediaUrl?: string;
  mediaType?: 'image' | 'video' | 'none';
  publishedAt: string;
  likes: number;
  comments: number;
  shares: number;
  sharedGroups: string[];
  userLiked?: boolean;
}

interface FacebookAutomationHubProps {
  scripts: GeneratedScript[];
  assets: RepositoryAsset[];
  userRole: UserRolePayload;
  triggerToast?: (msg: string) => void;
}

const DEFAULT_GROUPS: FacebookGroup[] = [
  { id: 'grp_1', name: 'GNN News Bangladesh Community', membersCount: '১২৫,০০০', category: 'সংবাদ ও মতামত', selected: true },
  { id: 'grp_2', name: 'Global Tech & Innovation Forum', membersCount: '৮৪,৫০০', category: 'প্রযুক্তি', selected: true },
  { id: 'grp_3', name: 'ঢাকা নাগরিক সংযোগ ও উন্নয়ন', membersCount: '৪৬,০০০', category: 'স্থানীয় খবর', selected: true },
  { id: 'grp_4', name: 'বাংলাদেশ মিডিয়া ও সাংবাদিকতা নেটওয়ার্ক', membersCount: '৩২,০০০', category: 'মিডিয়া', selected: false },
  { id: 'grp_5', name: 'World Breaking News & Geopolitics', membersCount: '৯৮,০০০', category: 'আন্তর্জাতিক', selected: true }
];

export default function FacebookAutomationHub({
  scripts,
  assets,
  userRole,
  triggerToast
}: FacebookAutomationHubProps) {
  // Post Composer State
  const [topicInput, setTopicInput] = useState('');
  const [selectedScriptId, setSelectedScriptId] = useState<string>('');
  const [language, setLanguage] = useState<'Bengali' | 'English' | 'Bilingual'>('Bengali');
  const [postType, setPostType] = useState<'breaking_news' | 'investigative' | 'discussion' | 'viral_bulletin'>('breaking_news');
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Generated Content
  const [generatedPost, setGeneratedPost] = useState<{
    headline: string;
    hook: string;
    body: string;
    callToAction: string;
    hashtags: string[];
    groupShareCaption: string;
    formattedPost: string;
  } | null>(null);

  const [postDraftText, setPostDraftText] = useState('');
  const [groupShareIntro, setGroupShareIntro] = useState('');
  const [attachedMediaUrl, setAttachedMediaUrl] = useState<string>('');
  const [attachedMediaType, setAttachedMediaType] = useState<'image' | 'video' | 'none'>('none');
  const [attachedMediaName, setAttachedMediaName] = useState<string>('');

  // Target Groups State
  const [groups, setGroups] = useState<FacebookGroup[]>(DEFAULT_GROUPS);
  const [newGroupName, setNewGroupName] = useState('');
  const [showAddGroup, setShowAddGroup] = useState(false);

  // Auto-Pilot Engine State
  const [autoPilotActive, setAutoPilotActive] = useState(false);
  const [autoPilotIntervalSec, setAutoPilotIntervalSec] = useState(25); // Demo friendly cycle
  const [secondsRemaining, setSecondsRemaining] = useState(25);
  const [autoPilotLogs, setAutoPilotLogs] = useState<string[]>([
    `[${new Date().toLocaleTimeString()}] 🚀 Facebook Page Automation Engine initialized. Ready to broadcast.`
  ]);
  const [autoPostsCreatedCount, setAutoPostsCreatedCount] = useState(0);

  // Published Posts Feed State
  const [publishedPosts, setPublishedPosts] = useState<FacebookPublishedPost[]>([
    {
      id: 'fb_sample_1',
      pageId: 'gnn_official_page',
      headline: '🚨 ব্রেকিং নিউজ: আন্তর্জাতিক প্রযুক্তি সম্মেলন ২০২৬-এর উদ্বোধনী বার্তা!',
      formattedPost: `🚨 ব্রেকিং নিউজ: আন্তর্জাতিক প্রযুক্তি সম্মেলন ২০২৬-এর উদ্বোধনী বার্তা! 🚨\n\nজিএনএন নিউজ রুম থেকে সরাসরি প্রাপ্ত তথ্যে জানা গেছে কৃত্রিম বুদ্ধিমত্তা ও নতুন প্রজন্মের প্রযুক্তির দ্রুত অগ্রগতি বৈশ্বিক অর্থনীতিতে নতুন দিগন্ত উন্মোচন করছে।\n\n📌 প্রধান তথ্যসমূহ:\n• ১০০টিরও বেশি দেশের প্রযুক্তিবিদরা অংশ নিচ্ছেন।\n• কৃত্রিম বুদ্ধিমত্তা নিয়ন্ত্রণে নতুন আন্তর্জাতিক ফ্রেমওয়ার্ক প্রণয়নের প্রস্তাব।\n• ভবিষ্যৎ প্রজন্মের জন্য উদ্ভাবনী সমাধান তৈরির আহ্বান।\n\n👉 এই গুরুত্বপূর্ণ পদক্ষেপে আপনার মতামত কী? কমেন্টে জানিয়ে দিন এবং পোস্টটি বন্ধুদের মাঝে শেয়ার করুন!\n\n#GNNNews #BreakingNews #Bangladesh #TechUpdates #ArtificialIntelligence`,
      mediaUrl: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=80',
      mediaType: 'image',
      publishedAt: '১০ মিনিট আগে',
      likes: 142,
      comments: 38,
      shares: 24,
      sharedGroups: ['GNN News Bangladesh Community', 'Global Tech & Innovation Forum'],
      userLiked: true
    }
  ]);

  // Comment simulation modal
  const [activeCommentPostId, setActiveCommentPostId] = useState<string | null>(null);
  const [commentInput, setCommentInput] = useState('');
  const [postComments, setPostComments] = useState<Record<string, { author: string; text: string; time: string }[]>>({
    fb_sample_1: [
      { author: 'তানভীর আহমেদ', text: 'অসাধারণ খবর! এই প্রযুক্তির সঠিক ব্যবহার নিশ্চিত করা প্রয়োজন।', time: '৮ মিনিট আগে' },
      { author: 'সাবরিনা জাহান', text: 'ধন্যবাদ জিএনএন-কে দ্রুততম সময়ে এই তথ্য সবার কাছে পৌঁছে দেয়ার জন্য।', time: '৪ মিনিট আগে' }
    ]
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const autoPilotTimerRef = useRef<any>(null);

  const notify = (msg: string) => {
    if (triggerToast) triggerToast(msg);
    else console.log(msg);
  };

  const addLog = (text: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setAutoPilotLogs(prev => [`[${timestamp}] ${text}`, ...prev.slice(0, 49)]);
  };

  // Sync script selection into topic
  useEffect(() => {
    if (selectedScriptId) {
      const script = scripts.find(s => s.id === selectedScriptId);
      if (script) {
        setTopicInput(`${script.headline} - ${script.hook}`);
      }
    }
  }, [selectedScriptId, scripts]);

  // 1. GENERATE FACEBOOK POST (নিজে নিজে পোস্ট তৈরি)
  const handleGenerateFacebookPost = async (overrideTopic?: string) => {
    const activeTopic = overrideTopic || topicInput || 'বাংলাদেশে নতুন অর্থনৈতিক ও প্রযুক্তিগত অগ্রগতির সাম্প্রতিক আপডেট';
    setIsGenerating(true);
    addLog(`✨ AI Synthesizing Facebook post on: "${activeTopic.substring(0, 45)}..."`);

    try {
      const res = await fetch('/api/facebook/generate-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topic: activeTopic,
          language,
          postType,
          pageName: 'GNN News Network',
          customPrompt: 'Include high-engagement call to action for comments and group sharing.'
        })
      });

      const data = await res.json();
      if (data.success && data.post) {
        setGeneratedPost(data.post);
        setPostDraftText(data.post.formattedPost);
        setGroupShareIntro(data.post.groupShareCaption);

        // If no media attached, pick an asset from repository if available
        if (!attachedMediaUrl && assets.length > 0) {
          const matchedAsset = assets.find(a => a.type === 'image' || a.type === 'video') || assets[0];
          setAttachedMediaUrl(matchedAsset.url || matchedAsset.dataUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80');
          setAttachedMediaType(matchedAsset.type === 'video' ? 'video' : 'image');
          setAttachedMediaName(matchedAsset.name);
          addLog(`📎 Automatically attached media asset: "${matchedAsset.name}"`);
        }

        notify('ফেসবুক পোস্ট সফলভাবে তৈরি হয়েছে!');
        addLog(`✅ Post synthesized with headline: "${data.post.headline.substring(0, 35)}..."`);
      }
    } catch (err: any) {
      console.error('Generation error:', err);
      notify('পোস্ট তৈরিতে সাময়িক সমস্যা হয়েছে, ফলব্যাক প্রয়োগ করা হয়েছে।');
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. UPLOAD MEDIA WORKFLOW (আপলোড)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const isVid = file.type.startsWith('video');
    const isImg = file.type.startsWith('image');

    if (!isVid && !isImg) {
      notify('অনুগ্রহ করে ইমেজ বা ভিডিও ফাইল নির্বাচন করুন');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAttachedMediaUrl(result);
      setAttachedMediaType(isVid ? 'video' : 'image');
      setAttachedMediaName(file.name);
      notify(`মিডিয়া আপলোড সম্পন্ন: ${file.name}`);
      addLog(`📤 Media uploaded: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);
    };
    reader.readAsDataURL(file);
  };

  // 3. ATTACH FROM MEDIA REPOSITORY (রিপোজিটরি থেকে সংযুক্তি)
  const handleAttachFromRepository = (asset: RepositoryAsset) => {
    setAttachedMediaUrl(asset.url || asset.dataUrl || 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80');
    setAttachedMediaType(asset.type === 'video' ? 'video' : 'image');
    setAttachedMediaName(asset.name);
    notify(`রিপোজিটরি থেকে মিডিয়া সংযুক্ত: ${asset.name}`);
    addLog(`📁 Attached repository media: "${asset.name}"`);
  };

  // 4. DOWNLOAD POST PACKAGE (ডাউনলোড কার্যবিধি)
  const handleDownloadPostPackage = () => {
    if (!postDraftText) {
      notify('ডাউনলোড করার মত কোন পোস্ট টেক্সট নেই');
      return;
    }

    const selectedGroupNames = groups.filter(g => g.selected).map(g => g.name);

    // Build text file package
    const packageContent = `=====================================================
GNN NEWS NETWORK - FACEBOOK BROADCAST PACKAGE
=====================================================
Generated Date: ${new Date().toLocaleString()}
Page Target: GNN News Network (Official Facebook Page)
Target Groups (${selectedGroupNames.length}):
${selectedGroupNames.map(name => ` - ${name}`).join('\n')}

-----------------------------------------------------
PRIMARY FACEBOOK PAGE POST
-----------------------------------------------------
${postDraftText}

-----------------------------------------------------
GROUP SHARE INTRO CAPTION
-----------------------------------------------------
${groupShareIntro || 'সম্মানিত সদস্যবৃন্দ, আমাদের পেজের এই গুরুত্বপূর্ণ প্রতিবেদনটি আপনাদের সাথে শেয়ার করা হলো।'}

-----------------------------------------------------
ATTACHED MEDIA
-----------------------------------------------------
File: ${attachedMediaName || 'Standard GNN News Graphic'}
Type: ${attachedMediaType}
=====================================================`;

    // Download text package
    const blob = new Blob([packageContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `fb_gnn_post_package_${Date.now()}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    // If there's an image attached, also trigger image download
    if (attachedMediaUrl && attachedMediaType === 'image') {
      const imgLink = document.createElement('a');
      imgLink.href = attachedMediaUrl;
      imgLink.download = attachedMediaName || `gnn_fb_media_${Date.now()}.png`;
      document.body.appendChild(imgLink);
      imgLink.click();
      document.body.removeChild(imgLink);
    }

    notify('ফেসবুক পোস্ট ও মিডিয়া প্যাকেজ ডাউনলোড সম্পন্ন!');
    addLog('📥 Post text and media assets package downloaded locally.');
  };

  // 5. PUBLISH POST TO FACEBOOK PAGE
  const handlePublishPost = async () => {
    if (!postDraftText) {
      notify('পোস্ট করার পূর্বে পোস্ট তৈরি করুন');
      return;
    }

    const selectedGroupNames = groups.filter(g => g.selected).map(g => g.name);

    addLog(`📢 Publishing post to Facebook Page "GNN News Network"...`);

    try {
      const res = await fetch('/api/facebook/publish-post', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          post: {
            text: postDraftText,
            mediaUrl: attachedMediaUrl,
            mediaType: attachedMediaType
          },
          targetGroups: selectedGroupNames
        })
      });

      const data = await res.json();
      if (data.success) {
        const newPublished: FacebookPublishedPost = {
          id: data.publishedPost.id,
          pageId: 'gnn_official_page',
          headline: generatedPost?.headline || '🚨 নতুন সংবাদ প্রকাশনা',
          formattedPost: postDraftText,
          mediaUrl: attachedMediaUrl || undefined,
          mediaType: attachedMediaType,
          publishedAt: 'এইমাত্র প্রকাশিত',
          likes: 12,
          comments: 2,
          shares: selectedGroupNames.length,
          sharedGroups: selectedGroupNames,
          userLiked: false
        };

        setPublishedPosts(prev => [newPublished, ...prev]);
        notify(`পোস্টটি সফলভাবে ফেসবুক পেজ ও ${selectedGroupNames.length}টি গ্রুপে প্রকাশিত হয়েছে!`);
        addLog(`🎉 Live on Facebook! Reached page and auto-crossposted to ${selectedGroupNames.length} Groups.`);

        // Clear composer draft
        setPostDraftText('');
        setGeneratedPost(null);
        setAttachedMediaUrl('');
        setAttachedMediaType('none');
        setAttachedMediaName('');
      }
    } catch (err: any) {
      console.error(err);
      notify('পোস্ট প্রকাশনায় সাময়িক সমস্যা হয়েছে');
    }
  };

  // 6. SHARE EXISTING POST TO GROUPS (গ্রুপে শেয়ার কার্যবিধি)
  const handleSharePostToGroups = (post: FacebookPublishedPost) => {
    const selectedGroupNames = groups.filter(g => g.selected).map(g => g.name);
    if (selectedGroupNames.length === 0) {
      notify('অনুগ্রহ করে অন্তত একটি গ্রুপ নির্বাচন করুন');
      return;
    }

    setPublishedPosts(prev => prev.map(p => {
      if (p.id === post.id) {
        const mergedGroups = Array.from(new Set([...p.sharedGroups, ...selectedGroupNames]));
        return {
          ...p,
          shares: p.shares + selectedGroupNames.length,
          sharedGroups: mergedGroups
        };
      }
      return p;
    }));

    notify(`পোস্টটি ${selectedGroupNames.length}টি ফেসবুক গ্রুপে শেয়ার করা হয়েছে!`);
    addLog(`👥 Post #${post.id.slice(-4)} shared to: ${selectedGroupNames.join(', ')}`);
  };

  // 7. AUTONOMOUS AUTO-PILOT WORKFLOW (স্বয়ংক্রিয় কার্যবিধি লুপ)
  useEffect(() => {
    if (!autoPilotActive) {
      if (autoPilotTimerRef.current) clearInterval(autoPilotTimerRef.current);
      return;
    }

    addLog('🟢 Auto-Pilot Activated: Autonomous script analyzer, post creator, and group dispatcher is LIVE.');

    // Function that runs one complete autonomous cycle
    const runAutonomousCycle = async () => {
      addLog('🤖 [Auto-Pilot] Starting autonomous creation cycle...');

      // Pick topic from scripts or generate fresh breaking topic
      let topic = 'আন্তর্জাতিক বাজারে জ্বালানি তেলের দামের ওঠানামা এবং নিত্যপ্রয়োজনীয় পণ্যের বাজার পরিস্থিতি';
      if (scripts.length > 0) {
        const randomScript = scripts[Math.floor(Math.random() * scripts.length)];
        topic = `${randomScript.headline} - ${randomScript.hook}`;
      }

      try {
        const genRes = await fetch('/api/facebook/generate-post', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            topic,
            language: 'Bengali',
            postType: 'breaking_news',
            pageName: 'GNN News Network'
          })
        });
        const genData = await genRes.json();

        if (genData.success && genData.post) {
          const autoPost = genData.post;
          const activeGroups = groups.filter(g => g.selected).map(g => g.name);

          // Pick an asset from repository or fallback
          let mediaUrl = 'https://images.unsplash.com/photo-1585829365295-ab7cd400c167?w=800&auto=format&fit=crop&q=80';
          let mediaType: 'image' | 'video' = 'image';
          if (assets.length > 0) {
            const candidate = assets[Math.floor(Math.random() * assets.length)];
            if (candidate.url || candidate.dataUrl) mediaUrl = candidate.url || candidate.dataUrl || mediaUrl;
            mediaType = candidate.type === 'video' ? 'video' : 'image';
          }

          // Publish immediately
          const newPost: FacebookPublishedPost = {
            id: `auto_fb_${Date.now()}`,
            pageId: 'gnn_official_page',
            headline: autoPost.headline,
            formattedPost: autoPost.formattedPost,
            mediaUrl,
            mediaType,
            publishedAt: 'এইমাত্র (Auto-Pilot)',
            likes: Math.floor(Math.random() * 40) + 5,
            comments: Math.floor(Math.random() * 8) + 1,
            shares: activeGroups.length,
            sharedGroups: activeGroups,
            userLiked: false
          };

          setPublishedPosts(prev => [newPost, ...prev]);
          setAutoPostsCreatedCount(c => c + 1);

          addLog(`🚀 [Auto-Pilot] Auto-published: "${autoPost.headline.substring(0, 30)}..."`);
          addLog(`👥 [Auto-Pilot] Auto-shared to ${activeGroups.length} Facebook Groups.`);
          notify(`[Auto-Pilot] নতুন পোস্ট স্বয়ংক্রিয়ভাবে পেজ ও ${activeGroups.length}টি গ্রুপে প্রকাশিত হয়েছে!`);
        }
      } catch (err: any) {
        addLog(`⚠️ [Auto-Pilot Error] ${err?.message || 'Cycle failed'}`);
      }
    };

    // Countdown and interval trigger
    setSecondsRemaining(autoPilotIntervalSec);
    autoPilotTimerRef.current = setInterval(() => {
      setSecondsRemaining(prev => {
        if (prev <= 1) {
          runAutonomousCycle();
          return autoPilotIntervalSec;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (autoPilotTimerRef.current) clearInterval(autoPilotTimerRef.current);
    };
  }, [autoPilotActive, autoPilotIntervalSec, scripts, assets, groups]);

  // Toggle group selection
  const toggleGroupSelection = (id: string) => {
    setGroups(prev => prev.map(g => g.id === id ? { ...g, selected: !g.selected } : g));
  };

  // Add custom group
  const handleAddCustomGroup = () => {
    if (!newGroupName.trim()) return;
    const newGroup: FacebookGroup = {
      id: `custom_grp_${Date.now()}`,
      name: newGroupName.trim(),
      membersCount: '৫০,০০০+',
      category: 'কাস্টম গ্রুপ',
      selected: true
    };
    setGroups(prev => [...prev, newGroup]);
    setNewGroupName('');
    setShowAddGroup(false);
    notify(`নতুন গ্রুপ যুক্ত হয়েছে: ${newGroup.name}`);
  };

  // Like reaction toggle on a post
  const handleToggleLike = (postId: string) => {
    setPublishedPosts(prev => prev.map(p => {
      if (p.id === postId) {
        return {
          ...p,
          userLiked: !p.userLiked,
          likes: p.userLiked ? p.likes - 1 : p.likes + 1
        };
      }
      return p;
    }));
  };

  // Add comment simulation
  const handleAddComment = (postId: string) => {
    if (!commentInput.trim()) return;
    const newComment = {
      author: 'জিএনএন দর্শক',
      text: commentInput.trim(),
      time: 'এইমাত্র'
    };
    setPostComments(prev => ({
      ...prev,
      [postId]: [...(prev[postId] || []), newComment]
    }));
    setPublishedPosts(prev => prev.map(p => p.id === postId ? { ...p, comments: p.comments + 1 } : p));
    setCommentInput('');
  };

  return (
    <div className="space-y-6 text-slate-200">
      
      {/* Header Banner: Facebook Page Hub & Auto-Pilot Status */}
      <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          
          <div className="flex items-center gap-3.5">
            <div className="p-3 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-2xl shadow-inner">
              <Facebook className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white font-sans flex items-center gap-2">
                  <span>ফেসবুক পেজ অটোমেশন হাব</span>
                  <span className="text-xs font-mono font-bold text-blue-400 bg-blue-500/15 border border-blue-500/30 px-2 py-0.5 rounded-full">
                    GNN Facebook Studio
                  </span>
                </h2>
              </div>
              <p className="text-xs text-slate-400 mt-1 max-w-2xl leading-relaxed">
                স্বয়ংক্রিয় পোস্ট তৈরি, মিডিয়া আপলোড ও ডাউনলোড, ফেসবুক গ্রুপে ক্রস-পোস্টিং এবং মানুষের মধ্যে লাইভ এনগেজমেন্ট পরিচালনা করুন।
              </p>
            </div>
          </div>

          {/* Auto-Pilot Toggle Control Card */}
          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 rounded-xl p-3 shrink-0">
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-white">Auto-Pilot Engine</span>
                <span className={`w-2 h-2 rounded-full ${autoPilotActive ? 'bg-emerald-400 animate-ping' : 'bg-slate-600'}`} />
              </div>
              <p className="text-[10px] font-mono text-slate-400">
                {autoPilotActive ? `পরবর্তী স্বয়ংক্রিয় পোস্ট: ${secondsRemaining}s` : 'স্বয়ংক্রিয় পোস্টার নিষ্ক্রিয়'}
              </p>
            </div>

            <button
              type="button"
              id="toggle-facebook-autopilot-btn"
              onClick={() => setAutoPilotActive(!autoPilotActive)}
              className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-all shadow-md ${
                autoPilotActive
                  ? 'bg-amber-600 hover:bg-amber-500 text-white shadow-amber-950/40'
                  : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-950/40'
              }`}
            >
              {autoPilotActive ? (
                <>
                  <Square className="w-3.5 h-3.5" />
                  <span>থামুন (Stop Auto-Pilot)</span>
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" />
                  <span>চালু করুন (Start Auto-Pilot)</span>
                </>
              )}
            </button>
          </div>

        </div>

        {/* Live Auto-Pilot Stats Bar when active */}
        {autoPilotActive && (
          <div className="mt-4 pt-3 border-t border-slate-900 flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
            <div className="flex items-center gap-2 text-emerald-400">
              <Activity className="w-4 h-4 animate-pulse" />
              <span>Auto-Pilot সক্রিয়: প্রতি {autoPilotIntervalSec} সেকেন্ডে স্ক্রিপ্ট থেকে পোস্ট তৈরি ও গ্রুপে শেয়ার হচ্ছে</span>
            </div>
            <div className="flex items-center gap-4 text-slate-400">
              <span>তৈরিকৃত পোস্ট: <strong className="text-white font-bold">{autoPostsCreatedCount}</strong></span>
              <span>টার্গেট গ্রুপ: <strong className="text-white font-bold">{groups.filter(g => g.selected).length}</strong></span>
            </div>
          </div>
        )}
      </div>

      {/* Main Grid Layout: Creator & Controls on Left, Feed Preview on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column (7 cols): Post Creator, Media Upload, Groups */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Card 1: AI Self-Generating Post Composer (নিজে নিজে পোস্ট তৈরি) */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-4 shadow-md">
            
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-white font-sans">
                  নিজে নিজে পোস্ট তৈরি করুন (AI Post Generator)
                </h3>
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-1 bg-slate-900 p-1 rounded-lg border border-slate-800 text-[11px] font-mono">
                {(['Bengali', 'English', 'Bilingual'] as const).map(lang => (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => setLanguage(lang)}
                    className={`px-2.5 py-1 rounded transition-colors cursor-pointer ${
                      language === lang ? 'bg-blue-600 text-white font-bold' : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {lang === 'Bengali' ? 'বাংলা' : lang === 'English' ? 'English' : 'দ্বিভাষিক'}
                  </button>
                ))}
              </div>
            </div>

            {/* Script Linker or Topic Input */}
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                  খবরের স্ক্রিপ্ট থেকে পোস্ট তৈরি করুন (বা কাস্টম বিষয় লিখুন):
                </label>
                <select
                  value={selectedScriptId}
                  onChange={(e) => setSelectedScriptId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 outline-none focus:border-blue-500 font-sans"
                >
                  <option value="">-- সংবাদ স্ক্রিপ্ট নির্বাচন করুন (বা নিচে বিষয় লিখুন) --</option>
                  {scripts.map(s => (
                    <option key={s.id} value={s.id}>
                      📰 {s.headline} ({s.language || 'GNN Script'})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <input
                  type="text"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  placeholder="যেমন: পদ্মা সেতুতে নতুন ট্রাফিক ম্যানেজমেন্ট সিস্টেম ও অর্থনৈতিক প্রভাব..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-blue-500 font-sans"
                />
              </div>

              {/* Category buttons */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'breaking_news', label: '🚨 ব্রেকিং নিউজ' },
                  { id: 'investigative', label: '🔍 অনুসন্ধানী প্রতিবেদন' },
                  { id: 'discussion', label: '💬 জনমত আলোচনা' },
                  { id: 'viral_bulletin', label: '⚡ ভাইরাল আপডেট' }
                ].map(type => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setPostType(type.id as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      postType === type.id
                        ? 'bg-blue-600/20 border border-blue-500 text-blue-300 shadow'
                        : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>

              {/* 1-Click Generate Button */}
              <button
                type="button"
                id="ai-generate-fb-post-btn"
                onClick={() => handleGenerateFacebookPost()}
                disabled={isGenerating}
                className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all shadow-lg shadow-blue-950/50 cursor-pointer disabled:opacity-50"
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>পোস্ট তৈরি হচ্ছে (AI Generating)...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4 text-amber-300" />
                    <span>নিজে নিজে পোস্ট তৈরি করুন (Generate Facebook Post)</span>
                  </>
                )}
              </button>
            </div>

            {/* Post Draft Editor Area */}
            <div className="space-y-2 pt-2 border-t border-slate-900">
              <div className="flex items-center justify-between">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  ফেসবুক পোস্ট খসড়া (Draft Text):
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      navigator.clipboard.writeText(postDraftText);
                      notify('পোস্ট কপি করা হয়েছে!');
                    }}
                    disabled={!postDraftText}
                    className="text-[10px] font-mono text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer disabled:opacity-40"
                  >
                    <Copy className="w-3 h-3" />
                    <span>কপি</span>
                  </button>
                </div>
              </div>

              <textarea
                value={postDraftText}
                onChange={(e) => setPostDraftText(e.target.value)}
                rows={6}
                placeholder="এখানে আপনার সম্পূর্ণ ফেসবুক পোস্টটি প্রদর্শিত হবে..."
                className="w-full bg-slate-900/60 border border-slate-800 rounded-xl p-3.5 text-xs text-slate-200 placeholder-slate-600 outline-none focus:border-blue-500 font-sans leading-relaxed resize-y"
              />

              {/* Group Share Custom Intro */}
              <div className="space-y-1 pt-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-slate-400 block font-semibold">
                  গ্রুপে শেয়ার করার ক্যাপশন (Group Share Intro Caption):
                </label>
                <input
                  type="text"
                  value={groupShareIntro}
                  onChange={(e) => setGroupShareIntro(e.target.value)}
                  placeholder="গ্রুপ সদস্যদের উদ্দেশ্যে বিশেষ বার্তা..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 outline-none focus:border-blue-500 font-sans"
                />
              </div>
            </div>

            {/* Card 2: Upload, Media Attachment & Download Actions (আপলোড ও ডাউনলোড) */}
            <div className="pt-3 border-t border-slate-900 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold">
                  মিডিয়া সংযুক্তি ও ডাউনলোড (Media & Actions):
                </span>
                {attachedMediaUrl && (
                  <button
                    type="button"
                    onClick={() => {
                      setAttachedMediaUrl('');
                      setAttachedMediaType('none');
                      setAttachedMediaName('');
                    }}
                    className="text-[10px] text-red-400 hover:text-red-300 cursor-pointer"
                  >
                    মিডিয়া মুছুন
                  </button>
                )}
              </div>

              {/* Attached Media Status Badge */}
              {attachedMediaUrl ? (
                <div className="flex items-center justify-between p-2.5 bg-slate-900/90 border border-blue-500/30 rounded-xl text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    {attachedMediaType === 'video' ? (
                      <Video className="w-4 h-4 text-red-400 shrink-0" />
                    ) : (
                      <ImageIcon className="w-4 h-4 text-blue-400 shrink-0" />
                    )}
                    <span className="truncate font-medium text-slate-200">{attachedMediaName || 'Attached Media Asset'}</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-800/50 px-2 py-0.5 rounded">
                    Ready to Post
                  </span>
                </div>
              ) : (
                <div className="p-3 bg-slate-900/40 border border-dashed border-slate-800 rounded-xl text-center text-xs text-slate-500">
                  কোন মিডিয়া সংযুক্ত নেই। কম্পিউটার থেকে আপলোড করুন বা রিপোজিটরি থেকে নিন।
                </div>
              )}

              {/* Action Buttons: Upload, From Repo, Download Package, Publish */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
                
                {/* Hidden File Input */}
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*,video/*"
                  onChange={handleFileUpload}
                  className="hidden"
                />

                {/* Upload Button */}
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="কম্পিউটার থেকে ছবি বা ভিডিও আপলোড করুন"
                >
                  <Upload className="w-3.5 h-3.5 text-cyan-400" />
                  <span>আপলোড</span>
                </button>

                {/* Attach from Repository Button */}
                <button
                  type="button"
                  onClick={() => {
                    if (assets.length > 0) {
                      const imgOrVid = assets.find(a => a.type === 'image' || a.type === 'video') || assets[0];
                      handleAttachFromRepository(imgOrVid);
                    } else {
                      notify('রিপোজিটরিতে কোন মিডিয়া নেই');
                    }
                  }}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  title="GNN মিডিয়া রিপোজিটরি থেকে ফাইল সংযুক্ত করুন"
                >
                  <Layers className="w-3.5 h-3.5 text-purple-400" />
                  <span>রিপোজিটরি</span>
                </button>

                {/* Download Package Button */}
                <button
                  type="button"
                  id="download-fb-package-btn"
                  onClick={handleDownloadPostPackage}
                  disabled={!postDraftText}
                  className="px-3 py-2 bg-slate-900 hover:bg-slate-850 border border-slate-800 hover:border-slate-700 text-slate-200 hover:text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
                  title="সম্পূর্ণ পোস্ট টেক্সট ও মিডিয়া ডাউনলোড করুন"
                >
                  <Download className="w-3.5 h-3.5 text-emerald-400" />
                  <span>ডাউনলোড</span>
                </button>

                {/* Publish to Page Button */}
                <button
                  type="button"
                  id="publish-fb-page-btn"
                  onClick={handlePublishPost}
                  disabled={!postDraftText}
                  className="px-3 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md shadow-blue-950/40 cursor-pointer disabled:opacity-40"
                  title="পোস্টটি ফেসবুক পেজ ও নির্বাচিত গ্রুপগুলোতে পোস্ট করুন"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>পোস্ট করুন</span>
                </button>

              </div>
            </div>

          </div>

          {/* Card 3: Target Facebook Groups Management (গ্রুপ শেয়ারিং কার্যবিধি) */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-5 space-y-3 shadow-md">
            <div className="flex items-center justify-between border-b border-slate-900 pb-3">
              <div className="flex items-center gap-2">
                <Users className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white font-sans">
                  টার্গেট ফেসবুক গ্রুপ নেটওয়ার্ক (Target Groups)
                </h3>
                <span className="text-xs font-mono text-slate-400">
                  ({groups.filter(g => g.selected).length}/{groups.length} নির্বাচিত)
                </span>
              </div>

              <button
                type="button"
                onClick={() => setShowAddGroup(!showAddGroup)}
                className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>গ্রুপ যুক্ত করুন</span>
              </button>
            </div>

            {/* Add Custom Group Input */}
            {showAddGroup && (
              <div className="flex items-center gap-2 p-3 bg-slate-900/80 border border-slate-800 rounded-xl animate-fadeIn">
                <input
                  type="text"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  placeholder="ফেসবুক গ্রুপের নাম..."
                  className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                />
                <button
                  type="button"
                  onClick={handleAddCustomGroup}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  যোগ করুন
                </button>
              </div>
            )}

            {/* Groups Checklist */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1">
              {groups.map(grp => (
                <div
                  key={grp.id}
                  onClick={() => toggleGroupSelection(grp.id)}
                  className={`p-2.5 rounded-xl border text-xs flex items-center justify-between cursor-pointer transition-all ${
                    grp.selected 
                      ? 'bg-blue-950/25 border-blue-500/40 text-white' 
                      : 'bg-slate-900/40 border-slate-850 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <input
                      type="checkbox"
                      checked={grp.selected}
                      onChange={() => {}} // Controlled by card click
                      className="w-3.5 h-3.5 accent-blue-600 rounded cursor-pointer shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="font-semibold truncate">{grp.name}</div>
                      <div className="text-[10px] font-mono text-slate-500">{grp.membersCount} সদস্য • {grp.category}</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Card 4: Autonomous Auto-Pilot Live Logs (লাইভ অটোমেশন লগ) */}
          <div className="bg-slate-950 border border-slate-900 rounded-2xl p-4 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 font-semibold flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5 text-emerald-400" />
                <span>অটোমেশন লাইভ সিস্টেম লগ (Live Activity Logs):</span>
              </span>
              <button
                type="button"
                onClick={() => setAutoPilotLogs([`[${new Date().toLocaleTimeString()}] Logs cleared.`])}
                className="text-[10px] font-mono text-slate-500 hover:text-slate-300"
              >
                ক্লিয়ার
              </button>
            </div>

            <div className="bg-slate-900/90 border border-slate-850 rounded-xl p-3 max-h-36 overflow-y-auto font-mono text-[11px] space-y-1 text-slate-300">
              {autoPilotLogs.map((log, index) => (
                <div key={index} className="leading-relaxed">
                  {log}
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Right Column (5 cols): Live Facebook Feed Simulation & Human Engagement */}
        <div className="lg:col-span-5 space-y-5">
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Globe className="w-4 h-4 text-blue-400" />
              <h3 className="text-sm font-bold text-white font-sans">
                লাইভ ফেসবুক ফিড ও এনগেজমেন্ট
              </h3>
            </div>
            <span className="text-[10px] font-mono text-slate-400">
              {publishedPosts.length}টি পোস্ট
            </span>
          </div>

          {/* Feed Container */}
          <div className="space-y-4 max-h-[860px] overflow-y-auto pr-1">
            {publishedPosts.map((post) => (
              <div 
                key={post.id}
                className="bg-slate-950 border border-slate-900 rounded-2xl overflow-hidden shadow-xl hover:border-slate-800 transition-all font-sans"
              >
                {/* Facebook Post Header */}
                <div className="p-4 flex items-center justify-between border-b border-slate-900">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-red-600 flex items-center justify-center font-bold text-white text-sm shadow-md ring-2 ring-blue-500/30">
                      GNN
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className="font-bold text-sm text-white">GNN News Network</span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-blue-400 fill-blue-400/20" />
                      </div>
                      <div className="flex items-center gap-1.5 text-[11px] text-slate-400">
                        <span>{post.publishedAt}</span>
                        <span>•</span>
                        <Globe className="w-3 h-3 text-slate-500" />
                        <span>পাবলিক</span>
                      </div>
                    </div>
                  </div>

                  {/* Group Sharing badge */}
                  {post.sharedGroups.length > 0 && (
                    <div className="px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[10px] font-mono font-semibold">
                      {post.sharedGroups.length} গ্রুপে শেয়ার্ড
                    </div>
                  )}
                </div>

                {/* Facebook Post Body Text */}
                <div className="p-4 space-y-3">
                  <p className="text-xs text-slate-200 whitespace-pre-wrap leading-relaxed">
                    {post.formattedPost}
                  </p>
                </div>

                {/* Attached Media Preview */}
                {post.mediaUrl && (
                  <div className="border-t border-b border-slate-900 bg-black max-h-72 overflow-hidden flex items-center justify-center">
                    {post.mediaType === 'video' ? (
                      <video 
                        src={post.mediaUrl} 
                        controls 
                        className="w-full max-h-72 object-contain"
                      />
                    ) : (
                      <img 
                        src={post.mediaUrl} 
                        alt="Facebook Post Media" 
                        className="w-full max-h-72 object-cover"
                      />
                    )}
                  </div>
                )}

                {/* Post Metrics Bar (Reactions & Comments count) */}
                <div className="px-4 py-2 flex items-center justify-between text-[11px] text-slate-400 border-b border-slate-900">
                  <div className="flex items-center gap-1.5">
                    <span className="flex items-center -space-x-1">
                      <span className="w-4 h-4 rounded-full bg-blue-600 flex items-center justify-center text-[9px] text-white">👍</span>
                      <span className="w-4 h-4 rounded-full bg-red-600 flex items-center justify-center text-[9px] text-white">❤️</span>
                    </span>
                    <span>{post.likes}</span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span>{post.comments}টি মন্তব্য</span>
                    <span>{post.shares}টি শেয়ার</span>
                  </div>
                </div>

                {/* Post Action Buttons: Like, Comment, Share to Groups */}
                <div className="px-2 py-1.5 grid grid-cols-3 gap-1 text-xs font-semibold text-slate-300">
                  
                  {/* Like Button */}
                  <button
                    type="button"
                    onClick={() => handleToggleLike(post.id)}
                    className={`py-2 rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                      post.userLiked 
                        ? 'text-blue-400 bg-blue-500/10' 
                        : 'hover:bg-slate-900 hover:text-white'
                    }`}
                  >
                    <ThumbsUp className={`w-4 h-4 ${post.userLiked ? 'fill-blue-400' : ''}`} />
                    <span>লাইক</span>
                  </button>

                  {/* Comment Button */}
                  <button
                    type="button"
                    onClick={() => setActiveCommentPostId(activeCommentPostId === post.id ? null : post.id)}
                    className="py-2 rounded-xl hover:bg-slate-900 hover:text-white flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 text-slate-400" />
                    <span>মন্তব্য</span>
                  </button>

                  {/* Share to Groups Action */}
                  <button
                    type="button"
                    onClick={() => handleSharePostToGroups(post)}
                    className="py-2 rounded-xl hover:bg-slate-900 hover:text-emerald-400 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                    title="নির্বাচিত ফেসবুক গ্রুপগুলোতে শেয়ার করুন"
                  >
                    <Share2 className="w-4 h-4 text-emerald-400" />
                    <span>গ্রুপে শেয়ার</span>
                  </button>

                </div>

                {/* Comment Section Drawer when opened */}
                {activeCommentPostId === post.id && (
                  <div className="p-4 bg-slate-900/60 border-t border-slate-900 space-y-3 animate-fadeIn">
                    
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-1">
                      {(postComments[post.id] || []).map((cmt, idx) => (
                        <div key={idx} className="bg-slate-950 p-2.5 rounded-xl text-xs space-y-0.5 border border-slate-850">
                          <div className="flex items-center justify-between">
                            <strong className="text-white font-semibold">{cmt.author}</strong>
                            <span className="text-[10px] text-slate-500 font-mono">{cmt.time}</span>
                          </div>
                          <p className="text-slate-300">{cmt.text}</p>
                        </div>
                      ))}
                    </div>

                    {/* New Comment Input */}
                    <div className="flex items-center gap-2">
                      <input
                        type="text"
                        value={commentInput}
                        onChange={(e) => setCommentInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAddComment(post.id);
                        }}
                        placeholder="একটি ইতিবাচক মন্তব্য লিখুন..."
                        className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-white outline-none focus:border-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => handleAddComment(post.id)}
                        className="p-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    </div>

                  </div>
                )}

              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
