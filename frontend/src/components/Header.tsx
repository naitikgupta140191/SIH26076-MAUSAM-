import React, { useState } from 'react';
import { Search, MapPin, Bookmark, Bell, Calendar, CloudSun, Navigation, User, LogIn } from 'lucide-react';
import type { LocationItem, UserProfile } from '../types/weather';
import { searchLocationsApi } from '../services/api';

interface HeaderProps {
  currentCity: string;
  onSelectLocation: (location: LocationItem) => void;
  onOpenSavedLocations: () => void;
  onOpenAlerts: () => void;
  onOpenEventPlanner: () => void;
  currentUser: UserProfile | null;
  onOpenAuthModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  onSelectLocation,
  onOpenSavedLocations,
  onOpenAlerts,
  onOpenEventPlanner,
  currentUser,
  onOpenAuthModal
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationItem[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Location Bar specific states
  const [isPillEditing, setIsPillEditing] = useState(false);
  const [pillQuery, setPillQuery] = useState('');
  const [pillResults, setPillResults] = useState<LocationItem[]>([]);
  const [isPillSearching, setIsPillSearching] = useState(false);
  const [showPillDropdown, setShowPillDropdown] = useState(false);

  const handleSearchChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    if (val.trim().length >= 2) {
      setIsSearching(true);
      setShowDropdown(true);
      const results = await searchLocationsApi(val);
      setSearchResults(results);
      setIsSearching(false);
    } else {
      setSearchResults([]);
      setShowDropdown(false);
    }
  };

  const handlePillQueryChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setPillQuery(val);
    if (val.trim().length >= 2) {
      setIsPillSearching(true);
      setShowPillDropdown(true);
      const results = await searchLocationsApi(val);
      setPillResults(results);
      setIsPillSearching(false);
    } else {
      setPillResults([]);
      setShowPillDropdown(false);
    }
  };

  const handleSelectCity = (city: LocationItem) => {
    onSelectLocation(city);
    setSearchQuery('');
    setShowDropdown(false);
    setIsPillEditing(false);
    setPillQuery('');
    setShowPillDropdown(false);
  };

  const handleGeoLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          onSelectLocation({
            name: "Current Location",
            country: "GPS",
            latitude: pos.coords.latitude,
            longitude: pos.coords.longitude
          });
        },
        (err) => {
          console.warn("Geolocation denied or error:", err);
          alert("Could not detect location. Please use search.");
        }
      );
    }
  };

  return (
    <header className="sticky top-0 z-40 glass-card border-b border-slate-800 bg-slate-950/80 backdrop-blur-md px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Interactive Location Bar */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="p-2 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 text-white shadow-lg shadow-cyan-500/25 animate-pulse-slow">
              <CloudSun className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-cyan-400 via-sky-300 to-indigo-300 bg-clip-text text-transparent">
                Mausam
              </h1>
              <p className="text-[10px] font-medium text-slate-400 tracking-wider uppercase">
                SIH Environmental Intelligence
              </p>
            </div>
          </div>

          {/* Interactive Location Bar (Clickable / Editable with PIN Code support) */}
          <div className="relative">
            {!isPillEditing ? (
              <button
                onClick={() => {
                  setIsPillEditing(true);
                  setPillQuery(currentCity);
                  setShowPillDropdown(true);
                }}
                className="flex items-center gap-2 bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 hover:border-cyan-500/50 px-3.5 py-1.5 rounded-full text-xs font-semibold text-cyan-300 transition-all cursor-pointer shadow-md group"
                title="Click to change location or enter PIN Code"
              >
                <MapPin className="w-3.5 h-3.5 text-cyan-400 animate-bounce group-hover:scale-110 transition-transform" />
                <span className="font-bold border-b border-dashed border-cyan-400/40 pb-0.5">{currentCity}</span>
                <span className="text-[10px] text-slate-500 group-hover:text-cyan-400 ml-0.5">(Change)</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-slate-900 border border-cyan-500 rounded-full px-3 py-1 text-xs text-slate-200 shadow-lg ring-1 ring-cyan-500/40 animate-fadeIn">
                <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <input
                  type="text"
                  autoFocus
                  value={pillQuery}
                  onChange={handlePillQueryChange}
                  onKeyDown={(e) => {
                    if (e.key === 'Escape') {
                      setIsPillEditing(false);
                      setShowPillDropdown(false);
                    }
                  }}
                  placeholder="Enter city or PIN code..."
                  className="bg-transparent border-none outline-none text-xs text-cyan-300 placeholder-slate-500 w-36 sm:w-48 font-medium"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsPillEditing(false);
                    setShowPillDropdown(false);
                  }}
                  className="text-slate-400 hover:text-white text-xs px-1 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Location Bar Dropdown */}
            {isPillEditing && showPillDropdown && (
              <div className="absolute left-0 top-full mt-2 w-64 sm:w-72 glass-card bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                <div className="p-2.5 border-b border-slate-800 bg-slate-950/60 flex items-center justify-between text-[11px] text-slate-400">
                  <span className="font-semibold text-cyan-400 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Search City or PIN Code
                  </span>
                  <button onClick={handleGeoLocation} className="text-cyan-400 hover:underline flex items-center gap-1">
                    <Navigation className="w-3 h-3" /> GPS
                  </button>
                </div>
                {isPillSearching ? (
                  <div className="p-4 text-xs text-center text-slate-400">Searching places & PIN codes...</div>
                ) : pillResults.length > 0 ? (
                  <div className="max-h-56 overflow-y-auto divide-y divide-slate-800/60">
                    {pillResults.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectCity(item)}
                        className="w-full px-3.5 py-2.5 text-left hover:bg-slate-800/80 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-200 group-hover:text-cyan-300">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-slate-400">
                            {item.admin1 ? `${item.admin1}, ` : ''}{item.country}
                          </div>
                        </div>
                        <span className="text-[9px] text-cyan-400 bg-cyan-950 px-1.5 py-0.5 rounded font-mono border border-cyan-800/60">
                          Select
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-xs text-center text-slate-400">
                    Type a city (e.g. Mumbai) or 6-digit PIN code (e.g. 110001, 400001, 560001)
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Global Search Bar with Autocomplete */}
        <div className="relative w-full md:w-80">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
              placeholder="Search city, PIN code (e.g. 110001) or country..."
              className="w-full bg-slate-900/80 border border-slate-800 focus:border-cyan-500 rounded-full pl-10 pr-10 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500/20 transition-all"
            />
            <button
              onClick={handleGeoLocation}
              title="Detect my location"
              className="absolute right-2.5 p-1 rounded-full text-slate-400 hover:text-cyan-400 hover:bg-slate-800 transition-colors"
            >
              <Navigation className="w-4 h-4" />
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && (
            <div className="absolute top-full mt-2 w-full glass-card bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
              {isSearching ? (
                <div className="p-4 text-xs text-center text-slate-400">Searching global weather & PIN code database...</div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-60 overflow-y-auto divide-y divide-slate-800/60">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectCity(item)}
                      className="w-full px-4 py-3 text-left hover:bg-slate-800/80 flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-200 group-hover:text-cyan-300">
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-400">
                          {item.admin1 ? `${item.admin1}, ` : ''}{item.country}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">
                        {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-xs text-center text-slate-400">No matching places or PIN codes found</div>
              )}
            </div>
          )}
        </div>

        {/* User Auth Profile & Navigation */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Login / Profile Button */}
          <button
            onClick={onOpenAuthModal}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-cyan-500/30 text-xs font-semibold text-cyan-300 transition-colors"
          >
            {currentUser && currentUser.isLoggedIn ? (
              <>
                <User className="w-4 h-4 text-cyan-400" />
                <span className="max-w-[120px] truncate">{currentUser.name}</span>
              </>
            ) : (
              <>
                <LogIn className="w-4 h-4 text-cyan-400" />
                <span>Login / Select Trade</span>
              </>
            )}
          </button>

          <button
            onClick={onOpenSavedLocations}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-cyan-300 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Saved Places</span>
          </button>

          <button
            onClick={onOpenAlerts}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 hover:text-amber-300 transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Alerts</span>
          </button>

          <button
            onClick={onOpenEventPlanner}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-semibold shadow-md shadow-indigo-500/20 transition-all"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Event Mode</span>
          </button>
        </div>
      </div>
    </header>
  );
};
