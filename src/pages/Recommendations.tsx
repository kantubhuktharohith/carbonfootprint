import React, { useState, useMemo } from 'react';
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
  Send,
  RotateCcw,
  CheckCheck,
  CircleDot,
  BookmarkCheck,
  Target,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { ActivityCategory, Recommendation, UserRecommendationPreferences } from '../types';
import { generateRecommendations } from '../lib/recommendations';

export const Recommendations: React.FC = () => {
  const navigate = useNavigate();
  const { activities } = useApp();

  // User input preferences state
  const [preferences, setPreferences] = useState<UserRecommendationPreferences>({
    category: 'all',
    targetReductionPct: 35,
    budgetTier: 'all',
    difficulty: 'all',
    timeframe: 'all',
    customGoalText: '',
  });

  const [promptInput, setPromptInput] = useState('');
  const [expandedRecId, setExpandedRecId] = useState<string | null>(null);
  const [customAdoptions, setCustomAdoptions] = useState<Record<string, number>>({});
  const [recStatuses, setRecStatuses] = useState<Record<string, 'new' | 'in_progress' | 'completed'>>({});
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Generate recommendations based on activities and user preferences
  const recommendations = useMemo(() => {
    return generateRecommendations(activities, preferences);
  }, [activities, preferences]);

  // Handle user custom prompt submission
  const handleApplyCustomGoal = (e: React.FormEvent) => {
    e.preventDefault();
    if (!promptInput.trim()) return;

    setPreferences((prev) => ({
      ...prev,
      customGoalText: promptInput.trim(),
    }));

    setToastMessage(`Generated custom suggestions for: "${promptInput.trim()}"`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleQuickChipClick = (goalText: string) => {
    setPromptInput(goalText);
    setPreferences((prev) => ({
      ...prev,
      customGoalText: goalText,
    }));
    setToastMessage(`Applied goal: "${goalText}"`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleResetPreferences = () => {
    setPreferences({
      category: 'all',
      targetReductionPct: 35,
      budgetTier: 'all',
      difficulty: 'all',
      timeframe: 'all',
      customGoalText: '',
    });
    setPromptInput('');
    setCustomAdoptions({});
    setToastMessage('Reset recommendation filters to defaults.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleAdoptionSliderChange = (recId: string, baseSavings: number, pct: number) => {
    setCustomAdoptions((prev) => ({ ...prev, [recId]: pct }));
  };

  const toggleRecStatus = (recId: string) => {
    const current = recStatuses[recId] || 'new';
    const next = current === 'new' ? 'in_progress' : current === 'in_progress' ? 'completed' : 'new';
    setRecStatuses((prev) => ({ ...prev, [recId]: next }));
    const label = next === 'in_progress' ? 'marked In Progress' : next === 'completed' ? 'marked Completed' : 'reset to Proposed';
    setToastMessage(`Action ${label}.`);
    setTimeout(() => setToastMessage(null), 2500);
  };

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
      {/* Toast Alert */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-[#166534] text-white px-4 py-3 rounded-2xl shadow-lg flex items-center gap-2 text-xs font-semibold animate-in fade-in slide-in-from-bottom-3">
          <CheckCircle2 className="w-4 h-4 text-emerald-300" />
          <span>{toastMessage}</span>
        </div>
      )}

      

      

      {/* Filter Tabs Summary */}
      <div className="flex items-center justify-between">
        <div className="text-xs text-gray-500 font-medium">
          Showing <span className="font-bold text-gray-900">{recommendations.length}</span> recommendations
          {preferences.customGoalText && (
            <span className="ml-1 text-emerald-800 font-semibold">
              tailored to "{preferences.customGoalText}"
            </span>
          )}
        </div>
      </div>

      {/* Recommendations Cards Grid */}
      <div className="space-y-4">
        {recommendations.map((rec, index) => {
          const isExpanded = expandedRecId === rec.id;
          const userAdoptionPct = customAdoptions[rec.id] !== undefined ? customAdoptions[rec.id] : (rec.adoption_percentage || 40);
          const currentStatus = recStatuses[rec.id] || rec.status;

          // Scale estimated savings based on user adoption slider!
          const scaledSavings = Math.round((rec.estimated_savings * (userAdoptionPct / (rec.adoption_percentage || 40))) * 10) / 10;

          return (
            <div
              key={rec.id}
              className={`bg-white rounded-3xl border transition-all overflow-hidden ${
                currentStatus === 'completed'
                  ? 'border-emerald-300 bg-emerald-50/20'
                  : currentStatus === 'in_progress'
                  ? 'border-blue-300 ring-2 ring-blue-100'
                  : rec.user_customized
                  ? 'border-emerald-400 ring-2 ring-emerald-100 shadow-md'
                  : 'border-gray-200/80 shadow-xs hover:shadow-md'
              }`}
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
                    {rec.user_customized && (
                      <span className="text-[10px] font-bold px-2.5 py-0.5 rounded-full bg-purple-100 text-purple-900">
                        Custom User Goal
                      </span>
                    )}
                  </div>

                  {/* Status Toggle Button & Scaled Savings Pill */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => toggleRecStatus(rec.id)}
                      className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                        currentStatus === 'completed'
                          ? 'bg-emerald-600 text-white'
                          : currentStatus === 'in_progress'
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {currentStatus === 'completed' ? (
                        <>
                          <CheckCheck className="w-3.5 h-3.5" />
                          <span>Completed</span>
                        </>
                      ) : currentStatus === 'in_progress' ? (
                        <>
                          <CircleDot className="w-3.5 h-3.5 animate-pulse" />
                          <span>In Progress</span>
                        </>
                      ) : (
                        <>
                          <BookmarkCheck className="w-3.5 h-3.5" />
                          <span>Adopt Action</span>
                        </>
                      )}
                    </button>

                    <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 font-extrabold text-sm">
                      <Sparkles className="w-4 h-4 text-[#10B981]" />
                      <span>Save ~{scaledSavings.toLocaleString()} kg CO2e</span>
                    </div>
                  </div>
                </div>

                {/* Title & Explanation */}
                <h3 className="text-lg font-bold text-gray-900 tracking-tight">{rec.title}</h3>
                <p className="text-xs sm:text-sm text-gray-600 mt-1.5 leading-relaxed">
                  {rec.explanation}
                </p>

                {/* USER-INTERACTIVE ADOPTION SLIDER */}
                <div className="mt-4 p-4 rounded-2xl bg-gray-50/90 border border-gray-200/80 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-gray-700 flex items-center gap-1.5">
                      <Target className="w-3.5 h-3.5 text-[#166534]" />
                      Custom Implementation Intensity:
                    </span>
                    <span className="font-extrabold text-[#166534]">
                      {userAdoptionPct}% Target (Saves {scaledSavings.toLocaleString()} kg CO2e)
                    </span>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="100"
                    step="5"
                    value={userAdoptionPct}
                    onChange={(e) =>
                      handleAdoptionSliderChange(rec.id, rec.estimated_savings, parseInt(e.target.value, 10))
                    }
                    className="w-full accent-[#166534] cursor-pointer h-2 bg-gray-200 rounded-lg"
                  />
                  <div className="flex justify-between text-[10px] text-gray-400 font-medium">
                    <span>10% pilot testing</span>
                    <span>50% partial adoption</span>
                    <span>100% full institutional standard</span>
                  </div>
                </div>

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
                      Targeted Action Plan ({userAdoptionPct}% Intensity)
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
