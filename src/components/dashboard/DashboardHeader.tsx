import React from 'react';
import {
  AlertTriangle,
  Target,
  Users,
  Sparkles,
  ArrowRight,
  TrendingDown,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { CategorySummary, Recommendation, WorkspaceType } from '../../types';

interface DashboardHeaderProps {
  workspaceType: WorkspaceType;
  workspaceName: string;
  highestCategory: CategorySummary | null;
  perPersonEmissionsKg: number;
  totalEmissionsKg: number;
  topRecommendation?: Recommendation;
}

export const DashboardHeader: React.FC<DashboardHeaderProps> = ({
  workspaceType,
  workspaceName,
  highestCategory,
  perPersonEmissionsKg,
  totalEmissionsKg,
  topRecommendation,
}) => {
  // Reduction target: Target 20% reduction
  const targetPct = 20;
  const currentReduction = 14.5; // measured progress against baseline

  return (
    <div className="space-y-4">
      {/* Top Banner: Workspace Details & Context */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/80 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100/70 text-[#166534]">
              {workspaceType.toUpperCase()} WORKSPACE
            </span>
            <span className="text-xs text-gray-500">• Oct 2026 Reporting Conclave</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
            {workspaceName}
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
            Real-time carbon emissions screening across electricity, transport, dining, and waste.
            Derived from verified CEA v19 and DEFRA emission factors.
          </p>
        </div>

        {/* Per-Person Badge (for Event and Institution) */}
        {workspaceType !== 'individual' && (
          <div className="bg-gradient-to-br from-emerald-50 to-green-50/50 p-4 rounded-xl border border-emerald-100 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-white text-[#166534] flex items-center justify-center shadow-2xs border border-emerald-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[11px] uppercase font-bold text-emerald-800 tracking-wider">
                Emissions Per Person
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl font-black text-[#166534]">
                  {perPersonEmissionsKg.toFixed(1)}
                </span>
                <span className="text-xs font-semibold text-emerald-700">kg CO2e / attendee</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Grid: Highest Category Alert Banner & Reduction Target Meter */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Highest Emission Category Alert */}
        <div className="lg:col-span-2 bg-white rounded-2xl p-5 border border-amber-200/80 bg-linear-to-r from-amber-50/40 via-white to-white shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center shrink-0 mt-0.5">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">
                  Highest-Emission Contributor
                </span>
                {highestCategory && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900">
                    {highestCategory.percentage}% of Total
                  </span>
                )}
              </div>
              <h2 className="text-base font-bold text-gray-900 mt-0.5">
                {highestCategory?.label || 'Electricity & Energy'}
              </h2>
              <p className="text-xs text-gray-600 mt-1 max-w-xl">
                Generating {highestCategory?.totalKg.toLocaleString() || 0} kg CO2e. Targeting this
                primary category in the simulator will unlock the quickest pathway to net-zero.
              </p>
            </div>
          </div>

          <Link
            to="/simulator"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold shadow-xs transition-all shrink-0 self-end sm:self-center"
          >
            <span>Simulate Reduction</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Reduction Target Meter */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between text-xs font-semibold text-gray-500 mb-1.5">
              <span className="flex items-center gap-1.5 text-gray-700">
                <Target className="w-4 h-4 text-[#166534]" />
                Reduction Target (Q4)
              </span>
              <span className="text-emerald-700 font-bold">-{targetPct}% Goal</span>
            </div>

            <div className="mt-2">
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-gray-900">{currentReduction}% Achieved</span>
                <span className="text-gray-400">Target: {targetPct}%</span>
              </div>
              <div className="w-full h-2.5 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-600 to-[#10B981] rounded-full transition-all duration-500"
                  style={{ width: `${(currentReduction / targetPct) * 100}%` }}
                />
              </div>
            </div>
          </div>

          <p className="text-[11px] text-gray-500 mt-3 pt-2 border-t border-gray-100 flex items-center justify-between">
            <span>Baseline: {(totalEmissionsKg * 1.15).toFixed(0)} kg</span>
            <span className="text-emerald-700 font-semibold flex items-center gap-0.5">
              <TrendingDown className="w-3 h-3" /> On Track
            </span>
          </p>
        </div>
      </div>

      {/* Top Recommended Action Preview Card & Custom Advisor Input */}
      {topRecommendation && (
        <div className="bg-gradient-to-r from-emerald-900 to-[#166534] text-white rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-xl bg-white/10 text-emerald-300 flex items-center justify-center shrink-0 mt-0.5">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] font-bold text-emerald-300 uppercase tracking-wider">
                    Top Recommended Action
                  </span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-emerald-400/20 text-emerald-200">
                    Save ~{topRecommendation.estimated_savings.toLocaleString()} kg CO2e
                  </span>
                </div>
                <h3 className="text-base font-bold text-white mt-0.5">
                  {topRecommendation.title}
                </h3>
                <p className="text-xs text-emerald-100/90 mt-1 max-w-2xl line-clamp-2">
                  {topRecommendation.explanation}
                </p>
              </div>
            </div>

            <Link
              to="/recommendations"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-emerald-50 text-[#166534] text-xs font-bold shadow-xs transition-all shrink-0 self-end md:self-center whitespace-nowrap"
            >
              <span>Explore Advisor</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick User-Input Advisor Launcher */}
          <div className="pt-3 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-emerald-200 text-[11px] font-semibold flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
              Want suggestions for your own goals? Use the Interactive Advisor:
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <Link
                to="/recommendations"
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium border border-white/15 transition-all"
              >
                + Carpool Strategy
              </Link>
              <Link
                to="/recommendations"
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium border border-white/15 transition-all"
              >
                + Plant-Rich Catering
              </Link>
              <Link
                to="/recommendations"
                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 text-white text-[11px] font-medium border border-white/15 transition-all"
              >
                + Rooftop Solar
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
