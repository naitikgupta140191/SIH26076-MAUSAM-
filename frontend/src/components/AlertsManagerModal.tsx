import React, { useState } from 'react';
import type { CustomAlert, PersonaType } from '../types/weather';
import { X, Bell, Plus, Trash2, ShieldAlert } from 'lucide-react';

interface AlertsManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  alerts: CustomAlert[];
  currentCity: string;
  lat: number;
  lon: number;
  onAddAlert: (alert: CustomAlert) => void;
  onDeleteAlert: (id: number) => void;
}

export const AlertsManagerModal: React.FC<AlertsManagerModalProps> = ({
  isOpen,
  onClose,
  alerts,
  currentCity,
  lat,
  lon,
  onAddAlert,
  onDeleteAlert
}) => {
  const [persona, setPersona] = useState<PersonaType>('health');
  const [metric, setMetric] = useState('AQI');
  const [threshold, setThreshold] = useState(150);
  const [condition, setCondition] = useState<'gt' | 'lt'>('gt');
  const [customMsg, setCustomMsg] = useState('');

  if (!isOpen) return null;

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    const newAlert: CustomAlert = {
      location_name: currentCity,
      latitude: lat,
      longitude: lon,
      persona,
      metric,
      threshold_value: Number(threshold),
      condition,
      alert_message: customMsg || `Notify if ${metric} is ${condition === 'gt' ? 'greater than' : 'less than'} ${threshold}`,
      is_active: true
    };
    onAddAlert(newAlert);
    setCustomMsg('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-card w-full max-w-xl rounded-3xl p-6 border border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-amber-400" />
            <h3 className="text-lg font-bold text-white">Custom Threshold Alerts</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Existing Alerts */}
        <div className="space-y-3 mb-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">Active Alert Rules</h4>
          {alerts.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400 bg-slate-900/60 rounded-xl border border-slate-800">
              No custom threshold alerts created yet.
            </div>
          ) : (
            alerts.map((al, idx) => (
              <div
                key={al.id || idx}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-amber-950 text-amber-400 border border-amber-800">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-200">{al.alert_message}</div>
                    <div className="text-xs text-slate-400">
                      {al.location_name} • {al.persona.toUpperCase()} ({al.metric} {al.condition === 'gt' ? '>' : '<'} {al.threshold_value})
                    </div>
                  </div>
                </div>

                {al.id && (
                  <button
                    onClick={() => onDeleteAlert(al.id!)}
                    className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))
          )}
        </div>

        {/* Create New Alert Form */}
        <form onSubmit={handleCreate} className="glass-card p-4 rounded-2xl border border-slate-800 space-y-4">
          <h4 className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
            <Plus className="w-3.5 h-3.5" /> Create New Threshold Warning for {currentCity}
          </h4>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-slate-400 font-medium">Persona Category</label>
              <select
                value={persona}
                onChange={(e) => setPersona(e.target.value as PersonaType)}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="health">Health & AQI</option>
                <option value="fitness">Fitness & Running</option>
                <option value="beach">Beach & Surf</option>
                <option value="traveler">Traveler & Flights</option>
                <option value="family">School Commute</option>
                <option value="agriculture">Agriculture & Garden</option>
                <option value="commuter">Commuter & Traffic</option>
                <option value="event">Event Planner</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Environmental Metric</label>
              <select
                value={metric}
                onChange={(e) => setMetric(e.target.value)}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="AQI">US AQI Index</option>
                <option value="PM2.5">PM2.5 Dust (µg/m³)</option>
                <option value="Rain Probability">Rain Probability (%)</option>
                <option value="Wind Gust">Wind Speed (km/h)</option>
                <option value="Wave Height">Wave Height (m)</option>
                <option value="UV Index">UV Index</option>
                <option value="Soil Moisture">Soil Moisture (m³/m³)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Condition</label>
              <select
                value={condition}
                onChange={(e) => setCondition(e.target.value as 'gt' | 'lt')}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              >
                <option value="gt">Greater Than (&gt;)</option>
                <option value="lt">Less Than (&lt;)</option>
              </select>
            </div>

            <div>
              <label className="text-xs text-slate-400 font-medium">Threshold Value</label>
              <input
                type="number"
                step="any"
                value={threshold}
                onChange={(e) => setThreshold(Number(e.target.value))}
                className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium">Custom Alert Note</label>
            <input
              type="text"
              placeholder="e.g. Wear N95 Mask if AQI > 150"
              value={customMsg}
              onChange={(e) => setCustomMsg(e.target.value)}
              className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs shadow-md transition-all"
          >
            Add Alert Rule
          </button>
        </form>
      </div>
    </div>
  );
};
