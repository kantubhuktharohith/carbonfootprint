import React from 'react';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { CategorySummary } from '../../types';

interface CategoryDonutChartProps {
  categories: CategorySummary[];
  totalKg: number;
}

export const CategoryDonutChart: React.FC<CategoryDonutChartProps> = ({ categories, totalKg }) => {
  const activeCategories = categories.filter((c) => c.totalKg > 0);

  if (activeCategories.length === 0) {
    return (
      <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-sm">
        <p>No activity records logged in this period.</p>
        <span className="text-xs text-gray-500 mt-1">Record activities to view category distribution.</span>
      </div>
    );
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-xs p-3 rounded-xl shadow-lg border border-gray-100 text-xs">
          <p className="font-semibold text-gray-900">{data.label}</p>
          <p className="text-emerald-700 font-bold text-sm mt-0.5">
            {data.totalKg.toLocaleString()} kg CO2e
          </p>
          <p className="text-gray-500 text-[11px] mt-0.5">{data.percentage}% of overall footprint</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="relative w-full h-64 flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={activeCategories}
            dataKey="totalKg"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius={68}
            outerRadius={95}
            paddingAngle={3}
            stroke="#ffffff"
            strokeWidth={2}
          >
            {activeCategories.map((entry) => (
              <Cell key={`cell-${entry.category}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>

      {/* Center Grand Total Label */}
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <span className="text-[11px] uppercase tracking-wider text-gray-400 font-semibold">
          Total Footprint
        </span>
        <span className="text-xl font-extrabold text-[#1F2937] tracking-tight">
          {totalKg > 1000 ? `${(totalKg / 1000).toFixed(2)} t` : `${Math.round(totalKg)} kg`}
        </span>
        <span className="text-[10px] text-gray-500 font-medium">CO2e</span>
      </div>
    </div>
  );
};
