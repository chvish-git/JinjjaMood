import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Calendar, TrendingUp, Download, Filter, RefreshCw } from 'lucide-react';
import { getMoodLogs } from '../utils/storage';
import { generateWeeklySummary, generateMonthlySummary, getMoodInsights, calculateStreaks } from '../utils/moodAnalytics';
import { WeeklySummaryCard } from '../components/analytics/WeeklySummaryCard';
import { MonthlySummaryCard } from '../components/analytics/MonthlySummaryCard';
import { MoodInsightsCard } from '../components/analytics/MoodInsightsCard';
import { MoodDistributionPieChart } from '../components/analytics/MoodDistributionPieChart';
import { MoodTrendChart } from '../components/charts/MoodTrendChart';
import { WeeklyMoodChart } from '../components/charts/WeeklyMoodChart';
import { MoodLog } from '../types/mood';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { AnalyticsSkeleton } from '../components/skeletons/AnalyticsSkeleton';
import { AnalyticsEmptyState } from '../components/EmptyStates';

type ViewMode = 'overview' | 'weekly' | 'monthly';
type TimeRange = '7' | '30' | '90' | 'all';

export const AnalyticsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [viewMode, setViewMode] = useState<ViewMode>('overview');
  const [timeRange, setTimeRange] = useState<TimeRange>('30');
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!userProfile?.uid) {
        setLoading(false);
        return;
      }

      try {
        const moodLogs = await getMoodLogs(userProfile.uid);
        setLogs(moodLogs);
      } catch (error) {
        console.error('Error loading mood logs:', error);
      } finally {
        setLoading(false);
        setIsVisible(true);
      }
    };

    loadData();
  }, [userProfile?.uid]);

  const getFilteredLogs = () => {
    if (timeRange === 'all') return logs;
    
    const daysAgo = new Date();
    daysAgo.setDate(daysAgo.getDate() - parseInt(timeRange));
    return logs.filter(log => log.timestamp >= daysAgo);
  };

  const filteredLogs = getFilteredLogs();
  const weeklySummary = generateWeeklySummary(filteredLogs);
  const monthlySummary = generateMonthlySummary(filteredLogs);
  const insights = getMoodInsights(filteredLogs);
  const streaks = calculateStreaks(filteredLogs);

  const exportData = () => {
    const csvContent = [
      ['Date', 'Time', 'Mood', 'Type', 'Journal Entry'],
      ...filteredLogs.map(log => [
        log.day,
        `${log.hour}:00`,
        log.mood,
        log.moodType,
        log.journalEntry || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jinjjamood-analytics-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return <AnalyticsSkeleton />;
  }

  if (logs.length === 0) {
    return <AnalyticsEmptyState />;
  }

  return (
    <div className={`min-h-screen pt-16 transition-all duration-1000 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100'
    }`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl animate-pulse ${
          isDark ? 'bg-purple-500' : 'bg-pink-300'
        }`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse delay-1000 ${
          isDark ? 'bg-blue-500' : 'bg-blue-300'
        }`}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 px-6 py-20">
        {/* Header */}
        <div className={`text-center mb-12 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            Mood Intelligence Dashboard 🧠
          </h1>
          
          <p className={`text-lg md:text-xl font-light ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            Your vibe patterns, decoded with data
          </p>
        </div>

        {/* Enhanced Controls with better contrast */}
        <div className={`max-w-6xl mx-auto mb-8 transform transition-all duration-1000 delay-200 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            {/* Enhanced View Mode Toggle */}
            <div className={`flex items-center gap-1 p-1 rounded-2xl border-2 ${
              isDark ? 'bg-slate-800 border-slate-600' : 'bg-white border-gray-300'
            }`}>
              {[
                { key: 'overview', label: 'Overview', icon: BarChart3 },
                { key: 'weekly', label: 'Weekly', icon: Calendar },
                { key: 'monthly', label: 'Monthly', icon: TrendingUp }
              ].map(({ key, label, icon: Icon }) => (
                <button
                  key={key}
                  onClick={() => setViewMode(key as ViewMode)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    viewMode === key
                      ? isDark 
                        ? 'bg-purple-600 text-white shadow-lg' 
                        : 'bg-purple-500 text-white shadow-lg'
                      : isDark 
                        ? 'text-gray-300 hover:text-white hover:bg-slate-700' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  <Icon size={16} />
                  <span className="hidden sm:inline">{label}</span>
                </button>
              ))}
            </div>

            {/* Enhanced Time Range & Export */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <Filter size={18} className={isDark ? 'text-gray-300' : 'text-gray-600'} />
                <select
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value as TimeRange)}
                  className={`px-4 py-2 rounded-lg border-2 transition-all duration-300 font-semibold ${
                    isDark 
                      ? 'bg-slate-800 text-gray-100 border-slate-600 focus:border-purple-400' 
                      : 'bg-white text-gray-800 border-gray-300 focus:border-purple-500'
                  } focus:outline-none focus:ring-2 focus:ring-purple-400/20`}
                >
                  <option value="7">Last 7 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="all">All time</option>
                </select>
              </div>

              <button
                onClick={exportData}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 border-2 font-semibold ${
                  isDark 
                    ? 'bg-slate-800 text-gray-100 hover:bg-slate-700 border-slate-600 hover:border-slate-500' 
                    : 'bg-white text-gray-800 hover:bg-gray-50 border-gray-300 hover:border-gray-400'
                }`}
              >
                <Download size={16} />
                <span className="text-sm font-bold hidden sm:inline">Export</span>
              </button>
            </div>
          </div>
        </div>

        {/* Overview Mode */}
        {viewMode === 'overview' && (
          <div className="max-w-6xl mx-auto space-y-8">
            {/* Quick Stats */}
            <div className={`transform transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-4 rounded-2xl backdrop-blur-sm border text-center ${
                  isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-white/80 border-gray-200 text-gray-800'
                }`}>
                  <div className="text-2xl font-bold">{filteredLogs.length}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Total Logs</div>
                </div>
                <div className={`p-4 rounded-2xl backdrop-blur-sm border text-center ${
                  isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-white/80 border-gray-200 text-gray-800'
                }`}>
                  <div className="text-2xl font-bold">{streaks.currentStreak}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Current Streak</div>
                </div>
                <div className={`p-4 rounded-2xl backdrop-blur-sm border text-center ${
                  isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-white/80 border-gray-200 text-gray-800'
                }`}>
                  <div className="text-2xl font-bold">{weeklySummary.averageMoodScore}/5</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Avg Score</div>
                </div>
                <div className={`p-4 rounded-2xl backdrop-blur-sm border text-center ${
                  isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-white/80 border-gray-200 text-gray-800'
                }`}>
                  <div className="text-2xl font-bold">{Math.round((filteredLogs.length / parseInt(timeRange || '30')) * 100) / 100}</div>
                  <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>Daily Avg</div>
                </div>
              </div>
            </div>

            {/* Insights */}
            <div className={`transform transition-all duration-1000 delay-400 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <MoodInsightsCard insights={insights} isDark={isDark} />
            </div>

            {/* Charts */}
            <div className={`grid grid-cols-1 lg:grid-cols-2 gap-8 transform transition-all duration-1000 delay-500 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200'
              }`}>
                <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Mood Distribution
                </h3>
                <MoodDistributionPieChart logs={filteredLogs} isDark={isDark} />
              </div>

              <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200'
              }`}>
                <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Mood Trend
                </h3>
                <MoodTrendChart logs={filteredLogs} isDark={isDark} />
              </div>
            </div>
          </div>
        )}

        {/* Weekly Mode */}
        {viewMode === 'weekly' && (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className={`transform transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <WeeklySummaryCard summary={weeklySummary} isDark={isDark} />
            </div>

            <div className={`transform transition-all duration-1000 delay-400 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200'
              }`}>
                <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Weekly Pattern
                </h3>
                <WeeklyMoodChart logs={filteredLogs} isDark={isDark} />
              </div>
            </div>
          </div>
        )}

        {/* Monthly Mode */}
        {viewMode === 'monthly' && (
          <div className="max-w-6xl mx-auto space-y-8">
            <div className={`transform transition-all duration-1000 delay-300 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <MonthlySummaryCard summary={monthlySummary} isDark={isDark} />
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center mt-12 transform transition-all duration-1000 delay-800 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <button
            onClick={() => navigate('/mood')}
            className={`px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
              isDark 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-400 hover:to-purple-500' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
            }`}
          >
            <span className="flex items-center gap-2">
              <RefreshCw size={20} />
              Log New Mood
            </span>
          </button>
          
          <button
            onClick={() => navigate('/history')}
            className={`px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${
              isDark 
                ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                : 'bg-black/10 text-gray-800 hover:bg-black/20 border border-gray-200'
            }`}
          >
            View Full History
          </button>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-2 h-2 rounded-full opacity-30 animate-bounce ${
              isDark ? 'bg-white' : 'bg-purple-400'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${3 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};