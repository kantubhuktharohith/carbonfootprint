import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Leaf,Menu } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReportingPeriod } from '../../types';

interface NavbarProps {
  onToggleSidebar?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onToggleSidebar }) => {
  const {
    reportingPeriod,
    setReportingPeriod,
    profile,
  } = useApp();
  const profileInitials = profile?.full_name
    ? profile.full_name
        .split(/\s+/)
        .map((name) => name[0])
        .join('')
        .slice(0, 2)
        .toUpperCase()
    : 'U';


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

            
          </div>

          {/* Center: Workspace Switcher & Period Selector */}
          <div className="hidden md:flex items-center gap-3">
            {/* Workspace Type Selector */}
            <div className="flex items-center bg-gray-100/80 p-1 rounded-xl border border-gray-200/60">
              
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

          {/* Right Action: Add Activity CTA */}
          <div className="flex items-center gap-2.5">
            

            {/* User Avatar */}
            <Link
              to="/settings"
              className="flex items-center gap-2 pl-2 border-l border-gray-200 text-gray-700 hover:text-emerald-700"
              title="Profile & Settings"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-800 font-bold flex items-center justify-center text-xs border border-emerald-200">
                {profileInitials}
              </div>
            </Link>
          </div>
        </div>

        {/* Mobile View Sub-header */}
        <div className="flex md:hidden items-center justify-between py-2 border-t border-gray-100 text-xs text-gray-600">
          
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
