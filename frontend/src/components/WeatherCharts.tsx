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
    <div className="glass-card bg-white/90 rounded-2xl p-6 border border-amber-200/80 my-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h3 className="text-base font-extrabold text-slate-900 flex items-center gap-2 tracking-tight">
            <Activity className="w-4 h-4 text-amber-500" />
            24-Hour Environmental Dynamics Chart
          </h3>
          <p className="text-xs font-semibold text-slate-600">Interactive hourly forecast trends</p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-1.5 bg-amber-50/80 p-1 rounded-xl border border-amber-200">
          <button
            onClick={() => setActiveTab('temp')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'temp' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Thermometer className="w-3.5 h-3.5" /> Temp (°C)
          </button>
          <button
            onClick={() => setActiveTab('rain')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'rain' ? 'bg-orange-500 text-white shadow-xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <CloudRain className="w-3.5 h-3.5" /> Rain (%)
          </button>
          <button
            onClick={() => setActiveTab('uv')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'uv' ? 'bg-amber-500 text-slate-950 shadow-xs' : 'text-slate-700 hover:text-slate-900'
            }`}
          >
            <Sun className="w-3.5 h-3.5" /> UV Index
          </button>
          <button
            onClick={() => setActiveTab('aqi')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              activeTab === 'aqi' ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-slate-700 hover:text-slate-900'
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
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 11, fontWeight: 'bold' }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11, fontWeight: 'bold' }} domain={['dataMin - 2', 'dataMax + 2']} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#fcd34d', borderRadius: '12px', color: '#0f172a', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                labelStyle={{ color: '#d97706', fontWeight: 'bold' }}
              />
              <Area type="monotone" dataKey="temp" name="Temperature (°C)" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#tempGradient)" />
            </AreaChart>
          ) : activeTab === 'rain' ? (
            <BarChart data={hourlyForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 11, fontWeight: 'bold' }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11, fontWeight: 'bold' }} domain={[0, 100]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#fcd34d', borderRadius: '12px', color: '#0f172a', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
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
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 11, fontWeight: 'bold' }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11, fontWeight: 'bold' }} domain={[0, 12]} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#fcd34d', borderRadius: '12px', color: '#0f172a', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Area type="monotone" dataKey="uv" name="UV Index" stroke="#f59e0b" strokeWidth={3} fillOpacity={1} fill="url(#uvGradient)" />
            </AreaChart>
          ) : (
            <BarChart data={hourlyForecast} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="time" stroke="#475569" tick={{ fontSize: 11, fontWeight: 'bold' }} />
              <YAxis stroke="#475569" tick={{ fontSize: 11, fontWeight: 'bold' }} />
              <Tooltip
                contentStyle={{ backgroundColor: '#ffffff', borderColor: '#fcd34d', borderRadius: '12px', color: '#0f172a', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
              />
              <Bar dataKey="aqi" name="US AQI Index" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          )}
        </ResponsiveContainer>
      </div>
    </div>
  );
};
