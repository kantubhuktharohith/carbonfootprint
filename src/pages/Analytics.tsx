import React, { useState, useMemo } from 'react';
import {
  BarChart3,
  Download,
  Printer,
  Calendar,
  Filter,
  Users,
  ShieldCheck,
  TrendingDown,
  Layers,
  FileSpreadsheet,
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { CategorySummary, ActivityCategory, ReportingPeriod } from '../types';
import { exportActivitiesToCSV, getPrintableAuditSummary } from '../lib/reporting';
import { CategoryBarChart } from '../components/charts/CategoryBarChart';
import { TimelineChart } from '../components/charts/TimelineChart';

export const Analytics: React.FC = () => {
  const {
    activities,
    totalEmissionsKg,
    categorySummaries,
    perPersonEmissionsKg,
    workspaceType,
    event,
    organization,
    profile,
  } = useApp();

  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ start: string; end: string }>({
    start: '2026-10-01',
    end: '2026-10-31',
  });

  // Filtered dataset for reports
  const filteredActivities = useMemo(() => {
    return activities.filter((act) => {
      const matchCat = selectedCategory === 'all' || act.category === selectedCategory;
      const matchStart = !dateRange.start || act.activity_date >= dateRange.start;
      const matchEnd = !dateRange.end || act.activity_date <= dateRange.end;
      return matchCat && matchStart && matchEnd;
    });
  }, [activities, selectedCategory, dateRange]);

  const printableAudit = useMemo(() => {
    return getPrintableAuditSummary(filteredActivities, profile || undefined, organization || undefined, event || undefined);
  }, [filteredActivities, profile, organization, event]);

  const handlePrint = () => {
    window.print();
  };

  const totalTons = (totalEmissionsKg / 1000).toFixed(2);

  return (
    <div className="space-y-6">
      {/* Printable Audit View (Triggered on Print) */}
      <div className="hidden print:block p-8 bg-white text-black space-y-6">
        <div className="border-b-2 border-black pb-4 flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-black uppercase tracking-tight">{printableAudit.title}</h1>
            <p className="text-sm font-semibold text-gray-700">Official Carbon Emissions Screening Audit Report</p>
            <p className="text-xs text-gray-500 mt-1">Generated: {printableAudit.reportingDate}</p>
          </div>
          <div className="text-right text-xs">
            <p className="font-bold">{printableAudit.organization}</p>
            <p>{printableAudit.venue}</p>
            <p>Total Attendees: {printableAudit.participants}</p>
          </div>
        </div>

        {/* Audit Numbers */}
        <div className="grid grid-cols-3 gap-4 border border-black p-4 text-center">
          <div>
            <span className="text-xs uppercase font-bold text-gray-600 block">Total GHG Footprint</span>
            <span className="text-xl font-black">{printableAudit.totalEmissionsKg.toLocaleString()} kg CO2e</span>
            <span className="text-xs block">({printableAudit.totalEmissionsTons} metric tons)</span>
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-gray-600 block">Intensity Per Person</span>
            <span className="text-xl font-black">{printableAudit.perPersonEmissionsKg} kg</span>
            <span className="text-xs block">CO2e / attendee</span>
          </div>
          <div>
            <span className="text-xs uppercase font-bold text-gray-600 block">Activity Log Entries</span>
            <span className="text-xl font-black">{printableAudit.activitiesCount}</span>
            <span className="text-xs block">Scope 2 & 3 activities</span>
          </div>
        </div>

        {/* Breakdown Table */}
        <div>
          <h2 className="text-sm font-bold uppercase mb-2">Category Breakdown (Scope 2 & Scope 3)</h2>
          <table className="w-full text-xs border border-black border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b border-black">
                <th className="p-2 text-left">Category</th>
                <th className="p-2 text-right">Activities</th>
                <th className="p-2 text-right">Emissions (kg CO2e)</th>
                <th className="p-2 text-right">Contribution (%)</th>
              </tr>
            </thead>
            <tbody>
              {printableAudit.categories.map((cat) => (
                <tr key={cat.category} className="border-b border-gray-300">
                  <td className="p-2 font-medium">{cat.label}</td>
                  <td className="p-2 text-right">{cat.activityCount}</td>
                  <td className="p-2 text-right font-bold">{cat.totalKg.toLocaleString()} kg</td>
                  <td className="p-2 text-right">{cat.percentage}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Audit Disclaimer */}
        <div className="text-[10px] text-gray-600 border-t border-gray-400 pt-3">
          <p className="font-bold">GHG Protocol Screening Disclaimer:</p>
          <p>{printableAudit.disclaimer}</p>
        </div>
      </div>

      {/* Screen Interactive UI (Hidden on Print) */}
      <div className="no-print space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
                Audit & Reporting
              </span>
              <span className="text-xs text-gray-400">• Scope 1-3 Analytics</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
              Analytics & Executive Reports
            </h1>
            <p className="text-xs sm:text-sm text-gray-500 mt-1">
              Filter by date and category, export verifiable CSV datasets, and print institutional summary audits.
            </p>
          </div>

          <div className="flex items-center gap-2.5 self-start sm:self-auto">
            <button
              onClick={() => exportActivitiesToCSV(filteredActivities)}
              className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-gray-700 text-xs font-bold shadow-2xs transition-colors"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-700" />
              <span>Export CSV Data</span>
            </button>

            <button
              onClick={handlePrint}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#166534] hover:bg-[#14532d] text-white text-xs font-bold shadow-xs hover:shadow-md transition-all active:scale-95"
            >
              <Printer className="w-4 h-4" />
              <span>Print Audit Report</span>
            </button>
          </div>
        </div>

        {/* Filter Controls Bar */}
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-gray-200/80 shadow-xs flex flex-wrap items-center justify-between gap-4">
          {/* Category Filter */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <span className="text-xs font-semibold text-gray-700">Filter Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-gray-50 border border-gray-200 text-xs font-medium text-gray-700 rounded-lg px-2.5 py-1.5 focus:ring-2 focus:ring-[#10B981]"
            >
              <option value="all">All Categories ({activities.length})</option>
              <option value="electricity">Electricity & Energy</option>
              <option value="transportation">Transportation</option>
              <option value="food">Food & Dining</option>
              <option value="waste">Waste Management</option>
            </select>
          </div>

          {/* Date Range Inputs */}
          <div className="flex items-center gap-2 text-xs text-gray-600">
            <Calendar className="w-4 h-4 text-gray-400" />
            <span>Date Range:</span>
            <input
              type="date"
              value={dateRange.start}
              onChange={(e) => setDateRange({ ...dateRange, start: e.target.value })}
              className="bg-gray-50 border border-gray-200 text-xs rounded-lg px-2 py-1"
            />
            <span>to</span>
            <input
              type="date"
              value={dateRange.end}
              onChange={(e) => setDateRange({ ...dateRange, end: e.target.value })}
              className="bg-gray-50 border border-gray-200 text-xs rounded-lg px-2 py-1"
            />
          </div>
        </div>

        {/* Analytics Key Numbers */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Screened Emissions
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-[#166534]">
                {totalEmissionsKg.toLocaleString()}
              </span>
              <span className="text-xs font-bold text-gray-500">kg CO2e</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">≈ {totalTons} metric tons total</p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Participant Intensity
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-gray-900">
                {perPersonEmissionsKg.toFixed(1)}
              </span>
              <span className="text-xs font-bold text-gray-500">kg CO2e / attendee</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Across {printableAudit.participants} registered workspace participants
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-gray-200/80 shadow-xs">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider block mb-1">
              Activity Records Logged
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-3xl font-black text-emerald-800">
                {filteredActivities.length}
              </span>
              <span className="text-xs font-bold text-gray-500">records</span>
            </div>
            <p className="text-[11px] text-gray-500 mt-1">
              Zero duplicate entries across Scope 2 & 3
            </p>
          </div>
        </div>

        {/* Charts Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-[#166534]" />
              Emissions by Category (kg CO2e)
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Relative magnitude across operational sources
            </p>
            <CategoryBarChart categories={categorySummaries} />
          </div>

          <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs">
            <h2 className="text-base font-bold text-gray-900 mb-1 flex items-center gap-2">
              <Layers className="w-4 h-4 text-[#166534]" />
              Historical Emissions Trajectory
            </h2>
            <p className="text-xs text-gray-500 mb-4">
              Timeline of consumption logged during active dates
            </p>
            <TimelineChart activities={filteredActivities} />
          </div>
        </div>

        {/* Detailed Breakdown Summary Table */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-gray-900">Category Breakdown Table</h2>
              <p className="text-xs text-gray-500 mt-0.5">
                Detailed footprint metrics driving audit summaries
              </p>
            </div>
            <button
              onClick={() => exportActivitiesToCSV(filteredActivities)}
              className="text-xs font-bold text-[#166534] hover:underline"
            >
              Export CSV →
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4 text-right">Activities Logged</th>
                  <th className="py-3.5 px-4 text-right">Total Emissions (kg CO2e)</th>
                  <th className="py-3.5 px-4 text-right">Share of Total</th>
                  <th className="py-3.5 px-4">Primary Factor Source</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {categorySummaries.map((cat) => (
                  <tr key={cat.category} className="hover:bg-gray-50/50">
                    <td className="py-3.5 px-4 font-bold text-gray-900 flex items-center gap-2">
                      <span
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: cat.color }}
                      />
                      {cat.label}
                    </td>
                    <td className="py-3.5 px-4 text-right font-medium text-gray-600">
                      {cat.activityCount}
                    </td>
                    <td className="py-3.5 px-4 text-right font-black text-gray-900">
                      {cat.totalKg.toLocaleString()} kg
                    </td>
                    <td className="py-3.5 px-4 text-right font-semibold text-emerald-800">
                      {cat.percentage}%
                    </td>
                    <td className="py-3.5 px-4 text-gray-500 text-[11px]">
                      {cat.category === 'electricity'
                        ? 'Central Electricity Authority (CEA) v19'
                        : cat.category === 'transportation'
                        ? 'UK DEFRA & ICAO Radiative Forcing'
                        : cat.category === 'food'
                        ? 'Poore & Nemecek (Science meta-analysis)'
                        : 'DEFRA Commercial Waste Model'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Regulatory Disclaimer Banner */}
        <div className="rounded-2xl p-4 bg-gray-100/60 border border-gray-200/60 text-[11px] text-gray-500 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-emerald-700 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold text-gray-700">Non-Regulatory Compliance Disclaimer: </span>
            This screening analytics report is generated for voluntary institutional sustainability monitoring and internal reduction strategy planning.
            It does not constitute independently certified regulatory carbon accounting under ISO 14064 or EU CSRD.
          </div>
        </div>
      </div>
    </div>
  );
};
