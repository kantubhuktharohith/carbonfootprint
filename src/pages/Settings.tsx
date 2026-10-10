import React, { useState } from 'react';
import {
  User,
  Building2,
  CalendarDays,
  CheckCircle2,
  Database,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { isSupabaseConfigured } from '../lib/supabase';

export const Settings: React.FC = () => {
  const {
    workspaceType,
    setWorkspaceType,
    profile,
    updateProfile,
    organization,
    event,
    setParticipantCount,
    loadSampleData,
  } = useApp();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [orgName, setOrgName] = useState(organization?.name || '');
  const [eventName, setEventName] = useState(event?.name || '');
  const [participants, setParticipants] = useState(
    event?.actual_participants?.toString() || organization?.participant_count?.toString() || ''
  );
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const handleLoadSampleData = () => {
    loadSampleData();
    setToastMessage('One month of sample data was added to local storage.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const count = parseInt(participants, 10);
      if (!isNaN(count) && count > 0) {
        setParticipantCount(count);
      }
      await updateProfile({ full_name: fullName, account_type: workspaceType });
      setToastMessage('Workspace settings updated successfully!');
    } catch (error) {
      console.error('Failed to save workspace settings:', error);
      setToastMessage('Unable to save workspace settings. Please try again.');
    }
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Toast */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#166534] text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            Workspace Configuration
          </span>
          <span className="text-xs text-gray-400">• Parameters & Scope</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
          Settings & Workspace Setup
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1">
          Configure reporting boundaries, participant headcounts, and database persistence settings.
        </p>
      </div>

      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
        <form onSubmit={handleSave} className="space-y-6">
          {/* Workspace Type Selector */}
          <div>
            <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
              Active Workspace Type
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <button
                type="button"
                onClick={() => setWorkspaceType('event')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  workspaceType === 'event'
                    ? 'border-[#166534] bg-emerald-50/50 shadow-xs ring-2 ring-[#166534]/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#166534] flex items-center justify-center shrink-0">
                  <CalendarDays className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-gray-900">Event Organizer</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Conferences, hackathons, and conventions
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setWorkspaceType('institution')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  workspaceType === 'institution'
                    ? 'border-[#166534] bg-emerald-50/50 shadow-xs ring-2 ring-[#166534]/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#166534] flex items-center justify-center shrink-0">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-gray-900">Institution</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    University campuses, schools, and offices
                  </p>
                </div>
              </button>

              <button
                type="button"
                onClick={() => setWorkspaceType('individual')}
                className={`p-4 rounded-2xl border text-left flex items-start gap-3 transition-all ${
                  workspaceType === 'individual'
                    ? 'border-[#166534] bg-emerald-50/50 shadow-xs ring-2 ring-[#166534]/20'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-100 text-[#166534] flex items-center justify-center shrink-0">
                  <User className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-xs text-gray-900">Individual</h3>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    Personal household and daily lifestyle
                  </p>
                </div>
              </button>
            </div>
          </div>

          {/* Form Fields */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Lead Sustainability Officer / User Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:ring-2 focus:ring-[#10B981]"
              />
            </div>

            {workspaceType === 'institution' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Institution Name
                </label>
                <input
                  type="text"
                  value={orgName}
                  onChange={(e) => setOrgName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:ring-2 focus:ring-[#10B981]"
                />
              </div>
            )}

            {workspaceType === 'event' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Event Name
                </label>
                <input
                  type="text"
                  value={eventName}
                  onChange={(e) => setEventName(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:ring-2 focus:ring-[#10B981]"
                />
              </div>
            )}

            {workspaceType !== 'individual' && (
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">
                  Total Attendees / Campus Population (For Intensity Metrics)
                </label>
                <input
                  type="number"
                  min="1"
                  value={participants}
                  onChange={(e) => setParticipants(e.target.value)}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-800 focus:ring-2 focus:ring-[#10B981]"
                />
              </div>
            )}
          </div>

          {/* Database Persistence Status Card */}
          <div className="bg-gray-50/70 p-4 rounded-2xl border border-gray-200/70 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-white shadow-2xs text-[#166534] flex items-center justify-center">
                <Database className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-xs text-gray-900">
                  {isSupabaseConfigured ? 'Connected to Supabase PostgreSQL' : 'Local storage persistence'}
                </h4>
                <p className="text-[11px] text-gray-500">
                  {isSupabaseConfigured
                    ? 'Real-time Row Level Security cloud persistence is enabled.'
                    : 'Data is stored in this browser until Supabase is configured.'}
                </p>
              </div>
            </div>

            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${
                isSupabaseConfigured
                  ? 'bg-emerald-100 text-emerald-800'
                  : 'bg-emerald-100 text-[#166534]'
              }`}
            >
              {isSupabaseConfigured ? 'Cloud Live' : 'Local Storage'}
            </span>
          </div>

          {/* Buttons */}
          <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all"
            >
              Save Configuration
            </button>
          </div>
        </form>

        {!isSupabaseConfigured && (
          <div className="border-t border-gray-100 pt-5">
            <p className="text-xs text-gray-500 mb-3">
              The workspace is empty by default. Add 30 days of local-only sample records for testing.
            </p>
            <button
              type="button"
              onClick={handleLoadSampleData}
              className="px-4 py-2.5 rounded-xl border border-emerald-200 text-emerald-800 hover:bg-emerald-50 text-xs font-bold transition-colors"
            >
              Load Sample Data
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
