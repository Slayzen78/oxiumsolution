/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Bot, 
  Phone, 
  ShoppingBag, 
  Cpu, 
  CheckCircle2, 
  ArrowUpRight, 
  ArrowRight,
  Sparkles,
  Terminal, 
  Menu,
  X,
  Plus
} from 'lucide-react';
import { AI_AGENTS } from './data/agents';
import RoiCalculator from './components/RoiCalculator';
import AgentSimulator from './components/AgentSimulator';
import BookingModal from './components/BookingModal';

export default function App() {
  const [isBookingOpen, setIsBookingOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<'home' | 'playground'>('home');
  const [selectedAgentId, setSelectedAgentId] = useState<string>('standardiste');

  const navigateToSection = (sectionId: string) => {
    setActiveView('home');
    setMobileMenuOpen(false);
    setTimeout(() => {
      const dom = document.getElementById(sectionId);
      if (dom) {
        dom.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }, 100);
  };

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 30);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  const getAgentIcon = (id: string, colorClass: string) => {
    switch (id) {
      case 'standardiste': 
        return <div className={`p-2.5 rounded-xl bg-indigo-50 border border-indigo-100 ${colorClass}`}><Phone className="w-5 h-5" /></div>;
      case 'commercial': 
        return <div className={`p-2.5 rounded-xl bg-blue-50 border border-blue-100 ${colorClass}`}><ShoppingBag className="w-5 h-5" /></div>;
      case 'automatisation': 
        return <div className={`p-2.5 rounded-xl bg-emerald-50 border border-emerald-100 ${colorClass}`}><Cpu className="w-5 h-5" /></div>;
      default: 
        return <div className={`p-2.5 rounded-xl bg-zinc-50 border border-zinc-150 ${colorClass}`}><Bot className="w-5 h-5" /></div>;
    }
  };

  const faqs = [
    {
      q: "Sous quels délais l'agent virtuel est-il opérationnel ?",
      a: "Un agent standard ou de prospection standardisé est conçu et intégré en 2 à 5 jours ouvrés."
    },
    {
      q: "Mes informations d'entreprise restent-elles confidentielles ?",
      a: "La confidentialité est contractuelle. Toutes vos données d'opérations cheminent au travers de bases de données isolées, encryptées et certifiées conformes aux recommandations RGPD."
    },
    {
      q: "Avec quels outils puis-je lier mes agents IA ?",
      a: "Nos solutions s'interfacent avec n'importe quelle API moderne, incluant Salesforce, HubSpot, Slack, Notion, Holded ainsi que vos bases de données privées (SQL/NoSQL) via tunnels VPN isolés."
    }
  ];

  return (
    <div className="relative min-h-screen bg-[#121214] text-zinc-100 overflow-hidden font-sans">
      
      {/* Soft aesthetic background lighting vectors */}
      <div className="absolute top-0 left-1/4 w-[450px] h-[450px] rounded-full glow-purple opacity-40 pointer-events-none z-0"></div>
      <div className="absolute top-[350px] right-1/4 w-[500px] h-[500px] rounded-full glow-blue opacity-30 pointer-events-none z-0"></div>
      <div className="absolute top-[1600px] left-12 w-[400px] h-[400px] rounded-full glow-emerald opacity-30 pointer-events-none z-0"></div>

      {/* FIXED FLOATING NAVBAR */}
      <header className={`fixed top-0 inset-x-0 z-40 transition-all duration-300 ${
        scrolled ? 'pt-3 px-4' : 'pt-5 px-4 md:px-8'
      }`}>
        <nav className={`max-w-6xl mx-auto rounded-full glass-nav px-6 py-2.5 flex items-center justify-between transition-all duration-300 ${
          scrolled ? 'shadow-2xl border-zinc-800/85 bg-[#121214e5]' : ''
        }`}>
          {/* Logo */}
          <button 
            type="button"
            onClick={() => {
              setActiveView('home');
              setMobileMenuOpen(false);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex items-center gap-2.5 group cursor-pointer bg-transparent border-0 p-0 text-left"
          >
            <div className="relative h-8 w-8 rounded-full bg-zinc-105 text-white border border-zinc-800 flex items-center justify-center font-display font-semibold text-base overflow-hidden">
              <span className="relative z-10 font-bold">A</span>
            </div>
            <span className="font-display font-medium text-base tracking-tight text-zinc-100 select-none">
              Axium <span className="text-zinc-450 font-light">Solutions</span>
            </span>
          </button>

          {/* Nav links */}
          <div className="hidden md:flex items-center gap-7 text-xs font-medium">
            <button 
              onClick={() => navigateToSection('agents')}
              className={`hover:text-zinc-100 transition cursor-pointer bg-transparent border-0 p-0 ${
                activeView === 'home' ? 'text-zinc-350' : 'text-zinc-400'
              }`}
            >
              Nos Agents
            </button>
            <button 
              onClick={() => navigateToSection('calculateur')}
              className="hover:text-zinc-100 text-zinc-400 transition cursor-pointer bg-transparent border-0 p-0"
            >
              Calcul de R.O.I
            </button>
            <button 
              onClick={() => {
                setSelectedAgentId('standardiste');
                setActiveView('playground');
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`hover:text-zinc-100 transition cursor-pointer bg-transparent border-0 p-0 ${
                activeView === 'playground' ? 'text-zinc-100 font-semibold underline underline-offset-4 decoration-indigo-400 decoration-2' : 'text-zinc-400'
              }`}
            >
              Simulateur (Test)
            </button>
            <button 
              onClick={() => navigateToSection('faq')}
              className="hover:text-zinc-100 text-zinc-400 transition cursor-pointer bg-transparent border-0 p-0"
            >
              FAQ
            </button>
          </div>

          {/* Action button */}
          <div className="hidden md:flex items-center">
            <button
              onClick={() => setIsBookingOpen(true)}
              className="px-4 py-2 rounded-full bg-zinc-100 text-zinc-950 hover:bg-zinc-200 text-xs font-semibold tracking-wide transition-all duration-200 cursor-pointer shadow-sm active:scale-95"
            >
              Prendre RDV
            </button>
          </div>

          {/* Mobile menu trigger */}
          <button 
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1.5 rounded-lg text-zinc-400 hover:text-zinc-100 bg-zinc-900 border border-zinc-800 hover:bg-zinc-850 transition"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </nav>
      </header>

      {/* MOBILE DROP-DOWN MENU */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            className="fixed top-20 inset-x-4 bg-zinc-900/95 border border-zinc-800 rounded-2xl p-5 z-30 md:hidden flex flex-col gap-4.5 shadow-2xl backdrop-blur-xl font-medium"
          >
            <button 
              onClick={() => navigateToSection('agents')} 
              className="text-left text-sm text-zinc-300 hover:text-zinc-100 transition bg-transparent border-0 p-0"
            >
              Nos Agents
            </button>
            <button 
              onClick={() => navigateToSection('calculateur')} 
              className="text-left text-sm text-zinc-300 hover:text-zinc-100 transition bg-transparent border-0 p-0"
            >
              Calcul de R.O.I
            </button>
            <button 
              onClick={() => {
                setSelectedAgentId('standardiste');
                setActiveView('playground');
                setMobileMenuOpen(false);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }} 
              className="text-left text-sm text-zinc-300 hover:text-zinc-100 transition bg-transparent border-0 p-0 font-semibold text-indigo-400"
            >
              Simulateur (Test)
            </button>
            <button 
              onClick={() => navigateToSection('faq')} 
              className="text-left text-sm text-zinc-300 hover:text-zinc-100 transition bg-transparent border-0 p-0"
            >
              FAQ
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                setIsBookingOpen(true);
              }}
              className="w-full bg-zinc-100 text-zinc-950 py-2.5 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer mt-1"
            >
              Prendre RDV <ArrowRight className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="relative z-10 pt-28 pb-16 px-4 md:px-8 max-w-5xl mx-auto space-y-20 md:space-y-32">
        
        {activeView === 'playground' ? (
          <section className="space-y-8 pt-4 md:pt-8 min-h-[600px]">
            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveView('home');
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-semibold text-zinc-300 hover:text-white transition cursor-pointer select-none"
              >
                <ArrowRight className="w-3.5 h-3.5 rotate-180" /> Retour à l'accueil
              </button>
              
              <div className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900/50 border border-zinc-800/80 rounded-full text-[10px] text-zinc-400 font-mono select-none">
                <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                <span>PLATEFORME DE TEST INTERACTIF</span>
              </div>
            </div>

            <div className="space-y-2">
              <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 font-bold block">
                VIVEZ L'EXPÉRIENCE EN DIRECT
              </span>
              <h1 className="text-3xl md:text-4xl font-display font-medium text-white tracking-tight">
                Plateforme d'Essai des Agents IA
              </h1>
              <p className="text-xs text-zinc-400 max-w-xl">
                Testez en direct les flux, fiches de connaissances et capacités d'interaction de nos agents de production intelligents.
              </p>
            </div>

            <AgentSimulator initialAgentId={selectedAgentId} />

            {/* Micro-CTA card under simulator */}
            <div className="bg-zinc-900/40 border border-zinc-800/80 rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="space-y-1 text-center md:text-left">
                <h4 className="font-display font-semibold text-sm text-white">Intéressé par une intégration personnalisée ?</h4>
                <p className="text-xs text-zinc-400 max-w-lg">
                  Chaque agent peut être personnalisé avec la charte de votre marque, vos propres bases de connaissances et vos logiciels de prédilection.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setIsBookingOpen(true)}
                className="px-5 py-2.5 rounded-xl bg-zinc-105 text-zinc-950 hover:bg-zinc-200 transition font-semibold text-xs cursor-pointer shrink-0"
              >
                Réserver mon audit gratuit
              </button>
            </div>
          </section>
        ) : (
          <>
            {/* HERO SECTION */}
            <section className="relative pt-8 md:pt-16 text-center space-y-6 max-w-3xl mx-auto">
              {/* Subtle line badge */}
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-zinc-900/50 border border-zinc-800/80 rounded-full text-[10px] md:text-xs text-zinc-400 font-mono select-none shadow-xs">
                <span className="w-2 h-2 bg-zinc-100 rounded-full animate-pulse"></span>
                <span>AXIUM SOLUTIONS — AGENTS IA STRUCTURÉS</span>
              </div>

              {/* Fine typographic title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-medium text-white tracking-tight leading-[1.12]">
                L'Élite des Agents IA <br className="hidden sm:block" />
                Pour Vos Opérations.
              </h1>

              <p className="text-zinc-400 text-sm md:text-base max-w-xl mx-auto leading-relaxed font-light">
                Automatisez vos taches chronophages. Nous concevons et déployons des agents autonomes et sécurisés pour répondre à vos clients, prospecter et structurer vos outils.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-3">
                <button
                  onClick={() => setIsBookingOpen(true)}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-100 text-zinc-950 font-semibold text-xs tracking-wide hover:bg-zinc-250 transition-all cursor-pointer shadow-md inline-flex items-center justify-center gap-1.5 font-sans"
                >
                  Réserver mon diagnostic <ArrowRight className="w-4.5 h-4.5 text-zinc-950" />
                </button>
                <button
                  onClick={() => {
                    setSelectedAgentId('standardiste');
                    setActiveView('playground');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white text-xs font-semibold tracking-wide hover:bg-zinc-850 transition inline-flex items-center justify-center gap-1.5 cursor-pointer"
                >
                 <ArrowRight className="w-4.5 h-4.5 text-zinc-950" /> Essayer un agent
                </button>
              </div>
            </section>

            {/* SERVICES: BENTO GRID SECTION */}
            <section id="agents" className="space-y-8">
              <div className="max-w-xl">
                <h2 className="text-2xl md:text-3xl font-display font-medium text-zinc-100 tracking-tight">
                  Nos Agents IA
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  Des configurations optimisées prêtes à l'emploi s'intégrant directement avec votre CRM .
                </p>
              </div>

              {/* Clean Bento Layout */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-5">
                
                {/* Agent Standardiste Box (6cols) */}
                <div 
                  onClick={() => {
                    setSelectedAgentId('standardiste');
                    setActiveView('playground');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="md:col-span-6 glass-card rounded-2xl p-6.5 flex flex-col justify-between cursor-pointer group transition-all duration-300 hover:border-zinc-750/80"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      {getAgentIcon('standardiste', 'text-indigo-400')}
                      <span className="text-[9px] font-mono font-medium text-indigo-300 bg-indigo-950/40 border border-indigo-900/50 px-2.5 py-0.5 rounded-full uppercase">
                        Secrétariat
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-[17px] text-zinc-100 group-hover:text-indigo-400 transition-colors">
                        {AI_AGENTS[0].name}
                      </h3>
                      <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed">
                        {AI_AGENTS[0].description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-8 pt-3.5 border-t border-zinc-800/60 flex justify-between items-center">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-indigo-400 group-hover:text-indigo-300 transition-colors cursor-pointer"
                    >
                      En savoir plus <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <span className="text-[10px] text-zinc-500 font-mono">Disponibilité : Immédiate</span>
                  </div>
                </div>

                {/* Agent Commercial (6cols) */}
                <div 
                  onClick={() => {
                    setSelectedAgentId('commercial');
                    setActiveView('playground');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="md:col-span-6 glass-card rounded-2xl p-6.5 flex flex-col justify-between cursor-pointer group transition-all duration-300 hover:border-zinc-750/80"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      {getAgentIcon('commercial', 'text-blue-400')}
                      <span className="text-[9px] font-mono font-medium text-blue-300 bg-blue-950/40 border border-blue-900/50 px-2.5 py-0.5 rounded-full uppercase">
                        Lead-Gen
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-[17px] text-zinc-100 group-hover:text-blue-400 transition-colors">
                        {AI_AGENTS[1].name}
                      </h3>
                      <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed">
                        {AI_AGENTS[1].description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-8 pt-3.5 border-t border-zinc-800/60 flex justify-between items-center">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-blue-400 group-hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      En savoir plus <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <span className="text-[10px] text-zinc-500 font-mono">Disponibilité : Immédiate</span>
                  </div>
                </div>

                {/* Agent Automatisation (8cols) */}
                <div 
                  onClick={() => {
                    setSelectedAgentId('automatisation');
                    setActiveView('playground');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="md:col-span-8 glass-card rounded-2xl p-6.5 flex flex-col justify-between cursor-pointer group transition-all duration-300 hover:border-zinc-750/80"
                >
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      {getAgentIcon('automatisation', 'text-emerald-400')}
                      <span className="text-[9px] font-mono font-medium text-emerald-300 bg-emerald-950/40 border border-emerald-900/50 px-2.5 py-0.5 rounded-full uppercase">
                        Workflows
                      </span>
                    </div>
                    <div>
                      <h3 className="font-display font-semibold text-[17px] text-zinc-100 group-hover:text-emerald-400 transition-colors">
                        {AI_AGENTS[2].name}
                      </h3>
                      <p className="text-zinc-400 text-xs mt-1.5 leading-relaxed">
                        {AI_AGENTS[2].description}
                      </p>
                    </div>
                  </div>
                  <div className="mt-8 pt-3.5 border-t border-zinc-800/60 flex justify-between items-center">
                    <button
                      type="button"
                      className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 group-hover:text-emerald-300 transition-colors cursor-pointer"
                    >
                      En savoir plus <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <span className="text-[10px] text-zinc-500 font-mono">Disponibilité : Immédiate</span>
                  </div>
                </div>

                {/* Securité card (4cols) */}
                <div className="md:col-span-4 glass-card rounded-2xl p-6.5 flex flex-col justify-between">
                  <div className="space-y-4">
                    <span className="p-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 inline-block">
                      <Bot className="w-5 h-5" />
                    </span>
                    <div>
                      <h3 className="font-display font-semibold text-[16px] text-zinc-100">Confidentialité Pro</h3>
                      <p className="text-zinc-400 text-xs mt-1 leading-relaxed">
                        Isolation complète des données (RGPD). Aucun modèle public n'est entraîné avec vos données d'entreprise.
                      </p>
                    </div>
                  </div>

                </div>

                {/* Business ROI (12cols) */}
                <div id="calculateur" className="md:col-span-12">
                  <RoiCalculator />
                </div>

              </div>
            </section>
          </>
        )}

        {/* NOTRE PROCESSUS */}
        <section className="space-y-12">
          <div className="max-w-xl mx-auto text-center space-y-2">
            <h2 className="text-2xl md:text-3xl font-display font-medium text-zinc-100 tracking-tight">
              Naissance de votre Agent en 3 Étapes
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1 */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-4 shadow-xs">
              <span className="text-sm font-mono font-semibold text-zinc-500 block border-b border-zinc-800/60 pb-2">
                01. DIAGNOSTIC
              </span>
              <div>
                <h3 className="font-display font-semibold text-sm text-zinc-100">Cartographie Des Flux</h3>
                <p className="text-zinc-400 text-xs leading-relaxed mt-1.5">
                  Analyse  de vos routines et choix des protocoles d'APIs à interconnecter pour maximiser le R.O.I.
                </p>
              </div>
            </div>

            {/* Step 2 */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-4 shadow-xs">
              <span className="text-sm font-mono font-semibold text-zinc-500 block border-b border-zinc-800/60 pb-2">
                02. CRÉATION
              </span>
              <div>
                <h3 className="font-display font-semibold text-sm text-zinc-100">Développement</h3>
                <p className="text-zinc-400 text-xs leading-relaxed mt-1.5">
                  Écriture des scripts d'intégration, calibrage des fiches de connaissances et sandbox fermée .
                </p>
              </div>
            </div>

            {/* Step 3 */}
            <div className="bg-zinc-900/30 border border-zinc-800/80 rounded-2xl p-6 space-y-4 shadow-xs">
              <span className="text-sm font-mono font-semibold text-zinc-500 block border-b border-zinc-800/60 pb-2">
                03. OPERATIONAL
              </span>
              <div>
                <h3 className="font-display font-semibold text-sm text-zinc-100">Déploiement Live</h3>
                <p className="text-zinc-400 text-xs leading-relaxed mt-1.5">
                  Mise en production sécurisée de vos agents avec surveillance et corrections régulières par notre pôle technique.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FREQUENT QUESTIONS */}
        <section id="faq" className="space-y-10">
          <div className="max-w-xl mx-auto text-center space-y-2">
            <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-500 font-semibold block">
              QUESTIONS / RÉPONSES
            </span>
            <h2 className="text-2xl md:text-3xl font-display font-medium text-zinc-100 tracking-tight">
              S'Informer Rapidement
            </h2>
          </div>

          <div className="max-w-2xl mx-auto space-y-3.5">
            {faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={index} className="bg-zinc-900/20 border border-zinc-800/80 rounded-2xl overflow-hidden shadow-xs transition-colors">
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-zinc-900/40 transition"
                  >
                    <span className="font-display font-medium text-xs md:text-sm text-zinc-200">
                      {faq.q}
                    </span>
                    <Plus className={`w-3.5 h-3.5 text-zinc-500 transition-transform duration-250 shrink-0 pointer-events-none ${isOpen ? 'rotate-45 text-white' : ''}`} />
                  </button>

                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.2, ease: 'easeInOut' }}
                      >
                        <div className="px-5 pb-5 pt-0.5 text-xs text-zinc-400 leading-relaxed border-t border-zinc-800/50">
                          {faq.a}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              );
            })}
          </div>
        </section>

        {/* BOTTOM BOOKING CTA */}
        <section className="bg-zinc-900 border border-zinc-800/80 rounded-3xl p-6.5 text-center space-y-4 max-w-3xl mx-auto text-white shadow-2xl flex flex-col items-center">
          <div className="p-2 bg-zinc-800 text-white rounded-xl border border-zinc-700/50 w-fit">
            <Sparkles className="w-4 h-4 text-emerald-450 animate-pulse" />
          </div>
          <h3 className="text-xl md:text-2xl font-display font-semibold text-zinc-105">Prêt à libérer votre capital temps ?</h3>
          <p className="text-zinc-400 text-xs leading-relaxed max-w-lg">
            Réservez un diagnostic immédiat pour valider la compatibilité technique de vos workflows de travail.
          </p>
          <button
            onClick={() => setIsBookingOpen(true)}
            className="px-6 py-3 bg-zinc-100 text-zinc-950 font-semibold rounded-xl text-xs hover:bg-zinc-200 duration-200 cursor-pointer shadow-md select-none mt-2"
          >
            Prendre RDV en direct
          </button>
        </section>

      </main>

      {/* FOOTER SECTION */}
      <footer className="border-t border-zinc-800 bg-[#0d0d0f] py-10 px-4 md:px-8 relative z-10 transition-colors">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-5">
          <div className="flex items-center gap-2">
            <div className="h-6.5 w-6.5 rounded-full bg-zinc-105 border border-zinc-805 text-white flex items-center justify-center font-display font-bold text-xs select-none">
              A
            </div>
            <span className="font-display font-semibold text-xs tracking-tight text-zinc-200">
              Axium <span className="text-zinc-500 font-light">Solutions</span>
            </span>
          </div>

          <p className="text-[10px] text-zinc-500 font-mono text-center md:text-right select-none leading-relaxed">
            © {new Date().getFullYear()} Axium Solutions SA. Tous droits réservés. <br />
            Hébergement souverain • Protection RGPD • Code certifié
          </p>
        </div>
      </footer>

      {/* MODAL */}
      <BookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />

    </div>
  );
}
