import React from 'react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from 'recharts';
import { CategorySummary } from '../../types';

interface CategoryBarChartProps {
  categories: CategorySummary[];
}

export const CategoryBarChart: React.FC<CategoryBarChartProps> = ({ categories }) => {
  const chartData = categories.map((cat) => ({
    name: cat.label.replace(' & Energy', '').replace(' Management', '').replace(' & Dining', ''),
    fullName: cat.label,
    totalKg: cat.totalKg,
    color: cat.color,
    percentage: cat.percentage,
  }));

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-xs p-3 rounded-xl shadow-lg border border-gray-100 text-xs">
          <p className="font-semibold text-gray-900">{data.fullName}</p>
          <p className="text-emerald-700 font-bold text-sm mt-0.5">
            {data.totalKg.toLocaleString()} kg CO2e
          </p>
          <p className="text-gray-500 text-[11px] mt-0.5">{data.percentage}% share</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="name"
            tick={{ fill: '#6B7280', fontSize: 11 }}
            axisLine={{ stroke: '#E5E7EB' }}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: '#6B7280', fontSize: 11 }}
            axisLine={false}
            tickLine={false}
            tickFormatter={(val) => `${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}`}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="totalKg" radius={[6, 6, 0, 0]} maxBarSize={48}>
            {chartData.map((entry, index) => (
              <Cell key={`bar-${index}`} fill={entry.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
