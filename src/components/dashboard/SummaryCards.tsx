import React from 'react';
import {
  Zap,
  Car,
  UtensilsCrossed,
  Trash2,
  TrendingDown,
  TrendingUp,
  CloudRain,
  Sparkles,
} from 'lucide-react';
import { CategorySummary } from '../../types';

interface SummaryCardsProps {
  totalEmissionsKg: number;
  categorySummaries: CategorySummary[];
  periodComparison: {
    diffKg: number;
    diffPercentage: number;
    trend: 'increased' | 'decreased' | 'unchanged';
  };
  potentialSavings: {
    potentialSavingsKg: number;
    percentage: number;
  };
}

export const SummaryCards: React.FC<SummaryCardsProps> = ({
  totalEmissionsKg,
  categorySummaries,
  periodComparison,
  potentialSavings,
}) => {
  const elecSummary = categorySummaries.find((c) => c.category === 'electricity');
  const transSummary = categorySummaries.find((c) => c.category === 'transportation');
  const foodSummary = categorySummaries.find((c) => c.category === 'food');
  const wasteSummary = categorySummaries.find((c) => c.category === 'waste');

  const totalTons = (totalEmissionsKg / 1000).toFixed(2);

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4">
      {/* 1. Grand Total Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-emerald-900/10 shadow-xs hover:shadow-md transition-shadow relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-0 opacity-60 group-hover:scale-110 transition-transform" />
        <div className="relative z-10 flex flex-col justify-between h-full">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
              Total Footprint
            </span>
            <div className="w-8 h-8 rounded-lg bg-emerald-100/70 text-[#166534] flex items-center justify-center">
              <CloudRain className="w-4 h-4" />
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-1.5">
              <span className="text-2xl font-black text-[#166534] tracking-tight">
                {totalEmissionsKg.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-gray-500">kg CO2e</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-0.5">≈ {totalTons} metric tons CO2e</p>
          </div>

          <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center gap-1.5 text-xs">
            {periodComparison.trend === 'decreased' ? (
              <span className="inline-flex items-center text-emerald-700 font-semibold gap-0.5 bg-emerald-50 px-1.5 py-0.5 rounded">
                <TrendingDown className="w-3.5 h-3.5" />
                {Math.abs(periodComparison.diffPercentage)}% vs last period
              </span>
            ) : periodComparison.trend === 'increased' ? (
              <span className="inline-flex items-center text-amber-700 font-semibold gap-0.5 bg-amber-50 px-1.5 py-0.5 rounded">
                <TrendingUp className="w-3.5 h-3.5" />
                +{periodComparison.diffPercentage}% vs last period
              </span>
            ) : (
              <span className="text-gray-500 text-[11px]">Consistent baseline</span>
            )}
          </div>
        </div>
      </div>

      {/* 2. Electricity Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Electricity
          </span>
          <div className="w-8 h-8 rounded-lg bg-green-50 text-emerald-800 flex items-center justify-center">
            <Zap className="w-4 h-4 text-[#166534]" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              {elecSummary?.totalKg.toLocaleString() || 0}
            </span>
            <span className="text-xs text-gray-500">kg</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {elecSummary?.percentage || 0}% of total footprint
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <span>{elecSummary?.activityCount || 0} meters/logs</span>
          <span className="text-emerald-700 font-medium">Scope 2</span>
        </div>
      </div>

      {/* 3. Transportation Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Transport
          </span>
          <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-700 flex items-center justify-center">
            <Car className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              {transSummary?.totalKg.toLocaleString() || 0}
            </span>
            <span className="text-xs text-gray-500">kg</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {transSummary?.percentage || 0}% of total footprint
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <span>{transSummary?.activityCount || 0} journeys</span>
          <span className="text-sky-700 font-medium">Scope 3</span>
        </div>
      </div>

      {/* 4. Food Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Food & Dining
          </span>
          <div className="w-8 h-8 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center">
            <UtensilsCrossed className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              {foodSummary?.totalKg.toLocaleString() || 0}
            </span>
            <span className="text-xs text-gray-500">kg</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {foodSummary?.percentage || 0}% of total footprint
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <span>{foodSummary?.activityCount || 0} meal batches</span>
          <span className="text-amber-700 font-medium">Scope 3</span>
        </div>
      </div>

      {/* 5. Waste Card */}
      <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
            Waste
          </span>
          <div className="w-8 h-8 rounded-lg bg-purple-50 text-purple-700 flex items-center justify-center">
            <Trash2 className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold text-gray-900 tracking-tight">
              {wasteSummary?.totalKg.toLocaleString() || 0}
            </span>
            <span className="text-xs text-gray-500">kg</span>
          </div>
          <p className="text-[11px] text-gray-500 mt-0.5">
            {wasteSummary?.percentage || 0}% of total footprint
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
          <span>{wasteSummary?.activityCount || 0} disposal batches</span>
          <span className="text-purple-700 font-medium">Scope 3</span>
        </div>
      </div>

      {/* 6. Potential Savings Card */}
      <div className="bg-gradient-to-br from-emerald-500/10 via-teal-50 to-emerald-50 rounded-2xl p-4 sm:p-5 border border-emerald-200 shadow-xs hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-emerald-900 uppercase tracking-wider">
            Potential Savings
          </span>
          <div className="w-8 h-8 rounded-lg bg-[#10B981] text-white flex items-center justify-center shadow-xs">
            <Sparkles className="w-4 h-4" />
          </div>
        </div>

        <div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-emerald-800 tracking-tight">
              {potentialSavings.potentialSavingsKg.toLocaleString()}
            </span>
            <span className="text-xs font-bold text-emerald-700">kg</span>
          </div>
          <p className="text-[11px] text-emerald-800 mt-0.5">
            Achievable target (-{potentialSavings.percentage}%)
          </p>
        </div>

        <div className="mt-3 pt-2.5 border-t border-emerald-200/60 flex items-center justify-between text-[11px] text-emerald-900 font-medium">
          <span>Simulate scenarios</span>
          <span className="text-xs font-bold">→</span>
        </div>
      </div>
    </div>
  );
};
