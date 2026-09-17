import React from 'react';
import type { SavedLocation, LocationItem } from '../types/weather';
import { X, MapPin, Trash2, Plus, Bookmark } from 'lucide-react';

interface SavedLocationsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedLocations: SavedLocation[];
  onSelectLocation: (loc: LocationItem) => void;
  onAddCurrentLocation: () => void;
  onDeleteLocation: (id: number) => void;
}

export const SavedLocationsModal: React.FC<SavedLocationsModalProps> = ({
  isOpen,
  onClose,
  savedLocations,
  onSelectLocation,
  onAddCurrentLocation,
  onDeleteLocation
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      <div className="glass-card w-full max-w-lg rounded-3xl p-6 border border-slate-800 shadow-2xl relative">
        <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <Bookmark className="w-5 h-5 text-cyan-400" />
            <h3 className="text-lg font-bold text-white">Saved Destinations</h3>
          </div>
          <button onClick={onClose} className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-slate-800">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 mb-6 max-h-80 overflow-y-auto pr-1">
          {savedLocations.length === 0 ? (
            <div className="text-center py-8 text-slate-400 text-sm">
              No saved locations yet. Save your favorite cities for instant access!
            </div>
          ) : (
            savedLocations.map((loc) => (
              <div
                key={loc.id}
                className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-cyan-500/40 transition-colors group"
              >
                <button
                  onClick={() => {
                    onSelectLocation({
                      name: loc.name,
                      country: loc.country,
                      latitude: loc.latitude,
                      longitude: loc.longitude
                    });
                    onClose();
                  }}
                  className="flex items-center gap-3 text-left flex-1"
                >
                  <div className="p-2 rounded-xl bg-cyan-950 text-cyan-400 border border-cyan-800/80">
                    <MapPin className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-sm font-bold text-slate-200 group-hover:text-cyan-300">
                      {loc.name}
                    </div>
                    <div className="text-xs text-slate-400">{loc.country}</div>
                  </div>
                </button>

                <button
                  onClick={() => onDeleteLocation(loc.id)}
                  title="Remove location"
                  className="p-2 text-slate-500 hover:text-rose-400 hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            ))
          )}
        </div>

        <button
          onClick={() => {
            onAddCurrentLocation();
            onClose();
          }}
          className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-semibold text-sm shadow-lg shadow-cyan-500/20 transition-all"
        >
          <Plus className="w-4 h-4" /> Save Active Location
        </button>
      </div>
    </div>
  );
};
