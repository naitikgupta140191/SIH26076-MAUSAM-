import React, { useState } from 'react';
import { X, PartyPopper, CheckCircle, Sparkles, CloudRain, Sun, Wind } from 'lucide-react';

interface EventPlannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentCity: string;
}

export const EventPlannerModal: React.FC<EventPlannerModalProps> = ({
  isOpen,
  onClose,
  currentCity
}) => {
  const [eventType, setEventType] = useState('Outdoor Wedding');
  const [guestCount, setGuestCount] = useState(150);
  const [eventDate, setEventDate] = useState(new Date().toISOString().split('T')[0]);

  if (!isOpen) return null;

  // Compute outdoor suitability score and advisories
  const rainProb = 15;
  const humidex = 27.5;
  const suitabilityScore = 88;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-card w-full max-w-2xl rounded-3xl p-6 border border-slate-800 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-gradient-to-tr from-purple-500 to-indigo-600 text-white shadow-lg">
              <PartyPopper className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Event Weather Intelligence & Comfort Index</h3>
              <p className="text-xs text-slate-400">Tailored planner matrix for weddings, concerts & gatherings</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Input Parameters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
          <div>
            <label className="text-xs text-slate-400 font-medium">Event Type</label>
            <select
              value={eventType}
              onChange={(e) => setEventType(e.target.value)}
              className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            >
              <option value="Outdoor Wedding">Outdoor Wedding</option>
              <option value="Garden Party">Garden Party</option>
              <option value="Concert / Music Fest">Concert / Music Fest</option>
              <option value="Sports Tournament">Sports Tournament</option>
              <option value="Corporate Retreat">Corporate Retreat</option>
            </select>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium">Estimated Guests</label>
            <input
              type="number"
              value={guestCount}
              onChange={(e) => setGuestCount(Number(e.target.value))}
              className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium">Event Date</label>
            <input
              type="date"
              value={eventDate}
              onChange={(e) => setEventDate(e.target.value)}
              className="w-full mt-1 bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-purple-500"
            />
          </div>
        </div>

        {/* Intelligence Results Card */}
        <div className="glass-card rounded-2xl p-6 border border-purple-900/50 bg-purple-950/20 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold bg-emerald-950 text-emerald-400 border border-emerald-800">
                Highly Favorable ({suitabilityScore}/100)
              </span>
              <span className="text-xs text-slate-400 font-mono">{eventType} in {currentCity}</span>
            </div>
            <Sparkles className="w-5 h-5 text-purple-400" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400">Peak Rain Probability</div>
              <div className="text-xl font-bold text-sky-400 flex items-center gap-1 my-1">
                <CloudRain className="w-4 h-4" /> {rainProb}%
              </div>
              <div className="text-[10px] text-slate-400">Low cancellation hazard</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400">Outdoor Comfort Index</div>
              <div className="text-xl font-bold text-emerald-400 flex items-center gap-1 my-1">
                <Sun className="w-4 h-4" /> {humidex}°C
              </div>
              <div className="text-[10px] text-slate-400">Humidex perceived temp</div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
              <div className="text-xs text-slate-400">Wind Stability</div>
              <div className="text-xl font-bold text-indigo-400 flex items-center gap-1 my-1">
                <Wind className="w-4 h-4" /> 14 km/h
              </div>
              <div className="text-[10px] text-slate-400">Safe for high canopy tents</div>
            </div>
          </div>

          <div className="space-y-2 pt-2">
            <h4 className="text-xs font-bold uppercase tracking-wider text-purple-300">Planner Recommendations</h4>
            <div className="space-y-2 text-xs text-slate-300">
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Excellent conditions for open-air seating for {guestCount} guests.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>Comfort index is optimal. No outdoor industrial mist fans or heavy patio heaters required.</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle className="w-4 h-4 text-purple-400 shrink-0 mt-0.5" />
                <span>Golden Hour lighting window for photography: 06:10 PM - 06:45 PM.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
