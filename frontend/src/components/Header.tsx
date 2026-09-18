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
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentCity,
  onSelectLocation,
  onOpenSavedLocations,
  onOpenAlerts,
  onOpenEventPlanner,
  currentUser,
  onOpenAuthModal,
  onLogout
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
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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
    <header className="sticky top-0 z-40 glass-card border-b border-amber-200 bg-white/80 backdrop-blur-md px-4 lg:px-8 py-3.5">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand Logo & Interactive Location Bar */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={() => window.location.reload()}>
            <div className="p-2 rounded-xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/25 animate-pulse-slow">
              <CloudSun className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-extrabold text-xl tracking-tight bg-gradient-to-r from-amber-500 via-yellow-300 to-orange-300 bg-clip-text text-transparent">
                Mausam
              </h1>
              <p className="text-[10px] font-medium text-slate-700 tracking-wider uppercase">
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
                className="flex items-center gap-2 bg-amber-50 hover:bg-amber-100 border border-amber-200 hover:border-amber-300 px-3.5 py-1.5 rounded-full text-xs font-semibold text-amber-700 transition-all cursor-pointer shadow-md group"
                title="Click to change location or enter PIN Code"
              >
                <MapPin className="w-3.5 h-3.5 text-amber-600 animate-bounce group-hover:scale-110 transition-transform" />
                <span className="font-bold border-b border-dashed border-amber-300 pb-0.5">{currentCity}</span>
                <span className="text-[10px] text-slate-700 group-hover:text-amber-700 ml-0.5">(Change)</span>
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-300 rounded-full px-3 py-1 text-xs text-slate-700 shadow-lg ring-1 ring-amber-200 animate-fadeIn">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
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
                  className="bg-transparent border-none outline-none text-xs text-amber-700 placeholder-slate-500 w-36 sm:w-48 font-medium"
                />
                <button
                  type="button"
                  onClick={() => {
                    setIsPillEditing(false);
                    setShowPillDropdown(false);
                  }}
                  className="text-slate-700 hover:text-white text-xs px-1 font-bold"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Location Bar Dropdown */}
            {isPillEditing && showPillDropdown && (
              <div className="absolute left-0 top-full mt-2 w-64 sm:w-72 glass-card bg-white border border-amber-200 rounded-2xl shadow-2xl overflow-hidden z-50 animate-fadeIn">
                <div className="p-2.5 border-b border-amber-100 bg-amber-50/80 flex items-center justify-between text-[11px] text-black">
                  <span className="font-semibold text-amber-700 flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> Search City or PIN Code
                  </span>
                  <button onClick={handleGeoLocation} className="text-amber-700 hover:underline flex items-center gap-1">
                    <Navigation className="w-3 h-3" /> GPS
                  </button>
                </div>
                {isPillSearching ? (
                  <div className="p-4 text-xs text-center text-slate-700">Searching places & PIN codes...</div>
                ) : pillResults.length > 0 ? (
                  <div className="max-h-56 overflow-y-auto divide-y divide-amber-100">
                    {pillResults.map((item, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSelectCity(item)}
                        className="w-full px-3.5 py-2.5 text-left hover:bg-amber-50 flex items-center justify-between group transition-colors"
                      >
                        <div>
                          <div className="text-xs font-bold text-slate-700 group-hover:text-amber-700">
                            {item.name}
                          </div>
                          <div className="text-[10px] text-slate-700">
                            {item.admin1 ? `${item.admin1}, ` : ''}{item.country}
                          </div>
                        </div>
                        <span className="text-[9px] text-amber-700 bg-amber-100 px-1.5 py-0.5 rounded font-mono border border-amber-200">
                          Select
                        </span>
                      </button>
                    ))}
                  </div>
                ) : (
                  <div className="p-3 text-xs text-center text-slate-700">
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
            <Search className="absolute left-3.5 w-4 h-4 text-slate-700 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={handleSearchChange}
              onFocus={() => searchQuery.length >= 2 && setShowDropdown(true)}
              placeholder="Search city, PIN code (e.g. 110001) or country..."
              className="w-full bg-[#f8f3ed] border border-amber-200 focus:border-amber-400 rounded-full pl-10 pr-10 py-2 text-sm text-stone-800 placeholder-stone-500 focus:outline-none focus:ring-2 focus:ring-amber-200 transition-all"
            />
            <button
              onClick={handleGeoLocation}
              title="Detect my location"
              className="absolute right-2.5 p-1 rounded-full text-slate-700 hover:text-amber-700 hover:bg-amber-100 transition-colors"
            >
              <Navigation className="w-4 h-4" />
            </button>
          </div>

          {/* Autocomplete Dropdown */}
          {showDropdown && (
            <div className="absolute top-full mt-2 w-full glass-card bg-white border border-amber-200 rounded-2xl shadow-2xl overflow-hidden z-50">
              {isSearching ? (
                <div className="p-4 text-xs text-center text-slate-700">Searching global weather & PIN code database...</div>
              ) : searchResults.length > 0 ? (
                <div className="max-h-60 overflow-y-auto divide-y divide-amber-100">
                  {searchResults.map((item, idx) => (
                    <button
                      key={idx}
                      onClick={() => handleSelectCity(item)}
                      className="w-full px-4 py-3 text-left hover:bg-amber-50 flex items-center justify-between group transition-colors"
                    >
                      <div>
                        <div className="text-sm font-semibold text-slate-700 group-hover:text-amber-700">
                          {item.name}
                        </div>
                        <div className="text-xs text-slate-700">
                          {item.admin1 ? `${item.admin1}, ` : ''}{item.country}
                        </div>
                      </div>
                      <span className="text-[10px] text-slate-700 font-mono">
                        {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                      </span>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-xs text-center text-slate-700">No matching places or PIN codes found</div>
              )}
            </div>
          )}
        </div>

        {/* User Auth Profile & Navigation */}
        <div className="flex items-center gap-2 w-full md:w-auto justify-end">
          {/* Login / Profile Button */}
          <div className="relative">
            <button
              onClick={() => {
                if (currentUser && currentUser.isLoggedIn) {
                  setShowProfileMenu((prev) => !prev);
                } else {
                  onOpenAuthModal();
                }
              }}
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white hover:bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-700 transition-colors"
            >
              {currentUser && currentUser.isLoggedIn ? (
                <>
                  <User className="w-4 h-4 text-amber-600" />
                  <span className="max-w-[120px] truncate">{currentUser.name}</span>
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 text-amber-600" />
                  <span>Login / Select Trade</span>
                </>
              )}
            </button>

            {currentUser && currentUser.isLoggedIn && showProfileMenu && (
              <div className="absolute right-0 top-full mt-2 w-40 bg-white border border-amber-200 rounded-xl shadow-2xl z-50 overflow-hidden">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    onLogout();
                  }}
                  className="w-full px-3 py-2.5 text-left text-sm font-medium text-red-600 hover:bg-amber-50 transition-colors"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          <button
            onClick={onOpenSavedLocations}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-amber-50 border border-amber-200 text-xs font-medium text-slate-700 hover:text-amber-700 transition-colors"
          >
            <Bookmark className="w-3.5 h-3.5 text-amber-600" />
            <span className="hidden sm:inline">Saved Places</span>
          </button>

          <button
            onClick={onOpenAlerts}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white hover:bg-amber-50 border border-amber-200 text-xs font-medium text-slate-700 hover:text-amber-600 transition-colors"
          >
            <Bell className="w-3.5 h-3.5 text-amber-500" />
            <span className="hidden sm:inline">Alerts</span>
          </button>

          <button
            onClick={onOpenEventPlanner}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-400 hover:to-orange-500 text-white text-xs font-semibold shadow-md shadow-amber-500/20 transition-all"
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Event Mode</span>
          </button>
        </div>
      </div>
    </header>
  );
};
