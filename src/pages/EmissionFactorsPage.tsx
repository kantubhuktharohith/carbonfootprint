import React, { useState } from 'react';
import {
  BookOpenCheck,
  Search,
  ExternalLink,
  ShieldCheck,
  AlertTriangle,
  Zap,
  Car,
  UtensilsCrossed,
  Trash2,
} from 'lucide-react';
import { EMISSION_FACTORS } from '../data/emissionFactors';
import { ActivityCategory } from '../types';

export const EmissionFactorsPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filtered = EMISSION_FACTORS.filter((factor) => {
    const matchCat = selectedCategory === 'all' || factor.category === selectedCategory;
    const matchQuery =
      searchQuery === '' ||
      factor.activity_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      factor.region.toLowerCase().includes(searchQuery.toLowerCase()) ||
      factor.source_name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchQuery;
  });

  const categoryIcons: Record<ActivityCategory, React.ReactNode> = {
    electricity: <Zap className="w-4 h-4 text-emerald-700" />,
    transportation: <Car className="w-4 h-4 text-sky-700" />,
    food: <UtensilsCrossed className="w-4 h-4 text-amber-700" />,
    waste: <Trash2 className="w-4 h-4 text-purple-700" />,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-full">
            Transparent Data Engine
          </span>
          <span className="text-xs text-gray-400">• Published Citations</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#1F2937] tracking-tight">
          Emission Factor Registry
        </h1>
        <p className="text-xs sm:text-sm text-gray-500 mt-1 max-w-2xl">
          Every calculation performed in EcoTrack AI maps to verified public databases with explicit source citations and calculation assumptions.
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Search factors, regions, sources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3.5 py-2 text-xs text-gray-800 focus:ring-2 focus:ring-[#10B981]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-1.5 w-full md:w-auto">
          {[
            { id: 'all', label: 'All Factors' },
            { id: 'electricity', label: 'Electricity ⚡' },
            { id: 'transportation', label: 'Transport 🚗' },
            { id: 'food', label: 'Food 🥗' },
            { id: 'waste', label: 'Waste 🗑️' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedCategory(tab.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                selectedCategory === tab.id
                  ? 'bg-[#166534] text-white shadow-2xs'
                  : 'bg-gray-100/80 text-gray-600 hover:bg-gray-200/80'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Factors Table / Cards */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Activity Type</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4 text-right">Factor Value</th>
                <th className="py-3.5 px-4">Region</th>
                <th className="py-3.5 px-4">Source Citation</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Calculation Notes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map((f) => (
                <tr key={f.id} className="hover:bg-gray-50/50">
                  <td className="py-3.5 px-4 font-bold text-gray-900 whitespace-nowrap">
                    {f.activity_type.replace(/_/g, ' ')}
                  </td>
                  <td className="py-3.5 px-4 whitespace-nowrap">
                    <span className="inline-flex items-center gap-1 font-semibold text-gray-700">
                      {categoryIcons[f.category]}
                      {f.category}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-right whitespace-nowrap">
                    <span className="font-mono font-black text-gray-900 text-sm">
                      {f.value.toFixed(4)}
                    </span>
                    <span className="text-[11px] text-gray-500 ml-1">kg CO2e/{f.unit}</span>
                  </td>
                  <td className="py-3.5 px-4 text-gray-600 whitespace-nowrap">{f.region}</td>
                  <td className="py-3.5 px-4 max-w-xs">
                    <div className="font-semibold text-gray-900 truncate">{f.source_name}</div>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] text-gray-400">Year: {f.reporting_year}</span>
                      {f.source_url && (
                        <a
                          href={f.source_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-700 hover:underline"
                        >
                          <span>URL</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </a>
                      )}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center whitespace-nowrap">
                    {f.is_verified ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 text-[10px] font-bold border border-emerald-200">
                        <ShieldCheck className="w-3 h-3 text-[#10B981]" />
                        Verified
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-50 text-amber-800 text-[10px] font-bold border border-amber-200">
                        <AlertTriangle className="w-3 h-3 text-amber-600" />
                        Illustrative
                      </span>
                    )}
                  </td>
                  <td className="py-3.5 px-4 text-gray-500 max-w-sm text-[11px] leading-relaxed">
                    {f.notes}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
