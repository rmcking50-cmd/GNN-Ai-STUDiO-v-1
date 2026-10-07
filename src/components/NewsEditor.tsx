import React, { useState } from 'react';
import { 
  FileText, 
  Search, 
  Sparkles, 
  RefreshCw, 
  Volume2, 
  Check, 
  Globe, 
  ArrowRight,
  TrendingUp,
  AlertCircle,
  Zap
} from 'lucide-react';
import { NewsArticle, GeneratedScript, UserRolePayload } from '../types';

interface NewsEditorProps {
  userRole: UserRolePayload;
  onAddScript: (script: GeneratedScript) => void;
  onAddAsset: (asset: any) => void;
  onAddMessage: (msg: string) => void;
}

export default function NewsEditor({ userRole, onAddScript, onAddAsset, onAddMessage }: NewsEditorProps) {
  const [newsCategory, setNewsCategory] = useState('Tech & Cyber Security Updates');
  const [region, setRegion] = useState('Global');
  const [language, setLanguage] = useState('Bangla');
  const [loadingNews, setLoadingNews] = useState(false);
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [activeArticle, setActiveArticle] = useState<NewsArticle | null>(null);

  const [generatingScript, setGeneratingScript] = useState(false);
  const [scriptForm, setScriptForm] = useState<Partial<GeneratedScript>>({
    title: '',
    headline: '',
    hook: '',
    body: '',
    outro: '',
    voiceoverText: '',
  });

  const [synthesizingTTS, setSynthesizingTTS] = useState(false);
  const [ttsVoice, setTtsVoice] = useState('Kore');
  const [ttsAudioUrl, setTtsAudioUrl] = useState<string | null>(null);

  // 1. Trigger Search Grounding on Server
  const fetchGroundedNews = async () => {
    setLoadingNews(true);
    try {
      const res = await fetch('/api/news-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category: newsCategory, region }),
      });
      const data = await res.json();
      if (data.articles) {
        const mapped = data.articles.map((art: any, index: number) => ({
          id: `news-${Date.now()}-${index}`,
          title: art.title,
          summary: art.summary,
          source: art.source || 'Search Grounded Portal',
          publishedDate: art.publishedDate || new Date().toLocaleDateString(),
          category: art.category || newsCategory,
        }));
        setArticles(mapped);
        if (mapped.length > 0) {
          setActiveArticle(mapped[0]);
          // Prefill initial script skeleton
          setScriptForm({
            title: `Broadcast Script - ${mapped[0].title.substring(0, 30)}...`,
            headline: mapped[0].title,
            hook: 'Welcome to GNN Broadcast Studio. Today, we bring you major developments.',
            body: mapped[0].summary,
            outro: 'Reporting live for GNN. Join us next hour for updates.',
            voiceoverText: `Welcome to GNN Broadcast Studio. Today, we bring you major developments. ${mapped[0].summary} Reporting live for GNN.`,
          });
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingNews(false);
    }
  };

  // 2. Format Television Anchor Script via Gemini
  const generateScriptFromArticle = async (article: NewsArticle) => {
    if (!userRole.permissions.canGenerateAI) {
      alert('Your authorized role does not have AI generation privileges.');
      return;
    }
    setGeneratingScript(true);
    try {
      const res = await fetch('/api/generate-script', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          headline: article.title,
          summary: article.summary,
          language: language,
        }),
      });
      const data = await res.json();
      if (data.script) {
        setScriptForm({
          title: `Broadcast Script - ${article.title.substring(0, 30)}...`,
          headline: data.script.headline || article.title,
          hook: data.script.hook || '',
          body: data.script.body || article.summary,
          outro: data.script.outro || '',
          voiceoverText: data.script.voiceoverText || '',
          language: language,
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingScript(false);
    }
  };

  // 3. Save generated script state (as Draft or Submitted for Review)
  const handleSaveScript = async (targetStatus: 'draft' | 'pending_review' = 'draft') => {
    if (!scriptForm.headline || !scriptForm.body) {
      alert('Please fill out the script parameters first.');
      return;
    }
    const newScript: GeneratedScript = {
      id: `script-${Date.now()}`,
      articleId: activeArticle?.id,
      title: scriptForm.title || `Broadcast Script - ${scriptForm.headline.substring(0, 20)}`,
      headline: scriptForm.headline || '',
      hook: scriptForm.hook || '',
      body: scriptForm.body || '',
      outro: scriptForm.outro || '',
      voiceoverText: scriptForm.voiceoverText || '',
      language: language,
      status: targetStatus,
      createdAt: new Date().toLocaleDateString(),
      author: userRole.osRole ? `GNN ${userRole.osRole}` : 'News Desk Writer',
      submittedForReviewAt: targetStatus === 'pending_review' ? new Date().toISOString() : undefined,
    };

    try {
      // Sync with backend script store & audit log
      await fetch('/api/scripts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ script: newScript }),
      });
    } catch (e) {
      console.warn('Backend sync notice:', e);
    }

    onAddScript(newScript);
    onAddAsset({
      id: `asset-${Date.now()}`,
      name: newScript.title,
      type: 'script',
      url: '#',
      createdAt: new Date().toLocaleDateString(),
      lyrics_or_text: newScript.voiceoverText,
      language: newScript.language,
      status: 'Ready',
    });

    if (targetStatus === 'pending_review') {
      alert('Broadcast script submitted for review! It is now in Pending Review status in the approval queue.');
    } else {
      alert('Broadcast script saved as Draft in your workspace!');
    }
  };

  // 4. TTS speech synthesizer (Voice-over)
  const synthesizeVoiceover = async () => {
    const textToRead = scriptForm.voiceoverText || scriptForm.body;
    if (!textToRead) {
      alert('Please compile or generate a script first.');
      return;
    }
    setSynthesizingTTS(true);
    setTtsAudioUrl(null);
    try {
      const res = await fetch('/api/generate-speech', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToRead, voice: ttsVoice }),
      });
      const data = await res.json();
      if (data.success && data.base64Audio) {
        const audioUrl = `data:audio/mp3;base64,${data.base64Audio}`;
        setTtsAudioUrl(audioUrl);

        onAddAsset({
          id: `asset-${Date.now()}`,
          name: `TTS Voiceover - ${scriptForm.headline?.substring(0, 15)}...`,
          type: 'audio',
          url: audioUrl,
          createdAt: new Date().toLocaleDateString(),
          duration: '0:35',
          size: '480 KB',
          language: language,
        });
        alert('Voiceover generated successfully and added to Repository!');
      } else {
        alert(data.error || 'Synthesizer failed.');
      }
    } catch (e: any) {
      alert(`Synthesis Error: ${e.message}`);
    } finally {
      setSynthesizingTTS(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-200">
      {/* Search Grounding Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left: Search News Portal */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Search className="w-4 h-4 text-red-500" /> Search Grounded Intelligence
            </h3>
            <p className="text-xs text-slate-400">Harvest the absolute latest global breaking news and verify web trends safely via Gemini Search Grounding.</p>
          </div>

          <div className="space-y-3 p-3 bg-slate-900/50 rounded-lg border border-slate-850">
            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">Stream Topic</label>
              <select 
                value={newsCategory}
                onChange={(e) => setNewsCategory(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded p-2 focus:outline-none focus:border-red-500"
              >
                <option value="Tech & Cyber Security Updates">Tech & Cyber Security Updates</option>
                <option value="Global Finance Briefs">Global Finance Briefs</option>
                <option value="Breaking National Politics">Breaking National Politics</option>
                <option value="Sports & Athletics Trends">Sports & Athletics Trends</option>
                <option value="Global Climatological changes">Climate & Energy</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-mono font-bold tracking-widest text-slate-400 uppercase">Region Target</label>
              <select 
                value={region}
                onChange={(e) => setRegion(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded p-2 focus:outline-none focus:border-red-500"
              >
                <option value="Global">Global Broadcast</option>
                <option value="Asia Pacific">Asia Pacific</option>
                <option value="North America">North America</option>
                <option value="Europe">Europe</option>
                <option value="South Asia Bangladesh">South Asia (Bangladesh Focus)</option>
              </select>
            </div>

            <button
              onClick={fetchGroundedNews}
              disabled={loadingNews}
              className="w-full bg-red-650 text-white rounded text-xs py-2 font-semibold hover:bg-red-700 hover:shadow-lg hover:shadow-red-650/15 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingNews ? 'animate-spin' : ''}`} />
              {loadingNews ? 'Harvesting Trends...' : 'Harvest Grounded News'}
            </button>
          </div>

          {/* Harvester Stream Results */}
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Harvester Feed Results ({articles.length})</span>
            {articles.length === 0 ? (
              <div className="text-center p-6 bg-slate-900/30 rounded border border-dashed border-slate-900/50">
                <AlertCircle className="w-5 h-5 mx-auto text-slate-600 mb-2" />
                <p className="text-xs text-slate-500 font-mono">No harvested articles feed active. Trigger Search Grounding above.</p>
              </div>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {articles.map((art) => (
                  <button
                    key={art.id}
                    onClick={() => {
                      setActiveArticle(art);
                      setScriptForm({
                        title: `Broadcast Script - ${art.title.substring(0, 30)}...`,
                        headline: art.title,
                        hook: 'Welcome back. Here is the latest coverage from GNN network.',
                        body: art.summary,
                        outro: 'Reporting live for GNN Global Core studio.',
                        voiceoverText: `Welcome back. Here is the latest coverage from GNN network. ${art.summary} Reporting live for GNN Global Core studio.`,
                      });
                    }}
                    className={`w-full text-left p-3 rounded-lg border text-xs font-sans transition-all flex flex-col space-y-1 ${
                      activeArticle?.id === art.id 
                        ? 'bg-slate-900 border-red-500/50 shadow-md' 
                        : 'bg-slate-950/40 border-slate-900 hover:border-slate-800'
                    }`}
                  >
                    <div className="flex justify-between items-center w-full">
                      <span className="text-[9px] font-mono text-red-400 bg-red-500/10 px-1.5 py-0.5 rounded uppercase font-bold">{art.category}</span>
                      <span className="text-[9px] font-mono text-slate-500">{art.source}</span>
                    </div>
                    <h4 className="font-semibold text-slate-200 line-clamp-1">{art.title}</h4>
                    <p className="text-slate-400 line-clamp-2 text-[11px] leading-relaxed">{art.summary}</p>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Center/Right: Detailed Selected Article and AI Script Editor */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Active harvested article */}
          {activeArticle && (
            <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <span className="text-[10px] font-mono text-red-400 font-extrabold bg-red-500/10 px-2 py-0.5 rounded tracking-wider uppercase">Active Harvester Focus</span>
                  <h3 className="text-base font-sans font-bold text-white tracking-tight">{activeArticle.title}</h3>
                </div>
                <button
                  onClick={() => generateScriptFromArticle(activeArticle)}
                  disabled={generatingScript}
                  className="bg-slate-100 text-slate-950 hover:bg-slate-200 text-xs font-semibold py-1.5 px-3 rounded flex items-center gap-1 cursor-pointer transition-all disabled:opacity-50"
                >
                  <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                  {generatingScript ? 'Drafting Script...' : 'Generate TV Script'}
                </button>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-900/60 p-3 rounded font-sans border border-slate-850">
                {activeArticle.summary}
              </p>
              <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-1">
                <span>Reporter Agency: <strong className="text-slate-400">{activeArticle.source}</strong></span>
                <span>Published Slot: {activeArticle.publishedDate}</span>
              </div>
            </div>
          )}

          {/* Script Editor Panel */}
          <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
            <div className="flex justify-between items-center border-b border-slate-850 pb-3">
              <div>
                <h4 className="text-sm font-sans font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-cyan-400" /> Television Anchor Script Editor
                </h4>
                <p className="text-xs text-slate-400">Formulates TV anchor scripts aligned with professional broadcast standardizations.</p>
              </div>
              <div className="flex items-center space-x-2">
                <select 
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 focus:outline-none"
                >
                  <option value="Bangla">Bengali (Bangla)</option>
                  <option value="English">English (US)</option>
                  <option value="Spanish">Spanish (Castilian)</option>
                  <option value="Hindi">Hindi (National)</option>
                </select>
              </div>
            </div>

            {/* Hook, Body, Outro Inputs */}
            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 uppercase tracking-widest block mb-1">Headline Prompter Title</label>
                <input 
                  type="text"
                  value={scriptForm.headline || ''}
                  onChange={(e) => setScriptForm({ ...scriptForm, headline: e.target.value })}
                  placeholder="Insert broadcast headline text..."
                  className="w-full bg-slate-900 border border-slate-800 rounded px-3 py-2 text-sm text-slate-100 placeholder-slate-600 focus:outline-none focus:border-red-500 font-sans"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-[11px] font-mono text-slate-500 uppercase tracking-widest block mb-1">1. Attention Hook</label>
                  <textarea 
                    value={scriptForm.hook || ''} 
                    onChange={(e) => setScriptForm({ ...scriptForm, hook: e.target.value })}
                    rows={4}
                    placeholder="Immediate high-impact opening sentence..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-sans resize-none leading-relaxed"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">2. Central Body Report</span>
                  <textarea 
                    value={scriptForm.body || ''}
                    onChange={(e) => setScriptForm({ ...scriptForm, body: e.target.value })}
                    rows={4}
                    placeholder="Clear detail report on the unfolding events..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
                  />
                </div>
                <div>
                  <span className="text-[11px] font-mono text-slate-500 uppercase tracking-widest block mb-1.5">3. Studio Sign-off Outro</span>
                  <textarea 
                    value={scriptForm.outro || ''}
                    onChange={(e) => setScriptForm({ ...scriptForm, outro: e.target.value })}
                    rows={4}
                    placeholder="Standard studio host sign-off details..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs text-slate-300 focus:outline-none focus:border-cyan-500 font-sans leading-relaxed"
                  />
                </div>
              </div>

              {/* Complete voiceover block for direct translation/audio */}
              <div className="bg-slate-900/60 p-4 rounded-lg border border-slate-850">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Complete Teleprompter Speech Audio Feed</span>
                  <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono">
                    {(scriptForm.voiceoverText || '').length} chars
                  </span>
                </div>
                <textarea
                  value={scriptForm.voiceoverText || ''}
                  onChange={(e) => setScriptForm({ ...scriptForm, voiceoverText: e.target.value })}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-850 rounded p-3 text-xs text-slate-300 focus:outline-none focus:border-red-500 font-sans leading-relaxed"
                  placeholder="Merged speaking flow is calculated here dynamically..."
                />
              </div>

              {/* Operations and Voiceover trigger */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-slate-900/40 p-3 rounded-lg border border-slate-850 space-y-2">
                  <label className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block">Configure Voice Synthesis</label>
                  <div className="flex space-x-2">
                    <select
                      value={ttsVoice}
                      onChange={(e) => setTtsVoice(e.target.value)}
                      className="bg-slate-950 border border-slate-800 text-xs text-slate-200 rounded p-2 focus:outline-none flex-1"
                    >
                      <option value="Kore">Prebuilt Kore (Empathetic / News)</option>
                      <option value="Zephyr">Prebuilt Zephyr (Authoritative / Host)</option>
                      <option value="Puck">Prebuilt Puck (Friendly / Fast)</option>
                      <option value="Fenrir">Prebuilt Fenrir (Bass / Broadcaster)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-col justify-end">
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={() => handleSaveScript('draft')}
                      disabled={!scriptForm.headline}
                      className="flex-1 min-w-[120px] px-3 py-2.5 bg-slate-850 border border-slate-800 text-slate-200 rounded-lg text-xs font-sans font-bold hover:bg-slate-800 hover:text-white transition-colors cursor-pointer disabled:opacity-40"
                    >
                      Save as Draft
                    </button>
                    <button
                      onClick={() => handleSaveScript('pending_review')}
                      disabled={!scriptForm.headline}
                      className="flex-1 min-w-[140px] px-3 py-2.5 bg-gradient-to-r from-amber-600 to-orange-600 hover:from-amber-500 hover:to-orange-500 text-white rounded-lg text-xs font-sans font-bold shadow-md shadow-amber-950/40 border border-amber-500/30 transition-all cursor-pointer disabled:opacity-40"
                    >
                      Submit for Review
                    </button>
                    <button
                      onClick={synthesizeVoiceover}
                      disabled={!(scriptForm.voiceoverText || scriptForm.body) || synthesizingTTS}
                      className="w-full flex items-center justify-center space-x-2 bg-gradient-to-r from-red-650 to-blue-650 text-white px-4 py-2.5 rounded-lg text-xs font-bold hover:scale-[1.01] shadow-lg shadow-red-500/10 cursor-pointer transition-all disabled:opacity-30 disabled:scale-100"
                    >
                      <Zap className={`w-4 h-4 ${synthesizingTTS ? 'animate-bounce' : ''}`} />
                      <span>{synthesizingTTS ? 'Synthesizing...' : 'Generate Voiceover'}</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* TTS Audio Player if ready */}
              {ttsAudioUrl && (
                <div className="bg-slate-900/80 p-3 rounded border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-xs text-slate-300 font-mono">Synthesized Voiceover ready:</span>
                  </div>
                  <audio src={ttsAudioUrl} controls className="h-8 max-w-sm" />
                </div>
              )}

            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
