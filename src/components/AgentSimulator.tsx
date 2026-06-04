/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, FormEvent } from 'react';
import { AI_AGENTS } from '../data/agents';
import { AIAgent, ChatMessage } from '../types';
import { Play, RotateCcw, Send, Terminal, Cpu, CheckCircle2 } from 'lucide-react';

// ==========================================
// CONFIGURATION DE VOTRE WEBHOOK MAKE
// ==========================================
const MAKE_WEBHOOK_URL = 'https://hook.eu1.make.com/bkvlhv8xgrk3jwjzbo5jnn1ijccun2cb'; 
// ^ Remplacez VOTRE_URL_WEBHOOK_MAKE par l'adresse copiée sur Make
// Exemple : 'https://hook.us1.make.com/xxxxxxxxx'

interface AgentSimulatorProps {
  initialAgentId?: string;
}

export default function AgentSimulator({ initialAgentId }: AgentSimulatorProps) {
  const [selectedAgent, setSelectedAgent] = useState<AIAgent>(
    AI_AGENTS.find((a) => a.id === initialAgentId) || AI_AGENTS[0]
  );
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isPlayingDemo, setIsPlayingDemo] = useState<boolean>(false);
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

  // Sync state
  useEffect(() => {
    resetChat();
  }, [selectedAgent]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addLog = (text: string) => {
    const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [`[${timestamp}] ${text}`, ...prev.slice(0, 10)]);
  };

  const resetChat = () => {
    setIsPlayingDemo(false);
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
    addLog(`Chargement du profil système...`);
    addLog(`Sécurisation SSL active. Prêt.`);
  };

  // 1. GESTION DES CLICS SUR LES BOUTONS PRÉDÉFINIS
  const handlePresetQuestion = async (promptText: string, index: number) => {
    if (isTyping || isPlayingDemo) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    addLog(`USER >> ${promptText}`);
    setIsTyping(true);
    addLog(`SYS_API >> Connexion Webhook (Scénario)...`);

    try {
      // Appel à Make
      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: promptText,
          agent: selectedAgent.id 
        }),
      });

      if (!response.ok) throw new Error("Erreur serveur Make");

      const responseText = await response.text();

      const agentMsg: ChatMessage = {
        id: `agent-${Date.now()}`,
        sender: 'agent',
        content: responseText || "L'agent a répondu avec succès, mais le message est vide.",
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentMsg]);
      addLog(`AGENT >> Réponse générée via Make.`);
    } catch (error) {
      console.error(error);
      addLog(`ERR >> Échec de la connexion avec l'agent.`);
      
      // Message de secours affiché dans le chat en cas de panne
      setMessages((prev) => [...prev, {
        id: `agent-error-${Date.now()}`,
        sender: 'agent',
        content: "Désolé, je rencontre des difficultés pour joindre mon serveur central. Veuillez vérifier la configuration de votre Webhook.",
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  // 2. GESTION DE LA ZONE DE TEXTE LIBRE (QUAND ON ÉCRIT ET APPUIE SUR ENTREE)
  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!inputVal.trim() || isTyping || isPlayingDemo) return;

    const userText = inputVal;
    setInputVal('');

    const userMsg: ChatMessage = {
      id: `user-custom-${Date.now()}`,
      sender: 'user',
      content: userText,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    addLog(`USER (custom) >> ${userText}`);
    setIsTyping(true);
    addLog(`SYS_API >> Transmission des données à Make...`);

    try {
      // Requête HTTP POST vers votre scénario Make
      const response = await fetch(MAKE_WEBHOOK_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userText,
          agent: selectedAgent.id 
        }),
      });

      if (!response.ok) throw new Error("Erreur de communication");

      // Récupération de la réponse renvoyée par le module Webhook Response de Make
      const responseText = await response.text();

      const agentMsg: ChatMessage = {
        id: `agent-custom-reply-${Date.now()}`,
        sender: 'agent',
        content: responseText || "L'agent n'a renvoyé aucun texte. Vérifiez votre module Webhook Response.",
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentMsg]);
      addLog(`AGENT >> Réponse dynamique reçue.`);
    } catch (error) {
      console.error(error);
      addLog(`ERR >> Impossible de joindre l'agent IA.`);
      
      setMessages((prev) => [...prev, {
        id: `agent-custom-error-${Date.now()}`,
        sender: 'agent',
        content: "Une erreur s'est produite lors de la connexion avec l'agent IA. Vérifiez votre scénario Make.",
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      }]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-[#121214] border border-zinc-800/80 rounded-3xl p-5 md:p-8 shadow-2xl relative overflow-hidden glass-card">
      
      {/* Decorative ambient lights */}
      <div className={`absolute top-1/2 left-1/3 w-80 h-80 rounded-full -translate-y-1/2 -translate-x-1/2 mix-blend-multiply opacity-25 pointer-events-none transition-all duration-750 ${
        selectedAgent.id === 'standardiste' ? 'bg-indigo-950/40 blur-[100px]' : 
        selectedAgent.id === 'commercial' ? 'bg-blue-950/40 blur-[100px]' : 'bg-emerald-950/40 blur-[100px]'
      }`}></div>

      {/* LEFT COLUMN: Profiler */}
      <div className="lg:col-span-5 flex flex-col justify-between space-y-6 z-10">
        <div>
          <span className={`text-[10px] font-semibold tracking-wider font-mono uppercase px-2.5 py-0.5 bg-zinc-900/50 border rounded-full inline-block mb-3.5 ${
            selectedAgent.id === 'standardiste' ? 'text-indigo-300 border-indigo-900/60' : 
            selectedAgent.id === 'commercial' ? 'text-blue-300 border-blue-900/60' : 'text-emerald-300 border-emerald-900/60'
          }`}>
            Assistant En Activité
          </span>
          
          <h3 className="text-2xl font-display font-semibold text-zinc-100 tracking-tight">
            {selectedAgent.name}
          </h3>
          <p className="text-zinc-400 text-xs mt-2 leading-relaxed">
            {selectedAgent.description}
          </p>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 gap-3 mt-5">
            <div className="bg-zinc-900/40 border border-zinc-800/70 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-mono">Performance</span>
              <span className={`text-xl font-bold font-display mt-0.5 ${
                selectedAgent.id === 'standardiste' ? 'text-indigo-300' : 
                selectedAgent.id === 'commercial' ? 'text-blue-300' : 'text-emerald-300'
              }`}>{selectedAgent.metrics.value}</span>
              <span className="text-[10px] text-zinc-400 mt-0.5 leading-none">{selectedAgent.metrics.label}</span>
            </div>

            <div className="bg-zinc-900/40 border border-zinc-800/70 rounded-xl p-3 flex flex-col justify-between">
              <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-mono">Disponibilité</span>
              <span className="text-xl font-bold font-display text-zinc-100 mt-0.5">24h / 7</span>
              <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5 leading-none">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Live
              </span>
            </div>
          </div>

          {/* Key agent benefits list */}
          <div className="space-y-2 mt-5">
            <p className="text-[10px] text-zinc-500 font-mono font-medium uppercase tracking-wider">Avantages :</p>
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

        {/* Quick selector of agents */}
        <div className="space-y-1.5 pt-4 border-t border-zinc-800/60">
          <p className="text-[10px] text-zinc-500 font-mono">Tester un autre agent :</p>
          <div className="flex gap-1.5">
            {AI_AGENTS.map((agent) => (
              <button
                key={agent.id}
                onClick={() => setSelectedAgent(agent)}
                className={`flex-1 text-[11px] font-medium py-1.5 rounded-xl transition-all duration-305 border font-mono select-none ${
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
      <div className="lg:col-span-7 flex flex-col h-[460px] bg-zinc-950/80 border border-zinc-800/85 rounded-2xl overflow-hidden z-10 shadow-inner">
        
        {/* Terminal Header */}
        <div className="bg-[#121214] border-b border-zinc-800/90 px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex gap-1">
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
              <span className="w-2.5 h-2.5 rounded-full bg-zinc-800"></span>
            </span>
            <span className="text-[11px] text-zinc-400 flex items-center gap-1.5 font-mono ml-2 select-none">
              <Terminal className="w-3 h-3 text-zinc-500" /> console_sandbox v4
            </span>
          </div>
          <button 
            type="button"
            onClick={resetChat} 
            className="text-[10px] text-zinc-400 hover:text-white flex items-center gap-1 px-2.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition cursor-pointer select-none"
          >
            <RotateCcw className="w-2.5 h-2.5 text-zinc-500" /> Reset
          </button>
        </div>

        {/* Message Logs */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          
          {/* Subtle console info block */}
          <div className="border border-zinc-800/90 bg-[#121214]/90 rounded-xl p-2.5 space-y-0.5 text-[9px] text-zinc-400 font-mono select-none">
            <div className="flex justify-between border-b border-zinc-800/60 pb-1 mb-1 font-bold text-zinc-400">
              <span className="flex items-center gap-1">
                <Cpu className="w-2.5 h-2.5 text-zinc-500" /> AXIUM SYSTEMS SECURE
              </span>
              <span className="text-emerald-400 uppercase text-[8px] font-semibold">✓ PRÊT</span>
            </div>
            {logs.slice(0, 3).map((log, index) => (
              <div key={index} className="truncate">{log}</div>
            ))}
          </div>

          {/* Conversation history */}
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col max-w-[80%] ${
                msg.sender === 'user' ? 'ml-auto items-end' : 'mr-auto items-start'
              }`}
            >
              <span className="text-[8px] text-zinc-500 font-mono mb-0.5">
                {msg.sender === 'user' ? 'Moi' : selectedAgent.name} • {msg.timestamp}
              </span>
              <div
                className={`p-3 rounded-xl leading-relaxed text-[11px] font-sans ${
                  msg.sender === 'user'
                    ? 'bg-zinc-100 text-zinc-950 rounded-tr-none font-semibold'
                    : 'bg-zinc-900/90 border border-zinc-800 text-zinc-200 rounded-tl-none shadow-sm'
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="mr-auto items-start max-w-[80%] flex flex-col">
              <span className="text-[8px] text-zinc-500 font-mono mb-0.5">Assistant est en train de réfléchir...</span>
              <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 p-2.5 rounded-xl rounded-tl-none shadow-sm flex items-center gap-1">
                <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1 h-1 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}

          <div ref={messageEndRef} />
        </div>

        {/* Interactive scenarios helper */}
        <div className="px-4 py-2 bg-zinc-900/40 border-t border-zinc-800/80 space-y-1 select-none">
          <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold font-mono">
            Scénarios prédéfinis :
          </p>
          <div className="flex flex-wrap gap-1">
            {selectedAgent.demoDialog.map((dialog, idx) => {
              const alreadyUsed = messages.some((m) => m.content === dialog.userPrompt);
              return (
                <button
                  key={idx}
                  type="button"
                  disabled={isTyping || alreadyUsed}
                  onClick={() => handlePresetQuestion(dialog.userPrompt, idx)}
                  className={`text-[10px] text-left px-2 py-1 rounded-lg border transition-all duration-200 flex items-center gap-1 select-none ${
                    alreadyUsed 
                      ? 'border-zinc-800/40 text-zinc-650 bg-zinc-950/40 cursor-not-allowed'
                      : 'border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white bg-[#141416] hover:bg-zinc-850 cursor-pointer text-xs font-sans'
                  }`}
                >
                  <Play className={`w-2 h-2 ${alreadyUsed ? 'text-zinc-650' : 'text-emerald-400'}`} /> {dialog.userPrompt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Input box */}
        <form onSubmit={handleSendMessage} className="p-2.5 bg-[#121214] border-t border-zinc-800 flex items-center gap-2">
          <input
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            disabled={isTyping || isPlayingDemo}
            placeholder={
              isTyping 
                ? "Génération en cours..." 
                : "Posez votre question (ex: prix, sécurité, rdv...)"
            }
            className="flex-1 bg-zinc-950 border border-zinc-800 text-xs text-zinc-100 placeholder-zinc-500 px-3 py-2 rounded-lg font-sans focus:border-zinc-700 focus:outline-none transition"
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isTyping}
            className={`p-2 rounded-lg flex items-center justify-center transition-all ${
              inputVal.trim() && !isTyping
                ? 'bg-zinc-100 hover:bg-zinc-250 text-zinc-950 cursor-pointer'
                : 'bg-zinc-900 text-zinc-500 cursor-not-allowed border border-zinc-800'
            }`}
          >
            <Send className="w-3 h-3" />
          </button>
        </form>

      </div>

    </div>
  );
}
