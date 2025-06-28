import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { MoodLog } from '../../types/mood';

interface MoodTrendChartProps {
  logs: MoodLog[];
  isDark: boolean;
}

const getMoodValue = (mood: string): number => {
  const valueMap: { [key: string]: number } = {
    'Sad': 1,
    'Stressed': 2,
    'Neutral': 3,
    'Good': 4,
    'Hyped': 5
  };
  return valueMap[mood] || 3;
};

const getMoodLabel = (value: number): string => {
  const labelMap: { [key: number]: string } = {
    1: 'Sad',
    2: 'Stressed',
    3: 'Neutral',
    4: 'Good',
    5: 'Hyped'
  };
  return labelMap[value] || 'Neutral';
};

export const MoodTrendChart: React.FC<MoodTrendChartProps> = ({ logs, isDark }) => {
  // Prepare data for the chart
  const chartData = logs
    .slice(0, 30) // Last 30 entries
    .reverse() // Show chronologically
    .map((log, index) => ({
      date: log.timestamp.toISOString().split('T')[0],
      mood: getMoodValue(log.mood),
      moodLabel: log.mood,
      entry: index + 1,
      timestamp: log.timestamp
    }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-3 rounded-lg border shadow-lg ${
          isDark 
            ? 'bg-gray-800 border-gray-600 text-white' 
            : 'bg-white border-gray-200 text-gray-800'
        }`}>
          <p className="font-medium">{format(new Date(data.timestamp), 'MMM dd, yyyy')}</p>
          <p className="text-sm">
            <span className="font-medium">Mood:</span> {data.moodLabel}
          </p>
          <p className="text-xs opacity-75">
            {format(new Date(data.timestamp), 'h:mm a')}
          </p>
        </div>
      );
    }
    return null;
  };

  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className={`text-center ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
          No data available for trend analysis
        </p>
      </div>
    );
  }

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDark ? '#374151' : '#E5E7EB'} 
          />
          <XAxis 
            dataKey="entry"
            tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280' }}
            axisLine={{ stroke: isDark ? '#4B5563' : '#D1D5DB' }}
          />
          <YAxis 
            domain={[0.5, 5.5]}
            ticks={[1, 2, 3, 4, 5]}
            tickFormatter={getMoodLabel}
            tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280' }}
            axisLine={{ stroke: isDark ? '#4B5563' : '#D1D5DB' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="mood" 
            stroke="#8B5CF6" 
            strokeWidth={3}
            dot={{ fill: '#8B5CF6', strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, stroke: '#8B5CF6', strokeWidth: 2 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};