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
    <div className="w-full max-w-5xl mx-auto">
      {/* Category Tabs */}
      <div className="flex justify-center mb-8">
        <div className="glass-strong rounded-2xl p-2">
          {categories.map(({ key, label, emoji, color }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex items-center gap-3 px-6 py-3 rounded-xl text-sm font-semibold transition-all duration-300 hover:scale-105 focus-enhanced ${
                activeCategory === key
                  ? `${color} text-white shadow-lg transform scale-105` 
                  : isDark 
                    ? 'text-gray-300 hover:text-white hover:bg-white/10' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <span className="text-xl">{emoji}</span>
              <span className="hidden sm:inline font-medium">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Category Description */}
      <div className={`text-center mb-6 transition-all duration-500 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
        <p className="text-body animate-fadeInUp">
          {activeCategory_info?.description}
        </p>
      </div>

      {/* Mood Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        {currentMoods.map(({ mood, emoji, color, darkColor, description }) => (
          <button
            key={mood}
            onClick={() => onMoodSelect(mood)}
            className={`
              btn-mood card-enhanced relative group focus-enhanced
              ${selectedMood === mood 
                ? `bg-gradient-to-br ${isDark ? darkColor : color} text-white shadow-2xl scale-105 ring-4 ring-white/30` 
                : isDark 
                  ? 'hover:bg-white/20' 
                  : 'hover:bg-white/90'
              }
            `}
            title={description}
          >
            <div className="text-center relative z-10">
              <div className="text-3xl mb-3 group-hover:scale-125 transition-transform duration-300 animate-gentle-wave">
                {emoji}
              </div>
              <div className={`font-semibold text-sm capitalize leading-tight ${
                selectedMood === mood ? 'text-white' : 'text-primary'
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

      {/* Enhanced visual feedback */}
      <div className="mt-8 text-center">
        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full glass transition-all duration-300 ${
          selectedMood ? 'opacity-100 scale-100' : 'opacity-0 scale-95'
        }`}>
          <span className="text-sm font-medium text-secondary">
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