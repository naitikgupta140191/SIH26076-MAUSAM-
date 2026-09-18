import React, { useState, useEffect } from 'react';
import type { DashboardData, PersonaType, LocationItem, SavedLocation, CustomAlert, UserProfile } from './types/weather';
import {
  fetchDashboardData,
  fetchSavedLocationsApi,
  addSavedLocationApi,
  fetchCustomAlertsApi,
  createCustomAlertApi
} from './services/api';
import { Header } from './components/Header';
import { PersonaSelector } from './components/PersonaSelector';
import { PersonaDetailView } from './components/PersonaDetailView';
import { WeatherCharts } from './components/WeatherCharts';
import { DailyForecastGrid } from './components/DailyForecastGrid';
import { SavedLocationsModal } from './components/SavedLocationsModal';
import { AlertsManagerModal } from './components/AlertsManagerModal';
import { EventPlannerModal } from './components/EventPlannerModal';
import { AuthModal } from './components/AuthModal';
import { CloudSun, Loader2, User, Briefcase } from 'lucide-react';

export const App: React.FC = () => {
  const [currentCity, setCurrentCity] = useState('New Delhi');
  const [lat, setLat] = useState(28.6139);
  const [lon, setLon] = useState(77.2090);
  const [activePersona, setActivePersona] = useState<PersonaType>('health');

  // User Auth Profile State
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('mausam_user') || localStorage.getItem('auracast_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [isAuthOpen, setIsAuthOpen] = useState(true); // always require login on every visit

  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [isSavedLocationsOpen, setIsSavedLocationsOpen] = useState(false);
  const [savedLocations, setSavedLocations] = useState<SavedLocation[]>([]);
  const [isAlertsOpen, setIsAlertsOpen] = useState(false);
  const [customAlerts, setCustomAlerts] = useState<CustomAlert[]>([]);
  const [isEventPlannerOpen, setIsEventPlannerOpen] = useState(false);

  useEffect(() => {
    if (currentUser) {
      const initial = currentUser.selectedPersonas?.[0] || currentUser.primaryPersona || 'health';
      setActivePersona(initial);
    }
  }, []);

  const loadData = async (city: string, latitude: number, longitude: number, persona: PersonaType) => {
    setLoading(true);
    const data = await fetchDashboardData(latitude, longitude, persona, city);
    setDashboardData(data);
    setLoading(false);
  };

  useEffect(() => {
    loadData(currentCity, lat, lon, activePersona);
  }, [currentCity, lat, lon, activePersona]);

  useEffect(() => {
    fetchSavedLocationsApi().then(setSavedLocations);
    fetchCustomAlertsApi().then(setCustomAlerts);
  }, []);

  const handleLoginSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    localStorage.setItem('mausam_user', JSON.stringify(user));
    const initial = user.selectedPersonas?.[0] || user.primaryPersona || 'health';
    setActivePersona(initial);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem('mausam_user');
    localStorage.removeItem('auracast_user');
    setIsAuthOpen(true);
  };

  const handleSelectLocation = (loc: LocationItem) => {
    setCurrentCity(loc.name);
    setLat(loc.latitude);
    setLon(loc.longitude);
  };

  const handleSelectPersona = (persona: PersonaType) => {
    setActivePersona(persona);
  };

  const handleAddCurrentLocation = async () => {
    const created = await addSavedLocationApi({
      name: currentCity,
      country: "Saved",
      latitude: lat,
      longitude: lon
    });
    if (created) {
      setSavedLocations(prev => [...prev, created]);
    }
  };

  const handleDeleteSavedLocation = (id: number) => {
    setSavedLocations(prev => prev.filter(l => l.id !== id));
  };

  const handleAddAlert = async (alert: CustomAlert) => {
    const created = await createCustomAlertApi(alert);
    if (created) {
      setCustomAlerts(prev => [...prev, created]);
    }
  };

  const handleDeleteAlert = (id: number) => {
    setCustomAlerts(prev => prev.filter(a => a.id !== id));
  };

  return (
    <div className="min-h-screen text-slate-800 flex flex-col font-sans">
      {/* Header Bar */}
      <Header
        currentCity={currentCity}
        onSelectLocation={handleSelectLocation}
        onOpenSavedLocations={() => setIsSavedLocationsOpen(true)}
        onOpenAlerts={() => setIsAlertsOpen(true)}
        onOpenEventPlanner={() => setIsEventPlannerOpen(true)}
        currentUser={currentUser}
        onOpenAuthModal={() => setIsAuthOpen(true)}
        onLogout={handleLogout}
      />

      {/* Main Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6">
        {/* User Greeting Banner if Logged In */}
        {currentUser && (
          <div className="glass-card rounded-2xl p-4 mb-4 border border-amber-200 bg-white/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-100 text-amber-700 border border-amber-200">
                <User className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  Welcome back, {currentUser.name}!
                </h3>
                <div className="flex flex-wrap items-center gap-1.5 mt-1">
                  <span className="text-[10px] text-slate-700 flex items-center gap-1">
                    <Briefcase className="w-3.5 h-3.5 text-amber-600" /> Active Domains:
                  </span>
                  {(currentUser.selectedPersonas || [currentUser.primaryPersona]).map(p => (
                    <span key={p} className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 border border-amber-200 font-mono uppercase">
                      {p === 'custom' ? currentUser.customTrade || 'Custom' : p}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsAuthOpen(true)}
              className="text-xs font-semibold text-amber-700 hover:underline shrink-0"
            >
              Manage Domains & Profile
            </button>
          </div>
        )}

        {/* Persona Selector Bar */}
        <PersonaSelector
          activePersona={activePersona}
          selectedPersonas={currentUser?.selectedPersonas || (currentUser?.primaryPersona ? [currentUser.primaryPersona] : [])}
          onSelectPersona={handleSelectPersona}
        />

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 space-y-4">
            <Loader2 className="w-10 h-10 text-amber-500 animate-spin" />
            <p className="text-sm font-semibold text-slate-700">
              Computing {activePersona.toUpperCase()} persona algorithms for {currentCity}...
            </p>
          </div>
        ) : dashboardData ? (
          <div className="space-y-6 animate-fadeIn">
            {/* Active Persona Insight View */}
            <PersonaDetailView
              insight={dashboardData.persona_insight}
              currentTemp={dashboardData.current_weather.temp_c}
              feelsLike={dashboardData.current_weather.feels_like_c}
              humidity={dashboardData.current_weather.humidity}
              windKph={dashboardData.current_weather.wind_kph}
              uvIndex={dashboardData.current_weather.uv_index}
            />

            {/* 24-Hour Environmental Dynamics Chart */}
            <WeatherCharts hourlyForecast={dashboardData.hourly_forecast} />

            {/* 7-Day Extended Outlook */}
            <DailyForecastGrid dailyForecast={dashboardData.daily_forecast} />
          </div>
        ) : (
          <div className="text-center py-16 text-slate-700">
            Failed to load weather data. Please retry.
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="glass-card border-t border-slate-900 py-6 px-4 text-center text-xs text-slate-700">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <CloudSun className="w-4 h-4 text-amber-500" />
            <span className="font-bold text-slate-700">Mausam Platform</span>
            <span>• Multi-Domain Weather & Environmental Intelligence</span>
          </div>
          <div>
            Powered by Open-Meteo High Resolution Environmental & AQI APIs
          </div>
        </div>
      </footer>

      {/* Modals */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        onLoginSuccess={handleLoginSuccess}
        initialUser={currentUser}
      />

      <SavedLocationsModal
        isOpen={isSavedLocationsOpen}
        onClose={() => setIsSavedLocationsOpen(false)}
        savedLocations={savedLocations}
        onSelectLocation={handleSelectLocation}
        onAddCurrentLocation={handleAddCurrentLocation}
        onDeleteLocation={handleDeleteSavedLocation}
      />

      <AlertsManagerModal
        isOpen={isAlertsOpen}
        onClose={() => setIsAlertsOpen(false)}
        alerts={customAlerts}
        currentCity={currentCity}
        lat={lat}
        lon={lon}
        onAddAlert={handleAddAlert}
        onDeleteAlert={handleDeleteAlert}
      />

      <EventPlannerModal
        isOpen={isEventPlannerOpen}
        onClose={() => setIsEventPlannerOpen(false)}
        currentCity={currentCity}
      />
    </div>
  );
};

export default App;
