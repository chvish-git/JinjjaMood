import React, { useState, useEffect } from 'react';
import { ArrowLeft, Calendar, Heart, TrendingUp } from 'lucide-react';
import { getLatestMoodLog, getMoodLogs } from '../utils/storage';
import { MoodLog } from '../types/mood';

interface ResultsProps {
  isDark: boolean;
  onBack: () => void;
  onNewMood: () => void;
}

export const Results: React.FC<ResultsProps> = ({ isDark, onBack, onNewMood }) => {
  const [latestLog, setLatestLog] = useState<MoodLog | null>(null);
  const [allLogs, setAllLogs] = useState<MoodLog[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setLatestLog(getLatestMoodLog());
    setAllLogs(getMoodLogs());
    setIsVisible(true);
  }, []);

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
      'Sad': isDark ? 'from-blue-500 to-blue-700' : 'from-blue-400 to-blue-600',
      'Neutral': isDark ? 'from-gray-500 to-gray-700' : 'from-gray-400 to-gray-600',
      'Good': isDark ? 'from-green-500 to-green-700' : 'from-green-400 to-green-600',
      'Stressed': isDark ? 'from-orange-500 to-red-600' : 'from-orange-400 to-red-500',
      'Hyped': isDark ? 'from-purple-500 to-pink-600' : 'from-purple-400 to-pink-500'
    };
    return colorMap[mood] || (isDark ? 'from-gray-500 to-gray-700' : 'from-gray-400 to-gray-600');
  };

  if (!latestLog) {
    return (
      <div className={`min-h-screen flex items-center justify-center ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100'
      }`}>
        <div className="text-center">
          <p className={`text-xl ${isDark ? 'text-white' : 'text-gray-800'}`}>
            No mood logs found. Let's start tracking!
          </p>
          <button
            onClick={onNewMood}
            className="mt-4 px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:scale-105 transition-transform duration-300"
          >
            Check In Now
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

      {/* Back button */}
      <div className="absolute top-6 left-6 z-10">
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
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        {/* Header */}
        <div className={`text-center mb-12 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            Mood Logged! ✨
          </h1>
          
          <p className={`text-lg md:text-xl font-light ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Your vibe has been captured
          </p>
        </div>

        {/* Latest Mood Card */}
        <div className={`mb-12 transform transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className={`bg-gradient-to-br ${getMoodColor(latestLog.mood)} p-8 rounded-3xl shadow-2xl max-w-md mx-auto text-white`}>
            <div className="text-center">
              <div className="text-6xl mb-4">{getMoodEmoji(latestLog.mood)}</div>
              <h3 className="text-2xl font-bold mb-2">{latestLog.mood}</h3>
              <p className="text-white/80 text-sm mb-4">
                {latestLog.timestamp.toLocaleString()}
              </p>
              {latestLog.journalEntry && (
                <div className="bg-white/20 rounded-2xl p-4 backdrop-blur-sm">
                  <p className="text-sm leading-relaxed">"{latestLog.journalEntry}"</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className={`mb-12 transform transition-all duration-1000 delay-500 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            <div className={`p-6 rounded-2xl backdrop-blur-sm border border-white/20 ${
              isDark ? 'bg-white/10 text-white' : 'bg-white/80 text-gray-800'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <Calendar className="text-purple-400" size={24} />
                <span className="font-semibold">Total Check-ins</span>
              </div>
              <p className="text-2xl font-bold">{allLogs.length}</p>
            </div>

            <div className={`p-6 rounded-2xl backdrop-blur-sm border border-white/20 ${
              isDark ? 'bg-white/10 text-white' : 'bg-white/80 text-gray-800'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <Heart className="text-pink-400" size={24} />
                <span className="font-semibold">This Week</span>
              </div>
              <p className="text-2xl font-bold">
                {allLogs.filter(log => {
                  const weekAgo = new Date();
                  weekAgo.setDate(weekAgo.getDate() - 7);
                  return log.timestamp >= weekAgo;
                }).length}
              </p>
            </div>

            <div className={`p-6 rounded-2xl backdrop-blur-sm border border-white/20 ${
              isDark ? 'bg-white/10 text-white' : 'bg-white/80 text-gray-800'
            }`}>
              <div className="flex items-center gap-3 mb-2">
                <TrendingUp className="text-green-400" size={24} />
                <span className="font-semibold">Streak</span>
              </div>
              <p className="text-2xl font-bold">1</p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`flex flex-col sm:flex-row gap-4 transform transition-all duration-1000 delay-700 ${
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
    </div>
  );
};