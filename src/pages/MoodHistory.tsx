import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Filter, Download, TrendingUp, BarChart3, Clock, BookOpen, AlertCircle } from 'lucide-react';
import { getMoodLogs } from '../utils/storage';
import { UserProfile } from '../components/UserProfile';
import { MoodLog, MoodType } from '../types/mood';

interface MoodHistoryProps {
  isDark: boolean;
  onBack: () => void;
  onNewMood: () => void;
  username: string;
}

type DateRange = '7' | '14' | '30' | 'all';
type MoodFilter = 'all' | MoodType;

export const MoodHistory: React.FC<MoodHistoryProps> = ({ isDark, onBack, onNewMood, username }) => {
  const [allLogs, setAllLogs] = useState<MoodLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<MoodLog[]>([]);
  const [dateRange, setDateRange] = useState<DateRange>('30');
  const [moodFilter, setMoodFilter] = useState<MoodFilter>('all');
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadLogs = async () => {
      try {
        setError(null);
        const logs = await getMoodLogs(username);
        const sortedLogs = logs.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
        setAllLogs(sortedLogs);
      } catch (error: any) {
        console.error('Error loading mood logs:', error);
        setError(error.message || 'Failed to load mood logs');
      } finally {
        setLoading(false);
        setIsVisible(true);
      }
    };

    loadLogs();
  }, [username]);

  useEffect(() => {
    let filtered = [...allLogs];

    // Apply date range filter
    if (dateRange !== 'all') {
      const daysAgo = new Date();
      daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
      filtered = filtered.filter(log => log.timestamp >= daysAgo);
    }

    // Apply mood filter
    if (moodFilter !== 'all') {
      filtered = filtered.filter(log => log.mood === moodFilter);
    }

    setFilteredLogs(filtered);
  }, [allLogs, dateRange, moodFilter]);

  const getMoodEmoji = (mood: string) => {
    const emojiMap: { [key: string]: string } = {
      'Sad': '😢',
      'Neutral': '😐',
      'Good': '😊',
      'Stressed': '😰',
      'Hyped': '🤩'
    };
    return emojiMap[mood] || '😐';
  };

  const getMoodColor = (mood: string) => {
    const colorMap: { [key: string]: string } = {
      'Sad': 'bg-blue-500',
      'Neutral': 'bg-gray-500',
      'Good': 'bg-green-500',
      'Stressed': 'bg-orange-500',
      'Hyped': 'bg-purple-500'
    };
    return colorMap[mood] || 'bg-gray-500';
  };

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

  const getMoodStats = () => {
    if (filteredLogs.length === 0) return {};

    const moodCounts = filteredLogs.reduce((acc, log) => {
      acc[log.mood] = (acc[log.mood] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number });

    const mostCommonMood = Object.entries(moodCounts).reduce((a, b) => 
      moodCounts[a[0]] > moodCounts[b[0]] ? a : b
    )[0];

    const averageMood = filteredLogs.reduce((sum, log) => sum + getMoodValue(log.mood), 0) / filteredLogs.length;

    return { moodCounts, mostCommonMood, averageMood };
  };

  const stats = getMoodStats();

  const exportMoodData = () => {
    const csvContent = [
      ['Date', 'Mood', 'Journal Entry'],
      ...filteredLogs.map(log => [
        log.timestamp.toLocaleDateString(),
        log.mood,
        log.journalEntry || ''
      ])
    ].map(row => row.map(cell => `"${cell}"`).join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `jinjjamood-export-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className={`text-xl ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Loading your mood history...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100'
      }`}>
        <div className="text-center max-w-md mx-auto p-6">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Unable to Load Mood History
          </h2>
          <p className={`text-lg mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            {error}
          </p>
          {error.includes('Firebase permission error') && (
            <div className={`p-4 rounded-lg mb-6 ${isDark ? 'bg-yellow-900/30 border border-yellow-700' : 'bg-yellow-100 border border-yellow-300'}`}>
              <p className={`text-sm ${isDark ? 'text-yellow-300' : 'text-yellow-800'}`}>
                <strong>Firebase Setup Required:</strong> Please configure your Firestore security rules to allow access to the collections. 
                Check the console for detailed instructions.
              </p>
            </div>
          )}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:scale-105 transition-transform duration-300"
            >
              Try Again
            </button>
            <button
              onClick={onBack}
              className={`px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 ${
                isDark 
                  ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                  : 'bg-black/10 text-gray-800 hover:bg-black/20 border border-gray-200'
              }`}
            >
              Back to Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (allLogs.length === 0) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100'
      }`}>
        <div className="text-center">
          <div className="text-6xl mb-4">📊</div>
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            No mood history yet
          </h2>
          <p className={`text-lg mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Start tracking your vibes to see your journey unfold
          </p>
          <button
            onClick={onNewMood}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:scale-105 transition-transform duration-300"
          >
            Start Your Journey
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen transition-all duration-1000 ${
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

      {/* User Profile */}
      <UserProfile isDark={isDark} />

      {/* Back button */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
            isDark 
              ? 'bg-white/10 text-white hover:bg-white/20' 
              : 'bg-black/10 text-gray-800 hover:bg-black/20'
          }`}
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>
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
            Your JinjjaMood Journey
          </h1>
          
          <p className={`text-lg md:text-xl font-light ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            See how your vibe has shifted over time
          </p>
        </div>

        {/* Filters */}
        <div className={`max-w-4xl mx-auto mb-8 transform transition-all duration-1000 delay-200 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <Calendar size={18} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                <select
                  value={dateRange}
                  onChange={(e) => setDateRange(e.target.value as DateRange)}
                  className={`px-3 py-2 rounded-lg border transition-all duration-300 ${
                    isDark 
                      ? 'bg-white/10 text-white border-white/20 focus:border-white/40' 
                      : 'bg-white/80 text-gray-800 border-gray-200 focus:border-purple-300'
                  }`}
                >
                  <option value="7">Last 7 days</option>
                  <option value="14">Last 14 days</option>
                  <option value="30">Last 30 days</option>
                  <option value="all">All time</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <Filter size={18} className={isDark ? 'text-gray-400' : 'text-gray-600'} />
                <select
                  value={moodFilter}
                  onChange={(e) => setMoodFilter(e.target.value as MoodFilter)}
                  className={`px-3 py-2 rounded-lg border transition-all duration-300 ${
                    isDark 
                      ? 'bg-white/10 text-white border-white/20 focus:border-white/40' 
                      : 'bg-white/80 text-gray-800 border-gray-200 focus:border-purple-300'
                  }`}
                >
                  <option value="all">All moods</option>
                  <option value="Sad">😢 Sad</option>
                  <option value="Stressed">😰 Stressed</option>
                  <option value="Neutral">😐 Neutral</option>
                  <option value="Good">😊 Good</option>
                  <option value="Hyped">🤩 Hyped</option>
                </select>
              </div>
            </div>

            <button
              onClick={exportMoodData}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                isDark 
                  ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                  : 'bg-black/10 text-gray-800 hover:bg-black/20 border border-gray-200'
              }`}
            >
              <Download size={16} />
              <span className="text-sm font-medium">Export</span>
            </button>
          </div>
        </div>

        {/* Stats Overview */}
        {stats.moodCounts && (
          <div className={`max-w-6xl mx-auto mb-8 transform transition-all duration-1000 delay-400 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-white/80 border-gray-200 text-gray-800'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <BarChart3 className="text-purple-400" size={24} />
                  <span className="font-semibold">Total Entries</span>
                </div>
                <p className="text-3xl font-bold">{filteredLogs.length}</p>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  in selected period
                </p>
              </div>

              <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-white/80 border-gray-200 text-gray-800'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <TrendingUp className="text-green-400" size={24} />
                  <span className="font-semibold">Most Common</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{getMoodEmoji(stats.mostCommonMood)}</span>
                  <span className="text-xl font-bold">{stats.mostCommonMood}</span>
                </div>
                <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {stats.moodCounts[stats.mostCommonMood]} times
                </p>
              </div>

              <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-white/80 border-gray-200 text-gray-800'
              }`}>
                <div className="flex items-center gap-3 mb-3">
                  <Clock className="text-blue-400" size={24} />
                  <span className="font-semibold">Average Mood</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-full bg-gray-200 rounded-full h-3 dark:bg-gray-700">
                    <div 
                      className="bg-gradient-to-r from-blue-500 via-yellow-500 to-purple-500 h-3 rounded-full transition-all duration-500"
                      style={{ width: `${(stats.averageMood / 5) * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-lg font-bold">{stats.averageMood.toFixed(1)}/5</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Mood Chart Visualization */}
        <div className={`max-w-6xl mx-auto mb-8 transform transition-all duration-1000 delay-600 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
            isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200'
          }`}>
            <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
              Mood Timeline
            </h3>
            
            {filteredLogs.length > 0 ? (
              <div className="space-y-4">
                {/* Simple timeline visualization */}
                <div className="relative">
                  <div className="flex items-end justify-between h-32 px-4">
                    {filteredLogs.slice(0, 10).reverse().map((log, index) => {
                      const height = (getMoodValue(log.mood) / 5) * 100;
                      return (
                        <div key={log.id} className="flex flex-col items-center group">
                          <div
                            className={`w-8 ${getMoodColor(log.mood)} rounded-t-lg transition-all duration-300 group-hover:scale-110 cursor-pointer`}
                            style={{ height: `${height}%` }}
                            title={`${log.mood} - ${log.timestamp.toLocaleDateString()}`}
                          ></div>
                          <div className="text-xs mt-2 text-center">
                            <div className="text-lg">{getMoodEmoji(log.mood)}</div>
                            <div className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                              {log.timestamp.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Mood distribution */}
                <div className="grid grid-cols-5 gap-2 mt-6">
                  {['Sad', 'Stressed', 'Neutral', 'Good', 'Hyped'].map(mood => {
                    const count = stats.moodCounts?.[mood] || 0;
                    const percentage = filteredLogs.length > 0 ? (count / filteredLogs.length) * 100 : 0;
                    
                    return (
                      <div key={mood} className="text-center">
                        <div className={`h-2 rounded-full ${getMoodColor(mood)} mb-2`} 
                             style={{ opacity: percentage / 100 }}></div>
                        <div className="text-lg">{getMoodEmoji(mood)}</div>
                        <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                          {count} ({percentage.toFixed(0)}%)
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  No mood data for selected filters
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Journal Log */}
        <div className={`max-w-4xl mx-auto transform transition-all duration-1000 delay-800 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
            isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200'
          }`}>
            <div className="flex items-center gap-3 mb-6">
              <BookOpen className={`${isDark ? 'text-white' : 'text-gray-800'}`} size={24} />
              <h3 className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                Journal Entries
              </h3>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`p-4 rounded-xl border transition-all duration-300 hover:scale-[1.02] ${
                      isDark 
                        ? 'bg-white/5 border-white/10 hover:bg-white/10' 
                        : 'bg-white/60 border-gray-100 hover:bg-white/80'
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div className={`w-10 h-10 rounded-full ${getMoodColor(log.mood)} flex items-center justify-center text-white font-bold`}>
                          {getMoodEmoji(log.mood)}
                        </div>
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {log.mood}
                          </span>
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {log.timestamp.toLocaleString()}
                          </span>
                        </div>
                        
                        {log.journalEntry && (
                          <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            "{log.journalEntry}"
                          </p>
                        )}
                        
                        {!log.journalEntry && (
                          <p className={`text-sm italic ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                            No journal entry
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <p className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    No entries found for selected filters
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 justify-center mt-12 transform transition-all duration-1000 delay-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <button
            onClick={onNewMood}
            className={`px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
              isDark 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-400 hover:to-purple-500' 
                : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
            }`}
          >
            Check In Again
          </button>
          
          <button
            onClick={onBack}
            className={`px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${
              isDark 
                ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                : 'bg-black/10 text-gray-800 hover:bg-black/20 border border-gray-200'
            }`}
          >
            Back to Home
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