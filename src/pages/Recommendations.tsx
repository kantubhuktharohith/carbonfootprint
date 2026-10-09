import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Lightbulb,
  Sparkles,
  Zap,
  Car,
  UtensilsCrossed,
  Trash2,
  CheckCircle2,
  ArrowRight,
  SlidersHorizontal,
  Clock,
  Coins,
  Gauge,
  ChevronDown,
  ChevronUp,
  ShieldAlert,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityCategory, Recommendation } from '../types';

export const Recommendations: React.FC = () => {
  const navigate = useNavigate();
  const { recommendations, activities } = useApp();

  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [expandedRecId, setExpandedRecId] = useState<string | null>(null);

  const filtered = recommendations.filter((r) => {
    return categoryFilter === 'all' || r.category === categoryFilter;
  });

  const categoryIcons: Record<ActivityCategory, React.ReactNode> = {
    electricity: <Zap className="w-4 h-4 text-emerald-700" />,
    transportation: <Car className="w-4 h-4 text-sky-700" />,
    food: <UtensilsCrossed className="w-4 h-4 text-amber-700" />,
    waste: <Trash2 className="w-4 h-4 text-purple-700" />,
  };

  const difficultyBadges = {
    easy: { text: 'Easy Effort', bg: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
    medium: { text: 'Medium Effort', bg: 'bg-amber-50 text-amber-800 border-amber-200' },
    hard: { text: 'High Effort', bg: 'bg-red-50 text-red-800 border-red-200' },
  };

  const costBadges = {
    zero: { text: 'Zero Cost', bg: 'bg-emerald-50 text-emerald-800' },
    low: { text: 'Low Cost', bg: 'bg-blue-50 text-blue-800' },
    medium: { text: 'Moderate Investment', bg: 'bg-amber-50 text-amber-800' },
    high: { text: 'Capital Intensive', bg: 'bg-red-50 text-red-800' },
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
              Rule-Based Intelligence
            </span>
            <span className="text-xs text-gray-400">• Ranked by Impact</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
            Targeted Reduction Recommendations
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            Algorithmically generated from your {activities.length} recorded activities to prioritize the highest emission reductions.
          </p>
        </div>

        <button
          onClick={() => navigate('/simulator')}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all self-start sm:self-auto"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>Open Impact Simulator</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {[
          { id: 'all', label: `All Interventions (${recommendations.length})` },
          { id: 'electricity', label: 'Electricity & Energy ⚡' },
          { id: 'transportation', label: 'Mobility & Transit 🚗' },
          { id: 'food', label: 'Food & Dining 🥗' },
          { id: 'waste', label: 'Waste Management 🗑️' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setCategoryFilter(tab.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              categoryFilter === tab.id
                ? 'bg-[#166534] text-white shadow-2xs'
                : 'bg-white border border-gray-200/80 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Recommendations Cards Grid */}
      <div className="space-y-4">
        {filtered.map((rec, index) => {
          const isExpanded = expandedRecId === rec.id;
          return (
            <div
              key={rec.id}
              className="bg-white rounded-3xl border border-gray-200/80 shadow-xs hover:shadow-md transition-all overflow-hidden"
            >
              <div className="p-5 sm:p-6">
                {/* Card Top Meta */}
                <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-gray-100 flex items-center justify-center font-bold text-xs text-gray-700">
                      #{index + 1}
                    </div>
                    <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-800">
                      {categoryIcons[rec.category]}
                      {rec.category.toUpperCase()}
                    </span>
                    <span
                      className={`text-xs font-semibold px-2.5 py-0.5 rounded-full border ${
                        difficultyBadges[rec.difficulty].bg
                      }`}
                    >
                      {difficultyBadges[rec.difficulty].text}
                    </span>
                  </div>

                  {/* Estimated Savings Pill */}
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-extrabold text-sm">
                    <Sparkles className="w-4 h-4 text-[#10B981]" />
                    <span>Save ~{rec.estimated_savings.toLocaleString()} kg CO2e</span>
                  </div>
                </div>

                {/* Title & Explanation */}
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">{rec.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
                  {rec.explanation}
                </p>

                {/* Two-Column Comparison: Baseline vs Suggested Change */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4">
                  <div className="p-3.5 rounded-2xl bg-gray-50 border border-gray-200/70 text-xs">
                    <span className="font-bold text-gray-500 uppercase text-[10px] tracking-wider block mb-1">
                      Identified Baseline Activity
                    </span>
                    <p className="text-gray-800 font-medium">{rec.baseline_activity}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-emerald-50/60 border border-emerald-200/70 text-xs">
                    <span className="font-bold text-emerald-800 uppercase text-[10px] tracking-wider block mb-1">
                      Targeted Action
                    </span>
                    <p className="text-emerald-900 font-medium">{rec.suggested_change}</p>
                  </div>
                </div>

                {/* Operational Badges */}
                <div className="flex flex-wrap items-center gap-4 mt-4 pt-4 border-t border-gray-100 text-xs text-gray-500">
                  <span className="flex items-center gap-1.5">
                    <Coins className="w-4 h-4 text-gray-400" />
                    <span>Cost: {costBadges[rec.estimated_cost].text}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4 text-gray-400" />
                    <span>Timeframe: {rec.timeframe}</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Gauge className="w-4 h-4 text-gray-400" />
                    <span>Difficulty: {rec.difficulty}</span>
                  </span>
                </div>

                {/* Expanded Details: Assumptions & Next Steps */}
                {isExpanded && (
                  <div className="mt-4 pt-4 border-t border-gray-100 space-y-4 animate-in fade-in duration-200">
                    <div>
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-1.5">
                        Calculation Assumptions
                      </h4>
                      <p className="text-xs text-gray-600 bg-gray-50 p-3 rounded-xl border border-gray-200/60 leading-relaxed font-mono">
                        {rec.assumptions}
                      </p>
                    </div>

                    <div>
                      <h4 className="text-xs font-bold text-gray-700 uppercase tracking-wider mb-2">
                        Suggested Next Steps
                      </h4>
                      <div className="space-y-2">
                        {rec.next_steps.map((step, idx) => (
                          <div
                            key={idx}
                            className="flex items-start gap-2.5 text-xs text-gray-700 bg-emerald-50/40 p-2.5 rounded-xl border border-emerald-100/60"
                          >
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                            <span>{step}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Card Action Footer */}
                <div className="mt-4 pt-4 border-t border-gray-100 flex items-center justify-between">
                  <button
                    onClick={() => setExpandedRecId(isExpanded ? null : rec.id)}
                    className="inline-flex items-center gap-1 text-xs font-bold text-gray-500 hover:text-gray-800 transition-colors"
                  >
                    <span>{isExpanded ? 'Hide Assumptions & Steps' : 'View Action Steps & Assumptions'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>

                  <button
                    onClick={() => navigate('/simulator')}
                    className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-emerald-100/70 hover:bg-emerald-200 text-[#166534] text-xs font-bold transition-all"
                  >
                    <span>Simulate in Model</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Transparency Disclaimer */}
      <div className="rounded-2xl p-4 bg-amber-50/70 border border-amber-200/70 text-xs text-amber-900 flex items-start gap-3">
        <ShieldAlert className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
        <div className="leading-relaxed">
          <span className="font-bold">Estimation Notice: </span>
          Projected emissions savings represent mathematical approximations derived from published emission factors.
          They do not guarantee certified reduction credits without formal verification and meter sub-metering.
        </div>
      </div>
    </div>
  );
};
