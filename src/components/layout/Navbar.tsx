import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Leaf,
  Building2,
  CalendarDays,
  User,
  PlusCircle,
  Menu,
  X,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReportingPeriod, WorkspaceType } from '../../types';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const {
    workspaceType,
    setWorkspaceType,
    reportingPeriod,
    setReportingPeriod,
    resetToDemoData,
    profile,
    event,
    organization,
  } = useApp();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();

  const workspaceLabels: Record<WorkspaceType, { label: string; icon: React.ReactNode; desc: string }> = {
    event: {
      label: event?.name || 'Campus Conclave 2026',
      icon: <CalendarDays className="w-4 h-4 text-emerald-600" />,
      desc: 'Event Workspace (342 Attendees)',
    },
    institution: {
      label: organization?.name || 'Apex Institute Campus',
      icon: <Building2 className="w-4 h-4 text-emerald-600" />,
      desc: 'Institution Workspace (1,200 Campus Members)',
    },
    individual: {
      label: profile?.full_name || 'Dr. Aarav Sharma',
      icon: <User className="w-4 h-4 text-emerald-600" />,
      desc: 'Personal Footprint Workspace',
    },
  };

  const periodOptions: { value: ReportingPeriod; label: string }[] = [
    { value: '7d', label: 'Last 7 Days' },
    { value: '30d', label: 'Last 30 Days' },
    { value: '90d', label: 'Last Quarter' },
    { value: '1y', label: 'Past Year' },
    { value: 'all', label: 'All Activities' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo & Mobile Toggle */}
          <div className="flex items-center gap-3">
            <button
              onClick={onToggleSidebar}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 lg:hidden focus:outline-hidden"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#166534] to-[#10B981] flex items-center justify-center text-white shadow-sm shadow-emerald-900/20 group-hover:scale-105 transition-transform">
                <Leaf className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="font-extrabold text-lg tracking-tight text-[#166534] flex items-center gap-1.5">
                  EcoTrack <span className="text-[#10B981]">AI</span>
                </span>
                <span className="text-[10px] text-gray-500 font-medium tracking-wide uppercase">
                  Carbon Intelligence
                </span>
              </div>
            </Link>

            {/* Demo Mode Badge */}
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 font-medium">
              <Sparkles className="w-3 h-3 text-[#10B981]" />
              <span>Demo Mode Active</span>
            </div>
          </div>

          {/* Center: Workspace Switcher & Period Selector */}
          <div className="hidden md:flex items-center gap-3">
            {/* Workspace Type Selector */}
            <div className="flex items-center bg-gray-100/80 p-1 rounded-xl border border-gray-200/60">
              <button
                onClick={() => setWorkspaceType('event')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  workspaceType === 'event'
                    ? 'bg-white text-[#166534] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Event Organizer Workspace"
              >
                <CalendarDays className="w-3.5 h-3.5" />
                <span>Event</span>
              </button>

              <button
                onClick={() => setWorkspaceType('institution')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  workspaceType === 'institution'
                    ? 'bg-white text-[#166534] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Institution / Campus Workspace"
              >
                <Building2 className="w-3.5 h-3.5" />
                <span>Institution</span>
              </button>

              <button
                onClick={() => setWorkspaceType('individual')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  workspaceType === 'individual'
                    ? 'bg-white text-[#166534] shadow-xs'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
                title="Individual Workspace"
              >
                <User className="w-3.5 h-3.5" />
                <span>Individual</span>
              </button>
            </div>

            {/* Reporting Period Filter */}
            <select
              value={reportingPeriod}
              onChange={(e) => setReportingPeriod(e.target.value as ReportingPeriod)}
              className="bg-white border border-gray-200 text-xs font-medium text-gray-700 rounded-lg px-2.5 py-1.5 focus:outline-hidden focus:ring-2 focus:ring-[#10B981] shadow-2xs cursor-pointer"
              aria-label="Filter reporting period"
            >
              {periodOptions.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Right Action: Add Activity CTA & Reset Demo */}
          <div className="flex items-center gap-2.5">
            <button
              onClick={resetToDemoData}
              title="Reset Demo Dataset to initial state"
              className="hidden lg:flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
              <span>Reset Data</span>
            </button>

            <Link
              to="/add-activity"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-[#166534] hover:bg-[#14532d] text-white text-xs sm:text-sm font-semibold shadow-xs hover:shadow-md transition-all active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Add Activity</span>
            </Link>

            {/* User Avatar */}
            <Link
              to="/settings"
              className="flex items-center gap-2 pl-2 border-l border-gray-200 text-gray-700 hover:text-emerald-700"
              title="Profile & Settings"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-200">
                AS
              </div>
            </Link>
          </div>
        </div>

        {/* Mobile View Sub-header */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-gray-100 text-xs text-gray-600">
          <div className="flex items-center gap-1.5 font-medium">
            {workspaceLabels[workspaceType].icon}
            <span className="truncate max-w-[200px]">{workspaceLabels[workspaceType].label}</span>
          </div>
          <select
            value={reportingPeriod}
            onChange={(e) => setReportingPeriod(e.target.value as ReportingPeriod)}
            className="text-xs bg-gray-50 border border-gray-200 rounded px-2 py-1"
          >
            {periodOptions.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </header>
  );
};
