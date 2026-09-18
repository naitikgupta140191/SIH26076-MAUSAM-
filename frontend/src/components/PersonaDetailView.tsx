import React from 'react';
import type { PersonaInsight, DetailedCard } from '../types/weather';
import { CheckCircle2, Activity, Thermometer, Wind, Droplets, Sparkles, Info } from 'lucide-react';

interface PersonaDetailViewProps {
  insight: PersonaInsight;
  currentTemp: number;
  feelsLike: number;
  humidity: number;
  windKph: number;
  uvIndex: number;
}

const colorStyles: Record<DetailedCard['color'], { bg: string; text: string; border: string }> = {
  emerald: { bg: 'bg-emerald-950/40', text: 'text-emerald-400', border: 'border-emerald-800/40' },
  amber: { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-800/40' },
  rose: { bg: 'bg-rose-950/40', text: 'text-rose-400', border: 'border-rose-800/40' },
  sky: { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-800/40' },
  indigo: { bg: 'bg-orange-950/40', text: 'text-orange-400', border: 'border-orange-800/40' },
  cyan: { bg: 'bg-yellow-950/40', text: 'text-yellow-400', border: 'border-yellow-800/40' },
  violet: { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-800/40' },
  teal: { bg: 'bg-orange-950/40', text: 'text-orange-400', border: 'border-orange-800/40' },
  orange: { bg: 'bg-orange-950/40', text: 'text-orange-400', border: 'border-orange-800/40' },
  purple: { bg: 'bg-yellow-950/40', text: 'text-yellow-400', border: 'border-yellow-800/40' },
  lime: { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-800/40' },
  blue: { bg: 'bg-amber-950/40', text: 'text-amber-400', border: 'border-amber-800/40' },
};

export const PersonaDetailView: React.FC<PersonaDetailViewProps> = ({
  insight,
  currentTemp,
  feelsLike,
  humidity,
  windKph,
  uvIndex
}) => {
  const getScoreColor = (score: number) => {
    if (score >= 80) return 'from-emerald-500 to-teal-400 text-emerald-400';
    if (score >= 60) return 'from-amber-500 to-yellow-400 text-amber-400';
    return 'from-rose-500 to-red-400 text-rose-400';
  };

  return (
    <div className="w-full space-y-6">
      {/* Top Banner & Main Score */}
      <div className="glass-card rounded-3xl p-6 lg:p-8 relative overflow-hidden border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-amber-400" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-950 border border-amber-800 text-amber-300">
                {insight.status_badge}
              </span>
              <span className="text-xs text-slate-200 flex items-center gap-1 font-mono">
                <Activity className="w-3.5 h-3.5 text-amber-400" /> Real-time Persona Computation
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight leading-snug">
              {insight.headline}
            </h2>

            <p className="text-sm text-slate-100 leading-relaxed max-w-3xl">
              {insight.summary}
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-4 pt-2 text-xs font-medium text-slate-100">
              <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
                <Thermometer className="w-4 h-4 text-rose-400" />
                <span>{currentTemp.toFixed(1)}°C (Feels {feelsLike.toFixed(1)}°C)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
                <Droplets className="w-4 h-4 text-amber-400" />
                <span>Humidity: {humidity}%</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
                <Wind className="w-4 h-4 text-amber-400" />
                <span>Wind: {windKph.toFixed(1)} km/h</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-900/90 px-3 py-1.5 rounded-lg border border-slate-800">
                <span className="text-amber-400 font-bold">UV</span>
                <span>Index: {uvIndex.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Persona Score Radial Gauge */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-900/80 rounded-2xl border border-slate-800/80 min-w-[160px]">
            <div className="relative flex items-center justify-center">
              <svg className="w-24 h-24 transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="currentColor"
                  strokeWidth="8"
                  className="text-slate-800"
                  fill="transparent"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="url(#scoreGradient)"
                  strokeWidth="8"
                  strokeDasharray={250}
                  strokeDashoffset={250 - (250 * insight.score) / 100}
                  strokeLinecap="round"
                  className="transition-all duration-1000 ease-out"
                  fill="transparent"
                />
                <defs>
                  <linearGradient id="scoreGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute flex flex-col items-center">
                <span className={`text-2xl font-black ${getScoreColor(insight.score)}`}>
                  {insight.score}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-slate-200 font-bold">
                  / 100 Score
                </span>
              </div>
            </div>
            <span className="text-xs font-semibold text-slate-100 mt-2">Suitability Index</span>
          </div>
        </div>
      </div>

      {/* 4 Tailored Detailed Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {insight.detailed_cards.map((card, idx) => {
          const style = colorStyles[card.color] || colorStyles.sky;
          return (
            <div
              key={idx}
              className={`glass-card p-5 rounded-2xl border ${style.border} ${style.bg} hover:border-amber-500/40 transition-all`}
            >
              <div className="text-xs font-bold uppercase tracking-wider text-slate-200 mb-1">
                {card.title}
              </div>
              <div className={`text-2xl font-black ${style.text} my-1.5 tracking-tight`}>
                {card.value}
              </div>
              <div className="text-xs text-slate-200 flex items-center gap-1">
                <Info className="w-3 h-3 text-slate-300" />
                <span>{card.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Smart Recommendations List */}
      <div className="glass-card rounded-2xl p-6 border border-slate-800">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-amber-950 text-amber-400 border border-amber-800">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-base font-bold text-slate-100">
            Smart Actionable Guidance for {insight.persona.toUpperCase()}
          </h3>
        </div>

        <div className="space-y-3">
          {insight.recommendations.map((rec, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-slate-900/60 border border-slate-800/80 hover:bg-slate-900 transition-colors"
            >
              <CheckCircle2 className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <span className="text-sm font-medium text-slate-200 leading-relaxed">
                {rec}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
