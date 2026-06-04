/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useRef, FormEvent } from 'react';
import { AI_AGENTS } from '../data/agents';
import { AIAgent, ChatMessage } from '../types';
import { 
  Play, 
  RotateCcw, 
  Send, 
  Terminal, 
  Cpu, 
  CheckCircle2, 
  Globe,
  Activity,
  Copy,
  Check,
  HelpCircle,
  ArrowRight,
  ExternalLink,
  Code,
  Zap,
  AlertCircle
} from 'lucide-react';

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

  // New Make.com integration states
  const [testMode, setTestMode] = useState<'simulation' | 'make_webhook'>('simulation');
  const [webhookUrl, setWebhookUrl] = useState<string>('');
  const [copiedPayload, setCopiedPayload] = useState<boolean>(false);
  const [copiedUrl, setCopiedUrl] = useState<boolean>(false);
  const [pingStatus, setPingStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [showMakeGuide, setShowMakeGuide] = useState<boolean>(false);
  const [sessionId, setSessionId] = useState<string>('');

  // Sync prop changes
  useEffect(() => {
    if (initialAgentId) {
      const target = AI_AGENTS.find((a) => a.id === initialAgentId);
      if (target) {
        setSelectedAgent(target);
      }
    }
  }, [initialAgentId]);

  // Load webhook url and initial setup
  useEffect(() => {
    const saved = localStorage.getItem('axium_make_webhook_url');
    if (saved) {
      setWebhookUrl(saved);
    }
    setSessionId('session-' + Math.random().toString(36).substring(2, 11));
  }, []);

  // Sync state when agent or testMode changes
  useEffect(() => {
    resetChat();
  }, [selectedAgent, testMode]);

  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const addLog = (text: string) => {
    const timestamp = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    setLogs((prev) => [`[${timestamp}] ${text}`, ...prev.slice(0, 15)]);
  };

  const handleWebhookUrlChange = (url: string) => {
    setWebhookUrl(url);
    localStorage.setItem('axium_make_webhook_url', url);
  };

  const resetChat = () => {
    setIsPlayingDemo(false);
    setMessages([
      {
        id: 'init',
        sender: 'agent',
        content: testMode === 'make_webhook' 
          ? `[Mode Live Make.com connecté] Bonjour ! Mes réponses sont désormais pilotées en direct par votre scénario Make. Envoyez n'importe quel message pour tester votre workflow.`
          : selectedAgent.initialMessage,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      },
    ]);
    setLogs([]);
    const generatedSession = 'session-' + Math.random().toString(36).substring(2, 11);
    setSessionId(generatedSession);
    
    addLog(`Démarrage de '${selectedAgent.name}'...`);
    if (testMode === 'make_webhook') {
      addLog(`PROXIFY >> Mode Webhook Live activé.`);
      addLog(`SESSION_ID >> Initialisé : ${generatedSession}`);
      addLog(`CORS_CHECK >> En attente d'une requête HTTP POST...`);
    } else {
      addLog(`Chargement du profil système...`);
      addLog(`Sécurisation SSL active. Prêt.`);
    }
  };

  const handleCopyPayload = () => {
    const payload = JSON.stringify({
      message: "Bonjour, j'aimerais tester cet agent IA !",
      agentId: selectedAgent.id,
      agentName: selectedAgent.name,
      session_id: sessionId,
      currentTime: new Date().toISOString()
    }, null, 2);

    navigator.clipboard.writeText(payload);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
    addLog(`SYS >> Payload d'exemples copié dans le presse-papiers.`);
  };

  const handleSendPing = async () => {
    if (!webhookUrl.trim()) {
      addLog(`SYS >> Ping interrompu : L'URL du webhook est vide.`);
      setPingStatus('error');
      return;
    }

    setPingStatus('sending');
    addLog(`API_POST >> Envoi d'un ping de schéma à : ${webhookUrl.substring(0, 35)}...`);

    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: "PING DE CONFIGURATION - Détection initiale du schéma Axium Solutions",
          agentId: selectedAgent.id,
          agentName: selectedAgent.name,
          session_id: "ping-test-123",
          currentTime: new Date().toISOString(),
          isPingTest: true
        })
      });

      if (response.ok) {
        setPingStatus('success');
        addLog(`API_RESPONSE >> Succès (REST HTTP 200/201). Schéma capturé par Make !`);
        setTimeout(() => setPingStatus('idle'), 3000);
      } else {
        throw new Error(`Erreur HTTP : Code ${response.status}`);
      }
    } catch (err: any) {
      console.error(err);
      setPingStatus('error');
      addLog(`ERR_CONNECT >> Échec : ${err.message || err}. Vérifiez vos droits CORS ou l'adresse.`);
      setTimeout(() => setPingStatus('idle'), 5000);
    }
  };

  const handlePresetQuestion = async (promptText: string, index: number) => {
    if (isTyping || isPlayingDemo) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      content: promptText,
      timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    
    if (testMode === 'make_webhook') {
      setIsTyping(true);
      await sendToWebhook(promptText);
    } else {
      addLog(`USER >> ${promptText}`);
      const matchingDialog = selectedAgent.demoDialog.find((d) => d.userPrompt === promptText);
      const responses = matchingDialog ? matchingDialog.agentResponses : ["Bien sûr, je comprends. Pourrions-nous en discuter lors d'un audit approfondi ?"];

      setIsTyping(true);
      addLog(`SYS >> Calcul du contexte de l'assistant...`);
      
      // Sim streaming delays
      for (let i = 0; i < responses.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        
        const agentMsg: ChatMessage = {
          id: `agent-${Date.now()}-${i}`,
          sender: 'agent',
          content: responses[i],
          timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        };

        setMessages((prev) => [...prev, agentMsg]);
        addLog(`AGENT >> Réponse générée (${responses[i].length} cars)`);
      }

      setIsTyping(false);
    }
  };

  const sendToWebhook = async (userText: string) => {
    if (!webhookUrl.trim()) {
      const errorMsg: ChatMessage = {
        id: `sys-err-${Date.now()}`,
        sender: 'system',
        content: "Erreur : Veuillez copier-coller votre adresse de Webhook Make.com dans le configurateur de gauche pour lancer le test en direct.",
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
      addLog(`SYS >> Erreur : Adresse de Webhook vide.`);
      setIsTyping(false);
      return;
    }

    addLog(`MAKE_POST >> Connexion au point de terminaison Make...`);
    addLog(`PAYLOAD >> { message: "${userText.substring(0, 20)}...", agentId: "${selectedAgent.id}", session_id: "${sessionId}" }`);

    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userText,
          agentId: selectedAgent.id,
          agentName: selectedAgent.name,
          session_id: sessionId,
          currentTime: new Date().toISOString()
        })
      });

      if (!res.ok) {
        throw new Error(`HTTP ${res.status} (${res.statusText})`);
      }

      const responseText = await res.text();
      addLog(`MAKE_RESPONSE >> Reçu HTTP ${res.status}. Taille : ${responseText.length} octets`);

      let replyText = "";
      try {
        const parsed = JSON.parse(responseText);
        replyText = parsed.response || parsed.message || parsed.text || parsed.reply || parsed.output || responseText;
        if (typeof replyText === 'object') {
          replyText = JSON.stringify(replyText);
        }
      } catch (e) {
        replyText = responseText;
      }

      // If output is completely empty
      if (!replyText.trim()) {
        replyText = "⚠️ Votre scénario Make a répondu correctement (HTTP 200), mais le corps de la réponse est vide. Assurez-vous d'avoir inséré un module de réponse final 'Webhook Response' renvoyant le texte souhaité.";
      }

      const agentMsg: ChatMessage = {
        id: `agent-webhook-reply-${Date.now()}`,
        sender: 'agent',
        content: replyText,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, agentMsg]);
      addLog(`AGENT_LIVE >> Réponse injectée dans l'interface de messagerie.`);
    } catch (err: any) {
      console.error(err);
      addLog(`ERR_CONNECT >> Impossible de contacter le Webhook de Make.com.`);
      addLog(`ERR_CORS >> Détails de l'erreur : ${err.message || err}`);
      
      const errorMsg: ChatMessage = {
        id: `sys-err-${Date.now()}`,
        sender: 'system',
        content: `❌ Échec de la communication avec Make.com (${err.message || err}).\n\nSolutions recommandées :\n1. Vérifiez que votre URL de webhook est exactement copiée dans l'interface.\n2. Assurez-vous que le scénario Make est actif en cliquant sur "Run ONCE" avant d'envoyer le message.\n3. Très Important : Utilisez impérativement un module final "Webhook Response" (Réponse de Webhook) dans votre scénario au lieu d'une fin classique, afin de renvoyer le texte au navigateur de test via CORS.`,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setIsTyping(false);
    }
  };

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
    setIsTyping(true);

    if (testMode === 'make_webhook') {
      await sendToWebhook(userText);
    } else {
      addLog(`USER (custom) >> ${userText}`);
      addLog(`SYS_API >> Évaluation sémantique...`);

      // Simulate response delay
      await new Promise((resolve) => setTimeout(resolve, 1200));

      let responseText = "C'est une excellente question relative à nos intégrations logicielles. Nos agents s'interfacent directement sur vos outils existants via des APIs sécurisées.";
      
      const lowercaseText = userText.toLowerCase();
      if (lowercaseText.includes('prix') || lowercaseText.includes('tarif') || lowercaseText.includes('coût') || lowercaseText.includes('combien')) {
        responseText = "Nos agents IA sont conçus sur mesure. Les forfaits d'intégration dépendent de vos workflows opérationnels exacts. Nos tarifs mensuels sont calculés en fonction des volumes d'exécution de vos agents. Nous vous invitons à réserver un créneau gratuit pour évaluer vos potentiels d'économies.";
      } else if (lowercaseText.includes('sécurité') || lowercaseText.includes('données') || lowercaseText.includes('rgpd') || lowercaseText.includes('secure')) {
        responseText = "La confidentialité est primordiale pour Axium Solutions. Toutes vos informations internes sont stockées et exécutées sur des clouds souverains isolés d'Europe, en conformité totale avec le RGPD.";
      } else if (lowercaseText.includes('rdv') || lowercaseText.includes('rendez-vous') || lowercaseText.includes('planifier') || lowercaseText.includes('contact')) {
        responseText = "Bien sûr ! Vous pouvez choisir un créneau horaire en direct à l'aide de notre bouton 'Prendre RDV' situé dans le menu supérieur.";
      } else if (lowercaseText.includes('humain') || lowercaseText.includes('vrai') || lowercaseText.includes('robot')) {
        responseText = "Je suis une simulation d'agent virtuel Axium Solutions. En production, nos architectures reproduisent fidèlement l'expertise métier de vos fiches pratiques.";
      }

      const agentMsg: ChatMessage = {
        id: `agent-custom-reply-${Date.now()}`,
        sender: 'agent',
        content: responseText,
        timestamp: new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
      };

      setMessages((prev) => [...prev, agentMsg]);
      addLog(`AGENT >> Réponse dynamique envoyée.`);
      setIsTyping(false);
    }
  };

  const getLogColorClass = (logLine: string) => {
    if (logLine.includes('ERR_CONNECT') || logLine.includes('ERR_CORS') || logLine.includes('Erreur')) {
      return 'text-rose-450 font-semibold';
    }
    if (logLine.includes('MAKE_POST') || logLine.includes('PAYLOAD') || logLine.includes('API_POST')) {
      return 'text-sky-400';
    }
    if (logLine.includes('MAKE_RESPONSE') || logLine.includes('AGENT_LIVE') || logLine.includes('API_RESPONSE') || logLine.includes('Succès')) {
      return 'text-emerald-450';
    }
    if (logLine.includes('SESSION_ID')) {
      return 'text-zinc-500 font-mono';
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

      {/* LEFT COLUMN: Profiler & Webhook Configurator */}
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

          {/* New Engine Selector Tab Row */}
          <div className="space-y-2">
            <p className="text-[10px] text-zinc-500 font-mono font-medium uppercase tracking-wider">
              Moteur de test de l'agent :
            </p>
            <div className="grid grid-cols-2 gap-1.5 bg-zinc-950/80 p-1.5 rounded-2xl border border-zinc-800/65">
              <button
                type="button"
                onClick={() => setTestMode('simulation')}
                className={`text-[11px] font-medium py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                  testMode === 'simulation'
                    ? 'bg-zinc-900 text-zinc-100 shadow-sm border border-zinc-800'
                    : 'text-zinc-400 hover:text-zinc-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5 text-zinc-400" />
                Simulation Locale
              </button>
              <button
                type="button"
                onClick={() => setTestMode('make_webhook')}
                className={`text-[11px] font-medium py-2 rounded-xl transition-all duration-200 flex items-center justify-center gap-1.5 cursor-pointer ${
                  testMode === 'make_webhook'
                    ? 'bg-zinc-100 text-zinc-950 font-semibold shadow-sm'
                    : 'text-zinc-450 hover:text-zinc-200'
                }`}
              >
                <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-500 animate-pulse" />
                Live Webhook Make
              </button>
            </div>
          </div>

          {/* Content rendered depending on the active test mode */}
          {testMode === 'simulation' ? (
            <div className="space-y-5 animate-fadeIn">
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
                  <span className="text-[9px] text-zinc-500 uppercase tracking-wider font-mono">Disponibilité</span>
                  <span className="text-xl font-bold font-display text-zinc-100 mt-0.5">24h / 7</span>
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-0.5 leading-none">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> Live
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
          ) : (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Webhook Connection Box */}
              <div className="bg-zinc-950 border border-zinc-800 p-4 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-[10px] text-zinc-400 font-mono font-bold uppercase flex items-center gap-1">
                    <Globe className="w-3.5 h-3.5 text-sky-400" /> URL Webhook de Test (Make.com)
                  </label>
                  <span className={`w-1.5 h-1.5 rounded-full ${webhookUrl ? 'bg-emerald-400 shadow-emerald-400 shadow' : 'bg-amber-400'} animate-pulse`}></span>
                </div>

                <input
                  type="text"
                  value={webhookUrl}
                  onChange={(e) => handleWebhookUrlChange(e.target.value)}
                  placeholder="https://hook.eu1.make.com/your-custom-webhook-id..."
                  className="w-full bg-zinc-900 border border-zinc-80 p-2.5 rounded-xl text-xs font-mono text-zinc-200 placeholder-zinc-650 focus:border-sky-500/80 focus:outline-none transition-all"
                />

                {/* Configurations triggers */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  {/* Copy payload schema */}
                  <button
                    type="button"
                    onClick={handleCopyPayload}
                    className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-850 transition text-[10px] text-zinc-350 cursor-pointer text-center select-none"
                  >
                    {copiedPayload ? (
                      <>
                        <Check className="w-3 h-3 text-emerald-400" />
                        Copié !
                      </>
                    ) : (
                      <>
                        <Copy className="w-3 h-3 text-zinc-500" />
                        Copier Payload JSON
                      </>
                    )}
                  </button>

                  {/* Send capture ping */}
                  <button
                    type="button"
                    onClick={handleSendPing}
                    disabled={pingStatus === 'sending'}
                    className="flex items-center justify-center gap-1 px-2.5 py-1.5 rounded-xl border border-zinc-800 hover:border-zinc-700 bg-zinc-900 hover:bg-zinc-850 transition text-[10px] text-zinc-350 disabled:opacity-50 cursor-pointer text-center select-none"
                  >
                    {pingStatus === 'sending' ? (
                      <span className="w-2.5 h-2.5 border-2 border-zinc-500 border-t-white rounded-full animate-spin"></span>
                    ) : pingStatus === 'success' ? (
                      <Check className="w-3 h-3 text-emerald-400" />
                    ) : pingStatus === 'error' ? (
                      <AlertCircle className="w-3 h-3 text-rose-450" />
                    ) : (
                      <Activity className="w-3 h-3 text-sky-450 animate-pulse" />
                    )}
                    <span>
                      {pingStatus === 'sending' ? "Ping d'essai..." : pingStatus === 'success' ? "Ping Reçu !" : pingStatus === 'error' ? "Échec Ping" : "Envoyer Ping"}
                    </span>
                  </button>
                </div>
              </div>

              {/* Show/Hide guidelines toggler */}
              <button
                type="button"
                onClick={() => setShowMakeGuide(!showMakeGuide)}
                className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl border border-zinc-800 bg-zinc-900/50 hover:bg-zinc-900 transition text-[11px] text-zinc-300 font-semibold cursor-pointer select-none"
              >
                <span className="flex items-center gap-1.5 text-zinc-300">
                  <HelpCircle className="w-3.5 h-3.5 text-amber-500" /> Guide : Configurer Make.com
                </span>
                <span className="text-[10px] text-zinc-500">{showMakeGuide ? 'Cacher' : 'Afficher'}</span>
              </button>

              {/* Step-by-Step interactive manual for Make.com */}
              {showMakeGuide && (
                <div className="bg-zinc-950/80 border border-zinc-855 rounded-2xl p-4 text-[11px] text-zinc-400 space-y-3 leading-relaxed animate-fadeIn">
                  <div className="flex items-center gap-1.5 border-b border-zinc-800 pb-2 mb-1">
                    <Code className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="font-mono text-zinc-200">PROCÉDURE EN 3 ÉTAPES</span>
                  </div>
                  
                  <div className="space-y-3 font-sans">
                    <div>
                      <span className="font-bold font-mono text-zinc-200 mr-1.5">01. DÉCLENCHEUR :</span>
                      Créez un scénario Make avec le module <strong className="text-zinc-200">"Custom Webhook"</strong>. Générez l'URL, collez-la ci-dessus, puis cliquez sur <strong className="text-zinc-300">"Envoyer Ping"</strong> pour que Make capture automatiquement les types de variables de notre message.
                    </div>
                    <div>
                      <span className="font-bold font-mono text-zinc-200 mr-1.5">02. TRAITEMENT :</span>
                      Connectez votre module IA préféré (ex: OpenAI ChatGPT, Google Gemini, Anthropic Claude, ou routeur SQL) et renseignez le prompt système de votre métier en lui passant le paramètre <code className="bg-zinc-900 border border-zinc-800 px-1 py-0.5 rounded text-sky-350 font-mono text-[10px]">message</code>.
                    </div>
                    <div>
                      <span className="font-bold font-mono text-zinc-200 mr-1.5">03. RÉPONSE D'INTERFACE :</span>
                      Ajoutez absolument un module <strong className="text-zinc-200">"Webhook Response"</strong> à la fin. Spécifiez le code HTTP 200, et renvoyez un JSON valide contenant une variable de réponse, ou simplement le message généré (ex: <code className="bg-zinc-900 border border-zinc-800 text-[10px] text-emerald-450 px-1 font-mono rounded">{"{ \"response\": \"...\" }"}</code>) pour que l'interface l'affiche en direct.
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

        </div>

        {/* Quick selector of agents */}
        <div className="space-y-1.5 pt-4 border-t border-zinc-800/60">
          <p className="text-[10px] text-zinc-500 font-mono">Tester un autre canal :</p>
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
              <Terminal className="w-3 h-3 text-zinc-500" /> control_panel v5.LIVE
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
                <Cpu className="w-2.5 h-2.5 text-zinc-500" /> CONSOLE DE FLUX AXIUM & MAKE
              </span>
              <span className="text-emerald-400 uppercase text-[8px] font-semibold flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span> CONNECTÉ
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
              className={`flex flex-col max-w-[80%] ${
                msg.sender === 'user' ? 'ml-auto items-end animate-sliceUp' : 'mr-auto items-start animate-sliceUp'
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
                    ? 'bg-rose-950/40 border border-rose-900/60 text-rose-300 rounded-lg text-xs leading-normal font-mono p-4'
                    : 'bg-zinc-900/95 border border-zinc-800 text-zinc-200 rounded-tl-none shadow-sm'
                }`}
                style={{
                  whiteSpace: msg.sender === 'system' ? 'pre-line' : 'normal'
                }}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {/* Typing Indicator */}
          {isTyping && (
            <div className="mr-auto items-start max-w-[80%] flex flex-col animate-fadeIn">
              <span className="text-[8px] text-zinc-500 font-mono mb-0.5">Le webhook Make formule son verdict...</span>
              <div className="bg-zinc-900 border border-zinc-800 text-zinc-400 p-2.5 rounded-xl rounded-tl-none shadow-sm flex items-center gap-1">
                <span className="w-1 h-1 bg-[#f59e0b] rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-1 h-1 bg-[#3b82f6] rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-1 h-1 bg-[#10b981] rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </div>
            </div>
          )}

          <div ref={messageEndRef} />
        </div>

        {/* Interactive scenarios helper */}
        <div className="px-4 py-2.5 bg-zinc-900/40 border-t border-zinc-800/80 space-y-1 select-none">
          <p className="text-[9px] text-zinc-500 uppercase tracking-wider font-semibold font-mono flex items-center gap-1">
            <Zap className="w-2.5 h-2.5 text-amber-500" /> Scénarios de test rapides :
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
                  className={`text-[10px] text-left px-2 py-1.5 rounded-lg border transition-all duration-200 flex items-center gap-1 select-none ${
                    alreadyUsed 
                      ? 'border-zinc-800/40 text-zinc-600 bg-zinc-950/40 cursor-not-allowed'
                      : 'border-zinc-800 hover:border-zinc-750 text-zinc-300 hover:text-white bg-[#141416] hover:bg-zinc-850 cursor-pointer text-xs font-sans'
                  }`}
                >
                  <Play className={`w-2 h-2 ${alreadyUsed ? 'text-zinc-600' : 'text-sky-400'}`} /> {dialog.userPrompt}
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
                ? "Traitement en cours par Make.com..." 
                : testMode === 'make_webhook'
                ? "Saisissez un message de test pour votre webhook Make..."
                : "Posez votre question (ex: prix, sécurité, rdv...)"
            }
            className={`flex-1 bg-zinc-950 border text-xs text-zinc-100 placeholder-zinc-500 px-3 py-2.5 rounded-xl font-sans focus:outline-none transition-all ${
              testMode === 'make_webhook' 
                ? 'border-zinc-800 focus:border-sky-500/80 ring-offset-zinc-950'
                : 'border-zinc-800 focus:border-zinc-700'
            }`}
          />
          <button
            type="submit"
            disabled={!inputVal.trim() || isTyping}
            className={`p-2.5 rounded-xl flex items-center justify-center transition-all ${
              inputVal.trim() && !isTyping
                ? testMode === 'make_webhook'
                  ? 'bg-sky-400 hover:bg-sky-500 text-zinc-950 cursor-pointer shadow-md shadow-sky-500/10'
                  : 'bg-zinc-100 hover:bg-zinc-250 text-zinc-950 cursor-pointer'
                : 'bg-zinc-900 text-zinc-500 cursor-not-allowed border border-zinc-800'
            }`}
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>

      </div>

    </div>
  );
}

