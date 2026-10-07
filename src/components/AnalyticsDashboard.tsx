import React, { useState, useEffect, useRef } from 'react';
import { 
  TrendingUp, 
  Users, 
  Clock, 
  Eye, 
  Share2, 
  MessageSquare, 
  Heart, 
  Radio, 
  Smartphone, 
  Laptop, 
  Monitor, 
  Tv, 
  Sparkles, 
  Zap, 
  Database, 
  Github, 
  Cloud, 
  Settings, 
  RefreshCw, 
  Layers, 
  CheckCircle, 
  AlertCircle, 
  FileText, 
  Globe,
  HelpCircle,
  PlayCircle,
  Download,
  FileDown,
  Printer,
  Check
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  BarChart, 
  Bar, 
  Cell,
  Legend,
  PieChart,
  Pie
} from 'recharts';
import { motion, AnimatePresence } from 'motion/react';
import { GeneratedScript, SocialPost } from '../types';
import { generateAnalyticsPdfReport } from '../utils/pdfExport';

interface AnalyticsDashboardProps {
  scripts?: GeneratedScript[];
  posts?: SocialPost[];
}

// Initial demographics mock data
const COUNTRY_DATA = [
  { country: 'Bangladesh', flag: '🇧🇩', share: 45, reach: '244,080', views: '298,400', avgWatch: '1m 24s' },
  { country: 'United States', flag: '🇺🇸', share: 22, reach: '119,328', views: '145,200', avgWatch: '1m 08s' },
  { country: 'India', flag: '🇮🇳', share: 15, reach: '81,360', views: '99,100', avgWatch: '1m 15s' },
  { country: 'Saudi Arabia', flag: '🇸🇦', share: 10, reach: '54,240', views: '66,100', avgWatch: '1m 42s' },
  { country: 'United Arab Emirates', flag: '🇦🇪', share: 8, reach: '43,392', views: '52,800', avgWatch: '1m 35s' },
];

const AGE_DEMOGRAPHICS = [
  { range: '13-17 (Gen Alpha)', percentage: 12, count: '65,088', color: '#38bdf8' },
  { range: '18-24 (Gen Z)', percentage: 48, count: '260,352', color: '#06b6d4' },
  { range: '25-34 (Millennials)', percentage: 28, count: '151,872', color: '#6366f1' },
  { range: '35-44 (Gen X)', percentage: 9, count: '48,816', color: '#a855f7' },
  { range: '45+ (Boomers)', percentage: 3, count: '16,272', color: '#ec4899' },
];

const GENDER_DATA = [
  { name: 'Male', value: 58, color: '#0284c7' },
  { name: 'Female', value: 38, color: '#db2777' },
  { name: 'Other/Non-binary', value: 4, color: '#7c3aed' },
];

export default function AnalyticsDashboard({ scripts = [], posts = [] }: AnalyticsDashboardProps) {
  const [selectedTimeframe, setSelectedTimeframe] = useState<'24h' | '7d' | '30d' | 'all'>('7d');
  const [selectedPlatform, setSelectedPlatform] = useState<string>('all');
  const [selectedCampaign, setSelectedCampaign] = useState<string>('all');
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [showConfigModal, setShowConfigModal] = useState<string | null>(null);
  const [showPdfModal, setShowPdfModal] = useState<boolean>(false);
  const [isExportingPdf, setIsExportingPdf] = useState<boolean>(false);
  const [optimizerCategory, setOptimizerCategory] = useState<string>('Tech news');
  const [optimizedTime, setOptimizedTime] = useState({ hour: '18:15', engagementGain: '+24.5%' });
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [cloudSqlStatus, setCloudSqlStatus] = useState<{ connected: boolean; region: string; instanceConnectionName?: string; database?: string } | null>({
    connected: true,
    region: 'asia-southeast1',
    instanceConnectionName: 'gen-lang-client-0808966802:asia-southeast1:gnn-studio-db-asia-se1',
    database: 'gnn_studio'
  });

  // Check Cloud SQL diagnostics on mount
  useEffect(() => {
    fetch('/api/cloudsql/status')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.status) {
          setCloudSqlStatus(data.status);
        }
      })
      .catch(err => console.warn('Cloud SQL status probe:', err));
  }, []);

  // PDF Export execution handler
  const handleExecutePdfExport = () => {
    setIsExportingPdf(true);
    showToast("Generating Executive PDF Analytics Report (Scripts & Social Reach)...");
    
    setTimeout(() => {
      try {
        const campaignObj = allCampaigns.find(c => c.id === selectedCampaign);
        generateAnalyticsPdfReport({
          timeframe: selectedTimeframe,
          platform: selectedPlatform,
          campaignTitle: campaignObj ? campaignObj.title : 'All GNN Publications (Aggregated)',
          metrics,
          scripts,
          posts,
          platformBenchmarks,
          countryData: COUNTRY_DATA,
          ageData: AGE_DEMOGRAPHICS
        });

        // Asynchronously persist analytics snapshot to Google Cloud SQL (asia-southeast1)
        fetch('/api/cloudsql/sync-analytics', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            timeframe: selectedTimeframe,
            platform: selectedPlatform,
            metrics,
            scriptsCount: scripts.length,
            postsCount: posts.length,
            payload: { exportedAt: new Date().toISOString() }
          })
        }).catch(err => console.warn('Cloud SQL analytics persist:', err));

        const timeStr = new Date().toTimeString().split(' ')[0];
        setTerminalLogs(prev => [
          { 
            id: `log-${Date.now()}`, 
            time: timeStr, 
            text: `Executive PDF Analytics Report exported successfully. Compiled ${scripts.length} registered scripts, ${posts.length} posts, and ${metrics.reach.toLocaleString()} reach metrics (Persisted to Cloud SQL asia-southeast1).`, 
            type: 'success' 
          },
          ...prev
        ]);

        showToast("PDF Report downloaded! Compiled scripts count & social reach metrics.");
        setShowPdfModal(false);
      } catch (err) {
        console.error("PDF Export error:", err);
        showToast("Failed to compile PDF. Please check browser permissions.");
      } finally {
        setIsExportingPdf(false);
      }
    }, 600);
  };

  // Accumulate combined published list for dropdown selector
  const rawCampaigns = [
    { id: 'all', title: 'All GNN Publications (Aggregated)' },
    { id: 'script-init-1', title: 'Fusion Grid Thermal Yield News' },
    ...scripts.map(s => ({ id: s.id, title: s.title || s.headline || 'Untitled Script' })),
    ...posts.map(p => ({ id: p.id, title: p.caption.substring(0, 32) + '...' }))
  ];

  // Safely deduplicate list to prevent React key duplicate warnings
  const allCampaigns = rawCampaigns.filter((item, index, self) =>
    index === self.findIndex((t) => t.id === item.id)
  );

  // Base state for real-time numeric counters
  const [metrics, setMetrics] = useState({
    views: 542400,
    likes: 184500,
    shares: 86120,
    comments: 34105,
    reach: 620400,
    activeViewers: 1420
  });

  // Track increments to trigger flash animations
  const [flashing, setFlashing] = useState<{ [key: string]: boolean }>({});

  // Dynamic log terminal messages
  const [terminalLogs, setTerminalLogs] = useState<Array<{ id: string; time: string; text: string; type: 'info' | 'success' | 'warn' }>>([
    { id: 'log-spec-1', time: '23:24:45', text: 'AI Planner: Recalculating demographic engagement coefficient based on new Bangladesh viewership.', type: 'info' },
    { id: 'log-spec-2', time: '23:24:30', text: 'Database MCP: Running standard indexing protocol for high-density social performance logs.', type: 'info' },
    { id: 'log-spec-3', time: '23:23:48', text: 'Google Drive MCP: Sync completed. Pushed backup copy of captioned reels.', type: 'success' },
    { id: 'log-spec-4', time: '23:23:13', text: 'AI Planner: Recalculating demographic engagement coefficient based on new Bangladesh viewership.', type: 'info' },
    { id: 'log-spec-5', time: '23:22:40', text: 'GitHub MCP: Automated commit of latest News Studio layout templates.', type: 'info' },
    { id: 'log-spec-6', time: '19:38:02', text: 'GNN AI OS initialization complete. Layer 1-5 online.', type: 'success' },
    { id: 'log-spec-7', time: '19:38:05', text: 'GitHub MCP loaded. SSH Key status verified.', type: 'info' },
    { id: 'log-spec-8', time: '19:38:10', text: 'Ocoya MCP channel sync: TikTok, YouTube, Instagram Reels connected.', type: 'success' },
    { id: 'log-spec-9', time: '19:38:12', text: 'SEO Engine optimization active: calculated optimal post time as 18:15 (+24.5% Gain).', type: 'info' }
  ]);

  // Handle live increments to simulate real-time performance analytics
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      // Choose a metric to increment
      const metricsList = ['views', 'likes', 'shares', 'comments', 'reach', 'activeViewers'];
      const randomMetric = metricsList[Math.floor(Math.random() * metricsList.length)] as keyof typeof metrics;
      
      let increment = 0;
      if (randomMetric === 'views') increment = Math.floor(Math.random() * 45) + 5;
      else if (randomMetric === 'reach') increment = Math.floor(Math.random() * 60) + 10;
      else if (randomMetric === 'likes') increment = Math.floor(Math.random() * 15) + 1;
      else if (randomMetric === 'shares') increment = Math.floor(Math.random() * 5) + 1;
      else if (randomMetric === 'comments') increment = Math.floor(Math.random() * 3) + 1;
      else if (randomMetric === 'activeViewers') {
        // Active viewers fluctuated up or down
        const change = Math.floor(Math.random() * 31) - 15;
        setMetrics(prev => ({
          ...prev,
          activeViewers: Math.max(800, prev.activeViewers + change)
        }));
        setFlashing(prev => ({ ...prev, activeViewers: true }));
        setTimeout(() => setFlashing(prev => ({ ...prev, activeViewers: false })), 800);
        return;
      }

      setMetrics(prev => ({
        ...prev,
        [randomMetric]: prev[randomMetric] + increment
      }));

      // Flash feedback
      setFlashing(prev => ({ ...prev, [randomMetric]: true }));
      setTimeout(() => setFlashing(prev => ({ ...prev, [randomMetric]: false })), 800);

      // Randomly push a realistic GNN Operating System log
      if (Math.random() > 0.75) {
        const events = [
          { text: 'Ocoya MCP: Successfully pulled real-time watchtime stats from YouTube API.', type: 'success' as const },
          { text: 'AI Planner: Recalculating demographic engagement coefficient based on new Bangladesh viewership.', type: 'info' as const },
          { text: 'Google Drive MCP: Sync completed. Pushed backup copy of captioned reels.', type: 'success' as const },
          { text: 'GitHub MCP: Automated commit of latest News Studio layout templates.', type: 'info' as const },
          { text: 'Database MCP: Running standard indexing protocol for high-density social performance logs.', type: 'info' as const },
          { text: 'Workflow Builder: Automated triggers complete for Viral Marketing short campaign.', type: 'success' as const }
        ];
        const randomEvent = events[Math.floor(Math.random() * events.length)];
        const timeStr = new Date().toTimeString().split(' ')[0];
        setTerminalLogs(prev => [
          { id: `log-${Date.now()}`, time: timeStr, text: randomEvent.text, type: randomEvent.type },
          ...prev.slice(0, 15) // Keep last 15 logs
        ]);
      }
    }, 2500);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Adjust metrics based on campaign dropdown selection
  useEffect(() => {
    if (selectedCampaign === 'all') {
      setMetrics({
        views: 542400,
        likes: 184500,
        shares: 86120,
        comments: 34105,
        reach: 620400,
        activeViewers: 1420
      });
    } else {
      // Generate a deterministic but customized set of stats for the selected campaign
      const hash = selectedCampaign.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      const seedViews = (hash % 8) * 15000 + 4200;
      setMetrics({
        views: seedViews,
        likes: Math.floor(seedViews * 0.35),
        shares: Math.floor(seedViews * 0.12),
        comments: Math.floor(seedViews * 0.06),
        reach: Math.floor(seedViews * 1.15),
        activeViewers: (hash % 15) * 8 + 45
      });
      showToast(`Switched campaign filters. Pulled analytical payload for "${allCampaigns.find(c => c.id === selectedCampaign)?.title}"`);
    }
  }, [selectedCampaign]);

  // Helper toast notifier
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleOptimizationTrigger = () => {
    const hours = ['16:45', '17:30', '18:15', '19:00', '20:30'];
    const randomHour = hours[Math.floor(Math.random() * hours.length)];
    const gains = ['+29.4%', '+25.2%', '+34.1%', '+21.8%', '+28.7%'];
    const randomGain = gains[Math.floor(Math.random() * gains.length)];
    setOptimizedTime({ hour: randomHour, engagementGain: randomGain });
    showToast(`AI Recalculated publish schedule for "${optimizerCategory}" category.`);
    
    // Add event log
    const timeStr = new Date().toTimeString().split(' ')[0];
    setTerminalLogs(prev => [
      { id: `log-${Date.now()}`, time: timeStr, text: `Gemini Content-Schedule Engine: Pushed optimized hour (${randomHour}) to Social Media Scheduler.`, type: 'success' },
      ...prev
    ]);
  };

  const triggerManualSync = () => {
    showToast("Re-syncing with GNN AI Operating System MCP Gateway...");
    const timeStr = new Date().toTimeString().split(' ')[0];
    setTerminalLogs(prev => [
      { id: `log-${Date.now()}`, time: timeStr, text: "Forced full MCP Hub handshake. Syncing database, Ocoya publisher, and Google Cloud telemetry.", type: 'info' },
      ...prev
    ]);
    
    // Slightly alter views for interactive feel
    setMetrics(prev => ({
      ...prev,
      views: prev.views + Math.floor(Math.random() * 120) + 15,
      likes: prev.likes + Math.floor(Math.random() * 40) + 5
    }));
  };

  // Recharts engagement multi-series based on platform & time filters
  const generateChartData = () => {
    const baseData = [
      { name: 'Mon', YouTube: 4000, TikTok: 2400, Instagram: 2400, Facebook: 1800, Portal: 1200 },
      { name: 'Tue', YouTube: 4500, TikTok: 3800, Instagram: 2800, Facebook: 2000, Portal: 1500 },
      { name: 'Wed', YouTube: 5100, TikTok: 5200, Instagram: 3100, Facebook: 2200, Portal: 1800 },
      { name: 'Thu', YouTube: 4800, TikTok: 6100, Instagram: 3400, Facebook: 2500, Portal: 1600 },
      { name: 'Fri', YouTube: 6200, TikTok: 8500, Instagram: 4200, Facebook: 3150, Portal: 2100 },
      { name: 'Sat', YouTube: 7500, TikTok: 11000, Instagram: 5900, Facebook: 4200, Portal: 2900 },
      { name: 'Sun', YouTube: 8100, TikTok: 12500, Instagram: 6400, Facebook: 4400, Portal: 3200 },
    ];

    // Scale data depending on selected campaign
    let multiplier = 1;
    if (selectedCampaign !== 'all') {
      const hash = selectedCampaign.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
      multiplier = 0.1 + (hash % 10) * 0.15;
    }

    // Adapt timeframe
    let timeLabel = baseData;
    if (selectedTimeframe === '24h') {
      timeLabel = [
        { name: '00:00', YouTube: 500, TikTok: 1200, Instagram: 600, Facebook: 400, Portal: 300 },
        { name: '04:00', YouTube: 300, TikTok: 900, Instagram: 400, Facebook: 200, Portal: 150 },
        { name: '08:00', YouTube: 1200, TikTok: 2500, Instagram: 1300, Facebook: 800, Portal: 500 },
        { name: '12:00', YouTube: 2100, TikTok: 4800, Instagram: 2200, Facebook: 1500, Portal: 950 },
        { name: '16:00', YouTube: 3800, TikTok: 7200, Instagram: 3900, Facebook: 2200, Portal: 1400 },
        { name: '20:00', YouTube: 5400, TikTok: 9100, Instagram: 4600, Facebook: 3100, Portal: 1800 },
      ];
    } else if (selectedTimeframe === '30d') {
      timeLabel = [
        { name: 'Week 1', YouTube: 18000, TikTok: 22000, Instagram: 11000, Facebook: 9000, Portal: 6500 },
        { name: 'Week 2', YouTube: 22000, TikTok: 29000, Instagram: 14000, Facebook: 11000, Portal: 8200 },
        { name: 'Week 3', YouTube: 26000, TikTok: 34000, Instagram: 17000, Facebook: 13500, Portal: 9400 },
        { name: 'Week 4', YouTube: 31000, TikTok: 42000, Instagram: 21000, Facebook: 15400, Portal: 11500 },
      ];
    } else if (selectedTimeframe === 'all') {
      timeLabel = [
        { name: 'Q1 26', YouTube: 42000, TikTok: 68000, Instagram: 34000, Facebook: 25000, Portal: 18000 },
        { name: 'Q2 26', YouTube: 68000, TikTok: 92000, Instagram: 51000, Facebook: 39000, Portal: 26000 },
        { name: 'Q3 26', YouTube: 81000, TikTok: 125000, Instagram: 64000, Facebook: 44000, Portal: 32000 },
      ];
    }

    return timeLabel.map(row => ({
      name: row.name,
      YouTube: Math.floor(row.YouTube * multiplier),
      TikTok: Math.floor(row.TikTok * multiplier),
      Instagram: Math.floor(row.Instagram * multiplier),
      Facebook: Math.floor(row.Facebook * multiplier),
      Portal: Math.floor(row.Portal * multiplier),
    }));
  };

  const chartData = generateChartData();

  // Benchmark breakdown for bar charts based on platform selection
  const platformBenchmarks = [
    { name: 'TikTok', views: Math.floor(metrics.views * 0.42), reach: Math.floor(metrics.reach * 0.45), color: '#00F2FE' },
    { name: 'YouTube', views: Math.floor(metrics.views * 0.30), reach: Math.floor(metrics.reach * 0.28), color: '#FF0055' },
    { name: 'Instagram', views: Math.floor(metrics.views * 0.16), reach: Math.floor(metrics.reach * 0.15), color: '#C13584' },
    { name: 'Facebook', views: Math.floor(metrics.views * 0.09), reach: Math.floor(metrics.reach * 0.08), color: '#1877F2' },
    { name: 'GNN Portal', views: Math.floor(metrics.views * 0.03), reach: Math.floor(metrics.reach * 0.04), color: '#38bdf8' },
  ];

  const getFilteredBenchmark = () => {
    if (selectedPlatform === 'all') return platformBenchmarks;
    return platformBenchmarks.filter(p => p.name.toLowerCase() === selectedPlatform.toLowerCase() || (selectedPlatform === 'youtube' && p.name === 'YouTube') || (selectedPlatform === 'tiktok' && p.name === 'TikTok'));
  };

  const filteredBenchmark = getFilteredBenchmark();

  // MCP Hub Connections list
  const mcpHubs = [
    { id: 'github', name: 'GitHub MCP', desc: 'Secure repository cloning, automated commits & branches', status: 'connected', type: 'Developer', details: 'SSH Handshake verified. Linked to github.com/saiful-pavel/gnn-studio-prod. Full read/write active.' },
    { id: 'drive', name: 'Google Drive MCP', desc: 'Auto-sync assets & render archives', status: 'idle', type: 'Storage', details: 'OAuth active. Connected to Google Workspace Drive. Synced 34 minutes ago.' },
    { id: 'gmail', name: 'Gmail MCP', desc: 'Broadcast summaries & press pitch releases', status: 'connected', type: 'Workspace', details: 'OAuth active. Client credentials validated. Accessing newsroom email loops.' },
    { id: 'calendar', name: 'Calendar MCP', desc: 'Sync editorial boards & publication timers', status: 'connected', type: 'Workspace', details: 'OAuth active. Synced with GNN Science & Technology live calendar.' },
    { id: 'notion', name: 'Notion MCP', desc: 'Pull news hooks & structured templates', status: 'connected', type: 'Integrations', details: 'Integrations Token verified. Subscribed to "Broadcast Script Master List".' },
    { id: 'figma', name: 'Figma MCP', desc: 'Sync vector cards & branding shapes', status: 'idle', type: 'Creative', details: 'Developer API token stored. Linked to file: GNN_Social_Asset_Template.' },
    { id: 'blender', name: 'Blender MCP', desc: 'Automate 3D virtual studio rendering triggers', status: 'idle', type: 'Creative', details: 'Render-farm socket online. Standing by for scene trigger cues.' },
    { id: 'ocoya', name: 'Ocoya MCP', desc: 'Multi-channel social scheduler & publish gateway', status: 'active', type: 'Publishing', details: 'Fully authorized API. Serving TikTok, YouTube, Instagram Reels, Facebook and X APIs.' },
    { id: 'database', name: 'Database MCP', desc: 'PostgreSQL instance metrics synchronization', status: 'active', type: 'Database', details: 'Cloud SQL instance active on 0.0.0.0. Client pool size: 24 active sockets.' },
    { id: 'docker', name: 'Docker MCP', desc: 'Control virtual render environment containers', status: 'connected', type: 'System', details: 'Local engine socket live. Virtual sandboxes spawning successfully.' },
    { id: 'kubernetes', name: 'Kubernetes MCP', desc: 'Scale real-time caption pipelines', status: 'connected', type: 'System', details: 'GNN Node group scaling automatically. Pod replicas healthy.' },
    { id: 'cloud', name: 'Cloud MCP', desc: 'Google Cloud Run microservices routing logs', status: 'active', type: 'System', details: 'Hosted on Google Cloud Run. Ingress reverse proxy port 3000 online.' }
  ];

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Toast notifier */}
      <AnimatePresence>
        {toastMessage && (
          <motion.div 
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className="fixed top-6 right-6 z-50 flex items-center gap-2.5 bg-slate-900/95 border border-cyan-500/30 text-cyan-400 px-4 py-3 rounded-xl shadow-2xl shadow-cyan-950/20 text-xs font-mono backdrop-blur-md"
          >
            <Zap className="w-4 h-4 text-cyan-400 animate-pulse" />
            <span>{toastMessage}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header and Live Status */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center space-y-4 xl:space-y-0 bg-slate-950/50 border border-slate-900 rounded-2xl p-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold tracking-widest text-cyan-400 uppercase mb-2">
            <Radio className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
            <span>Layer 4 — Performance Automation</span>
          </div>
          <h2 className="text-3xl font-display font-bold tracking-tight text-white flex items-center gap-2">
            <TrendingUp className="w-8 h-8 text-cyan-500 animate-pulse" /> GNN AI OS Analytics Studio
          </h2>
          <p className="text-sm text-slate-400 max-w-2xl mt-1">
            Real-time cross-platform viewership tracking, audience demographics segmentation, and automatic schedule optimizations connected via GNN MCP server routing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Direct Download as PDF Button */}
          <button
            onClick={handleExecutePdfExport}
            disabled={isExportingPdf}
            id="download-analytics-pdf-btn"
            className="flex items-center gap-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-semibold shadow-lg shadow-red-950/40 border border-red-500/40 rounded-lg px-4 py-2 text-xs font-mono transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed group"
            title="Download PDF report with current script counts and social reach metrics"
          >
            {isExportingPdf ? (
              <>
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                <span>Compiling PDF...</span>
              </>
            ) : (
              <>
                <FileDown className="w-4 h-4 text-red-200 group-hover:scale-110 transition-transform" />
                <span>Download as PDF</span>
              </>
            )}
          </button>

          {/* Customize PDF Report Modal Trigger */}
          <button
            onClick={() => setShowPdfModal(true)}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 text-slate-300 border border-slate-800 hover:border-slate-700 rounded-lg px-3 py-2 text-xs font-mono transition-all cursor-pointer"
            title="Preview report sections and custom filters before download"
          >
            <span>Preview Scope</span>
          </button>

          {/* Cloud SQL Region Status Indicator */}
          <div className="hidden sm:flex items-center gap-2 bg-slate-900/90 border border-emerald-500/30 px-3 py-2 rounded-lg text-xs font-mono text-emerald-400">
            <Database className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
            <span className="text-[11px] font-bold">Cloud SQL (asia-southeast1)</span>
          </div>

          {/* Real-time sync toggle */}
          <button 
            onClick={() => {
              setIsLiveStreaming(!isLiveStreaming);
              showToast(isLiveStreaming ? "Paused real-time data streaming." : "Resumed real-time data streaming.");
            }}
            className={`flex items-center space-x-2 px-3 py-2 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
              isLiveStreaming 
                ? 'bg-cyan-500/10 border-cyan-500/40 text-cyan-300' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLiveStreaming ? 'bg-cyan-400 animate-ping' : 'bg-slate-600'}`} />
            <span>{isLiveStreaming ? 'LIVE SYNC ACTIVE' : 'LIVE SYNC PAUSED'}</span>
          </button>

          {/* Manual Force Sync */}
          <button 
            onClick={triggerManualSync}
            className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 text-slate-200 border border-slate-800 hover:border-slate-700 rounded-lg px-3.5 py-2 font-mono text-xs cursor-pointer transition-all"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Force MCP Handshake</span>
          </button>
        </div>
      </div>

      {/* Campaign & Filter bar */}
      <div className="flex flex-col lg:flex-row gap-4 justify-between items-stretch lg:items-center bg-slate-950/40 border border-slate-900/60 p-4 rounded-xl">
        <div className="flex flex-col sm:flex-row gap-4 items-stretch sm:items-center flex-1">
          {/* Campaign Selector */}
          <div className="flex-1 min-w-[200px]">
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Selected Publication Context</label>
            <select 
              value={selectedCampaign} 
              onChange={(e) => setSelectedCampaign(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 text-xs font-medium text-slate-200 focus:border-cyan-500 outline-none cursor-pointer"
            >
              {allCampaigns.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.id === 'all' ? '🌐 ' : '📄 '}
                  {c.title}
                </option>
              ))}
            </select>
          </div>

          {/* Platform filter tabs */}
          <div>
            <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Platform Filter</label>
            <div className="flex flex-wrap gap-1 bg-slate-900/80 p-1 border border-slate-850 rounded-lg">
              {[
                { id: 'all', label: 'All' },
                { id: 'youtube', label: 'YouTube' },
                { id: 'tiktok', label: 'TikTok' },
                { id: 'instagram', label: 'Instagram' },
                { id: 'facebook', label: 'Facebook' },
                { id: 'portal', label: 'GNN Live' }
              ].map((platform) => (
                <button
                  key={platform.id}
                  onClick={() => {
                    setSelectedPlatform(platform.id);
                    showToast(`Filtering metrics to: ${platform.label}`);
                  }}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                    selectedPlatform === platform.id 
                      ? 'bg-cyan-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/10' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                  }`}
                >
                  {platform.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Timeframe tab */}
        <div>
          <label className="block text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-1.5">Time Period</label>
          <div className="flex bg-slate-900/80 p-1 border border-slate-850 rounded-lg">
            {[
              { id: '24h', label: '24 Hours' },
              { id: '7d', label: '7 Days' },
              { id: '30d', label: '30 Days' },
              { id: 'all', label: 'All Time' }
            ].map((tf) => (
              <button
                key={tf.id}
                onClick={() => {
                  setSelectedTimeframe(tf.id as any);
                  showToast(`Timeframe shifted to last ${tf.label}`);
                }}
                className={`px-3 py-1.5 rounded-md text-[11px] font-medium transition-all cursor-pointer ${
                  selectedTimeframe === tf.id 
                    ? 'bg-slate-800 text-cyan-400 font-bold border border-slate-700/60' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {tf.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Analytics Metric Cards Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {[
          { 
            key: 'views', 
            label: 'Total Views', 
            val: metrics.views.toLocaleString(), 
            pct: '+18.4% vs last week', 
            desc: 'Aggregate video impressions', 
            icon: Eye, 
            color: 'text-cyan-400', 
            glow: 'shadow-cyan-950/20' 
          },
          { 
            key: 'likes', 
            label: 'Total Likes', 
            val: metrics.likes.toLocaleString(), 
            pct: '+22.1%', 
            desc: 'Video reactions & double-taps', 
            icon: Heart, 
            color: 'text-rose-400', 
            glow: 'shadow-rose-950/20' 
          },
          { 
            key: 'shares', 
            label: 'Shares Out', 
            val: metrics.shares.toLocaleString(), 
            pct: '+32.1%', 
            desc: 'Viral loop loopings triggered', 
            icon: Share2, 
            color: 'text-purple-400', 
            glow: 'shadow-purple-950/20' 
          },
          { 
            key: 'comments', 
            label: 'Comments Feed', 
            val: metrics.comments.toLocaleString(), 
            pct: '+14.9%', 
            desc: 'Cross-channel direct discussions', 
            icon: MessageSquare, 
            color: 'text-yellow-400', 
            glow: 'shadow-yellow-950/20' 
          },
          { 
            key: 'reach', 
            label: 'Unique Reach', 
            val: metrics.reach.toLocaleString(), 
            pct: '+25.2%', 
            desc: 'Distinct viewer accounts touched', 
            icon: Users, 
            color: 'text-emerald-400', 
            glow: 'shadow-emerald-950/20' 
          },
          { 
            key: 'activeViewers', 
            label: 'Live Conc. Viewers', 
            val: metrics.activeViewers.toLocaleString(), 
            pct: 'Real-time active', 
            desc: 'Simulated current streaming loops', 
            icon: Radio, 
            color: 'text-red-500', 
            glow: 'shadow-red-950/20' 
          }
        ].map((card) => {
          const isFlashing = flashing[card.key];
          return (
            <div 
              key={card.key} 
              className={`relative bg-slate-950 border border-slate-900/90 rounded-xl p-4 hover:border-slate-800 transition-all duration-300 shadow-lg ${card.glow} flex flex-col justify-between`}
            >
              {/* Subtle real-time flash indicator background */}
              {isFlashing && (
                <span className="absolute inset-0 bg-cyan-500/5 rounded-xl animate-pulse pointer-events-none border border-cyan-500/20" />
              )}
              
              <div className="flex justify-between items-start mb-2.5">
                <span className="text-[9px] font-mono text-slate-500 uppercase tracking-wider">{card.label}</span>
                <card.icon className={`w-4 h-4 ${card.color} ${isFlashing ? 'animate-bounce' : ''}`} />
              </div>
              <div>
                <h3 className={`text-xl font-mono font-bold text-white transition-all duration-200 ${isFlashing ? 'text-cyan-300 scale-105' : ''}`}>
                  {card.val}
                </h3>
                <p className="text-[10px] text-emerald-400 font-semibold mt-1 flex items-center gap-0.5">
                  <TrendingUp className="w-3 h-3" />
                  {card.pct}
                </p>
                <div className="mt-2 pt-2 border-t border-slate-900/60">
                  <p className="text-[9px] text-slate-500 leading-relaxed font-mono">{card.desc}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Charts Visualization Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Engagement Trend (Area Chart) */}
        <div className="lg:col-span-2 bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-start mb-4">
              <div>
                <h4 className="text-sm font-sans font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                  <TrendingUp className="w-4 h-4 text-cyan-400" /> Multi-Platform Performance Curve
                </h4>
                <p className="text-xs text-slate-400 font-mono">Real-time interactions per platform across time slots</p>
              </div>
              <div className="flex gap-2 text-[10px] font-mono bg-slate-900/70 p-1 rounded-lg border border-slate-850">
                <span className="text-slate-400 px-1.5 py-0.5">Unit: Impressions</span>
              </div>
            </div>

            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorYt" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#FF0055" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#FF0055" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorTok" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#00F2FE" stopOpacity={0.35}/>
                      <stop offset="95%" stopColor="#00F2FE" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorIg" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#C13584" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#C13584" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorFb" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#1877F2" stopOpacity={0.25}/>
                      <stop offset="95%" stopColor="#1877F2" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorPortal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#10172a" />
                  <YAxis style={{ fontSize: '9px', fill: '#64748b', fontFamily: 'var(--font-mono)' }} />
                  <XAxis dataKey="name" style={{ fontSize: '9px', fill: '#64748b', fontFamily: 'var(--font-mono)' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px' }} 
                    labelStyle={{ color: '#94a3b8', fontSize: '11px', fontFamily: 'var(--font-mono)' }}
                    itemStyle={{ fontSize: '11px', padding: '1px 0' }}
                  />
                  
                  {/* Conditionally render platforms based on selection */}
                  {(selectedPlatform === 'all' || selectedPlatform === 'youtube') && (
                    <Area type="monotone" dataKey="YouTube" stroke="#FF0055" fillOpacity={1} fill="url(#colorYt)" strokeWidth={2.5} name="YouTube Studio" />
                  )}
                  {(selectedPlatform === 'all' || selectedPlatform === 'tiktok') && (
                    <Area type="monotone" dataKey="TikTok" stroke="#00F2FE" fillOpacity={1} fill="url(#colorTok)" strokeWidth={2.5} name="TikTok Shorts" />
                  )}
                  {(selectedPlatform === 'all' || selectedPlatform === 'instagram') && (
                    <Area type="monotone" dataKey="Instagram" stroke="#C13584" fillOpacity={1} fill="url(#colorIg)" strokeWidth={2} name="Instagram Reels" />
                  )}
                  {(selectedPlatform === 'all' || selectedPlatform === 'facebook') && (
                    <Area type="monotone" dataKey="Facebook" stroke="#1877F2" fillOpacity={1} fill="url(#colorFb)" strokeWidth={1.5} name="Facebook Watch" />
                  )}
                  {(selectedPlatform === 'all' || selectedPlatform === 'portal') && (
                    <Area type="monotone" dataKey="Portal" stroke="#38bdf8" fillOpacity={1} fill="url(#colorPortal)" strokeWidth={2} name="GNN Web Stream" />
                  )}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Color Indicators Legend */}
          <div className="flex flex-wrap justify-center gap-4 text-[10px] font-mono mt-3 pt-3 border-t border-slate-900/60">
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 bg-[#FF0055] rounded-full" />
              <span className="text-slate-400">YouTube (30%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 bg-[#00F2FE] rounded-full" />
              <span className="text-slate-400">TikTok Shorts (42%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 bg-[#C13584] rounded-full" />
              <span className="text-slate-400">Instagram (16%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 bg-[#1877F2] rounded-full" />
              <span className="text-slate-400">Facebook (9%)</span>
            </div>
            <div className="flex items-center space-x-1.5">
              <span className="w-2 h-2 bg-[#38bdf8] rounded-full" />
              <span className="text-slate-400">GNN Web Portal (3%)</span>
            </div>
          </div>
        </div>

        {/* Platform Share Breakdown (Bar Chart) */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h4 className="text-sm font-sans font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Globe className="w-4 h-4 text-purple-400" /> Interaction vs Reach Index
              </h4>
              <p className="text-xs text-slate-400 font-mono">Channel-wise breakdown comparing views with unique reach</p>
            </div>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={filteredBenchmark} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#10172a" />
                  <YAxis style={{ fontSize: '9px', fill: '#64748b', fontFamily: 'var(--font-mono)' }} />
                  <XAxis dataKey="name" style={{ fontSize: '9px', fill: '#64748b', fontFamily: 'var(--font-mono)' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#020617', borderColor: '#1e293b', borderRadius: '8px' }}
                    itemStyle={{ fontSize: '11px' }}
                  />
                  <Legend wrapperStyle={{ fontSize: '10px', fontFamily: 'var(--font-mono)' }} />
                  <Bar dataKey="views" name="Impressions" fill="#00F2FE" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="reach" name="Unique Reach" fill="#a855f7" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <p className="text-[10px] font-mono text-center text-slate-500 mt-2">
            *Audience retention peak points identified around portrait short loops.
          </p>
        </div>

      </div>

      {/* Demographics row */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* Geographic Distribution */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-xl">
          <div className="mb-4">
            <h4 className="text-sm font-sans font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <span>🇧🇩</span> Geographic Demographics (Active Streams)
            </h4>
            <p className="text-xs text-slate-400 font-mono">Content consumption and avg. video retention per region</p>
          </div>

          <div className="space-y-3">
            {COUNTRY_DATA.map((entry, idx) => (
              <div key={idx} className="bg-slate-900/30 border border-slate-900 rounded-lg p-2.5">
                <div className="flex justify-between items-center text-xs font-mono mb-1">
                  <span className="flex items-center gap-2 font-bold text-slate-200">
                    <span className="text-base">{entry.flag}</span>
                    {entry.country}
                  </span>
                  <span className="text-cyan-400 font-bold">{entry.share}% Share</span>
                </div>
                
                {/* Progress Bar */}
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden mb-1.5">
                  <div 
                    className="h-full bg-gradient-to-r from-cyan-500 to-purple-500" 
                    style={{ width: `${entry.share * 2}%` }} 
                  />
                </div>

                <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                  <span>Reach: <strong className="text-slate-400">{entry.reach}</strong></span>
                  <span>Views: <strong className="text-slate-400">{entry.views}</strong></span>
                  <span>Avg Watch: <strong className="text-cyan-400">{entry.avgWatch}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Age Groups & Gender Splits */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-xl flex flex-col justify-between">
          <div>
            <div className="mb-4">
              <h4 className="text-sm font-sans font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-4 h-4 text-pink-400" /> Age Bracket Analysis
              </h4>
              <p className="text-xs text-slate-400 font-mono">Age breakdown tracking GNN digital audience clusters</p>
            </div>

            <div className="space-y-3.5">
              {AGE_DEMOGRAPHICS.map((entry, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono">
                    <span className="text-slate-300 font-medium">{entry.range}</span>
                    <span className="text-slate-400">{entry.percentage}% ({entry.count})</span>
                  </div>
                  <div className="w-full bg-slate-900/50 h-2 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full" 
                      style={{ width: `${entry.percentage}%`, backgroundColor: entry.color }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Gender Split row */}
          <div className="mt-6 pt-5 border-t border-slate-900/60">
            <h5 className="text-[10px] font-mono text-slate-500 uppercase tracking-widest mb-3">Gender Distribution</h5>
            <div className="grid grid-cols-3 gap-2">
              {GENDER_DATA.map((g, i) => (
                <div key={i} className="bg-slate-900/30 border border-slate-900 rounded-lg p-2.5 text-center">
                  <span className="text-[10px] font-mono text-slate-500 block mb-1">{g.name}</span>
                  <span className="text-lg font-mono font-bold text-slate-100" style={{ color: g.color }}>
                    {g.value}%
                  </span>
                  <div className="w-full bg-slate-900 h-1 rounded-full mt-1.5 overflow-hidden">
                    <div className="h-full" style={{ width: `${g.value}%`, backgroundColor: g.color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Device Distribution & Live Timing Optimizer */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-xl flex flex-col justify-between space-y-4">
          <div>
            <div className="mb-3">
              <h4 className="text-sm font-sans font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Smartphone className="w-4 h-4 text-cyan-400" /> Device Distribution
              </h4>
              <p className="text-xs text-slate-400 font-mono">Primary interfaces active on GNN streams</p>
            </div>

            <div className="space-y-2.5">
              {[
                { label: 'Mobile Loops (Portrait)', value: 84, icon: Smartphone, color: 'from-cyan-500 to-blue-500' },
                { label: 'Smart TV streams', value: 10, icon: Tv, color: 'from-purple-500 to-indigo-500' },
                { label: 'Desktop Web Viewers', value: 4, icon: Laptop, color: 'from-pink-500 to-rose-500' },
                { label: 'Tablets & Spans', value: 2, icon: Monitor, color: 'from-teal-500 to-emerald-500' }
              ].map((entry, idx) => (
                <div key={idx} className="space-y-1">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span className="flex items-center gap-1.5 text-slate-200">
                      <entry.icon className="w-3.5 h-3.5 text-slate-500" />
                      {entry.label}
                    </span>
                    <span className="font-bold text-slate-300">{entry.value}%</span>
                  </div>
                  <div className="w-full bg-slate-900/60 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${entry.color}`} 
                      style={{ width: `${entry.value}%` }} 
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-900/80 to-cyan-950/20 border border-slate-800 rounded-xl p-3.5 space-y-2.5">
            <div>
              <div className="flex justify-between items-center">
                <h5 className="text-[11px] font-sans font-bold text-white uppercase tracking-wider flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5 text-yellow-400" /> Gemini Timing-Optimizer
                </h5>
                <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-cyan-400/10 border border-cyan-400/20 text-cyan-400">
                  Active Agent
                </span>
              </div>
              <p className="text-[10px] text-slate-400 font-mono leading-normal mt-0.5">Calculates peak times per industry segment using historic analytics.</p>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[8px] font-mono text-slate-500 uppercase mb-1">Industry Stream</label>
                  <select 
                    value={optimizerCategory} 
                    onChange={(e) => setOptimizerCategory(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded px-1.5 py-1 text-[10px] text-slate-300 outline-none"
                  >
                    <option value="Breaking news">Local/National News</option>
                    <option value="Tech news">Tech & Security</option>
                    <option value="Sports stream">Sports Broadcaster</option>
                    <option value="Entertainment">Viral Creator</option>
                  </select>
                </div>
                
                <div className="bg-slate-950 border border-slate-850 rounded p-1 text-center flex flex-col justify-center">
                  <span className="text-[7px] font-mono text-slate-500 uppercase">Target Hour</span>
                  <span className="text-sm font-mono text-yellow-400 font-extrabold">{optimizedTime.hour}</span>
                  <span className="text-[8px] text-emerald-400 font-mono">{optimizedTime.engagementGain} Gain</span>
                </div>
              </div>

              <button 
                onClick={handleOptimizationTrigger}
                className="w-full bg-slate-100 hover:bg-slate-200 text-slate-950 text-[10px] font-mono font-bold py-1.5 rounded transition-all cursor-pointer flex items-center justify-center gap-1"
              >
                <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                <span>Optimize Content Schedule</span>
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* GNN AI OS Control Hub & MCP Server Handshakes */}
      <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 shadow-xl">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
          <div>
            <h4 className="text-base font-sans font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-5 h-5 text-cyan-400" /> GNN AI OS Integration Suite & MCP Gateway
            </h4>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Live routing telemetry status for Model Context Protocol (MCP) servers and OS layer modules
            </p>
          </div>
          <div className="flex items-center space-x-1.5 bg-slate-900 border border-slate-850 rounded-lg px-2.5 py-1 text-[10px] font-mono text-slate-400 mt-2 md:mt-0">
            <span>Platform Core Version:</span>
            <span className="text-cyan-400 font-bold">v1.0 (Enterprise Suite)</span>
          </div>
        </div>

        {/* Grid of OS Layers and MCP Telemetry */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          {mcpHubs.map((hub) => (
            <div 
              key={hub.id} 
              onClick={() => setShowConfigModal(hub.id)}
              className="group bg-slate-900/30 border border-slate-900 hover:border-slate-800 rounded-xl p-4 transition-all cursor-pointer shadow hover:shadow-cyan-950/5 relative overflow-hidden"
            >
              {/* Telemetry connection status bar */}
              <div className={`absolute top-0 left-0 right-0 h-1 ${
                hub.status === 'active' ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                hub.status === 'connected' ? 'bg-cyan-500' : 'bg-slate-700'
              }`} />

              <div className="flex justify-between items-start mb-2 pt-1">
                <div>
                  <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-400 uppercase">
                    {hub.type}
                  </span>
                  <h5 className="text-xs font-bold text-slate-100 group-hover:text-cyan-400 transition-colors mt-1">
                    {hub.name}
                  </h5>
                </div>
                
                {/* Status Indicator bubble */}
                <div className="flex items-center space-x-1.5">
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    hub.status === 'active' ? 'bg-emerald-400 animate-pulse' :
                    hub.status === 'connected' ? 'bg-cyan-400' : 'bg-slate-500'
                  }`} />
                  <span className="text-[9px] font-mono text-slate-500 capitalize">
                    {hub.status}
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 leading-normal mb-2.5 font-mono">
                {hub.desc}
              </p>

              <div className="text-[9px] font-mono text-cyan-500/70 group-hover:text-cyan-400 flex items-center gap-0.5 mt-auto">
                <span>View Details & Config</span>
                <span>→</span>
              </div>
            </div>
          ))}
        </div>

        {/* Live Logs Terminal & AI Copilot Insights split row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* OS Event Terminal */}
          <div className="lg:col-span-2 bg-slate-950 border border-slate-900 rounded-xl p-4 flex flex-col h-72">
            <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-3">
              <div className="flex items-center space-x-1.5 text-xs font-mono font-bold text-slate-400">
                <span className="w-2.5 h-2.5 rounded-full bg-cyan-500" />
                <span>GNN AI OS System Telemetry Log Stream</span>
              </div>
              <span className="text-[9px] font-mono text-slate-500">Live Listening ...</span>
            </div>

            {/* Terminal Body */}
            <div className="flex-1 overflow-y-auto font-mono text-[10px] text-slate-300 space-y-1.5 pr-2 custom-scrollbar">
              {terminalLogs.map((log) => (
                <div key={log.id} className="flex items-start space-x-2 leading-relaxed">
                  <span className="text-slate-600">[{log.time}]</span>
                  <span className={`px-1 py-0.2 rounded text-[8px] font-bold ${
                    log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                    log.type === 'warn' ? 'bg-amber-500/10 text-amber-400' : 'bg-cyan-500/10 text-cyan-400'
                  }`}>
                    {log.type.toUpperCase()}
                  </span>
                  <span className="flex-1 text-slate-300">{log.text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Content Analytics Insights Card */}
          <div className="bg-gradient-to-br from-slate-900/40 to-indigo-950/10 border border-slate-850 rounded-xl p-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-mono font-bold text-yellow-400 mb-2">
                <Sparkles className="w-4 h-4 text-yellow-400 animate-pulse" />
                <span>AI Operating System Insights</span>
              </div>
              <h5 className="text-xs font-bold text-white mb-2 uppercase tracking-wide">
                Audience Engagement Hotspots
              </h5>
              <div className="space-y-2.5 text-xs text-slate-400 font-mono leading-relaxed">
                <p>
                  🤖 <strong className="text-slate-200">Bangladesh Market Spike:</strong> Views surged 45% following automated Bengali subtitle generation templates on TikTok anchor shorts.
                </p>
                <p>
                  ⏱️ <strong className="text-slate-200">Publish Optimization:</strong> Scheduling scientific publications at <strong className="text-yellow-400">{optimizedTime.hour}</strong> yields peak retention rates among Gen-Z cohorts.
                </p>
                <p>
                  📱 <strong className="text-slate-200">Portrait Format Priority:</strong> Over 84% of impressions originate on mobile loops. Porting standard 16:9 scripts to vertical layout yields substantial CTR gain.
                </p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-900/60 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Updated: Real-time</span>
              <span className="text-cyan-400">GNN AI Analytics Desk</span>
            </div>
          </div>

        </div>
      </div>

      {/* Config Details Modal popup */}
      <AnimatePresence>
        {/* PDF Export Configuration & Preview Modal */}
        {showPdfModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="w-full max-w-xl bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden"
            >
              {/* Header red accent stripe */}
              <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-red-500 to-amber-500" />
              
              <button 
                onClick={() => setShowPdfModal(false)}
                className="absolute top-5 right-5 text-slate-400 hover:text-white font-mono text-xs cursor-pointer p-1"
              >
                ✕ Close
              </button>

              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-xl bg-red-600/10 border border-red-500/30 flex items-center justify-center text-red-500">
                  <FileDown className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-lg font-bold text-white flex items-center gap-2">
                    Executive Analytics PDF Report
                  </h4>
                  <p className="text-xs text-slate-400 font-mono">
                    Workspace Editorial, Reach & Viewership Export
                  </p>
                </div>
              </div>

              {/* Scope Summary Preview Card */}
              <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-850 space-y-3 mb-5">
                <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider flex items-center justify-between border-b border-slate-850 pb-2">
                  <span>Report Scope & Inventory Preview</span>
                  <span className="text-red-400 font-bold">2-Page PDF Document</span>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">Scripts Recorded</span>
                    <strong className="text-base text-white font-mono">{scripts.length} Scripts</strong>
                    <span className="text-[9px] text-emerald-400 block mt-0.5">
                      {scripts.filter(s => s.status === 'approved').length} approved
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">Social Reach</span>
                    <strong className="text-base text-cyan-400 font-mono">
                      {(metrics.reach / 1000).toFixed(0)}k reach
                    </strong>
                    <span className="text-[9px] text-slate-400 block mt-0.5">Across 5 channels</span>
                  </div>

                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-[10px] text-slate-400 block font-mono">Total Viewership</span>
                    <strong className="text-base text-purple-400 font-mono">
                      {(metrics.views / 1000).toFixed(0)}k views
                    </strong>
                    <span className="text-[9px] text-emerald-400 block mt-0.5">+18.4% growth</span>
                  </div>
                </div>

                <div className="space-y-1.5 text-xs text-slate-300 pt-1 font-mono text-[11px]">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Campaign Filter:</span>
                    <span className="text-slate-200 font-semibold truncate max-w-[260px]">
                      {allCampaigns.find(c => c.id === selectedCampaign)?.title}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Active Timeframe:</span>
                    <span className="text-slate-200">{selectedTimeframe.toUpperCase()}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Active Social Posts Queued:</span>
                    <span className="text-slate-200">{posts.length} Campaigns</span>
                  </div>
                </div>
              </div>

              {/* Sections included in report */}
              <div className="space-y-2 mb-6">
                <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block">Included Sections</span>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono text-slate-300">
                  <div className="flex items-center gap-2 bg-slate-950/40 px-2.5 py-1.5 rounded border border-slate-850">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Workspace & Social KPIs</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/40 px-2.5 py-1.5 rounded border border-slate-850">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Platform Benchmarks</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/40 px-2.5 py-1.5 rounded border border-slate-850">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Audience Demographics</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-950/40 px-2.5 py-1.5 rounded border border-slate-850">
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Generated Scripts Table</span>
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-3 pt-4 border-t border-slate-800">
                <button
                  onClick={handleExecutePdfExport}
                  disabled={isExportingPdf}
                  className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-500 text-white font-bold py-3 px-4 rounded-xl text-xs font-mono transition-all cursor-pointer shadow-lg shadow-red-950/50 disabled:opacity-50"
                >
                  {isExportingPdf ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-white" />
                      <span>Generating PDF Document...</span>
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4 text-white" />
                      <span>Download PDF Report (.pdf)</span>
                    </>
                  )}
                </button>
                <button
                  onClick={() => setShowPdfModal(false)}
                  className="bg-slate-800 hover:bg-slate-750 text-slate-300 py-3 px-5 rounded-xl text-xs font-mono transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}

        {showConfigModal && (() => {
          const mcp = mcpHubs.find(h => h.id === showConfigModal);
          if (!mcp) return null;
          return (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl relative"
              >
                <button 
                  onClick={() => setShowConfigModal(null)}
                  className="absolute top-4 right-4 text-slate-400 hover:text-slate-200 font-mono text-xs cursor-pointer"
                >
                  ✕ Close
                </button>

                <div className="flex items-center gap-2 mb-4">
                  <Database className="w-5 h-5 text-cyan-400" />
                  <h4 className="text-base font-bold text-white">{mcp.name} Configuration</h4>
                </div>

                <div className="space-y-4">
                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-xs font-mono">
                    <span className="text-slate-500 block mb-1">MCP Integration Description:</span>
                    <span className="text-slate-200">{mcp.desc}</span>
                  </div>

                  <div className="bg-slate-950 p-3 rounded-lg border border-slate-850 text-xs font-mono">
                    <span className="text-slate-500 block mb-1">Telemetry Diagnostics:</span>
                    <span className="text-cyan-400">{mcp.details}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-[10px] font-mono">
                    <div className="bg-slate-950/50 p-2.5 rounded border border-slate-850">
                      <span className="text-slate-500 block">Connection State</span>
                      <strong className="text-emerald-400 uppercase">{mcp.status}</strong>
                    </div>
                    <div className="bg-slate-950/50 p-2.5 rounded border border-slate-850">
                      <span className="text-slate-500 block">Protocol Standard</span>
                      <strong className="text-slate-300">MCP-RFC-1.0</strong>
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-850 flex gap-2">
                    <button 
                      onClick={() => {
                        showToast(`Successfully re-established secure tunnel to ${mcp.name}.`);
                        setShowConfigModal(null);
                      }}
                      className="flex-1 bg-cyan-500 text-slate-950 font-bold py-2 px-3 rounded text-xs hover:bg-cyan-400 transition-colors cursor-pointer text-center"
                    >
                      Re-verify Socket Connection
                    </button>
                    <button 
                      onClick={() => setShowConfigModal(null)}
                      className="flex-1 bg-slate-850 text-slate-300 py-2 px-3 rounded text-xs hover:bg-slate-800 transition-colors cursor-pointer text-center"
                    >
                      Dismiss
                    </button>
                  </div>
                </div>
              </motion.div>
            </div>
          );
        })()}
      </AnimatePresence>

    </div>
  );
}
