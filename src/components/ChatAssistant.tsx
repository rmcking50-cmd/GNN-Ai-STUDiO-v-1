import React, { useState, useRef, useEffect } from 'react';
import { 
  MessageSquare, 
  Send, 
  Sparkles, 
  RefreshCw, 
  User, 
  Bot, 
  Tv, 
  Volume2, 
  UserCheck,
  BrainCircuit,
  ChevronRight
} from 'lucide-react';
import { ChatMessage, UserRolePayload } from '../types';

interface ChatAssistantProps {
  userRole: UserRolePayload;
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
}

const PERSONAS = [
  { id: 'lead', title: 'TV Broadcast Lead Producer', system: 'You are a veteran TV and short-form news executive. Help the user optimize hooks, body formats, script timing, and teleprompter cues.' },
  { id: 'marketing', title: 'Viral Growth Strategist', system: 'You are a social content marketer. Guide the user on hashtag algorithms, post caption copywriting, interactive polls, click-through optimization.' },
  { id: 'coach', title: 'Speech & Accent Coach', system: 'You are a voice director. Help calibrate anchor dialogs, voice projection, pronunciation, pauses, and teleprompter breathing styles.' }
];

export default function ChatAssistant({ userRole, messages, setMessages }: ChatAssistantProps) {
  const [activePersona, setActivePersona] = useState(PERSONAS[0]);
  const [inputText, setInputText] = useState('');
  const [sendingChat, setSendingChat] = useState(false);
  const threadEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll chat thread
  useEffect(() => {
    threadEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    if (!userRole.permissions.canGenerateAI) {
      alert('Your authorized role does not have AI interaction privileges.');
      return;
    }

    const userMsg: ChatMessage = {
      id: `chat-${Date.now()}-user`,
      role: 'user',
      parts: [{ text: inputText }],
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const currentPrompt = inputText;
    setMessages((prev) => [...prev, userMsg]);
    setInputText('');
    setSendingChat(true);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, userMsg].map(m => ({ text: m.parts[0].text })),
          roleInstruction: activePersona.system,
        }),
      });
      const data = await res.json();
      
      const modelMsg: ChatMessage = {
        id: `chat-${Date.now()}-model`,
        role: 'model',
        parts: [{ text: data.text || 'I am GNN AI Studio supervisor. Let us assemble stellar global stories!' }],
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, modelMsg]);
    } catch (e: any) {
      console.error(e);
    } finally {
      setSendingChat(false);
    }
  };

  const handleClearContext = () => {
    setMessages([]);
  };

  return (
    <div className="space-y-6 text-slate-200">
      
      {/* Upper Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Side: Personas Selection */}
        <div className="lg:col-span-4 bg-slate-950 border border-slate-900 rounded-xl p-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="space-y-1">
              <h3 className="text-sm font-sans font-bold text-white uppercase tracking-wider flex items-center gap-1.5">
                <BrainCircuit className="w-4 h-4 text-red-500 animate-pulse" /> AI Agent Personas
              </h3>
              <p className="text-xs text-slate-400">Choose custom newsroom roles to assist in different production workflows.</p>
            </div>

            <div className="space-y-2.5 pt-1">
              {PERSONAS.map(p => (
                <button
                  key={p.id}
                  onClick={() => setActivePersona(p)}
                  className={`w-full text-left p-3.5 rounded-lg border text-xs font-sans transition-all flex flex-col space-y-1 cursor-pointer ${
                    activePersona.id === p.id 
                      ? 'bg-slate-900 border-red-500/50 shadow' 
                      : 'bg-slate-950 border-slate-900 text-slate-400 hover:border-slate-850'
                  }`}
                >
                  <span className={`text-[10px] font-mono tracking-wider font-extrabold uppercase ${activePersona.id === p.id ? 'text-red-400' : 'text-slate-550'}`}>
                    Active Consultant Model
                  </span>
                  <h4 className="font-bold text-slate-200">{p.title}</h4>
                  <p className="text-slate-400 text-[11px] leading-relaxed line-clamp-2">{p.system}</p>
                </button>
              ))}
            </div>
          </div>

          {/* GNN AI Studio Custom GPT Switcher / Ditcher */}
          <div className="p-4 rounded-xl border border-red-500/20 bg-gradient-to-br from-slate-950 via-slate-900 to-red-950/20 space-y-3 shadow-lg my-1">
            <div className="flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
              <span className="text-[10px] font-mono font-bold text-amber-400 tracking-wider uppercase">
                External GPT Switcher
              </span>
            </div>
            <div className="space-y-1">
              <h4 className="text-xs font-bold text-white font-sans">
                GNN AI Studio ChatGPT "Ditcher"
              </h4>
              <p className="text-[11px] text-slate-400 leading-relaxed">
                Transition from the local models directly to OpenAI's custom GPT environment for high-fidelity TV broadcast consulting, viral script metrics, and voice coach tips.
              </p>
            </div>
            <a
              href="https://chatgpt.com/g/g-p-6a54a5915104819181483747a751926c-gnn-ai-studio/shared/c/6a54bc66-5d78-83ee-9539-c5f3bcd19621?owner_user_id=user-IlmmvjZzwle0oYYHqq1pOTaA"
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-2 bg-gradient-to-r from-red-650 to-red-800 hover:from-red-600 hover:to-red-750 text-white rounded-lg text-xs font-bold font-sans flex items-center justify-center gap-1.5 transition-all shadow-md cursor-pointer hover:scale-[1.02] active:scale-[0.98] text-center"
            >
              <Tv className="w-3.5 h-3.5 shrink-0" />
              <span>Ditch Local & Open GNN GPT</span>
              <ChevronRight className="w-3.5 h-3.5 shrink-0" />
            </a>
          </div>

          <div className="pt-3 border-t border-slate-900 space-y-2">
            <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-500">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>Model Config: gemini-3.5-flash</span>
            </div>
            <button
              onClick={handleClearContext}
              className="text-xs font-sans hover:text-red-400 underline cursor-pointer hover:no-underline"
            >
              Reset Conversation Thread
            </button>
          </div>
        </div>

        {/* Right Side: Conversation Thread */}
        <div className="lg:col-span-8 bg-slate-950 border border-slate-900 rounded-xl p-5 flex flex-col justify-between h-[480px]">
          
          {/* Header Info */}
          <div className="mb-3 border-b border-slate-900 pb-2 flex justify-between items-center text-xs font-mono">
            <span className="text-slate-400 flex items-center gap-1">
              <MessageSquare className="w-4 h-4 text-red-500" /> Conversing with {activePersona.title}
            </span>
            <span className="text-slate-500 uppercase">Active Core Chat</span>
          </div>

          {/* Thread Container */}
          <div className="flex-1 overflow-y-auto pr-2 space-y-4 max-h-[350px]">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center space-y-2 text-slate-600 font-mono py-12">
                <Tv className="w-8 h-8 text-slate-700 animate-bounce" />
                <p className="text-xs">Hello, I am your GNN AI assistant. Pose script ideas or scheduling prompts below!</p>
              </div>
            ) : (
              messages.map(m => (
                <div 
                  key={m.id}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div className={`flex items-start space-x-2 max-w-[80%] rounded-xl p-3 text-xs leading-relaxed font-sans ${
                    m.role === 'user' 
                      ? 'bg-red-650/10 border border-red-500/20 text-slate-250 order-2' 
                      : 'bg-slate-900 border border-slate-850 text-slate-300'
                  }`}>
                    <div className="shrink-0 mt-0.5">
                      {m.role === 'user' ? (
                        <User className="w-3.5 h-3.5 text-red-400" />
                      ) : (
                        <Bot className="w-3.5 h-3.5 text-blue-400" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="whitespace-pre-wrap">{m.parts[0].text}</p>
                      <span className="text-[9px] font-mono text-slate-500 tracking-wider block text-right mt-1">
                        {m.timestamp}
                      </span>
                    </div>
                  </div>
                </div>
              ))
            )}
            
            {sendingChat && (
              <div className="flex justify-start">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-850 flex items-center space-x-2 text-xs font-mono text-slate-500">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-red-500" />
                  <span>Thinking & analyzing cues...</span>
                </div>
              </div>
            )}
            <div ref={threadEndRef} />
          </div>

          {/* Input Box Form */}
          <form onSubmit={handleSendMessage} className="mt-4 pt-3 border-t border-slate-900 flex space-x-3">
            <input
              type="text"
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`Ask ${activePersona.title}...`}
              className="flex-1 bg-slate-900 rounded-lg border border-slate-800 p-2.5 text-xs text-slate-200 outline-none focus:border-red-500 font-sans"
            />
            <button
              type="submit"
              disabled={sendingChat || !inputText.trim()}
              className="px-4 py-2.5 bg-red-650 hover:bg-red-700 text-white rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer disabled:opacity-45"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Send</span>
            </button>
          </form>

        </div>
      </div>

    </div>
  );
}
