import React from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ActivityRecord } from '../../types';
import { getTimelineData } from '../../lib/calculations';

interface TimelineChartProps {
  activities: ActivityRecord[];
}

export const TimelineChart: React.FC<TimelineChartProps> = ({ activities }) => {
  const data = getTimelineData(activities);

  if (data.length === 0) {
    return (
      <div className="h-64 flex items-center justify-center text-gray-400 text-sm">
        No daily records found.
      </div>
    );
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const point = payload[0].payload;
      return (
        <div className="bg-white/95 backdrop-blur-xs p-3.5 rounded-xl shadow-lg border border-gray-100 text-xs min-w-[170px]">
          <p className="font-semibold text-gray-900 border-b border-gray-100 pb-1 mb-1.5">
            Date: {point.date}
          </p>
          <div className="space-y-1">
            <div className="flex justify-between text-emerald-800">
              <span>⚡ Energy:</span>
              <span className="font-semibold">{point.electricity} kg</span>
            </div>
            <div className="flex justify-between text-sky-800">
              <span>🚗 Transport:</span>
              <span className="font-semibold">{point.transportation} kg</span>
            </div>
            <div className="flex justify-between text-amber-800">
              <span>🥗 Food:</span>
              <span className="font-semibold">{point.food} kg</span>
            </div>
            <div className="flex justify-between text-purple-800">
              <span>🗑️ Waste:</span>
              <span className="font-semibold">{point.waste} kg</span>
            </div>
            <div className="border-t border-gray-100 pt-1 mt-1 flex justify-between font-bold text-gray-900">
              <span>Total Day:</span>
              <span>{point.total} kg</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="w-full h-64">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
          <defs>
            <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
              <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
          <XAxis
            dataKey="displayDate"
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
          <Area
            type="monotone"
            dataKey="total"
            stroke="#166534"
            strokeWidth={2.5}
            fillOpacity={1}
            fill="url(#colorTotal)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};
