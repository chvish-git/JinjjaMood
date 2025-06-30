import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, Heart, TrendingUp, BarChart3, Home, RefreshCw, Plus } from 'lucide-react';
import { getLatestMoodLog, getMoodLogs, checkDailyMoodLimit } from '../utils/storage';
import { getPersonalizedQuote, getDailyTheme, getThemeEmoji } from '../data/vibeQuotes';
import { MoodLog } from '../types/mood';
import { VibeQuote } from '../types/vibeQuote';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { ResultsSkeleton } from '../components/skeletons/ResultsSkeleton';
import { ResultsEmptyState } from '../components/EmptyStates';
import { getMoodOption } from '../data/moodOptions';
import { format } from 'date-fns';

export const ResultsPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [latestLog, setLatestLog] = useState<MoodLog | null>(null);
  const [allLogs, setAllLogs] = useState<MoodLog[]>([]);
  const [todayLogs, setTodayLogs] = useState<MoodLog[]>([]);
  const [vibeQuote, setVibeQuote] = useState<VibeQuote | null>(null);
  const [dailyTheme, setDailyTheme] = useState<string>('');
  const [isVisible, setIsVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dailyCount, setDailyCount] = useState(0);
  const [canAddMore, setCanAddMore] = useState(false);

  useEffect(() => {
    const loadData = async () => {
      if (!userProfile?.uid) {
        setLoading(false);
        return;
      }

      try {
        const [latest, logs, dailyLimit] = await Promise.all([
          getLatestMoodLog(userProfile.uid),
          getMoodLogs(userProfile.uid),
          checkDailyMoodLimit(userProfile.uid)
        ]);
        
        setLatestLog(latest);
        setAllLogs(logs);
        setDailyTheme(getDailyTheme());
        setDailyCount(dailyLimit.count);
        setCanAddMore(!dailyLimit.hasReachedLimit);
        
        // Filter today's logs
        const today = format(new Date(), 'yyyy-MM-dd');
        const todaysLogs = logs.filter(log => log.day === today);
        setTodayLogs(todaysLogs);
        
        if (latest) {
          // Get personalized quote based on user's mood and daily theme
          const personalizedQuote = getPersonalizedQuote(latest.mood as any);
          setVibeQuote(personalizedQuote);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
        setIsVisible(true);
      }
    };

    loadData();
  }, [userProfile?.uid]);

  const getMoodEmoji = (mood: string) => {
    const moodOption = getMoodOption(mood as any);
    return moodOption?.emoji || '😐';
  };

  const getMoodColor = (mood: string) => {
    const moodOption = getMoodOption(mood as any);
    if (!moodOption) return isDark ? 'from-gray-500 to-gray-700' : 'from-gray-400 to-gray-600';
    
    return isDark ? moodOption.darkColor : moodOption.color;
  };

  const getWeeklyLogs = () => {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return allLogs.filter(log => log.timestamp >= weekAgo);
  };

  // Calculate daily mood recap
  const getDailyMoodRecap = () => {
    const recap = todayLogs.reduce((acc, log) => {
      const moodOption = getMoodOption(log.mood as any);
      const type = moodOption?.type || 'neutral';
      acc[type] = (acc[type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return recap;
  };

  const dailyRecap = getDailyMoodRecap();

  if (loading) {
    return <ResultsSkeleton />;
  }

  if (!latestLog) {
    return <ResultsEmptyState />;
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
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        {/* Header */}
        <div className={`text-center mb-8 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            You logged {latestLog.mood}! Respect! ✨
          </h1>
          
          {vibeQuote && (
            <div className="flex items-center justify-center gap-2 text-sm">
              <span className={`${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Today's theme: {dailyTheme}
              </span>
              <span className="text-lg">{getThemeEmoji(vibeQuote.theme)}</span>
            </div>
          )}
        </div>

        {/* Personalized Vibe Quote Box */}
        {vibeQuote && (
          <div className={`mb-8 max-w-2xl mx-auto transform transition-all duration-1000 delay-200 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className={`p-8 rounded-3xl backdrop-blur-sm border shadow-2xl ${
              isDark 
                ? 'bg-white/10 border-white/20 text-white' 
                : 'bg-white/80 border-gray-200 text-gray-800'
            }`}>
              <div className="text-center">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <span className="text-2xl">{getThemeEmoji(vibeQuote.theme)}</span>
                  <span className={`text-sm font-medium px-3 py-1 rounded-full ${
                    isDark ? 'bg-white/20' : 'bg-gray-100'
                  }`}>
                    {vibeQuote.theme} • {vibeQuote.mood}
                  </span>
                </div>
                <p className="text-lg md:text-xl leading-relaxed font-medium italic">
                  "{vibeQuote.text}"
                </p>
                <div className={`mt-4 text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Matched to your {latestLog.mood.toLowerCase()} mood
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Latest Mood Reflection */}
        <div className={`mb-8 transform transition-all duration-1000 delay-400 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className={`bg-gradient-to-br ${getMoodColor(latestLog.mood)} p-6 rounded-2xl shadow-xl max-w-md mx-auto text-white`}>
            <div className="text-center">
              <div className="text-4xl mb-3">{getMoodEmoji(latestLog.mood)}</div>
              <h3 className="text-xl font-bold mb-2">You felt: {latestLog.mood}</h3>
              <p className="text-white/80 text-sm mb-3">
                {latestLog.timestamp.toLocaleString()}
              </p>
              {latestLog.journalEntry && (
                <div className="bg-white/20 rounded-xl p-3 backdrop-blur-sm">
                  <p className="text-sm leading-relaxed">
                    <span className="font-medium">You wrote:</span> "{latestLog.journalEntry}"
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Daily Mood Recap */}
        {todayLogs.length > 1 && (
          <div className={`mb-8 transform transition-all duration-1000 delay-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className={`p-6 rounded-2xl backdrop-blur-sm border max-w-lg mx-auto ${
              isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200'
            }`}>
              <h3 className={`text-lg font-bold mb-4 text-center ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                Today's Mood Recap
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {Object.entries(dailyRecap).map(([type, count]) => (
                  <div key={type} className={`p-3 rounded-lg text-center ${
                    isDark ? 'bg-white/5' : 'bg-gray-50'
                  }`}>
                    <div className={`text-sm font-medium capitalize ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      {type}
                    </div>
                    <div className={`text-xl font-bold ${
                      isDark ? 'text-white' : 'text-gray-800'
                    }`}>
                      {count}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className={`mb-8 transform transition-all duration-1000 delay-600 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            <div className={`p-4 rounded-xl backdrop-blur-sm border ${
              isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-white/80 border-gray-200 text-gray-800'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <Calendar className="text-purple-400" size={20} />
                <span className="font-semibold text-sm">Total Check-ins</span>
              </div>
              <p className="text-xl font-bold">{allLogs.length}</p>
            </div>

            <div className={`p-4 rounded-xl backdrop-blur-sm border ${
              isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-white/80 border-gray-200 text-gray-800'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <Heart className="text-pink-400" size={20} />
                <span className="font-semibold text-sm">This Week</span>
              </div>
              <p className="text-xl font-bold">{getWeeklyLogs().length}</p>
            </div>

            <div className={`p-4 rounded-xl backdrop-blur-sm border ${
              isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-white/80 border-gray-200 text-gray-800'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                <TrendingUp className="text-green-400" size={20} />
                <span className="font-semibold text-sm">Today</span>
              </div>
              <p className="text-xl font-bold">{dailyCount}/5</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 transform transition-all duration-1000 delay-800 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          {/* Retry CTA - Only show if less than 5 moods today */}
          {canAddMore && (
            <button
              onClick={() => navigate('/mood')}
              className={`group px-6 py-3 text-base font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-xl ${
                isDark 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-400 hover:to-purple-500' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
              }`}
            >
              <span className="flex items-center gap-2">
                <Plus size={18} className="group-hover:rotate-90 transition-transform duration-300" />
                Add another mood?
              </span>
            </button>
          )}

          <button
            onClick={() => navigate('/history')}
            className={`px-6 py-3 text-base font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${
              isDark 
                ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                : 'bg-black/10 text-gray-800 hover:bg-black/20 border border-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <BarChart3 size={18} />
              See mood history
            </span>
          </button>
          
          <button
            onClick={() => navigate('/')}
            className={`px-6 py-3 text-base font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${
              isDark 
                ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                : 'bg-black/10 text-gray-800 hover:bg-black/20 border border-gray-200'
            }`}
          >
            <span className="flex items-center gap-2">
              <Home size={18} />
              Back to Home
            </span>
          </button>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
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