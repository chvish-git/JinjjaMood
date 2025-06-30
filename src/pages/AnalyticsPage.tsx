import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3, Calendar, TrendingUp, Download, Filter, RefreshCw, PieChart } from 'lucide-react';
import { getMoodLogs } from '../utils/storage';
import { MoodLog } from '../types/mood';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getMoodOption } from '../data/moodOptions';
import { format, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';

export const AnalyticsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [logs, setLogs] = useState<MoodLog[]>([]);
  const [weeklyLogs, setWeeklyLogs] = useState<MoodLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!userProfile?.id) {
        setLoading(false);
        return;
      }

      try {
        const moodLogs = await getMoodLogs(userProfile.id);
        setLogs(moodLogs);
        
        // Filter for this week
        const now = new Date();
        const weekStart = startOfWeek(now);
        const weekEnd = endOfWeek(now);
        
        const thisWeekLogs = moodLogs.filter(log => 
          isWithinInterval(log.timestamp, { start: weekStart, end: weekEnd })
        );
        setWeeklyLogs(thisWeekLogs);
      } catch (error) {
        console.error('Error loading mood logs:', error);
      } finally {
        setLoading(false);
        setIsVisible(true);
      }
    };

    loadData();
  }, [userProfile?.id]);

  // Calculate mood distribution
  const getMoodDistribution = () => {
    const distribution = weeklyLogs.reduce((acc, log) => {
      const moodOption = getMoodOption(log.mood as any);
      const type = moodOption?.type || 'neutral';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const total = weeklyLogs.length;
    return {
      positive: Math.round(((distribution.positive || 0) / total) * 100) || 0,
      neutral: Math.round(((distribution.neutral || 0) / total) * 100) || 0,
      negative: Math.round(((distribution.negative || 0) / total) * 100) || 0,
      bonus: Math.round(((distribution.bonus || 0) / total) * 100) || 0,
    };
  };

  const distribution = getMoodDistribution();

  // Generate insight caption
  const getInsightCaption = () => {
    if (weeklyLogs.length === 0) return "Start logging to see your vibe insights! ✨";
    
    const maxType = Object.entries(distribution).reduce((a, b) => 
      distribution[a[0]] > distribution[b[0]] ? a : b
    )[0];

    const typeEmojis = {
      positive: '✨',
      neutral: '😐', 
      negative: '💙',
      bonus: '🔥'
    };

    const typeDescriptions = {
      positive: 'positive energy',
      neutral: 'chill vibes',
      negative: 'real feels',
      bonus: 'main character energy'
    };

    return `Your week was mostly ${typeEmojis[maxType as keyof typeof typeEmojis]} – ${typeDescriptions[maxType as keyof typeof typeDescriptions]}`;
  };

  const exportData = () => {
    const csvContent = [
      ['Date', 'Time', 'Mood', 'Type', 'Journal Entry'],
      ...logs.map(log => [
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
    return (
      <div className={`min-h-screen flex items-center justify-center pt-16 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className={`text-xl ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Loading your analytics...
          </p>
        </div>
      </div>
    );
  }

  if (logs.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center pt-16 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100'
      }`}>
        <div className="text-center max-w-md mx-auto">
          <div className="text-6xl mb-4">📊</div>
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            No analytics yet
          </h2>
          <p className={`text-lg mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Start tracking your moods to unlock beautiful insights and patterns
          </p>
          <button
            onClick={() => navigate('/mood')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:scale-105 transition-transform duration-300"
          >
            Start Tracking
          </button>
        </div>
      </div>
    );
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
            Your Vibe Analytics 📊
          </h1>
          
          <p className={`text-lg md:text-xl font-light ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            See how your mood patterns unfold over time
          </p>
        </div>

        {/* Controls */}
        <div className={`max-w-4xl mx-auto mb-8 transform transition-all duration-1000 delay-200 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="flex justify-between items-center">
            <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Weekly Summary
            </h2>
            <button
              onClick={exportData}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                isDark 
                  ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                  : 'bg-white text-gray-800 hover:bg-gray-50 border border-gray-300'
              }`}
            >
              <Download size={16} />
              <span className="text-sm font-medium">Export</span>
            </button>
          </div>
        </div>

        {/* Daily History */}
        <div className={`max-w-4xl mx-auto mb-8 transform transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
            isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200'
          }`}>
            <h3 className={`text-xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Recent Mood Check-ins
            </h3>
            
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {weeklyLogs.slice(0, 5).map((log) => {
                const moodOption = getMoodOption(log.mood as any);
                return (
                  <div
                    key={log.id}
                    className={`flex items-center gap-4 p-3 rounded-lg ${
                      isDark 
                        ? 'bg-white/5 hover:bg-white/10' 
                        : 'bg-white/60 hover:bg-white/80'
                    } transition-all duration-300`}
                  >
                    <div className="text-2xl">{moodOption?.emoji || '😐'}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                          {log.mood}
                        </span>
                        <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {format(log.timestamp, 'MMM dd, h:mm a')}
                        </span>
                      </div>
                      {log.journalEntry && (
                        <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                          "{log.journalEntry.substring(0, 100)}{log.journalEntry.length > 100 ? '...' : ''}"
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Weekly Summary */}
        <div className={`max-w-4xl mx-auto mb-8 transform transition-all duration-1000 delay-400 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
            isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200'
          }`}>
            <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Mood Distribution
            </h3>
            
            {/* Pie Chart Visualization */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-green-500 flex items-center justify-center text-white font-bold text-lg">
                  {distribution.positive}%
                </div>
                <div className="text-sm font-medium">🟢 Positive</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-yellow-500 flex items-center justify-center text-white font-bold text-lg">
                  {distribution.neutral}%
                </div>
                <div className="text-sm font-medium">🟡 Neutral</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-blue-500 flex items-center justify-center text-white font-bold text-lg">
                  {distribution.negative}%
                </div>
                <div className="text-sm font-medium">🔵 Negative</div>
              </div>
              
              <div className="text-center">
                <div className="w-16 h-16 mx-auto mb-2 rounded-full bg-purple-500 flex items-center justify-center text-white font-bold text-lg">
                  {distribution.bonus}%
                </div>
                <div className="text-sm font-medium">🔥 Bonus</div>
              </div>
            </div>

            {/* Insight Caption */}
            <div className={`text-center p-4 rounded-xl ${
              isDark ? 'bg-white/5' : 'bg-gray-50'
            }`}>
              <p className={`text-lg font-medium ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {getInsightCaption()}
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center transform transition-all duration-1000 delay-600 ${
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
    </div>
  );
};