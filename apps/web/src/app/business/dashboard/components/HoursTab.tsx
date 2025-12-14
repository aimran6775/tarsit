'use client';

import { Clock, Save, RefreshCw, Loader2 } from 'lucide-react';
import type { BusinessHours } from '../types';

interface HoursTabProps {
  editedHours: BusinessHours[];
  setEditedHours: (hours: BusinessHours[]) => void;
  isSavingHours: boolean;
  onSaveHours: () => void;
  onInitializeHours: () => void;
}

export function HoursTab({
  editedHours,
  setEditedHours,
  isSavingHours,
  onSaveHours,
  onInitializeHours,
}: HoursTabProps) {
  return (
    <div className="bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg font-semibold text-white">Business Hours</h2>
          <p className="text-sm text-white/50">Set your operating hours for each day of the week</p>
        </div>
        <div className="flex gap-2">
          {editedHours.length === 0 && (
            <button
              onClick={onInitializeHours}
              className="flex items-center gap-2 px-4 py-2 border border-white/20 text-white/70 text-sm font-medium rounded-lg hover:bg-white/5 transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Initialize Defaults
            </button>
          )}
          <button
            onClick={onSaveHours}
            disabled={isSavingHours}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white text-sm font-medium rounded-lg hover:from-purple-500 hover:to-indigo-500 disabled:opacity-50 transition-all shadow-lg shadow-purple-500/25"
          >
            {isSavingHours ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Hours
          </button>
        </div>
      </div>

      {editedHours.length === 0 ? (
        <div className="text-center py-10 border-2 border-dashed border-white/10 rounded-xl">
          <Clock className="h-12 w-12 text-white/10 mx-auto mb-3" />
          <p className="text-white/50">No business hours set</p>
          <p className="text-sm text-white/30 mt-1">Click "Initialize Defaults" to set up standard business hours</p>
        </div>
      ) : (
        <div className="space-y-3">
          {editedHours.map((hours, index) => (
            <div key={hours.dayOfWeek} className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/5">
              <span className="w-24 font-medium text-white">{hours.dayName}</span>
              
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={!hours.isClosed}
                  onChange={(e) => {
                    const newHours = [...editedHours];
                    newHours[index] = { ...hours, isClosed: !e.target.checked };
                    setEditedHours(newHours);
                  }}
                  className="w-4 h-4 rounded border-white/30 bg-white/5 text-purple-600 focus:ring-purple-500/50"
                />
                <span className="text-sm text-white/60">Open</span>
              </label>
              
              {!hours.isClosed && (
                <>
                  <input
                    type="time"
                    value={hours.openTime}
                    onChange={(e) => {
                      const newHours = [...editedHours];
                      newHours[index] = { ...hours, openTime: e.target.value };
                      setEditedHours(newHours);
                    }}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                  <span className="text-white/40">to</span>
                  <input
                    type="time"
                    value={hours.closeTime}
                    onChange={(e) => {
                      const newHours = [...editedHours];
                      newHours[index] = { ...hours, closeTime: e.target.value };
                      setEditedHours(newHours);
                    }}
                    className="px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-purple-500/50"
                  />
                </>
              )}
              
              {hours.isClosed && (
                <span className="text-red-400 font-medium">Closed</span>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
