/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calendar as CalendarIcon, Clock, Sparkles, Building, Mail, User, Info, CheckCircle2 } from 'lucide-react';
import { BookingDetails } from '../types';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AVAILABLE_DAYS = [
  { weekday: "Mercredi", date: "3 Juin", label: "03/06" },
  { weekday: "Jeudi", date: "4 Juin", label: "04/06" },
  { weekday: "Vendredi", date: "5 Juin", label: "05/06" },
  { weekday: "Lunes", date: "8 Juin", label: "08/06" },
  { weekday: "Mardi", date: "9 Juin", label: "09/06" }
];

const TIME_SLOTS = [
  "09:30", "11:00", "14:00", "15:30", "17:00"
];

export default function BookingModal({ isOpen, onClose }: BookingModalProps) {
  const [step, setStep] = useState<1 | 2>(1);
  const [selectedDay, setSelectedDay] = useState<string>("3 Juin");
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string>("11:00");
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    agentInterest: 'standardiste',
    customMessage: ''
  });

  const [bookingConfirmed, setBookingConfirmed] = useState<boolean>(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setBookingConfirmed(true);
    setStep(2);
    
    const bookingResult: BookingDetails = {
      name: formData.name,
      email: formData.email,
      company: formData.company,
      agentInterest: formData.agentInterest,
      date: selectedDay,
      timeSlot: selectedTimeSlot,
      customMessage: formData.customMessage
    };
    
    localStorage.setItem('axium_last_booking', JSON.stringify(bookingResult));
  };

  const getAgentLabel = (id: string) => {
    switch(id) {
      case 'standardiste': return "L'Agent Standardiste (Voix & Accueil)";
      case 'commercial': return "L'Agent Commercial (Growth & Devis)";
      case 'automatisation': return "L'Agent Automatisation (Opérations)";
      default: return "Diagnostic global";
    }
  };

  const handleResetAndClose = () => {
    setBookingConfirmed(false);
    setStep(1);
    setFormData({
      name: '',
      email: '',
      company: '',
      agentInterest: 'standardiste',
      customMessage: ''
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop overlay */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleResetAndClose}
          className="fixed inset-0 bg-black/60 backdrop-blur-md"
        />

        {/* Modal content */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ type: 'spring', damping: 25, stiffness: 220 }}
          className="relative w-full max-w-lg overflow-hidden rounded-2xl border border-zinc-800 bg-[#121214] p-6 md:p-8 text-zinc-100 z-10 shadow-2xl"
        >
          {/* Close */}
          <button
            onClick={handleResetAndClose}
            className="absolute top-4 right-4 p-1.5 rounded-lg text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>

          {!bookingConfirmed ? (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Header */}
              <div>
                <span className="text-[10px] uppercase font-mono tracking-widest text-zinc-300 bg-zinc-900 px-2.5 py-0.5 border border-zinc-800 rounded-full inline-block mb-1.5 font-medium">
                  DIAGNOSTIC CRÉATIF OFFERT
                </span>
                <h2 className="text-xl font-display font-semibold text-white tracking-tight">
                  Réserver votre échange IA
                </h2>
                <p className="text-xs text-zinc-400 mt-1">
                  15 minutes gratuites avec un ingénieur d'Axium Solutions pour cadrer l'automatisation de vos flux.
                </p>
              </div>

              {/* Date */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <CalendarIcon className="w-3.5 h-3.5 text-zinc-300" /> 1. Choisir la date :
                </label>
                <div className="grid grid-cols-5 gap-1.5">
                  {AVAILABLE_DAYS.map((day) => (
                    <button
                      key={day.date}
                      type="button"
                      onClick={() => setSelectedDay(day.date)}
                      className={`py-1.5 rounded-xl border flex flex-col justify-center items-center text-center transition cursor-pointer select-none ${
                        selectedDay === day.date
                          ? 'border-zinc-100 bg-zinc-100 text-zinc-950 font-semibold'
                          : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      <span className="text-[9px] font-mono uppercase">{day.weekday.substring(0,3)}</span>
                      <span className="text-xs font-display font-semibold mt-0.5">{day.date.split(" ")[0]}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Workday hours */}
              <div className="space-y-2">
                <label className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-zinc-300" /> 2. Horaire disponible :
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {TIME_SLOTS.map((slot) => (
                    <button
                      key={slot}
                      type="button"
                      onClick={() => setSelectedTimeSlot(slot)}
                      className={`px-3 py-1 rounded-xl border text-xs font-mono transition cursor-pointer select-none ${
                        selectedTimeSlot === slot
                          ? 'border-zinc-105 bg-zinc-105 text-zinc-950 font-semibold'
                          : 'border-zinc-800 bg-zinc-900/40 text-zinc-400 hover:bg-zinc-800 hover:text-white'
                      }`}
                    >
                      {slot}
                    </button>
                  ))}
                </div>
              </div>

              {/* Forms inputs */}
              <div className="space-y-2.5 pt-2 border-t border-zinc-800/80">
                <label className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-zinc-300" /> 3. Vos Détails Professionnels :
                </label>
                
                <div className="grid grid-cols-2 gap-2.5">
                  {/* Name */}
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                      <User className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      placeholder="Votre nom"
                      className="w-full bg-zinc-900 text-xs text-zinc-100 border border-zinc-800 px-3 py-2 pl-9 rounded-xl focus:border-zinc-700 focus:outline-none transition"
                    />
                  </div>

                  {/* Company */}
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                      <Building className="w-3.5 h-3.5" />
                    </span>
                    <input
                      type="text"
                      required
                      value={formData.company}
                      onChange={(e) => setFormData({...formData, company: e.target.value})}
                      placeholder="Entreprise"
                      className="w-full bg-zinc-900 text-xs text-zinc-100 border border-zinc-800 px-3 py-2 pl-9 rounded-xl focus:border-zinc-700 focus:outline-none transition"
                    />
                  </div>
                </div>

                {/* Email address */}
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-500">
                    <Mail className="w-3.5 h-3.5" />
                  </span>
                  <input
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    placeholder="Adresse e-mail professionnelle"
                    className="w-full bg-zinc-900 text-xs text-zinc-100 border border-zinc-800 px-3 py-2 pl-9 rounded-xl focus:border-zinc-700 focus:outline-none transition"
                  />
                </div>

                {/* Target Agent choice list */}
                <select
                  value={formData.agentInterest}
                  onChange={(e) => setFormData({...formData, agentInterest: e.target.value})}
                  className="w-full bg-zinc-900 text-xs text-zinc-200 border border-zinc-800 px-3 py-2 rounded-xl focus:border-zinc-750 focus:outline-none transition"
                >
                  <option value="standardiste" className="bg-[#121214] text-zinc-100">Besoin : Automatisation Standard Téléphonique</option>
                  <option value="commercial" className="bg-[#121214] text-zinc-100">Besoin : Relances & Secrétariat Commercial</option>
                  <option value="automatisation" className="bg-[#121214] text-zinc-100">Besoin : Intégrations Applications & ERP</option>
                  <option value="autre" className="bg-[#121214] text-zinc-100">Plusieurs agents / Curation projet globale</option>
                </select>
              </div>

              {/* Validation */}
              <button
                type="submit"
                className="w-full bg-zinc-100 text-zinc-950 hover:bg-zinc-200 transition font-medium text-xs py-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer font-sans shadow-md"
              >
                <Sparkles className="w-3.5 h-3.5 text-emerald-600 animate-pulse" /> Réserver mon Créneau Offert
              </button>

              <div className="flex items-center gap-1.5 justify-center text-[10px] text-zinc-400 bg-zinc-905 p-2 border border-zinc-800/60 rounded-lg select-none">
                <Info className="w-3.5 h-3.5 text-zinc-550 shrink-0" />
                <span>Aucune donnée n'est cédée à des tiers (RGPD validé).</span>
              </div>
            </form>
          ) : (
            <div className="text-center space-y-5 py-4 font-sans text-zinc-105">
              <div className="flex justify-center">
                <div className="p-3.5 rounded-full bg-emerald-950/20 border border-emerald-900/50">
                  <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                </div>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-xl font-display font-semibold text-white">Demande d'Audit Validée</h3>
                <p className="text-xs text-zinc-400">
                  Rendez-vous est pris avec un ingénieur pour le :
                </p>
                <div className="inline-block px-3 py-1.5 bg-zinc-900 border border-zinc-800 rounded-xl font-mono text-xs text-zinc-100 font-semibold mt-1">
                  {selectedDay} à {selectedTimeSlot} (Heure locale)
                </div>
              </div>

              <div className="border-t border-zinc-800 pt-5 space-y-2.5 max-w-sm mx-auto text-left text-xs text-zinc-300">
                <p className="flex gap-2">
                  <span className="text-emerald-400">✓</span> <span>Un carton d'invitation avec salon de visio a été transmis à <span className="text-white font-mono font-medium">{formData.email}</span>.</span>
                </p>
                <p className="flex gap-2">
                  <span className="text-emerald-400">✓</span> <span>Nous ferons une pré-étude de l'activité de <span className="text-white font-sans font-medium">{formData.company}</span>.</span>
                </p>
                <p className="flex gap-2">
                  <span className="text-emerald-400">✓</span> <span>Thème : <span className="text-white font-sans font-medium">{getAgentLabel(formData.agentInterest)}</span>.</span>
                </p>
              </div>

              <button
                type="button"
                onClick={handleResetAndClose}
                className="w-full bg-zinc-900 hover:bg-zinc-800 border border-zinc-800 text-zinc-300 hover:text-white transition py-2.5 rounded-xl text-xs font-medium cursor-pointer"
              >
                Fermer
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
