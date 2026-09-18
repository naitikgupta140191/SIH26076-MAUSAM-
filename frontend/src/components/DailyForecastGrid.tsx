import React from 'react';
import type { DailyTrendItem } from '../types/weather';
import { Calendar, CloudRain, Sun, CloudSun } from 'lucide-react';

interface DailyForecastGridProps {
  dailyForecast: DailyTrendItem[];
}

export const DailyForecastGrid: React.FC<DailyForecastGridProps> = ({ dailyForecast }) => {
  const getDayName = (dateStr: string, idx: number) => {
    if (idx === 0) return 'Today';
    if (idx === 1) return 'Tomorrow';
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('en-US', { weekday: 'short' });
    } catch {
      return `Day ${idx + 1}`;
    }
  };

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 my-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
          <Calendar className="w-4 h-4 text-amber-500" />
          7-Day Extended Environmental Outlook
        </h3>
        <span className="text-xs text-slate-700 font-mono">High Precision Daily Forecast</span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
        {dailyForecast.map((day, idx) => {
          const dayName = getDayName(day.date, idx);
          const hasRain = day.rain_prob > 30;

          return (
            <div
              key={idx}
              className={`p-4 rounded-xl glass-card border transition-all duration-300 flex flex-col items-center justify-between text-center ${
                idx === 0 ? 'border-amber-500/50 bg-slate-900/90 shadow-md' : 'border-slate-800/80 hover:border-slate-700'
              }`}
            >
              <span className={`text-xs font-bold uppercase tracking-wider ${idx === 0 ? 'text-amber-400' : 'text-slate-700'}`}>
                {dayName}
              </span>

              <div className="my-3 p-2.5 rounded-full bg-slate-800/60 text-amber-300">
                {hasRain ? (
                  <CloudRain className="w-6 h-6 text-amber-400 animate-pulse" />
                ) : day.temp_max > 30 ? (
                  <Sun className="w-6 h-6 text-amber-400" />
                ) : (
                  <CloudSun className="w-6 h-6 text-yellow-300" />
                )}
              </div>

              <div className="space-y-1 w-full">
                <div className="flex items-center justify-center gap-2 text-sm font-extrabold text-slate-900">
                  <span className="text-slate-900">{Math.round(day.temp_max)}°</span>
                  <span className="text-slate-700 text-xs">/</span>
                  <span className="text-slate-700 font-normal text-xs">{Math.round(day.temp_min)}°</span>
                </div>

                <div className="flex items-center justify-center gap-1 text-[11px] text-amber-400 font-medium">
                  <CloudRain className="w-3 h-3" />
                  <span>{day.rain_prob}%</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
