import React, { useState } from 'react';
import type { UserProfile, PersonaType } from '../types/weather';
import {
  X,
  User,
  Mail,
  Lock,
  HeartPulse,
  Dumbbell,
  Waves,
  Plane,
  Baby,
  Sprout,
  Car,
  PartyPopper,
  Briefcase,
  Sparkles,
  ArrowRight,
  CheckCircle2
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialUser?: UserProfile | null;
}

const TRADE_OPTIONS: { id: PersonaType; name: string; desc: string; icon: React.ComponentType<{ className?: string }>; color: string }[] = [
  { id: 'health', name: 'Health-conscious user', desc: 'AQI, Pollen, UV & Asthma Triggers', icon: HeartPulse, color: 'from-emerald-500 to-teal-600' },
  { id: 'fitness', name: 'Outdoor fitness enthusiast', desc: 'Best Running Hours, Wind & Heat Index', icon: Dumbbell, color: 'from-amber-500 to-orange-600' },
  { id: 'beach', name: 'Beachgoer & surfer', desc: 'Waves, Swell, Tide & Water Temp', icon: Waves, color: 'from-cyan-500 to-blue-600' },
  { id: 'traveler', name: 'Traveler', desc: 'Flight Weather & AI Packing Advice', icon: Plane, color: 'from-indigo-500 to-violet-600' },
  { id: 'family', name: 'Parents & families', desc: 'School Commute & Recess Rain Alerts', icon: Baby, color: 'from-pink-500 to-rose-600' },
  { id: 'agriculture', name: 'Agriculture & gardener', desc: 'Soil Moisture, Soil Temp & Frost Alerts', icon: Sprout, color: 'from-lime-500 to-emerald-600' },
  { id: 'commuter', name: 'Commuter', desc: 'Highway Visibility & Traffic Hazards', icon: Car, color: 'from-sky-500 to-indigo-600' },
  { id: 'event', name: 'Event planner', desc: 'Outdoor Comfort Index & Gathering Score', icon: PartyPopper, color: 'from-purple-500 to-fuchsia-600' },
  { id: 'custom', name: 'Other Trade / Field', desc: 'Specify custom profession (Pilot, Photographer, etc.)', icon: Briefcase, color: 'from-slate-600 to-slate-800' }
];

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialUser
}) => {
  const [isRegister, setIsRegister] = useState(true);
  const [name, setName] = useState(initialUser?.name || '');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPersonas, setSelectedPersonas] = useState<PersonaType[]>(
    initialUser?.selectedPersonas || (initialUser?.primaryPersona ? [initialUser.primaryPersona] : ['health'])
  );
  const [customTrade, setCustomTrade] = useState(initialUser?.customTrade || '');

  if (!isOpen) return null;

  const handleTogglePersona = (personaId: PersonaType) => {
    setSelectedPersonas(prev => {
      if (prev.includes(personaId)) {
        if (prev.length === 1) return prev; // keep at least 1 domain selected
        return prev.filter(p => p !== personaId);
      } else {
        return [...prev, personaId];
      }
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const primary = selectedPersonas[0] || 'health';
    const userProfile: UserProfile = {
      name: name || 'Mausam User',
      email,
      primaryPersona: primary,
      selectedPersonas: selectedPersonas.length > 0 ? selectedPersonas : [primary],
      customTrade: selectedPersonas.includes('custom') ? customTrade : undefined,
      isLoggedIn: true
    };

    onLoginSuccess(userProfile);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-lg animate-fadeIn">
      <div className="glass-card w-full max-w-2xl rounded-3xl p-6 lg:p-8 border border-slate-800 shadow-2xl relative max-h-[92vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Title */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 mb-3 animate-pulse-slow">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {isRegister ? 'Welcome to Mausam Intelligence' : 'Sign In to Your Dashboard'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
            Select one or multiple fields to customize weather & environmental algorithms specifically for your routine.
          </p>
        </div>

        {/* Toggle Login vs Register */}
        <div className="flex rounded-xl bg-slate-900 p-1 mb-6 border border-slate-800">
          <button
            type="button"
            onClick={() => setIsRegister(true)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              isRegister ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Profile & Choose Domains
          </button>
          <button
            type="button"
            onClick={() => setIsRegister(false)}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              !isRegister ? 'bg-cyan-500 text-slate-950 shadow-md' : 'text-slate-400 hover:text-white'
            }`}
          >
            Existing User Login
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* User Basic Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {isRegister && (
              <div>
                <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-cyan-400" /> Full Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
                />
              </div>
            )}

            <div className={!isRegister ? 'sm:col-span-2' : ''}>
              <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-cyan-400" /> Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="text-xs font-semibold text-slate-300 mb-1 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-cyan-400" /> Password
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500"
              />
            </div>
          </div>

          {/* TRADE / PERSONA SELECTION SECTION */}
          <div className="space-y-3 pt-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4" /> Select Your User Domains (Select Multiple)
              </label>
              <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/60">
                {selectedPersonas.length} Selected
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 max-h-64 overflow-y-auto pr-1">
              {TRADE_OPTIONS.map((trade) => {
                const Icon = trade.icon;
                const isSelected = selectedPersonas.includes(trade.id);
                return (
                  <button
                    key={trade.id}
                    type="button"
                    onClick={() => handleTogglePersona(trade.id)}
                    className={`flex flex-col items-start p-3 rounded-2xl border text-left transition-all relative ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-400 shadow-md shadow-cyan-500/20 ring-1 ring-cyan-400'
                        : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700 opacity-75 hover:opacity-100'
                    }`}
                  >
                    {isSelected && (
                      <CheckCircle2 className="w-4 h-4 text-cyan-400 absolute top-2.5 right-2.5 fill-slate-950" />
                    )}
                    <div className={`p-1.5 rounded-lg mb-2 text-white bg-gradient-to-tr ${trade.color}`}>
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-slate-200">{trade.name}</span>
                    <span className="text-[10px] text-slate-400 mt-0.5 line-clamp-2">{trade.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* If "Other Trade / Field" is selected */}
            {selectedPersonas.includes('custom') && (
              <div className="pt-2">
                <label className="text-xs font-medium text-slate-300 mb-1 block">
                  Specify Your Profession / Trade
                </label>
                <input
                  type="text"
                  required
                  value={customTrade}
                  onChange={(e) => setCustomTrade(e.target.value)}
                  placeholder="e.g. Civil Engineer, Drone Pilot, Outdoor Photographer..."
                  className="w-full bg-slate-900 border border-cyan-500/50 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                />
              </div>
            )}
          </div>

          {/* Submit Action Button */}
          <button
            type="submit"
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all mt-6"
          >
            <span>{isRegister ? 'Complete Setup & Load Multi-Domain View' : 'Sign In to My Dashboard'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};
