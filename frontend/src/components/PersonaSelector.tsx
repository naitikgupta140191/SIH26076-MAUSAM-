import React from 'react';
import type { PersonaType } from '../types/weather';
import { HeartPulse, Dumbbell, Waves, Plane, Baby, Sprout, Car, PartyPopper, Check } from 'lucide-react';

interface PersonaSelectorProps {
  activePersona: PersonaType;
  selectedPersonas?: PersonaType[];
  onSelectPersona: (persona: PersonaType) => void;
}

const PERSONAS: { id: PersonaType; name: string; tag: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { id: 'health', name: 'Health & AQI', tag: 'Allergies, UV & Asthma', icon: HeartPulse, color: 'from-emerald-500 to-teal-600' },
  { id: 'fitness', name: 'Fitness & Run', tag: 'Best Running Hours', icon: Dumbbell, color: 'from-amber-500 to-orange-600' },
  { id: 'beach', name: 'Surf & Beach', tag: 'Waves, Swell & Tides', icon: Waves, color: 'from-amber-500 to-orange-600' },
  { id: 'traveler', name: 'Traveler Brief', tag: 'Flight Alerts & Packing', icon: Plane, color: 'from-yellow-500 to-orange-600' },
  { id: 'family', name: 'School Commute', tag: 'Parents & Rain Warning', icon: Baby, color: 'from-pink-500 to-rose-600' },
  { id: 'agriculture', name: 'Agri & Soil', tag: 'Soil Moisture & Frost', icon: Sprout, color: 'from-lime-500 to-emerald-600' },
  { id: 'commuter', name: 'Traffic & Vis', tag: 'Fog & Highway Hazards', icon: Car, color: 'from-amber-500 to-orange-600' },
  { id: 'event', name: 'Event Planner', tag: 'Extended Comfort Index', icon: PartyPopper, color: 'from-yellow-500 to-orange-600' }
];

export const PersonaSelector: React.FC<PersonaSelectorProps> = ({ activePersona, selectedPersonas = [], onSelectPersona }) => {
  return (
    <div className="w-full my-6">
      <div className="flex items-center justify-between mb-3 px-1">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-amber-700">Select Intelligence Mode</span>
          {selectedPersonas.length > 0 && (
            <span className="text-[10px] bg-amber-100 border border-amber-200 text-amber-700 px-2 py-0.5 rounded-full font-mono">
              {selectedPersonas.length} Domain{selectedPersonas.length > 1 ? 's' : ''} Active
            </span>
          )}
        </div>
        <span className="text-xs text-slate-700 hidden sm:inline">Click any domain view to switch recomputed environmental algorithms</span>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2.5">
        {PERSONAS.map((p) => {
          const Icon = p.icon;
          const isActive = activePersona === p.id;
          const isUserDomain = selectedPersonas.includes(p.id);
          return (
            <button
              key={p.id}
              onClick={() => onSelectPersona(p.id)}
              className={`relative flex flex-col items-center justify-center p-3 rounded-2xl transition-all duration-300 text-center glass-card ${
                isActive
                  ? `ring-2 ring-amber-400 bg-white shadow-lg shadow-amber-200/70 scale-[1.03]`
                  : isUserDomain
                  ? `border border-amber-200 bg-amber-50/70 hover:bg-white opacity-95`
                  : `hover:bg-white/80 opacity-75 hover:opacity-100 hover:scale-[1.01]`
              }`}
            >
              {isActive && (
                <div className={`absolute top-0 inset-x-0 h-1 rounded-t-2xl bg-gradient-to-r ${p.color}`} />
              )}
              {isUserDomain && !isActive && (
                <div className="absolute top-1.5 right-1.5 p-0.5 rounded-full bg-amber-100 border border-amber-200 text-amber-700">
                  <Check className="w-2.5 h-2.5" />
                </div>
              )}
              <div className={`p-2 rounded-xl mb-2 ${
                isActive ? `bg-gradient-to-tr ${p.color} text-white` : 'bg-amber-100 text-amber-700'
              }`}>
                <Icon className="w-5 h-5" />
              </div>
              <span className={`text-xs font-bold leading-tight ${isActive ? 'text-slate-900' : 'text-slate-800'}`}>
                {p.name}
              </span>
              <span className="text-[10px] text-slate-700 mt-1 line-clamp-1">
                {p.tag}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
