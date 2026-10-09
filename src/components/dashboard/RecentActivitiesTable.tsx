import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap,
  Car,
  UtensilsCrossed,
  Trash2,
  ArrowRight,
  PlusCircle,
} from 'lucide-react';
import { ActivityCategory, ActivityRecord } from '../../types';

interface RecentActivitiesTableProps {
  activities: ActivityRecord[];
}

export const RecentActivitiesTable: React.FC<RecentActivitiesTableProps> = ({ activities }) => {
  const recent = activities.slice(0, 5);

  const categoryIcons: Record<ActivityCategory, React.ReactNode> = {
    electricity: <Zap className="w-3.5 h-3.5 text-emerald-700" />,
    transportation: <Car className="w-3.5 h-3.5 text-sky-700" />,
    food: <UtensilsCrossed className="w-3.5 h-3.5 text-amber-700" />,
    waste: <Trash2 className="w-3.5 h-3.5 text-purple-700" />,
  };

  const categoryBadges: Record<ActivityCategory, { bg: string; text: string; label: string }> = {
    electricity: { bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-800', label: 'Electricity' },
    transportation: { bg: 'bg-sky-50 border-sky-200', text: 'text-sky-800', label: 'Transport' },
    food: { bg: 'bg-amber-50 border-amber-200', text: 'text-amber-800', label: 'Food' },
    waste: { bg: 'bg-purple-50 border-purple-200', text: 'text-purple-800', label: 'Waste' },
  };

  if (recent.length === 0) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-xs text-center py-10">
        <p className="text-gray-500 text-sm">No activity records logged yet.</p>
        <Link
          to="/add-activity"
          className="inline-flex items-center gap-1.5 mt-3 text-xs font-semibold text-[#166534] hover:underline"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Record your first activity</span>
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-gray-200/80 shadow-xs overflow-hidden">
      <div className="p-5 border-b border-gray-100 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-gray-900">Recently Recorded Activities</h2>
          <p className="text-xs text-gray-500 mt-0.5">
            Latest Scope 2 and Scope 3 data entries driving your dashboard
          </p>
        </div>
        <Link
          to="/activities"
          className="inline-flex items-center gap-1 text-xs font-bold text-[#166534] hover:text-[#14532d] hover:underline"
        >
          <span>View All ({activities.length})</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-gray-50/70 border-b border-gray-100 text-[11px] font-semibold text-gray-500 uppercase tracking-wider">
              <th className="py-3 px-4">Date</th>
              <th className="py-3 px-4">Category</th>
              <th className="py-3 px-4">Activity Description</th>
              <th className="py-3 px-4 text-right">Quantity</th>
              <th className="py-3 px-4 text-right">Emissions (kg CO2e)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {recent.map((act) => {
              const badge = categoryBadges[act.category];
              return (
                <tr key={act.id} className="hover:bg-gray-50/50 transition-colors">
                  <td className="py-3 px-4 text-gray-500 whitespace-nowrap font-medium">
                    {act.activity_date}
                  </td>
                  <td className="py-3 px-4 whitespace-nowrap">
                    <span
                      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${badge.bg} ${badge.text}`}
                    >
                      {categoryIcons[act.category]}
                      {badge.label}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-800 max-w-xs">
                    <div className="font-medium truncate">{act.notes || act.activity_type.replace(/_/g, ' ')}</div>
                    <div className="text-[11px] text-gray-400 truncate">
                      Factor: {act.factor_value_used} kg/{act.unit}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-right font-medium text-gray-700 whitespace-nowrap">
                    {act.quantity.toLocaleString()} {act.unit}
                  </td>
                  <td className="py-3 px-4 text-right whitespace-nowrap font-bold text-gray-900">
                    {act.estimated_emissions.toLocaleString()} kg
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
