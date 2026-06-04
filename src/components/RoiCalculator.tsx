/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { Calculator, Sparkles, TrendingUp } from 'lucide-react';

export default function RoiCalculator() {
  const [teamSize, setTeamSize] = useState<number>(5);
  const [hoursLost, setHoursLost] = useState<number>(8);
  const [hourlyRate, setHourlyRate] = useState<number>(45);

  // Calcs
  const totalHoursLostPerMonth = Math.round(teamSize * hoursLost * 4.333);
  const monthlyCost = totalHoursLostPerMonth * hourlyRate;
  
  const hoursSavedPerMonth = Math.round(totalHoursLostPerMonth * 0.80);
  const moneySavedPerMonth = hoursSavedPerMonth * hourlyRate;
  const annualSavings = moneySavedPerMonth * 12;

  return (
    <div className="glass-card rounded-2xl p-6 md:p-8 flex flex-col justify-between h-full relative overflow-hidden group">
      <div>
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-100">
              <Calculator className="w-4 h-4 text-zinc-300" />
            </div>
            <div>
              <h3 className="font-display font-medium text-sm text-zinc-100">Estimer votre R.O.I.</h3>
              <p className="text-[11px] text-zinc-400">Combien de temps pouvez-vous libérer ?</p>
            </div>
          </div>
        </div>

        {/* Sliders */}
        <div className="space-y-5">
          {/* Slider 1 */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="team-size" className="text-zinc-350 font-medium">Taille de l'équipe</label>
              <span className="font-mono text-zinc-100 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-[11px]">
                {teamSize} collaborateur{teamSize > 1 ? 's' : ''}
              </span>
            </div>
            <input
              id="team-size"
              type="range"
              min="1"
              max="50"
              value={teamSize}
              onChange={(e) => setTeamSize(Number(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-305 focus:outline-none"
            />
          </div>

          {/* Slider 2 */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="hours-lost" className="text-zinc-350 font-medium">Tâches répétitives / pers / semaine</label>
              <span className="font-mono text-zinc-100 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-[11px]">
                {hoursLost}h / semaine
              </span>
            </div>
            <input
              id="hours-lost"
              type="range"
              min="2"
              max="24"
              value={hoursLost}
              onChange={(e) => setHoursLost(Number(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-305 focus:outline-none"
            />
          </div>

          {/* Slider 3 */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center text-xs">
              <label htmlFor="hourly-rate" className="text-zinc-350 font-medium">Taux horaire moyen (€/h)</label>
              <span className="font-mono text-zinc-100 bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-[11px]">
                {hourlyRate} € / heure
              </span>
            </div>
            <input
              id="hourly-rate"
              type="range"
              min="15"
              max="150"
              step="5"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              className="w-full h-1 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-zinc-305 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="mt-6 pt-5 border-t border-zinc-800/60 space-y-3.5">
        <div className="grid grid-cols-2 gap-3.5">
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-3">
            <p className="text-[9px] text-zinc-450 uppercase tracking-wider font-mono">Temps Perdu</p>
            <p className="text-lg font-display font-semibold text-zinc-100 mt-0.5">
              {totalHoursLostPerMonth}h <span className="text-[10px] text-zinc-550 font-normal">/mois</span>
            </p>
          </div>
          <div className="bg-zinc-900/30 border border-zinc-800/50 rounded-xl p-3">
            <p className="text-[9px] text-zinc-455 uppercase tracking-wider font-mono">Coût Financier</p>
            <p className="text-lg font-display font-semibold text-zinc-100 mt-0.5">
              {monthlyCost.toLocaleString('fr-FR')} € <span className="text-[10px] text-zinc-555 font-normal">/mois</span>
            </p>
          </div>
        </div>

        {/* Saved money highlighted */}
        <div className="bg-[#18181c] border border-zinc-800/80 text-white rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-[9px] text-zinc-400 uppercase tracking-wider font-mono flex items-center gap-1 font-semibold">
              <TrendingUp className="w-3 h-3 text-emerald-400" /> ÉCONOMIE FINANCIÈRE PROJETÉE
            </span>
            <div className="text-xl md:text-2xl font-display font-bold mt-1 text-white select-none">
              +{annualSavings.toLocaleString('fr-FR')} € <span className="text-[10px] text-zinc-500 font-normal">/an</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-zinc-400">Temps libéré</p>
            <p className="text-sm font-semibold font-mono text-zinc-100 mt-0.5">
              +{hoursSavedPerMonth}h <span className="text-[10px] font-normal text-zinc-500">/mois</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
