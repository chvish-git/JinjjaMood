import React, { useState } from 'react';
import { MoodType } from '../types/mood';
import { moodOptions, getMoodsByType } from '../data/moodOptions';
import { useTheme } from '../contexts/ThemeContext';

interface MoodSelectorProps {
  selectedMood: MoodType | null;
  onMoodSelect: (mood: MoodType) => void;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onMoodSelect }) => {
  const { isDark } = useTheme();
  const [activeCategory, setActiveCategory] = useState<'positive' | 'neutral' | 'negative' | 'bonus'>('positive');

  const categories = [
    { key: 'positive', label: 'Positive', emoji: '✨', color: 'mood-positive', description: 'Feeling good? These vibes are for you!' },
    { key: 'neutral', label: 'Neutral', emoji: '😐', color: 'mood-neutral', description: 'Sometimes we\'re just... existing. That\'s valid too.' },
    { key: 'negative', label: 'Negative', emoji: '💙', color: 'mood-negative', description: 'Having a rough time? We see you and it\'s okay.' },
    { key: 'bonus', label: 'Bonus', emoji: '🔥', color: 'mood-bonus', description: 'For when regular moods just don\'t capture the chaos.' }
  ] as const;

  const currentMoods = getMoodsByType(activeCategory);
  const activeCategory_info = categories.find(cat => cat.key === activeCategory);

  return (
    <div className="w-full max-w-6xl mx-auto">
      {/* Enhanced Category Tabs with better contrast */}
      <div className="flex justify-center mb-8">
        <div className={`rounded-2xl p-2 w-full max-w-2xl border-2 ${
          isDark 
            ? 'bg-slate-800/90 border-slate-600 backdrop-blur-sm' 
            : 'bg-white/95 border-gray-300 backdrop-blur-sm shadow-lg'
        }`}>
          <div className="grid grid-cols-4 gap-2">
            {categories.map(({ key, label, emoji, color }) => (
              <button
                key={key}
                onClick={() => setActiveCategory(key)}
                className={`flex flex-col items-center gap-2 px-4 py-4 rounded-xl text-sm font-bold transition-all duration-300 hover:scale-105 focus-enhanced border-2 ${
                  activeCategory === key
                    ? isDark
                      ? 'bg-gradient-to-br from-purple-600 to-pink-600 text-white border-purple-400 shadow-lg transform scale-105'
                      : 'bg-gradient-to-br from-purple-500 to-pink-500 text-white border-purple-300 shadow-lg transform scale-105'
                    : isDark 
                      ? 'text-gray-200 hover:text-white hover:bg-slate-700/80 border-slate-600 hover:border-slate-500' 
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100 border-gray-200 hover:border-gray-300'
                }`}
              >
                <span className="text-2xl">{emoji}</span>
                <span className="font-bold text-xs leading-tight">{label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Category Description with better contrast */}
      <div className={`text-center mb-6 transition-all duration-500 ${
        isDark ? 'text-gray-100' : 'text-gray-800'
      }`}>
        <p className="text-lg font-semibold animate-fadeInUp">
          {activeCategory_info?.description}
        </p>
      </div>

      {/* Enhanced Mood Grid with better contrast */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {currentMoods.map(({ mood, emoji, color, darkColor, description }) => (
          <button
            key={mood}
            onClick={() => onMoodSelect(mood)}
            className={`
              btn-mood relative group focus-enhanced p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl border-2
              ${selectedMood === mood 
                ? `bg-gradient-to-br ${isDark ? darkColor : color} text-white shadow-2xl scale-105 border-white/50` 
                : isDark 
                  ? 'bg-slate-800/80 text-gray-100 hover:bg-slate-700/90 border-slate-600 hover:border-slate-500 backdrop-blur-sm' 
                  : 'bg-white/90 text-gray-800 hover:bg-white border-gray-200 hover:border-gray-300 shadow-md hover:shadow-lg backdrop-blur-sm'
              }
            `}
            title={description}
          >
            <div className="text-center relative z-10">
              <div className="text-3xl mb-3 group-hover:scale-125 transition-transform duration-300 animate-gentle-wave">
                {emoji}
              </div>
              <div className={`font-bold text-sm capitalize leading-tight ${
                selectedMood === mood 
                  ? 'text-white' 
                  : isDark 
                    ? 'text-gray-100' 
                    : 'text-gray-800'
              }`}>
                {mood.replace(/([a-z])([A-Z])/g, '$1 $2')}
              </div>
            </div>
            
            {selectedMood === mood && (
              <>
                <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none animate-pulse-glow"></div>
                <div className="absolute -inset-1 rounded-2xl bg-gradient-to-br from-white/30 to-transparent pointer-events-none animate-sparkle"></div>
              </>
            )}

            {/* Enhanced hover glow effect */}
            <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-all duration-300 bg-gradient-to-br from-white/20 via-transparent to-white/10 pointer-events-none"></div>
          </button>
        ))}
      </div>

      {/* Enhanced visual feedback with better contrast */}
      <div className="mt-8 text-center">
        <div className={`inline-flex items-center gap-2 px-6 py-3 rounded-full border-2 transition-all duration-300 ${
          selectedMood ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        } ${
          isDark 
            ? 'bg-slate-800/90 border-slate-600 text-gray-100 backdrop-blur-sm' 
            : 'bg-white/95 border-gray-300 text-gray-800 backdrop-blur-sm shadow-lg'
        }`}>
          <span className="text-sm font-bold">
            {selectedMood ? `Selected: ${selectedMood}` : 'Choose your vibe'}
          </span>
          {selectedMood && (
            <span className="text-lg animate-gentle-wave">
              {currentMoods.find(m => m.mood === selectedMood)?.emoji}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};