/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { AIAgent } from '../types';

export const AI_AGENTS: AIAgent[] = [
  {
    id: 'standardiste',
    name: "L'Agent Standardiste",
    badge: "Voix & Support client 24/7",
    description: "Gère vos appels entrants, qualifie les requêtes, planifie des rendez-vous et répond aux questions fréquentes de manière fluide et naturelle.",
    accentColor: "indigo",
    gradientFrom: "from-indigo-500/20",
    gradientTo: "to-violet-500/5",
    iconName: "phone",
    benefits: [
      "Secrétariat téléphonique autonome",
      "Prise de RDV synchronisée avec Google Calendar & Outlook",
      "Échelle immédiate : encaisse 100 appels simultanément"
    ],
    metrics: { label: "Taux de décroché instantané", value: "100%" },
    systemPrompt: "Tu es Chloé, l'agent d'accueil virtuel d'Axium Solutions. Tu es chaleureuse, professionnelle, dynamique et rigoureuse.",
    initialMessage: "Bonjour et bienvenue chez Axium Solutions ! Je suis Chloé, votre assistante virtuelle. Comment puis-je vous aider aujourd'hui ? Je peux simuler une prise de contact ou répondre à vos questions."
  },
  {
    id: 'commercial',
    name: "L'Agent Commercial",
    badge: "Génération de leads & Prospection",
    description: "Qualifie vos prospects en temps réel sur votre site, rédige des propositions personnalisées , et relance intelligemment par email.",
    accentColor: "blue",
    gradientFrom: "from-blue-500/20",
    gradientTo: "to-cyan-500/5",
    iconName: "shopping-bag",
    benefits: [
      "Qualification automatique des leads entrants (24h/24)",
      "Rédaction de propositions de devis personnalisées en 3 minutes",
      "Relances multicanaux ultra-personnalisées basées sur le contexte"
    ],
    metrics: { label: "Hausse des rdv qualifiés", value: "+45%" },
    systemPrompt: "Tu es Maxime, le bras droit commercial virtuel d'Axium. Tu vas droit au but, tu es persuasif tout en restant extrêmement courtois et axé sur la valeur financière délivrée.",
    initialMessage: "Bonjour ! Je suis Maxime, expert en croissance commerciale. Dites-moi : quel est votre secteur d'activité principale et combien de prospects traite votre équipe chaque mois ? Je vais estimer votre potentiel d'optimisation."
  },
  {
    id: 'automatisation',
    name: "L'Agent Automatisation",
    badge: "Processus & Intégration ERP/CRM",
    description: "Connecte vos outils quotidiens (Slack, Notion, ERP, CRM) pour orchestrer des workflows sans faille, saisir les données et valider les factures sans erreur.",
    accentColor: "emerald",
    gradientFrom: "from-emerald-500/20",
    gradientTo: "to-teal-500/5",
    iconName: "cpu",
    benefits: [
      "Zéro erreur de saisie manuelle de données",
      "Synchronisation bidirectionnelle instantanée de tous vos logiciels",
      "Génération automatique de rapports et alertes de anomalies"
    ],
    metrics: { label: "Temps administratif économisé", value: "-80%" },
    systemPrompt: "Tu es l'Agent Atlas, l'orchestrateur système d'Axium Solutions. Neutre, extrêmement analytique, structuré et performant.",
    initialMessage: "Système configuré. Je suis Atlas, spécialisé dans l'automatisation de vos flux de travail. Quels logiciels utilisez-vous le plus pour gérer vos opérations (ex: Salesforce, Notion, Excel, HubSpot) ?"
  }
];
