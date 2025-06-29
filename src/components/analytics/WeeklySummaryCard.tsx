import React from 'react';
import { WeeklySummary } from '../../types/mood';
import { Calendar, TrendingUp, Target, Award, BarChart3, Zap } from 'lucide-react';
import { getMoodOption } from '../../data/moodOptions';

interface WeeklySummaryCardProps {
  summary: WeeklySummary;
  isDark: boolean;
}

export const WeeklySummaryCard: React.FC<WeeklySummaryCardProps> = ({ summary, isDark }) => {
  const mostCommonMoodOption = getMoodOption(summary.mostCommonMood as any);

  return (
    <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
      isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200'
    }`}>
      <div className="flex items-center gap-3 mb-6">
        <Calendar className={`${isDark ? 'text-purple-400' : 'text-purple-600'}`} size={24} />
        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          This Week's Vibe Check
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Most Common Mood */}
        <div className={`p-4 rounded-xl ${
          isDark ? 'bg-white/5' : 'bg-gray-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-blue-400" size={16} />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Top Vibe
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{mostCommonMoodOption?.emoji || '😐'}</span>
            <span className={`font-bold capitalize ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {summary.mostCommonMood}
            </span>
          </div>
        </div>

        {/* Mood Streak */}
        <div className={`p-4 rounded-xl ${
          isDark ? 'bg-white/5' : 'bg-gray-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Award className="text-yellow-400" size={16} />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Streak
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {summary.moodStreak}
            </span>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              days
            </span>
          </div>
        </div>

        {/* Total Logs */}
        <div className={`p-4 rounded-xl ${
          isDark ? 'bg-white/5' : 'bg-gray-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="text-green-400" size={16} />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Check-ins
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {summary.totalLogs}
            </span>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              total
            </span>
          </div>
        </div>

        {/* Average Score */}
        <div className={`p-4 rounded-xl ${
          isDark ? 'bg-white/5' : 'bg-gray-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-purple-400" size={16} />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Average
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {summary.averageMoodScore}
            </span>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              /5
            </span>
          </div>
        </div>

        {/* Mood Variance */}
        <div className={`p-4 rounded-xl ${
          isDark ? 'bg-white/5' : 'bg-gray-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Zap className="text-orange-400" size={16} />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Variety
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {summary.moodVariance}
            </span>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              avg
            </span>
          </div>
        </div>

        {/* Best/Hardest Days */}
        <div className={`p-4 rounded-xl ${
          isDark ? 'bg-white/5' : 'bg-gray-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Calendar className="text-pink-400" size={16} />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Days
            </span>
          </div>
          <div className="space-y-1">
            <div className="flex items-center gap-1">
              <span className="text-green-400">↗</span>
              <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {summary.bestDay}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <span className="text-blue-400">↘</span>
              <span className={`text-xs ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                {summary.hardestDay}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};