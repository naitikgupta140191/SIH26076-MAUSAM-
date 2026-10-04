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
  emerald: { bg: 'bg-emerald-50/90', text: 'text-emerald-700', border: 'border-emerald-200' },
  amber: { bg: 'bg-amber-50/90', text: 'text-amber-700', border: 'border-amber-200' },
  rose: { bg: 'bg-rose-50/90', text: 'text-rose-700', border: 'border-rose-200' },
  sky: { bg: 'bg-amber-50/90', text: 'text-amber-700', border: 'border-amber-200' },
  indigo: { bg: 'bg-orange-50/90', text: 'text-orange-700', border: 'border-orange-200' },
  cyan: { bg: 'bg-yellow-50/90', text: 'text-yellow-700', border: 'border-yellow-200' },
  violet: { bg: 'bg-amber-50/90', text: 'text-amber-700', border: 'border-amber-200' },
  teal: { bg: 'bg-orange-50/90', text: 'text-orange-700', border: 'border-orange-200' },
  orange: { bg: 'bg-orange-50/90', text: 'text-orange-700', border: 'border-orange-200' },
  purple: { bg: 'bg-yellow-50/90', text: 'text-yellow-700', border: 'border-yellow-200' },
  lime: { bg: 'bg-amber-50/90', text: 'text-amber-700', border: 'border-amber-200' },
  blue: { bg: 'bg-amber-50/90', text: 'text-amber-700', border: 'border-amber-200' },
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
      <div className="glass-card bg-white/90 rounded-3xl p-6 lg:p-8 relative overflow-hidden border border-amber-200/80 shadow-xl">
        <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
          <Sparkles className="w-48 h-48 text-amber-500" />
        </div>

        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-3 flex-1">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-amber-900 border border-amber-700 text-amber-200 shadow-xs">
                {insight.status_badge}
              </span>
              <span className="text-xs text-amber-950 font-mono font-bold flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-amber-600" /> Real-time Persona Computation
              </span>
            </div>

            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 tracking-tight leading-snug">
              {insight.headline}
            </h2>

            <p className="text-sm font-semibold text-slate-700 leading-relaxed max-w-3xl">
              {insight.summary}
            </p>

            {/* Quick Metrics Bar */}
            <div className="flex flex-wrap items-center gap-3 pt-2 text-xs font-semibold text-slate-800">
              <div className="flex items-center gap-1.5 bg-amber-50/90 px-3 py-1.5 rounded-lg border border-amber-200 shadow-xs">
                <Thermometer className="w-4 h-4 text-rose-500" />
                <span>{currentTemp.toFixed(1)}°C (Feels {feelsLike.toFixed(1)}°C)</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50/90 px-3 py-1.5 rounded-lg border border-amber-200 shadow-xs">
                <Droplets className="w-4 h-4 text-amber-600" />
                <span>Humidity: {humidity}%</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50/90 px-3 py-1.5 rounded-lg border border-amber-200 shadow-xs">
                <Wind className="w-4 h-4 text-amber-600" />
                <span>Wind: {windKph.toFixed(1)} km/h</span>
              </div>
              <div className="flex items-center gap-1.5 bg-amber-50/90 px-3 py-1.5 rounded-lg border border-amber-200 shadow-xs">
                <span className="text-amber-600 font-bold">UV</span>
                <span>Index: {uvIndex.toFixed(1)}</span>
              </div>
            </div>
          </div>

          {/* Persona Score Radial Gauge */}
          <div className="flex flex-col items-center justify-center p-4 bg-slate-900 rounded-2xl border border-slate-800 min-w-[160px] shadow-xl">
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
                <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">
                  / 100 SCORE
                </span>
              </div>
            </div>
            <span className="text-xs font-extrabold text-white mt-2 tracking-wide">Suitability Index</span>
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
              className={`glass-card p-5 rounded-2xl border ${style.border} ${style.bg} hover:border-amber-400 transition-all shadow-xs`}
            >
              <div className="text-xs font-extrabold uppercase tracking-wider text-slate-700 mb-1">
                {card.title}
              </div>
              <div className={`text-2xl font-black ${style.text} my-1.5 tracking-tight`}>
                {card.value}
              </div>
              <div className="text-xs text-slate-600 flex items-center gap-1 font-medium">
                <Info className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                <span>{card.subtitle}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Smart Recommendations List */}
      <div className="glass-card bg-white/90 rounded-2xl p-6 border border-amber-200/80 shadow-xs">
        <div className="flex items-center gap-2 mb-4">
          <div className="p-1.5 rounded-lg bg-amber-500 text-white shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
          <h3 className="text-base font-extrabold text-slate-900 tracking-tight">
            Smart Actionable Guidance for {insight.persona.toUpperCase()}
          </h3>
        </div>

        <div className="space-y-3">
          {insight.recommendations.map((rec, i) => (
            <div
              key={i}
              className="flex items-start gap-3 p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 hover:bg-amber-100/60 transition-colors"
            >
              <CheckCircle2 className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
              <span className="text-sm font-semibold text-slate-800 leading-relaxed">
                {rec}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
