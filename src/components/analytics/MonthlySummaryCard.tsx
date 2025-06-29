import React from 'react';
import { MonthlySummary } from '../../types/mood';
import { Calendar, TrendingUp, Target, Award, BarChart3, Percent } from 'lucide-react';
import { getMoodOption } from '../../data/moodOptions';

interface MonthlySummaryCardProps {
  summary: MonthlySummary;
  isDark: boolean;
}

export const MonthlySummaryCard: React.FC<MonthlySummaryCardProps> = ({ summary, isDark }) => {
  const topMood = Object.entries(summary.moodDistribution).reduce((a, b) => 
    summary.moodDistribution[a[0]] > summary.moodDistribution[b[0]] ? a : b
  )?.[0] || 'neutral';
  
  const topMoodOption = getMoodOption(topMood as any);

  return (
    <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
      isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200'
    }`}>
      <div className="flex items-center gap-3 mb-6">
        <Calendar className={`${isDark ? 'text-blue-400' : 'text-blue-600'}`} size={24} />
        <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
          This Month's Journey
        </h3>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
        {/* Top Mood */}
        <div className={`p-4 rounded-xl ${
          isDark ? 'bg-white/5' : 'bg-gray-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Target className="text-blue-400" size={16} />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Top Mood
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-2xl">{topMoodOption?.emoji || '😐'}</span>
            <span className={`font-bold capitalize ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {topMood}
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
              Total Logs
            </span>
          </div>
          <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
            {summary.totalLogs}
          </span>
        </div>

        {/* Consistency */}
        <div className={`p-4 rounded-xl ${
          isDark ? 'bg-white/5' : 'bg-gray-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <Percent className="text-purple-400" size={16} />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Consistency
            </span>
          </div>
          <div className="flex items-center gap-1">
            <span className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              {summary.consistencyScore}
            </span>
            <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              %
            </span>
          </div>
        </div>

        {/* Average Score */}
        <div className={`p-4 rounded-xl ${
          isDark ? 'bg-white/5' : 'bg-gray-50'
        }`}>
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="text-orange-400" size={16} />
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

        {/* Best Days */}
        <div className={`p-4 rounded-xl ${
          isDark ? 'bg-white/5' : 'bg-gray-50'
        } col-span-2`}>
          <div className="flex items-center gap-2 mb-2">
            <Award className="text-yellow-400" size={16} />
            <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
              Highlights
            </span>
          </div>
          <div className="space-y-2">
            <div>
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Best days:
              </span>
              <div className="flex gap-2 mt-1">
                {summary.bestDays.slice(0, 3).map((day, index) => (
                  <span key={index} className={`text-xs px-2 py-1 rounded-full ${
                    isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-100 text-green-700'
                  }`}>
                    {day}
                  </span>
                ))}
              </div>
            </div>
            <div>
              <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Tough days:
              </span>
              <div className="flex gap-2 mt-1">
                {summary.hardDays.slice(0, 3).map((day, index) => (
                  <span key={index} className={`text-xs px-2 py-1 rounded-full ${
                    isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-100 text-blue-700'
                  }`}>
                    {day}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Weekly Trends */}
      <div className={`p-4 rounded-xl ${
        isDark ? 'bg-white/5' : 'bg-gray-50'
      }`}>
        <h4 className={`text-sm font-medium mb-3 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          Weekly Trends
        </h4>
        <div className="flex items-end gap-2 h-16">
          {summary.moodTrends.map((trend, index) => (
            <div key={index} className="flex-1 flex flex-col items-center">
              <div 
                className={`w-full rounded-t transition-all duration-500 ${
                  trend.averageScore >= 4 ? 'bg-green-400' :
                  trend.averageScore >= 3 ? 'bg-yellow-400' :
                  'bg-blue-400'
                }`}
                style={{ 
                  height: `${(trend.averageScore / 5) * 100}%`,
                  minHeight: '8px'
                }}
              ></div>
              <span className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                W{trend.week}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};