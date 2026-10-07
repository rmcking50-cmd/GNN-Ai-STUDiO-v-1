import React from 'react';
import { 
  Sparkles, 
  HelpCircle, 
  BookOpen, 
  Tv, 
  Plus, 
  CheckCircle, 
  Mic, 
  Video, 
  FileText, 
  ArrowRight,
  UserCheck,
  Flame,
  Wand2
} from 'lucide-react';

interface EmptyStateProps {
  onPopulateDemo: () => void;
  onOpenQuickScript: () => void;
  onOpenQuickAsset: () => void;
}

export default function EmptyState({ onPopulateDemo, onOpenQuickScript, onOpenQuickAsset }: EmptyStateProps) {
  return (
    <div className="p-8 text-slate-100 max-w-4xl mx-auto space-y-8 animate-fade-in">
      
      {/* Intro section */}
      <div className="text-center space-y-3">
        <div className="w-14 h-14 rounded-full bg-red-500/10 border border-red-500/30 flex items-center justify-center mx-auto shadow-lg shadow-red-950/20">
          <Tv className="w-7 h-7 text-red-500 animate-pulse" />
        </div>
        <h3 className="text-2xl font-display font-bold tracking-tight text-white">
          Welcome to GNN AI Operating System
        </h3>
        <p className="text-xs text-slate-400 font-mono max-w-lg mx-auto leading-relaxed">
          আপনার ব্রডকাস্ট ওয়ার্কস্পেস বর্তমানে খালি আছে। নিচে দেওয়া ইন্টারেক্টিভ গাইড এবং কুইক অ্যাকশন ব্যবহার করে মাত্র কয়েক সেকেন্ডে আপনার প্রথম এআই নিউজ কন্টেন্ট তৈরি করুন।
        </p>
      </div>

      {/* Guide steps grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Step 1 */}
        <div className="bg-slate-900/45 border border-slate-850 rounded-xl p-4.5 hover:border-slate-800 transition-all space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-400">
            <span className="w-5 h-5 rounded-full bg-red-500/15 flex items-center justify-center text-[10px]">১</span>
            <span>চ্যানেল প্রোফাইল সেটআপ (Work for Channel)</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            GNN TV, Tnews Bangla বা আপনার নিজস্ব কাস্টম ব্রডকাস্ট চ্যানেল তৈরি করে ভাষা, লোগো এবং সোশ্যাল মিডিয়া এপিআই গেটওয়ে সক্রিয় করুন।
          </p>
        </div>

        {/* Step 2 */}
        <div className="bg-slate-900/45 border border-slate-850 rounded-xl p-4.5 hover:border-slate-800 transition-all space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-400">
            <span className="w-5 h-5 rounded-full bg-red-500/15 flex items-center justify-center text-[10px]">২</span>
            <span>এআই নিউজ স্ক্রিপ্ট জেনারেশন (News Script)</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            "New Script" কুইক অ্যাকশন বা Grounded News ট্যাবে গিয়ে আপনার পছন্দের টপিকে হুক, মেইন বডি এবং আউটরো সহ পূর্ণাঙ্গ স্ক্রিপ্ট জেনারেট করুন।
          </p>
        </div>

        {/* Step 3 */}
        <div className="bg-slate-900/45 border border-slate-850 rounded-xl p-4.5 hover:border-slate-800 transition-all space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-400">
            <span className="w-5 h-5 rounded-full bg-red-500/15 flex items-center justify-center text-[10px]">৩</span>
            <span>ডিজিটাল ৩ডি প্রেজেন্টার কাস্টমাইজেশন</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            Presenter Model Studio-তে গিয়ে ৩ডি ক্যারেক্টার স্যুট, হেয়ার স্টাইলিং, ক্রোমা কি ব্যাকগ্রাউন্ড এবং কাস্টম ভয়েস সিগনেচার যুক্ত করুন।
          </p>
        </div>

        {/* Step 4 */}
        <div className="bg-slate-900/45 border border-slate-850 rounded-xl p-4.5 hover:border-slate-800 transition-all space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-red-400">
            <span className="w-5 h-5 rounded-full bg-red-500/15 flex items-center justify-center text-[10px]">৪</span>
            <span>সোশ্যাল মিডিয়া পাবলিশ ও অটোমেশন</span>
          </div>
          <p className="text-[11px] text-slate-400 leading-normal">
            তৈরিকৃত নিউজ ভিডিওটি সরাসরি YouTube Live, Facebook Live, TikTok বা X (Twitter) হ্যান্ডেলে অটোমেটেড শিডিউলারের মাধ্যমে প্রকাশ করুন।
          </p>
        </div>

      </div>

      {/* Program roadmaps & details */}
      <div className="bg-gradient-to-br from-slate-950 to-slate-900/80 border border-slate-850 rounded-2xl p-6 space-y-4">
        <div className="flex items-center gap-2 text-xs font-mono text-slate-400 uppercase tracking-widest">
          <BookOpen className="w-4 h-4 text-slate-500" />
          <span>GNN Staging Program Playbook / গাইডলাইন</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4.5 text-xs text-slate-300">
          <div className="space-y-1.5 p-3.5 bg-slate-900/20 rounded-xl border border-slate-900">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              🎭 ৩ডি কার্টুন ও ক্যারেক্টার
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
              Text-to-Sequence প্রযুক্তির মাধ্যমে কার্টুন ক্যারেক্টার, ৩ডি মডেল রিলিজ এবং "Drama/BANGLA Natok" স্ক্রিপ্ট সাজিয়ে ভিডিও টিজার জেনারেট করুন।
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 bg-slate-900/20 rounded-xl border border-slate-900">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              🎤 কাস্টম ভয়েস রেকর্ডিং
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
              Vocal Lab-এ আপনার নিজের কন্ঠস্বর রেকর্ড করে "Voice Model" তৈরি করুন, যা স্বয়ংক্রিয়ভাবে যেকোনো টেক্সটকে আপনার কণ্ঠে রূপান্তর করবে।
            </p>
          </div>

          <div className="space-y-1.5 p-3.5 bg-slate-900/20 rounded-xl border border-slate-900">
            <h4 className="font-bold text-white flex items-center gap-1.5">
              💻 গ্লোবাল এপিআই গেটওয়ে
            </h4>
            <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
              গুগল ড্রাইভ, জিমেইল এবং গিটহাব এমসিপি (Model Context Protocol) সার্ভারের মাধ্যমে সম্পূর্ণ সুরক্ষিত ও অটো-কমিট এনভায়রনমেন্ট উপভোগ করুন।
            </p>
          </div>
        </div>
      </div>

      {/* Quick Action CTAs */}
      <div className="flex flex-col sm:flex-row gap-3 items-stretch justify-center pt-2">
        <button 
          onClick={onPopulateDemo}
          className="bg-red-650 hover:bg-red-700 text-white font-mono text-xs font-bold px-5 py-3 rounded-xl shadow-lg shadow-red-950/20 cursor-pointer flex items-center justify-center gap-2 transition-all hover:scale-105"
        >
          <Flame className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          <span>Populate High-Fidelity Broadcast Demo</span>
        </button>

        <button 
          onClick={onOpenQuickScript}
          className="bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-slate-700 font-mono text-xs font-bold px-4 py-3 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all"
        >
          <FileText className="w-3.5 h-3.5 text-slate-400" />
          <span>New Script Modal</span>
        </button>

        <button 
          onClick={onOpenQuickAsset}
          className="bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-slate-700 font-mono text-xs font-bold px-4 py-3 rounded-xl cursor-pointer flex items-center justify-center gap-1.5 transition-all"
        >
          <Plus className="w-3.5 h-3.5 text-slate-400" />
          <span>New Media Asset</span>
        </button>
      </div>

    </div>
  );
}
