import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { MoodLog } from '../../types/mood';
import { getMoodOption } from '../../data/moodOptions';

interface MoodDistributionPieChartProps {
  logs: MoodLog[];
  isDark: boolean;
}

export const MoodDistributionPieChart: React.FC<MoodDistributionPieChartProps> = ({ logs, isDark }) => {
  // Calculate mood distribution
  const moodCounts = logs.reduce((acc, log) => {
    acc[log.mood] = (acc[log.mood] || 0) + 1;
    return acc;
  }, {} as { [key: string]: number });

  const chartData = Object.entries(moodCounts).map(([mood, count]) => {
    const moodOption = getMoodOption(mood as any);
    return {
      name: mood,
      value: count,
      percentage: ((count / logs.length) * 100).toFixed(1),
      emoji: moodOption?.emoji || '😐',
      color: getColorForMoodType(moodOption?.type || 'neutral')
    };
  });

  function getColorForMoodType(type: string): string {
    switch (type) {
      case 'positive': return '#10B981';
      case 'bonus': return '#8B5CF6';
      case 'neutral': return '#6B7280';
      case 'negative': return '#3B82F6';
      default: return '#6B7280';
    }
  }

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-3 rounded-lg border shadow-lg ${
          isDark 
            ? 'bg-gray-800 border-gray-600 text-white' 
            : 'bg-white border-gray-200 text-gray-800'
        }`}>
          <div className="flex items-center gap-2">
            <span className="text-lg">{data.emoji}</span>
            <span className="font-medium capitalize">{data.name}</span>
          </div>
          <p className="text-sm">
            <span className="font-medium">{data.value}</span> entries ({data.percentage}%)
          </p>
        </div>
      );
    }
    return null;
  };

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, value, name }: any) => {
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);
    const percentage = ((value / logs.length) * 100).toFixed(0);

    // Only show label if percentage is > 8% to avoid clutter
    if (parseFloat(percentage) < 8) return null;

    return (
      <text 
        x={x} 
        y={y} 
        fill="white" 
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight="bold"
      >
        {`${percentage}%`}
      </text>
    );
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          No data available for distribution analysis
        </p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={CustomLabel}
            outerRadius={80}
            fill="#8884d8"
            dataKey="value"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      {/* Custom Legend */}
      <div className="flex flex-wrap justify-center gap-3 mt-4">
        {chartData.map((entry) => (
          <div key={entry.name} className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: entry.color }}
            ></div>
            <span className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              {entry.emoji} {entry.name} ({entry.percentage}%)
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};