import React from 'react';
import { useApp } from '../context/AppContext';
import { DashboardHeader } from '../components/dashboard/DashboardHeader';
import { SummaryCards } from '../components/dashboard/SummaryCards';
import { CategoryDonutChart } from '../components/charts/CategoryDonutChart';
import { CategoryBarChart } from '../components/charts/CategoryBarChart';
import { TimelineChart } from '../components/charts/TimelineChart';
import { RecentActivitiesTable } from '../components/dashboard/RecentActivitiesTable';
import { PieChart as PieIcon, BarChart3, LineChart, ShieldCheck } from 'lucide-react';

export const Dashboard: React.FC = () => {
  const {
    activities,
    loading,
    workspaceType,
    totalEmissionsKg,
    categorySummaries,
    perPersonEmissionsKg,
    highestCategory,
    periodComparison,
    potentialSavings,
    recommendations,
    event,
    organization,
    profile,
  } = useApp();

  const workspaceName =
    workspaceType === 'event'
      ? event?.name || 'Event Workspace'
      : workspaceType === 'institution'
      ? organization?.name || 'Institution Workspace'
      : profile?.full_name || 'Individual Workspace';

  const topRec = recommendations.length > 0 ? recommendations[0] : undefined;

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-28 bg-gray-200 rounded-2xl" />
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="h-28 bg-gray-200 rounded-2xl" />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="h-72 bg-gray-200 rounded-2xl" />
          <div className="h-72 bg-gray-200 rounded-2xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Workspace Context */}
      

      {/* 2. Top Summary Metrics Cards */}
      <SummaryCards
        totalEmissionsKg={totalEmissionsKg}
        categorySummaries={categorySummaries}
        periodComparison={periodComparison}
        potentialSavings={potentialSavings}
      />

      {/* 3. Visual Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Donut Chart: Category Share */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <PieIcon className="w-4 h-4 text-[#166534]" />
                Emissions by Category
              </h2>
              <span className="text-xs text-gray-400 font-medium">Percent split</span>
            </div>
            <p className="text-xs text-gray-500">
              Proportion of greenhouse gas emissions across operational scopes
            </p>
          </div>

          <CategoryDonutChart categories={categorySummaries} totalKg={totalEmissionsKg} />

          {/* Legend Badges */}
          <div className="grid grid-cols-2 gap-2 pt-3 border-t border-gray-100 text-xs">
            {categorySummaries.map((cat) => (
              <div key={cat.category} className="flex items-center justify-between">
                <div className="flex items-center gap-1.5 truncate">
                  <span
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-gray-600 truncate">{cat.label.split(' ')[0]}</span>
                </div>
                <span className="font-bold text-gray-900 ml-1">{cat.percentage}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bar Chart: Category Emissions Comparison */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <BarChart3 className="w-4 h-4 text-[#166534]" />
                Category Comparisons
              </h2>
              <span className="text-xs text-gray-400 font-medium">kg CO2e</span>
            </div>
            <p className="text-xs text-gray-500">
              Absolute magnitude comparison highlighting key intervention areas
            </p>
          </div>

          <CategoryBarChart categories={categorySummaries} />

          <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
            <span>Primary Focus:</span>
            <span className="font-semibold text-emerald-800">
              {highestCategory?.label || 'Electricity'}
            </span>
          </div>
        </div>

        {/* Area Chart: Emissions Over Time */}
        <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <h2 className="text-base font-bold text-gray-900 flex items-center gap-2">
                <LineChart className="w-4 h-4 text-[#166534]" />
                Emissions Over Time
              </h2>
              <span className="text-xs text-gray-400 font-medium">Daily trend</span>
            </div>
            <p className="text-xs text-gray-500">
              Day-by-day progression during the active reporting conclave
            </p>
          </div>

          <TimelineChart activities={activities} />

          <div className="pt-3 border-t border-gray-100 text-xs text-gray-500 flex items-center justify-between">
            <span>Logged Days:</span>
            <span className="font-semibold text-gray-800">
              {new Set(activities.map((a) => a.activity_date)).size} dates recorded
            </span>
          </div>
        </div>
      </div>

      {/* 4. Recent Activities Table */}
      <RecentActivitiesTable activities={activities} />

      {/* 5. Methodology & Non-Regulatory Notice */}
      <div className="rounded-xl p-4 bg-gray-100/60 border border-gray-200/60 text-[11px] text-gray-500 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-gray-700">Transparency & Methodology: </span>
          EcoTrack AI calculates Scope 1-3 greenhouse gas emissions using published emission factors
          from the Central Electricity Authority (CEA India Database v19, 2024), UK DEFRA 2024, US EPA eGRID, and Poore & Nemecek (2018).
          This platform is designed for internal sustainability monitoring, hackathon carbon accounting, and reduction simulation, and does not claim ISO 14064 certification.
        </div>
      </div>
    </div>
  );
};
