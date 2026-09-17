import React, { useState, useEffect } from 'react';
import type { UserProfile, PersonaType } from '../types/weather';
import { registerUserApi, loginUserApi } from '../services/api';
import {
  User, Mail, Lock, HeartPulse, Dumbbell, Waves, Plane, Baby,
  Sprout, Car, PartyPopper, Briefcase, CloudSun, ArrowRight,
  CheckCircle2, AlertCircle, Loader2, X,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: UserProfile) => void;
  initialUser?: UserProfile | null;
}

const TRADE_OPTIONS: {
  id: PersonaType;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  { id: 'health',      name: 'Health-conscious',    desc: 'AQI, Pollen, UV & Allergy Index',      icon: HeartPulse,   color: 'from-emerald-500 to-teal-600'   },
  { id: 'fitness',     name: 'Outdoor Fitness',      desc: 'Best Running Hours & Heat Index',      icon: Dumbbell,     color: 'from-amber-500 to-orange-600'   },
  { id: 'beach',       name: 'Beachgoer & Surfer',   desc: 'Waves, Swell, Tide & Water Temp',      icon: Waves,        color: 'from-cyan-500 to-blue-600'      },
  { id: 'traveler',    name: 'Traveler',              desc: 'Flight Weather & Packing Advice',      icon: Plane,        color: 'from-indigo-500 to-violet-600'  },
  { id: 'family',      name: 'Parents & Families',   desc: 'School Commute & Rain Alerts',         icon: Baby,         color: 'from-pink-500 to-rose-600'      },
  { id: 'agriculture', name: 'Agriculture',           desc: 'Soil Moisture, Temp & Frost Alerts',   icon: Sprout,       color: 'from-lime-500 to-emerald-600'   },
  { id: 'commuter',    name: 'Commuter',              desc: 'Highway Visibility & Traffic Hazards', icon: Car,          color: 'from-sky-500 to-indigo-600'     },
  { id: 'event',       name: 'Event Planner',         desc: 'Outdoor Comfort & Gathering Score',    icon: PartyPopper,  color: 'from-purple-500 to-fuchsia-600' },
  { id: 'custom',      name: 'Other / Custom Trade',  desc: 'Pilot, Photographer, Engineer…',       icon: Briefcase,    color: 'from-slate-600 to-slate-800'    },
];

/** Parse backend UserAuthResponse into a frontend UserProfile */
function buildProfile(apiUser: Record<string, unknown>): UserProfile {
  let parsedPersonas: PersonaType[] = ['health'];
  try {
    const p = JSON.parse((apiUser.selected_personas as string) || '["health"]');
    if (Array.isArray(p) && p.length > 0) parsedPersonas = p as PersonaType[];
  } catch { /* keep default */ }

  return {
    name:             (apiUser.name as string) || 'Mausam User',
    email:            (apiUser.email as string) || '',
    primaryPersona:   ((apiUser.primary_persona as string) || 'health') as PersonaType,
    selectedPersonas: parsedPersonas,
    customTrade:      (apiUser.custom_trade as string) || undefined,
    isLoggedIn:       true,
  };
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLoginSuccess,
  initialUser,
}) => {
  // Default to "Sign In" tab
  const [isRegister, setIsRegister] = useState(false);
  const [name,             setName]             = useState('');
  const [email,            setEmail]            = useState('');
  const [password,         setPassword]         = useState('');
  const [selectedPersonas, setSelectedPersonas] = useState<PersonaType[]>(['health']);
  const [customTrade,      setCustomTrade]      = useState('');
  const [error,            setError]            = useState('');
  const [loading,          setLoading]          = useState(false);

  // Reset ALL fields every time the modal opens — never pre-fill credentials
  useEffect(() => {
    if (isOpen) {
      setIsRegister(false);
      setName('');
      setEmail('');
      setPassword('');
      setCustomTrade('');
      setError('');
      setLoading(false);
      setSelectedPersonas(['health']);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTogglePersona = (id: PersonaType) => {
    setSelectedPersonas(prev => {
      if (prev.includes(id)) {
        return prev.length === 1 ? prev : prev.filter(p => p !== id);
      }
      return [...prev, id];
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isRegister) {
        /* ── REGISTER ─────────────────────────────────────── */
        const primary = selectedPersonas[0] || 'health';
        const result = await registerUserApi({
          name:              name.trim(),
          email:             email.trim().toLowerCase(),
          password,
          primary_persona:   primary,
          selected_personas: selectedPersonas,
          custom_trade:      selectedPersonas.includes('custom') ? customTrade.trim() : undefined,
        });

        if (!result.success || !result.user) {
          setError(result.error || 'Registration failed. Please try again.');
          setLoading(false);
          return;
        }
        onLoginSuccess(buildProfile(result.user));
        onClose();

      } else {
        /* ── LOGIN ────────────────────────────────────────── */
        const result = await loginUserApi({
          email:    email.trim().toLowerCase(),
          password,
        });

        if (!result.success || !result.user) {
          setError(result.error || 'Login failed. Please check your credentials.');
          setLoading(false);
          return;
        }
        onLoginSuccess(buildProfile(result.user));
        onClose();
      }
    } catch {
      setError('Connection error. Please ensure the backend server is running on port 8000.');
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-lg animate-fadeIn">
      <div className="glass-card w-full max-w-2xl rounded-3xl p-6 lg:p-8 border border-slate-800 shadow-2xl relative max-h-[92vh] overflow-y-auto">

        {/* X button ONLY shown when a session already exists (profile management) */}
        {initialUser && (
          <button
            onClick={onClose}
            aria-label="Close"
            className="absolute top-5 right-5 p-1.5 rounded-full text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* ── Header ───────────────────────────────────────── */}
        <div className="text-center mb-6">
          <div className="inline-flex p-3 rounded-2xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 mb-3">
            <CloudSun className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-extrabold text-white tracking-tight">
            {isRegister ? 'Create Your Mausam Account' : 'Welcome to Mausam'}
          </h2>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            {isRegister
              ? 'Set up your personalized multi-domain weather intelligence dashboard'
              : 'Sign in to access your personalized weather & environmental dashboard'}
          </p>
        </div>

        {/* ── Tab Toggle ───────────────────────────────────── */}
        <div className="flex rounded-xl bg-slate-900 p-1 mb-5 border border-slate-800">
          <button
            type="button"
            id="tab-signin"
            onClick={() => { setIsRegister(false); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              !isRegister
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            id="tab-register"
            onClick={() => { setIsRegister(true); setError(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
              isRegister
                ? 'bg-cyan-500 text-slate-950 shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            Create Account
          </button>
        </div>

        {/* ── Error Banner ─────────────────────────────────── */}
        {error && (
          <div
            role="alert"
            className="flex items-start gap-2.5 bg-rose-950/60 border border-rose-700/50 rounded-xl px-4 py-3 mb-4"
          >
            <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-rose-300 leading-relaxed">{error}</p>
          </div>
        )}

        {/* ── Form ─────────────────────────────────────────── */}
        <form onSubmit={handleSubmit} className="space-y-4">

          {/* Name — Register only */}
          {isRegister && (
            <div>
              <label htmlFor="auth-name" className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-cyan-400" /> Full Name
              </label>
              <input
                id="auth-name"
                type="text"
                required
                autoComplete="name"
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          )}

          {/* Email */}
          <div>
            <label htmlFor="auth-email" className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-cyan-400" /> Email Address
            </label>
            <input
              id="auth-email"
              type="email"
              required
              autoComplete="username"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="name@example.com"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Password */}
          <div>
            <label htmlFor="auth-password" className="text-xs font-semibold text-slate-300 mb-1.5 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-cyan-400" /> Password
              {isRegister && (
                <span className="text-slate-500 font-normal ml-1">— min. 6 characters</span>
              )}
            </label>
            <input
              id="auth-password"
              type="password"
              required
              autoComplete={isRegister ? 'new-password' : 'current-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder={isRegister ? 'Create a strong password' : 'Enter your password'}
              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3.5 py-2.5 text-xs text-slate-200 placeholder:text-slate-600 focus:outline-none focus:border-cyan-500 transition-colors"
            />
          </div>

          {/* Domain / Persona Selection — Register only */}
          {isRegister && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                  <Briefcase className="w-3.5 h-3.5" /> Your Weather Domains
                </label>
                <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-800/60">
                  {selectedPersonas.length} selected
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 max-h-52 overflow-y-auto pr-0.5">
                {TRADE_OPTIONS.map(trade => {
                  const Icon = trade.icon;
                  const isSelected = selectedPersonas.includes(trade.id);
                  return (
                    <button
                      key={trade.id}
                      type="button"
                      onClick={() => handleTogglePersona(trade.id)}
                      className={`flex flex-col items-start p-2.5 rounded-2xl border text-left transition-all relative ${
                        isSelected
                          ? 'bg-slate-900 border-cyan-400 ring-1 ring-cyan-400 shadow-md shadow-cyan-500/20'
                          : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-900 hover:border-slate-700 opacity-70 hover:opacity-100'
                      }`}
                    >
                      {isSelected && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 absolute top-2 right-2 fill-slate-950" />
                      )}
                      <div className={`p-1.5 rounded-lg mb-1.5 text-white bg-gradient-to-tr ${trade.color}`}>
                        <Icon className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-bold text-slate-200">{trade.name}</span>
                      <span className="text-[9px] text-slate-400 mt-0.5 line-clamp-2 leading-relaxed">{trade.desc}</span>
                    </button>
                  );
                })}
              </div>

              {selectedPersonas.includes('custom') && (
                <div>
                  <label htmlFor="auth-trade" className="text-xs font-medium text-slate-300 mb-1 block">
                    Specify Your Profession
                  </label>
                  <input
                    id="auth-trade"
                    type="text"
                    required
                    value={customTrade}
                    onChange={e => setCustomTrade(e.target.value)}
                    placeholder="e.g. Civil Engineer, Drone Pilot, Outdoor Photographer..."
                    className="w-full bg-slate-900 border border-cyan-500/50 rounded-xl px-3.5 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-cyan-500"
                  />
                </div>
              )}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            id="auth-submit"
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold text-sm shadow-xl shadow-cyan-500/25 transition-all mt-2 disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{isRegister ? 'Creating Account…' : 'Signing In…'}</span>
              </>
            ) : (
              <>
                <span>{isRegister ? 'Create Account & Open Dashboard' : 'Sign In to Dashboard'}</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
