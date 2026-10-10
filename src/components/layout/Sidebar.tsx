import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  ClipboardList,
  PlusCircle,
  BarChart3,
  Lightbulb,
  SlidersHorizontal,
  BookOpenCheck,
  Settings,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onCloseMobile,
}) => {
  const { activities, recommendations } = useApp();

  const navItems = [
    {
      to: '/',
      label: 'Dashboard',
      icon: LayoutDashboard,
      badge: null,
    },
    {
      to: '/activities',
      label: 'Activities',
      icon: ClipboardList,
      badge: activities.length,
    },
    {
      to: '/add-activity',
      label: 'Add Activity',
      icon: PlusCircle,
      badge: null,
    },
    {
      to: '/analytics',
      label: 'Analytics & Reports',
      icon: BarChart3,
      badge: null,
    },
    {
      to: '/recommendations',
      label: 'Recommendations',
      icon: Lightbulb,
      badge: recommendations.length,
    },
    {
      to: '/simulator',
      label: 'Impact Simulator',
      icon: SlidersHorizontal,
      badge: 'Interactive',
    },
    {
      to: '/settings',
      label: 'Settings & Audit',
      icon: Settings,
      badge: null,
    },
  ];

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-xs lg:hidden no-print"
          onClick={onCloseMobile}
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed top-16 bottom-0 left-0 z-40 bg-white border-r border-gray-200/80 transition-all duration-300 ease-in-out flex flex-col no-print
          ${collapsed ? 'w-20' : 'w-64'}
          ${mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Navigation Menu */}
        <div className="flex-1 py-4 px-3 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                onClick={onCloseMobile}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group ${
                    isActive
                      ? 'bg-emerald-50 text-[#166534] font-semibold shadow-2xs border-l-4 border-[#166534]'
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100/70'
                  }`
                }
                title={collapsed ? item.label : undefined}
              >
                <Icon className="w-5 h-5 shrink-0 text-gray-500 group-hover:text-[#166534] transition-colors" />
                
                {!collapsed && (
                  <div className="flex-1 flex items-center justify-between overflow-hidden">
                    <span className="truncate">{item.label}</span>
                    {item.badge !== null && (
                      <span
                        className={`text-[11px] font-semibold px-2 py-0.5 rounded-full ${
                          typeof item.badge === 'number'
                            ? 'bg-emerald-100 text-[#166534]'
                            : 'bg-emerald-600 text-white text-[10px]'
                        }`}
                      >
                        {item.badge}
                      </span>
                    )}
                  </div>
                )}
              </NavLink>
            );
          })}
        </div>

        {/* Environmental Audit Footnote Card (when expanded) */}
        {!collapsed && (
          <div className="p-4 m-3 rounded-2xl bg-gradient-to-br from-emerald-50 to-green-50 border border-emerald-100">
            <div className="flex items-center gap-2 mb-1.5 text-xs font-semibold text-emerald-900">
              <ShieldCheck className="w-4 h-4 text-[#10B981]" />
              <span>GHG Protocol Screening</span>
            </div>
            <p className="text-[11px] text-emerald-700 leading-relaxed">
              CEA v19 & DEFRA 2024 calculation factors. Verified formulas with zero duplicate counting.
            </p>
          </div>
        )}

        {/* Desktop Collapse Toggle */}
        <div className="hidden lg:flex p-3 border-t border-gray-100 justify-end">
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
            aria-label="Toggle sidebar width"
          >
            {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
      </aside>
    </>
  );
};
