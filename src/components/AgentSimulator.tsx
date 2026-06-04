/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, FormEvent } from 'react';
import { AI_AGENTS } from '../data/agents';
import { AIAgent, ChatMessage } from '../types';
import { 
  RotateCcw, 
  Send, 
  Terminal, 
  Cpu, 
  CheckCircle2, 
  Zap
} from 'lucide-react';

interface AgentSimulatorProps {
  initialAgentId?: string;
}

export default function AgentSimulator({ initialAgentId }: AgentSimulatorProps) {
  const [selectedAgent, setSelectedAgent] = useState<AIAgent>(
    AI_AGENTS.find((a) => a.id === initialAgentId) || AI_AGENTS[0]
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [inputVal, setInputVal] = useState<string>('');
  const [isTyping, setIsTyping] = useState<boolean>(false);
  const [logs, setLogs] = useState<string[]>([]);
  const messageEndRef = useRef<HTMLDivElement>(null);

  // Sync prop changes
  useEffect(() => {
    if (initialAgentId) {
      const target = AI_AGENTS.find((a) => a.id === initialAgentId);
      if (target) {
        setSelectedAgent(target);
      }
    }
  }, [initialAgentId]);

  // Sync state when agent changes
  useEffect(() => {
    resetChat();
  }, [selectedAgent]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addLog = (text: string) => {
    const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [`[${timestamp}] ${text}`, ...prev.slice(0, 15)]);
  };

  const resetChat = () => {
    setMessages([
      {
        id: 'init',
        sender: 'agent',
        content: selectedAgent.initialMessage,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setLogs([]);
    
    addLog(`Démarrage de '${selectedAgent.name}'...`);
    addLog(`GEMINI_ENGINE >> Modèle gemini-2.5-flash prêt.`);
    addLog(`SYS >> Instructions système configurées pour ${selectedAgent.name}.`);
    addLog(`Sécurisation SSL active. Prêt.`);
  };

  /**
   * Action principale : Envoi du message à notre fonction API sécurisée sur Vercel
   */
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isTyping) return;

    const userText = inputVal;
    setInputVal('');

    // 1. Ajouter le message de l'utilisateur à l'écran
    const userMsg: ChatMessage = {
      id: `user-custom-${Date.now()}`,
      sender: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsTyping(true);
    addLog(`USER >> ${userText}`);
    addLog(`API_POST >> Envoi de la requête au serveur sécurisé /api/chat...`);

    try {
      // 2. Préparer les consignes métier de l'agent sélectionné
      const systemInstruction = `
        Tu es un agent d'intelligence artificielle haut de gamme pour Axium Solutions.
        Ton identité actuelle : ${selectedAgent.name}.
        Description de ton rôle : ${selectedAgent.description}.
        
        Directives obligatoires :
        - Reste fidèle au rôle mentionné.
        - Sois professionnel, courtois, expert et réponds de manière concise.
        - Réponds directement en français.
      `;

      // 3. Appeler notre route API Vercel sécurisée
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          systemInstruction: systemInstruction
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Erreur HTTP ${res.status}`);
      }

      const data = await res.json();
      const replyText = data.text || "Désolé, je n'ai pas pu formuler de réponse.";
      addLog(`GEMINI_RESPONSE >> Succès ! Réponse reçue.`);

      // 4. Ajouter la réponse de l'IA à l'écran
      const agentMsg: ChatMessage = {
        id: `agent-reply-${Date.now()}`,
        sender: 'agent',
        content: replyText,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentMsg]);

    } catch (err: any) {
      console.error(err);
      addLog(`ERR_SERVER >> Impossible d'obtenir une réponse de /api/chat.`);
      
      const errorMsg: ChatMessage = {
        id: `sys-err-${Date.now()}`,
        sender: 'system',
        content: `❌ Échec de la communication avec l'IA.\n\nDétail : ${err.message || err}\n\nSolutions :\n1. Vérifie que tu as bien créé le fichier api/chat.js à la racine de ton projet.\n2. Assure-toi d'avoir ajouté ta clé "GEMINI_API_KEY" dans l'onglet Environment Variables sur Vercel.\n3. Re-lance un "Redeploy" sur Vercel pour mettre à jour l'application.`,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

  const getLogColorClass = (logLine: string) => {
    if (logLine.includes('ERR_SERVER') || logLine.includes('Erreur')) {
      return 'text-rose-450 font-semibold';
    }
    if (logLine.includes('API_POST')) {
      return 'text-sky-400';
    }
    if (logLine.includes('GEMINI_RESPONSE') || logLine.includes('Succès')) {
      return 'text-emerald-450';
    }
    return 'text-zinc-400';
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#121214] border border-zinc-800/80 rounded-3xl p-5 md:p-8 shadow-2xl relative overflow-hidden glass-card">
      
      {/* Decorative ambient lights */}
      <div className={`absolute top-1/2 left-1/3 w-80 h-80 rounded-full -translate-y-1/2 -translate-x-1/2 mix-blend-multiply opacity-25 pointer-events-none transition-all duration-750 ${
        selectedAgent.id === 'standardiste' ? 'bg-indigo-950/40 blur-[100px]' : 
        selectedAgent.id === 'commercial' ? 'bg-blue-950/40 blur-[100px]' : 'bg-emerald-950/40 blur-[100px]'
      }`}></div>

      {/* LEFT COLUMN: Profiler & Status */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-6 z-10">
        <div className="space-y-6">
          
          <div>
            <span className={`text-[10px] font-semibold tracking-wider font-mono uppercase px-2.5 py-0.5 bg-zinc-900/50 border rounded-full inline-block mb-3.5 ${
              selectedAgent.id === 'standardiste' ? 'text-indigo-300 border-indigo-900/60' : 
              selectedAgent.id === 'commercial' ? 'text-blue-300 border-blue-900/60' : 'text-emerald-300 border-emerald-900/60'
            }`}>
              Profil d'Agent Sélectionné
            </span>
            
            <h3 className="text-2xl font-display font-semibold text-zinc-100 tracking-tight">
              {selectedAgent.name}
            </h3>
            <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
              {selectedAgent.description}
            </p>
          </div>

          {/* Engine Status View */}
          <div className="space-y-2">
            <p className="text-[10px] text-zinc-500 font-mono font-medium uppercase tracking-wider">
              Moteur de test de l'agent :
            </p>
            <div className="bg-zinc-950/80 p-3 rounded-2xl border border-zinc-800/65 flex items-center gap-2.5">
              <Zap className="w-4 h-4 text-amber-500 fill-amber-500 animate-pulse" />
              <div className="flex flex-col">
                <span className="text-xs font-semibold text-zinc-100">Intégration Gemini Directe</span>
                <span className="text-[10px] text-zinc-400">Canal sécurisé via API Vercel</span>
              </div>
            </div>
          </div>

          <div className="space-y-5">
            {/* Quick Metrics */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-900/40 border border-zinc-800/70 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-mono">Performance</span>
                <span className={`text-xl font-bold font-display mt-0.5 ${
                  selectedAgent.id === 'standardiste' ? 'text-indigo-300' : 
                  selectedAgent.id === 'commercial' ? 'text-blue-300' : 'text-emerald-300'
                }`}>{selectedAgent.metrics.value}</span>
                <span className="text-[10px] text-zinc-400 mt-0.5 leading-none">{selectedAgent.metrics.label}</span>
              </div>

              <div className="bg-zinc-900/40 border border-zinc-800/70 rounded-xl p-3 flex flex-col justify-between">
                <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-mono">Statut API</span>
                <span className="text-xl font-bold font-display text-emerald-400 mt-0.5">Actif</span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5 leading-none">
                  <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> En ligne
                </span>
              </div>
            </div>

            {/* Key agent benefits list */}
            <div className="space-y-2">
              <p className="text-[10px] text-zinc-500 font-mono font-medium uppercase tracking-wider">Avantages Clés :</p>
              {selectedAgent.benefits.map((benefit, i) => (
                <div key={i} className="flex items-start gap-2 text-xs text-zinc-300">
                  <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${
                    selectedAgent.id === 'standardiste' ? 'text-indigo-400' : 
                    selectedAgent.id === 'commercial' ? 'text-blue-400' : 'text-emerald-400'
                  }`} />
                  <span>{benefit}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Quick selector of agents */}
        <div className="space-y-1.5 pt-4 border-t border-zinc-800/60">
          <p className="text-[10px] text-zinc-500 font-mono">Changer de canal d'Agent :</p>
          <div className="flex gap-1.5">
            {AI_AGENTS.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`flex-1 text-[11px] font-medium py-1.5 rounded-xl transition-all duration-300 border font-mono select-none cursor-pointer ${
                  selectedAgent.id === agent.id
                    ? agent.id === 'standardiste' ? 'bg-[#1e1b4b] text-indigo-200 border-indigo-800/80' :
                      agent.id === 'commercial' ? 'bg-[#1e3a8a] text-blue-200 border-blue-800/80' :
                      'bg-[#064e3b] text-[#a7f3d0] border-emerald-800/80'
                    : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-850'
                }`}
              >
                {agent.name.split(" ")[1]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* RIGHT COLUMN: Chat Terminal */}
      <div className="lg:col-span-7 flex flex-col h-[480px] bg-zinc-950/80 border border-zinc-800/85 rounded-2xl overflow-hidden z-10 shadow-inner">
        
        {/* Terminal Header */}
        <div className="bg-[#121214] border-b border-zinc-800/90 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
            </span>
            <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-mono ml-2 select-none">
              <Terminal className="w-3 h-3 text-zinc-500" /> control_panel v5.GEMINI_LIVE
            </span>
          </div>
          <button 
            type="button"
            onClick={resetChat} 
            className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition cursor-pointer select-none"
          >
            <RotateCcw className="w-2.5 h-2.5 text-zinc-500" /> Réinitialiser
          </button>
        </div>

        {/* Message Logs */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Console logger output */}
          <div className="border border-zinc-850/80 bg-[#121214]/95 rounded-xl p-3 space-y-1 text-[9px] font-mono select-none">
            <div className="flex justify-between border-b border-zinc-800/80 pb-1.5 mb-1.5 font-bold text-zinc-400">
              <span className="flex items-center gap-1">
                <Cpu className="w-2.5 h-2.5 text-zinc-500" /> CONSOLE DE FLUX GEMINI AI
              </span>
              <span className="text-emerald-400 uppercase text-[8px] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> SECURE API
              </span>
            </div>
            {logs.length === 0 ? (
              <div className="text-zinc-600 italic">Console prête. En attente d'interactions...</div>
            ) : (
              logs.slice(0, 4).map((log, index) => (
                <div key={index} className={`truncate ${getLogColorClass(log)}`}>
                  {log}
                </div>
              ))
            )}
          </div>

          {/* Conversation history */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[85%] ${
                msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <span className="text-[8px] text-zinc-500 font-mono mb-0.5 whitespace-nowrap">
                {msg.sender === 'user' ? 'Moi' : selectedAgent.name} • {msg.timestamp}
              </span>
              <div
                className={`p-3 rounded-xl leading-relaxed text-[11px] font-sans ${
                  msg.sender === 'user'
                    ? 'bg-zinc-100 text-zinc-950 rounded-tr-none font-semibold'
                    : msg.sender === 'system'
                    ? 'bg-rose-950/40 border border-rose-900/60 text-rose-300 rounded-lg text-xs leading-normal font-mono p-4 font-sans'
                    : 'bg-zinc-900/95 border border-zinc-800 text-zinc-200 rounded-tl-none shadow-sm'
                }`}
                style={{
                  whiteSpace: 'pre-line'
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="mr-auto items-start max-w-[80%] flex flex-col">
              <span className="text-[8px] text-zinc-500 font-mono mb-0.5">{selectedAgent.name} réfléchit...</span>
              <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 p-2.5 rounded-xl rounded-tl-none shadow-sm flex items-center gap-1">
                <span className="w-1 h-1 bg-amber-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1 h-1 bg-blue-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1 h-1 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}
          <div ref={messageEndRef} />
        </div>

        {/* Form Input Area */}
        <form onSubmit={handleSendMessage} className="p-3 bg-[#121214] border-t border-zinc-800/90 flex gap-2 items-center">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isTyping}
            placeholder={`Posez une question à notre ${selectedAgent.name.toLowerCase()}...`}
            className="flex-1 bg-zinc-950 border border-zinc-800/80 rounded-xl px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700 disabled:opacity-60 transition"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isTyping}
            className="p-2 rounded-xl bg-zinc-100 hover:bg-white text-zinc-950 disabled:opacity-40 disabled:hover:bg-zinc-100 transition cursor-pointer shrink-0"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>
    </div>
  );
}
