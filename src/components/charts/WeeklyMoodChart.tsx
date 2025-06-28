import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { format, startOfWeek, addDays, isSameDay } from 'date-fns';
import { MoodLog } from '../../types/mood';

interface WeeklyMoodChartProps {
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

const getDayName = (dayIndex: number): string => {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return days[dayIndex];
};

export const WeeklyMoodChart: React.FC<WeeklyMoodChartProps> = ({ logs, isDark }) => {
  // Get current week data
  const now = new Date();
  const weekStart = startOfWeek(now);
  
  // Create data for each day of the week
  const weekData = Array.from({ length: 7 }, (_, index) => {
    const day = addDays(weekStart, index);
    const dayLogs = logs.filter(log => isSameDay(log.timestamp, day));
    
    const averageMood = dayLogs.length > 0 
      ? dayLogs.reduce((sum, log) => sum + getMoodValue(log.mood), 0) / dayLogs.length
      : 0;
    
    return {
      day: getDayName(index),
      fullDay: format(day, 'EEEE'),
      date: format(day, 'MMM dd'),
      averageMood: averageMood,
      entryCount: dayLogs.length,
      isToday: isSameDay(day, now)
    };
  });

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className={`p-3 rounded-lg border shadow-lg ${
          isDark 
            ? 'bg-gray-800 border-gray-600 text-white' 
            : 'bg-white border-gray-200 text-gray-800'
        }`}>
          <p className="font-medium">{data.fullDay}</p>
          <p className="text-sm">{data.date}</p>
          {data.entryCount > 0 ? (
            <>
              <p className="text-sm">
                <span className="font-medium">Average Mood:</span> {data.averageMood.toFixed(1)}/5
              </p>
              <p className="text-sm">
                <span className="font-medium">Entries:</span> {data.entryCount}
              </p>
            </>
          ) : (
            <p className="text-sm text-gray-500">No entries</p>
          )}
        </div>
      );
    }
    return null;
  };

  const getBarColor = (value: number, isToday: boolean) => {
    if (value === 0) return isDark ? '#374151' : '#E5E7EB';
    if (isToday) return '#F59E0B'; // Highlight today
    if (value >= 4) return '#10B981'; // Good/Hyped
    if (value >= 3) return '#6B7280'; // Neutral
    return '#3B82F6'; // Sad/Stressed
  };

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={weekData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid 
            strokeDasharray="3 3" 
            stroke={isDark ? '#374151' : '#E5E7EB'} 
          />
          <XAxis 
            dataKey="day"
            tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280' }}
            axisLine={{ stroke: isDark ? '#4B5563' : '#D1D5DB' }}
          />
          <YAxis 
            domain={[0, 5]}
            tick={{ fontSize: 12, fill: isDark ? '#9CA3AF' : '#6B7280' }}
            axisLine={{ stroke: isDark ? '#4B5563' : '#D1D5DB' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Bar 
            dataKey="averageMood" 
            fill="#8B5CF6"
            radius={[4, 4, 0, 0]}
          >
            {weekData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={getBarColor(entry.averageMood, entry.isToday)} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div className="flex flex-wrap justify-center gap-4 mt-4 text-xs">
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-amber-500"></div>
          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Today</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-emerald-500"></div>
          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Good Mood</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-gray-500"></div>
          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Neutral</span>
        </div>
        <div className="flex items-center gap-1">
          <div className="w-3 h-3 rounded bg-blue-500"></div>
          <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>Low Mood</span>
        </div>
      </div>
    </div>
  );
};