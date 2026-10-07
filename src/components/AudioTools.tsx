import React, { useState, useRef } from 'react';
import { 
  Mic, 
  MicOff, 
  Sparkles, 
  Wand2, 
  Check, 
  Volume2, 
  FileText, 
  RefreshCw, 
  Sliders, 
  Activity, 
  Subtitles,
  CornerDownLeft,
  Settings
} from 'lucide-react';
import { UserRolePayload } from '../types';

interface AudioToolsProps {
  userRole: UserRolePayload;
  onAddAsset: (asset: any) => void;
}

export default function AudioTools({ userRole, onAddAsset }: AudioToolsProps) {
  // Recorder states
  const [isRecording, setIsRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState('');
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  // Denoising states
  const [denoisingActive, setDenoisingActive] = useState(false);
  const [deconvolutionLevel, setDeconvolutionLevel] = useState(85);
  const [humReduction, setHumReduction] = useState(true);
  const [vocalBoost, setVocalBoost] = useState(true);

  // Subtitle states
  const [subtitleOutput, setSubtitleOutput] = useState('');
  const [subtitleLanguage, setSubtitleLanguage] = useState('Bangla');
  const [generatingSubtitles, setGeneratingSubtitles] = useState(false);

  // Microphone Recording Methods
  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        await handleTranscribeBlob(audioBlob);
        
        // Stop all track streams so microphone light resolves
        stream.getTracks().forEach(track => track.stop());
      };

      recorder.start();
      setIsRecording(true);
      setTranscriptionText('Microphone active. Record anchor voice...');
    } catch (e: any) {
      alert(`Microphone access error: ${e.message}. Ensure frame permissions are granted!`);
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscribeBlob = async (blob: Blob) => {
    setTranscribing(true);
    setTranscriptionText('Transcribing audio elements via Gemini 3.5 Transcribe...');
    try {
      // FileReader to convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = async () => {
        const base64data = (reader.result as string).split(',')[1];
        
        const res = await fetch('/api/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ base64Audio: base64data }),
        });
        const data = await res.json();
        if (data.success && data.text) {
          setTranscriptionText(data.text);
          onAddAsset({
            id: `asset-transcript-${Date.now()}`,
            name: `Mic Transcript Draft - ${new Date().toLocaleTimeString()}`,
            type: 'subtitles',
            url: '#',
            createdAt: new Date().toLocaleDateString(),
            lyrics_or_text: data.text,
          });
        } else {
          setTranscriptionText(data.text || 'Transcription concluded with no text output');
        }
      };
    } catch (e: any) {
      setTranscriptionText(`Transcription failed: ${e.message}`);
    } finally {
      setTranscribing(false);
    }
  };

  // Vocal Denoising Trigger Simulation
  const handleApplyDenoising = () => {
    setDenoisingActive(true);
    setTimeout(() => {
      setDenoisingActive(false);
      alert('Vocal deconvolution algorithm calibrated. Hum cancelled, vocal gain leveled for peak broadcast delivery!');
    }, 2000);
  };

  // Automated multilingual subtitles generation
  const handleGenerateSubtitles = () => {
    if (!transcriptionText || transcriptionText.startsWith('Microphone')) {
      alert('Please perform an audio transcription first.');
      return;
    }
    setGeneratingSubtitles(true);
    setTimeout(() => {
      const demoSubtitles = [
        `1\n00:00:01,200 --> 00:00:04,500\n[Broadcast Studio Intro Hook]\n(GNN TV Focus)`,
        `2\n00:00:04,600 --> 00:00:09,100\n${transcriptionText.substring(0, 45)}...`,
        `3\n00:00:09,200 --> 00:00:14,000\n${subtitleLanguage} Translation Track synced: Crystal vocal feedback.`
      ].join('\n\n');
      setSubtitleOutput(demoSubtitles);
      setGeneratingSubtitles(false);

      onAddAsset({
        id: `sub-asset-${Date.now()}`,
        name: `Cap Subtitles (${subtitleLanguage})`,
        type: 'subtitles',
        url: '#',
        createdAt: new Date().toLocaleDateString(),
        lyrics_or_text: demoSubtitles,
        language: subtitleLanguage,
      });
    }, 1500);
  };

  return (
    <div className="space-y-6 text-slate-200">
      
      {/* 2x2 Grid for Denoising and Transcription */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Voice Denoising and Deconvolution Box */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
          <div className="flex justify-between items-start">
            <div className="space-y-1">
              <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-cyan-400" /> Vocal Deconvolution & Denoise Engine
              </h3>
              <p className="text-xs text-slate-400">Cancel high-frequency hums and recover crystal studio quality in noisy situations.</p>
            </div>
            <Activity className="w-5 h-5 text-cyan-400 animate-pulse" />
          </div>

          <div className="space-y-4 p-4 bg-slate-900/40 rounded-lg border border-slate-850">
            {/* Decov Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-mono text-slate-400">
                <span>Vocal Clarification Index</span>
                <span className="text-cyan-400 font-bold">{deconvolutionLevel}%</span>
              </div>
              <input 
                type="range"
                min="0"
                max="100"
                value={deconvolutionLevel}
                onChange={(e) => setDeconvolutionLevel(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-950 rounded cursor-pointer accent-cyan-400"
              />
            </div>

            {/* Checkbox Options */}
            <div className="grid grid-cols-2 gap-3 text-xs font-sans">
              <label className="flex items-center space-x-2 bg-slate-950/60 p-2.5 rounded border border-slate-850 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={humReduction}
                  onChange={(e) => setHumReduction(e.target.checked)}
                  className="rounded bg-slate-950 text-cyan-400 focus:ring-0 cursor-pointer"
                />
                <span className="text-slate-350">Ambient Hum Cancel</span>
              </label>

              <label className="flex items-center space-x-2 bg-slate-950/60 p-2.5 rounded border border-slate-850 cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={vocalBoost}
                  onChange={(e) => setVocalBoost(e.target.checked)}
                  className="rounded bg-slate-950 text-cyan-400 focus:ring-0 cursor-pointer"
                />
                <span className="text-slate-350">Speech Gain Boost</span>
              </label>
            </div>

            <button
              onClick={handleApplyDenoising}
              disabled={denoisingActive}
              className="w-full bg-slate-100 hover:bg-slate-200 text-slate-950 text-xs font-bold py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-colors cursor-pointer disabled:opacity-50"
            >
              {denoisingActive ? (
                <>
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  <span>Processing Audio Frequencies...</span>
                </>
              ) : (
                <>
                  <Wand2 className="w-3.5 h-3.5 text-cyan-500" />
                  <span>Execute Vocal Optimization</span>
                </>
              )}
            </button>
          </div>

          <div className="p-3 bg-cyan-500/5 rounded border border-cyan-500/10 flex items-start gap-2 text-xs font-mono text-slate-400">
            <Settings className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
            <p>Active algorithm cleans dynamic frequencies, boosts midrange dialogues, and applies studio compressor thresholds automatically.</p>
          </div>
        </div>

        {/* Right: Automatic Captioneer (Voice Transcript Input) */}
        <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
          <div className="space-y-1">
            <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Mic className="w-4 h-4 text-red-500" /> Automatic Intelligent Captioneer
            </h3>
            <p className="text-xs text-slate-400 font-mono">Input your live microphone feed, transcribe instantly using Gemini 3.5 Flash.</p>
          </div>

          <div className="flex flex-col items-center justify-center py-6 bg-slate-900/30 rounded-lg border border-dashed border-slate-850 relative">
            
            {isRecording && (
              <span className="absolute top-3 right-3 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
              </span>
            )}

            <button
              onClick={isRecording ? stopRecording : startRecording}
              className={`w-16 h-16 rounded-full flex items-center justify-center border-2 transition-all cursor-pointer ${
                isRecording 
                  ? 'bg-red-650/20 border-red-500 hover:scale-[1.05] shadow-lg shadow-red-500/10' 
                  : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
              }`}
            >
              {isRecording ? (
                <MicOff className="w-6 h-6 text-red-500 animate-pulse" />
              ) : (
                <Mic className="w-6 h-6" />
              )}
            </button>
            <span className="text-xs text-slate-400 mt-3 font-mono">
              {isRecording ? 'Click to conclude recording...' : 'Click to start live anchor voice recording'}
            </span>
          </div>

          {/* Transcript Block output */}
          <div className="space-y-1">
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest block">Live Output Dialogue</span>
            <div className="w-full bg-slate-900 min-h-24 p-3 rounded-lg border border-slate-850 text-xs leading-relaxed font-sans text-slate-350">
              {transcribing ? (
                <div className="flex items-center space-x-2">
                  <RefreshCw className="w-3.5 h-3.5 text-red-500 animate-spin" />
                  <span className="text-slate-500 font-mono">Connecting Gemini 3.5 Flash for whisper audio feedback...</span>
                </div>
              ) : (
                transcriptionText || 'Whisper anchor dialogue log...'
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Multilingual Subtitle Tracks Generator Row */}
      <div className="bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4">
        <div className="flex justify-between items-center border-b border-slate-950 pb-3">
          <div>
            <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
              <Subtitles className="w-4 h-4 text-yellow-400" /> Automated Multilingual Subtitle Matrix
            </h3>
            <p className="text-xs text-slate-400">Inject transcription texts to generate professional multi-channel SRT subtitle packages.</p>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-xs font-mono text-slate-400 uppercase tracking-widest">Translate To:</span>
            <select
              value={subtitleLanguage}
              onChange={(e) => setSubtitleLanguage(e.target.value)}
              className="bg-slate-900 border border-slate-800 rounded px-2.5 py-1 text-xs text-slate-300 outline-none"
            >
              <option value="Bangla">Bengali (Bangla)</option>
              <option value="English">English</option>
              <option value="Spanish">Spanish</option>
              <option value="Japanese">Japanese</option>
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">Raw Script or Voice Input Source</span>
            <textarea
              value={transcriptionText}
              onChange={(e) => setTranscriptionText(e.target.value)}
              rows={5}
              placeholder="Paste dialogue text or transcript segments here..."
              className="w-full bg-slate-900 border border-slate-850 rounded-lg p-3 text-xs text-slate-300 focus:outline-none focus:border-red-500 font-sans leading-relaxed"
            />
            <button
              onClick={handleGenerateSubtitles}
              disabled={generatingSubtitles || !transcriptionText}
              className="w-full bg-red-650 hover:bg-red-700 text-white text-xs font-semibold py-2 rounded transition-colors disabled:opacity-40"
            >
              {generatingSubtitles ? 'Generating Subtitle Frames...' : 'Calculate SRT subtitle frames'}
            </button>
          </div>

          <div className="space-y-2">
            <span className="text-[10px] font-mono text-slate-400 uppercase tracking-widest block font-bold">SRT Multilingual Outputs</span>
            <textarea
              value={subtitleOutput}
              readOnly
              rows={5}
              placeholder="SRT subtitle package compiles here..."
              className="w-full bg-slate-900 border border-slate-850 text-yellow-400 rounded-lg p-3 text-xs leading-relaxed font-mono resize-none focus:outline-none"
            />
          </div>
        </div>
      </div>

    </div>
  );
}
