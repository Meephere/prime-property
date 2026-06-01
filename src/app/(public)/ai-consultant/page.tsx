"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Send, Bot, ShieldAlert, Cpu, Landmark, 
  Database, RefreshCw, Key, HelpCircle, ArrowRight, MapPin, ExternalLink 
} from "lucide-react";
import ElegantBackground from "@/components/elegant-bg";
import { ChatMessage, MemoryItem } from "@/lib/agent-memory";
import { AgentLog } from "@/lib/agent-system";
import { formatRupiah } from "@/lib/utils";

export default function AIConsultantHub() {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "concierge",
      text: "Halo! Saya adalah Concierge Agent Anda dari Prime Property AI. Di sini saya dibantu oleh Valuation Agent (keuangan) dan Legal Agent (hukum) untuk menguji kelayakan investasi dan legalitas properti secara instan.\n\nSilakan tanyakan mengenai properti di Krakatau, Pancing, Helvetia, atau Cemara Asri, lengkap dengan rentang budget Anda. Contoh: 'Cari ruko di Krakatau budget 3 Milyar'.",
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    }
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  
  // Multi-agent states
  const [agentLogs, setAgentLogs] = useState<AgentLog[]>([]);
  const [memories, setMemories] = useState<MemoryItem[]>([]);
  const [matchedProperties, setMatchedProperties] = useState<any[]>([]);
  
  // Interactive sample suggestions
  const suggestions = [
    "Cari villa mewah di Cemara Asri budget 9 Milyar",
    "Rekomendasi ruko Krakatau budget 4 M",
    "Ada properti apa saja di kawasan Pancing?"
  ];

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (textToSend: string) => {
    if (!textToSend.trim() || loading) return;

    setLoading(true);
    setInput("");
    
    // Add user message locally first
    const tempUserMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text: textToSend,
      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
    };
    
    setMessages(prev => [...prev, tempUserMsg]);

    try {
      const response = await fetch("/api/ai-consultant", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend,
          history: messages
        })
      });

      if (response.ok) {
        const body = await response.json();
        if (body.success && body.data) {
          const { chatMessages, agentLogs, retrievedMemories, matchedProperties } = body.data;
          
          // Animate agent logs intake in a sequential staggered way to feel like thinking
          setAgentLogs([]);
          setMemories([]);
          setMatchedProperties([]);

          for (let i = 0; i < agentLogs.length; i++) {
            await new Promise(resolve => setTimeout(resolve, 350));
            setAgentLogs(prev => [...prev, agentLogs[i]]);
          }

          setMemories(retrievedMemories);
          setMatchedProperties(matchedProperties);
          
          // Finally add the assistant's reply
          const assistantReply = chatMessages[chatMessages.length - 1];
          setMessages(prev => [...prev, assistantReply]);
        }
      } else {
        setMessages(prev => [
          ...prev,
          {
            id: `error-${Date.now()}`,
            sender: "concierge",
            text: "Maaf, terjadi kesalahan koneksi saat berkoordinasi dengan AI Agents. Silakan coba lagi.",
            timestamp: new Date().toLocaleTimeString("id-ID")
          }
        ]);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-[#1A1A1A] py-16 sm:py-24 px-4 sm:px-6 lg:px-8 text-zinc-300 relative min-h-screen overflow-hidden">
      {/* Background Ornaments with Antigravity depth */}
      <ElegantBackground mode="dark" />
      
      <div className="max-w-7xl mx-auto space-y-12 relative z-10">
        
        {/* Editorial Title Block */}
        <div className="space-y-4 text-center">
          <span className="text-[10px] uppercase tracking-[0.3em] text-[#C9A961] font-bold inline-flex items-center space-x-2 px-3 py-1 bg-white/5 border border-[#C9A961]/20">
            <Cpu className="h-3.5 w-3.5 text-[#C9A961] animate-pulse" />
            <span>Multi-Agent System & Memory Bank</span>
          </span>
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white uppercase font-sans">
            AI CONSULTANT HUB
          </h1>
          <p className="max-w-2xl mx-auto text-xs sm:text-sm text-zinc-400 font-light leading-relaxed">
            Konsultasikan rencana investasi Anda dengan jaringan agen otonom kami yang bekerja sama secara real-time mengaudit properti dari aspek keuangan, wilayah, dan hukum.
          </p>
        </div>

        {/* Main Grid: Chat Console left, Agent Workflow Visualizer right */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column: Glassmorphic Chat Console (Col-span 7) */}
          <div className="lg:col-span-7 flex flex-col h-[650px] bg-[#161616]/80 border border-zinc-800/80 backdrop-blur-xl relative shadow-2xl glow-gold select-none">
            
            {/* Header Console */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800/80 bg-zinc-900/30">
              <div className="flex items-center space-x-3">
                <div className="relative">
                  <div className="w-3 h-3 rounded-full bg-[#C9A961] animate-ping absolute"></div>
                  <div className="w-3 h-3 rounded-full bg-[#C9A961] relative"></div>
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-white">AI Consultation Session</h3>
                  <p className="text-[9px] text-zinc-500 font-mono">Agent-to-User Interface v2.0</p>
                </div>
              </div>
              <button 
                onClick={() => {
                  setMessages([
                    {
                      id: "welcome",
                      sender: "concierge",
                      text: "Halo! Sesi telah direset. Silakan tanyakan properti apa saja yang ingin Anda audit atau cari.",
                      timestamp: new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" })
                    }
                  ]);
                  setAgentLogs([]);
                  setMemories([]);
                  setMatchedProperties([]);
                }}
                className="p-1.5 hover:bg-white/5 border border-zinc-800 hover:border-zinc-700 transition-colors"
                title="Reset Percakapan"
              >
                <RefreshCw className="h-3.5 w-3.5 text-zinc-450" />
              </button>
            </div>

            {/* Chat Messages viewport */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 dashboard-scroll">
              <AnimatePresence initial={false}>
                {messages.map((msg) => {
                  const isUser = msg.sender === "user";
                  return (
                    <motion.div
                      key={msg.id}
                      initial={{ opacity: 0, y: 15 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`flex ${isUser ? "justify-end" : "justify-start"} w-full`}
                    >
                      <div className={`max-w-[85%] flex items-start space-x-3 ${isUser ? "flex-row-reverse space-x-reverse" : ""}`}>
                        {/* Avatar */}
                        <div className={`w-8 h-8 flex items-center justify-center border shrink-0 ${
                          isUser 
                            ? "bg-zinc-800 border-zinc-700 text-zinc-300" 
                            : "bg-[#C9A961]/10 border-[#C9A961]/35 text-[#C9A961]"
                        }`}>
                          {isUser ? "U" : <Bot className="h-4 w-4" />}
                        </div>
                        
                        {/* Message content */}
                        <div className={`p-4 border ${
                          isUser 
                            ? "bg-zinc-900/60 border-zinc-850 text-zinc-200" 
                            : "bg-[#1A1A1A]/95 border-zinc-800 text-zinc-300 shadow-md"
                        }`}>
                          <div className="flex items-center justify-between mb-1.5 space-x-10">
                            <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500">
                              {isUser ? "Anda" : "Concierge Agent"}
                            </span>
                            <span className="text-[9px] font-mono text-zinc-650">{msg.timestamp}</span>
                          </div>
                          <p className="text-xs sm:text-sm font-light leading-relaxed whitespace-pre-line text-left">
                            {msg.text}
                          </p>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>

              {loading && (
                <div className="flex justify-start w-full">
                  <div className="flex items-start space-x-3">
                    <div className="w-8 h-8 flex items-center justify-center border bg-[#C9A961]/10 border-[#C9A961]/30 text-[#C9A961]">
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    </div>
                    <div className="p-4 border bg-zinc-900/30 border-zinc-850 text-zinc-400 space-y-2">
                      <span className="text-[9px] font-bold uppercase tracking-widest text-[#C9A961] animate-pulse">
                        Agen Sedang Berkolaborasi...
                      </span>
                      <div className="h-2 w-32 bg-zinc-800 rounded animate-pulse"></div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Suggestions for quick access */}
            {messages.length === 1 && (
              <div className="px-6 py-2 flex flex-wrap gap-2 justify-start items-center bg-zinc-900/10">
                <span className="text-[9px] font-bold text-zinc-500 uppercase tracking-widest mr-2 flex items-center">
                  <HelpCircle className="h-3 w-3 mr-1 text-[#C9A961]" />
                  Saran Pencarian:
                </span>
                {suggestions.map((s, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(s)}
                    className="text-[10px] bg-white/5 border border-zinc-800 hover:border-[#C9A961]/30 text-zinc-400 hover:text-white px-2.5 py-1 transition-all"
                  >
                    {s}
                  </button>
                ))}
              </div>
            )}

            {/* Input Form console */}
            <form 
              onSubmit={(e) => {
                e.preventDefault();
                handleSend(input);
              }}
              className="p-4 border-t border-zinc-800/80 bg-zinc-900/20 flex gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ketik pencarian atau audit properti (misal: 'Audit Aston Villas')..."
                className="flex-1 bg-zinc-950/60 border border-zinc-800 hover:border-zinc-700 focus:border-[#C9A961]/60 focus:ring-0 px-4 py-3.5 text-xs text-white placeholder-zinc-550 transition-all font-light rounded-none"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="px-6 bg-[#C9A961] hover:bg-[#bca055] text-zinc-950 border border-transparent font-bold text-xs uppercase tracking-wider flex items-center transition-all disabled:opacity-40 disabled:cursor-not-allowed rounded-none cursor-pointer"
              >
                <span>Kirim</span>
                <Send className="h-3.5 w-3.5 ml-2" />
              </button>
            </form>
          </div>

          {/* Right Column: Agent Workflow & Memory Bank Visualizer (Col-span 5) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* 1. Multi-Agent Collaborative Workflow Visualizer */}
            <div className="bg-[#161616]/80 border border-zinc-800/80 backdrop-blur-xl p-6 shadow-2xl relative glow-gold text-left select-none">
              <div className="flex items-center space-x-2 border-b border-zinc-850 pb-3 mb-4">
                <Cpu className="h-4.5 w-4.5 text-[#C9A961]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">Agent Collaboration Pipeline</h3>
              </div>

              {agentLogs.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-555 italic border border-dashed border-zinc-850">
                  Kirim pesan di chat konsol untuk memicu kolaborasi agen otonom.
                </div>
              ) : (
                <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 dashboard-scroll">
                  {agentLogs.map((log) => {
                    const agentColors = {
                      concierge: "border-blue-500/30 text-blue-400 bg-blue-950/15",
                      valuation: "border-yellow-500/30 text-yellow-400 bg-yellow-950/15",
                      legal: "border-red-500/30 text-red-400 bg-red-950/15"
                    };
                    const agentName = {
                      concierge: "Concierge Agent",
                      valuation: "Valuation Agent",
                      legal: "Legal Agent"
                    };
                    return (
                      <div key={log.id} className="p-3 border bg-[#1A1A1A]/80 hover:border-zinc-700 transition-colors space-y-1.5">
                        <div className="flex justify-between items-center text-[9px] font-mono">
                          <span className={`px-2 py-0.5 border uppercase font-bold tracking-wider ${agentColors[log.agent]}`}>
                            {agentName[log.agent]}
                          </span>
                          <span className="text-zinc-600 font-semibold">{log.timestamp}</span>
                        </div>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider">{log.action}</h4>
                        <p className="text-[11px] text-zinc-400 font-light leading-relaxed">{log.details}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* 2. Agent Shared Memory Bank retrieved */}
            <div className="bg-[#161616]/80 border border-zinc-800/80 backdrop-blur-xl p-6 shadow-2xl relative glow-gold text-left select-none">
              <div className="flex items-center space-x-2 border-b border-zinc-850 pb-3 mb-4">
                <Database className="h-4.5 w-4.5 text-[#C9A961]" />
                <h3 className="text-xs font-bold uppercase tracking-widest text-white">Retrieved Long-term Memories</h3>
              </div>

              {memories.length === 0 ? (
                <div className="py-12 text-center text-xs text-zinc-555 italic border border-dashed border-zinc-850">
                  Belum ada memori jangka panjang yang diekstrak.
                </div>
              ) : (
                <div className="space-y-3.5 max-h-[220px] overflow-y-auto pr-2 dashboard-scroll">
                  {memories.map((mem) => (
                    <div key={mem.id} className="p-3 bg-[#1A1A1A]/60 border border-zinc-850 space-y-1">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="text-[#C9A961] font-bold uppercase tracking-wider flex items-center">
                          <Key className="h-3 w-3 mr-1 text-[#C9A961]" />
                          {mem.key}
                        </span>
                        <span className="px-1.5 py-0.5 bg-zinc-850 text-zinc-450 border border-zinc-800 uppercase font-mono text-[8px] font-semibold">
                          {mem.category}
                        </span>
                      </div>
                      <p className="text-[11px] text-zinc-450 font-light leading-relaxed">{mem.content}</p>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {mem.tags.map((t, idx) => (
                          <span key={idx} className="text-[8px] text-zinc-550 border border-zinc-850 px-1 bg-white/2">
                            #{t}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* 3. Recommended Listings matched */}
            {matchedProperties.length > 0 && (
              <div className="bg-[#161616]/80 border border-zinc-800/80 backdrop-blur-xl p-6 shadow-2xl relative glow-gold text-left select-none">
                <div className="flex items-center space-x-2 border-b border-zinc-850 pb-3 mb-4">
                  <Landmark className="h-4.5 w-4.5 text-[#C9A961]" />
                  <h3 className="text-xs font-bold uppercase tracking-widest text-white">Matched Properties (Top Match)</h3>
                </div>

                <div className="space-y-3.5">
                  {matchedProperties.map((prop) => (
                    <div key={prop.id} className="p-3 bg-[#1A1A1A]/60 border border-zinc-850 hover:border-[#C9A961]/25 transition-colors flex items-center justify-between gap-4">
                      <div className="space-y-1 truncate">
                        <span className="text-[8px] bg-[#C9A961]/10 text-[#C9A961] border border-[#C9A961]/20 font-bold px-1.5 py-0.5 uppercase tracking-wider">
                          {prop.tipe}
                        </span>
                        <h4 className="text-xs font-bold text-white uppercase tracking-wider truncate mt-1">
                          {prop.nama_property}
                        </h4>
                        <div className="text-[10px] text-zinc-450 flex items-center">
                          <MapPin className="h-3 w-3 mr-1 text-[#C9A961] shrink-0" />
                          <span>{prop.kawasan.join(", ")}</span>
                        </div>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-[9px] uppercase tracking-widest text-zinc-500 font-semibold">Value</p>
                        <p className="text-xs font-bold text-[#C9A961]">{formatRupiah(prop.price)}</p>
                        <a
                          href={`/?properti=${prop.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center text-[8px] font-bold uppercase tracking-wider text-[#C9A961] hover:text-[#bca055] mt-1"
                        >
                          <span>Explore</span>
                          <ExternalLink className="h-2.5 w-2.5 ml-1" />
                        </a>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}
