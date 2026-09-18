import React, { useState } from 'react';
import { ResponsiveContainer, AreaChart, Area, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import type { HourlyTrendItem } from '../types/weather';
import { Thermometer, CloudRain, Sun, Activity } from 'lucide-react';

interface WeatherChartsProps {
  hourlyForecast: HourlyTrendItem[];
}

export const WeatherCharts: React.FC<WeatherChartsProps> = ({ hourlyForecast }) => {
  const [activeTab, setActiveTab] = useState<'temp' | 'rain' | 'uv' | 'aqi'>('temp');

  return (
    <div className="glass-card rounded-2xl p-6 border border-slate-800 my-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Activity className="w-4 h-4 text-amber-500" />
            24-Hour Environmental Dynamics Chart
          </h3>
          <p className="text-xs text-slate-700">Interactive hourly forecast trends</p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-white/70 p-1 rounded-xl border border-slate-200">
          <button
            onClick={() => setActiveTab('temp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'temp' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" /> Temp (°C)
          </button>
          <button
            onClick={() => setActiveTab('rain')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'rain' ? 'bg-orange-500 text-white shadow-md' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" /> Rain (%)
          </button>
          <button
            onClick={() => setActiveTab('uv')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'uv' ? 'bg-amber-500 text-slate-950 shadow-md' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5" /> UV Index
          </button>
          <button
            onClick={() => setActiveTab('aqi')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'aqi' ? 'bg-emerald-500 text-slate-950 shadow-md' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Activity className="w-3.5 h-3.5" /> AQI
          </button>
        </div>
      </div>

      <div className="h-64 w-full">
        <ResponsiveContainer width="100%" height="100%">
          {activeTab === 'temp' ? (
            <AreaChart data={hourlyForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
                labelStyle={{ color: '#38bdf8', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#tempGradient)" />
            </AreaChart>
          ) : activeTab === 'rain' ? (
            <BarChart data={hourlyForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
              />
              <Bar dataKey="rain_prob" name="Rain Prob (%)" fill="#f59e0b" radius={[4, 4, 0, 0]} />
            </BarChart>
          ) : activeTab === 'uv' ? (
            <AreaChart data={hourlyForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="uvGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} domain={[0, 12]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
              />
              <Area type="monotone" dataKey="uv" name="UV Index" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#uvGradient)" />
            </AreaChart>
          ) : (
            <BarChart data={hourlyForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="time" stroke="#64748b" tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#f8fafc' }}
              />
              <Bar dataKey="aqi" name="US AQI Index" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
