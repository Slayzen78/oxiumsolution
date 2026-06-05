/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface ChatMessage {
  id: string;
  sender: 'user' | 'agent' | 'system';
  content: string;
  timestamp: string;
}

export interface AIAgent {
  id: string;
  name: string;
  badge: string;
  description: string;
  accentColor: string;
  gradientFrom: string;
  gradientTo: string;
  iconName: 'phone' | 'shopping-bag' | 'cpu' | 'bot' | 'zap';
  benefits: string[];
  metrics: { label: string; value: string };
  systemPrompt: string;
  initialMessage: string;
}

export interface BookingDetails {
  className?: string;
  name: string;
  email: string;
  company: string;
  agentInterest: string;
  date: string;
  timeSlot: string;
  customMessage?: string;
}
