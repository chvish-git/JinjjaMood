import React, { useState } from 'react';
import { MoodType } from '../types/mood';
import { moodOptions, getMoodsByType } from '../data/moodOptions';

interface MoodSelectorProps {
  selectedMood: MoodType | null;
  onMoodSelect: (mood: MoodType) => void;
  isDark: boolean;
}

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onMoodSelect, isDark }) => {
  const [activeCategory, setActiveCategory] = useState<'positive' | 'neutral' | 'negative' | 'bonus'>('positive');

  const categories = [
    { key: 'positive', label: 'Positive', emoji: '✨', color: 'text-green-500' },
    { key: 'neutral', label: 'Neutral', emoji: '😐', color: 'text-gray-500' },
    { key: 'negative', label: 'Negative', emoji: '💙', color: 'text-blue-500' },
    { key: 'bonus', label: 'Bonus', emoji: '🔥', color: 'text-purple-500' }
  ] as const;

  const currentMoods = getMoodsByType(activeCategory);

  return (
    <div className="w-full max-w-4xl mx-auto">
      {/* Category Tabs */}
      <div className="flex justify-center mb-6">
        <div className={`flex rounded-2xl p-1 ${
          isDark ? 'bg-white/10' : 'bg-black/10'
        }`}>
          {categories.map(({ key, label, emoji, color }) => (
            <button
              key={key}
              onClick={() => setActiveCategory(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                activeCategory === key
                  ? isDark 
                    ? 'bg-white/20 text-white shadow-lg' 
                    : 'bg-white text-gray-800 shadow-lg'
                  : isDark 
                    ? 'text-gray-400 hover:text-white hover:bg-white/10' 
                    : 'text-gray-600 hover:text-gray-800 hover:bg-white/50'
              }`}
            >
              <span className="text-lg">{emoji}</span>
              <span className="hidden sm:inline">{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Mood Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {currentMoods.map(({ mood, emoji, color, darkColor, description }) => (
          <button
            key={mood}
            onClick={() => onMoodSelect(mood)}
            className={`
              relative p-4 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl
              ${selectedMood === mood 
                ? `bg-gradient-to-br ${isDark ? darkColor : color} text-white shadow-2xl scale-105` 
                : isDark 
                  ? 'bg-white/10 text-white hover:bg-white/20' 
                  : 'bg-white/80 text-gray-800 hover:bg-white/90'
              }
              backdrop-blur-sm border border-white/20 group
            `}
            title={description}
          >
            <div className="text-center">
              <div className="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">
                {emoji}
              </div>
              <div className="font-medium text-xs capitalize leading-tight">
                {mood.replace(' ', '\n')}
              </div>
            </div>
            
            {selectedMood === mood && (
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
            )}
          </button>
        ))}
      </div>

      {/* Category Description */}
      <div className={`text-center mt-4 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
        {activeCategory === 'positive' && "✨ Feeling good? These vibes are for you!"}
        {activeCategory === 'neutral' && "😐 Sometimes we're just... existing. That's valid too."}
        {activeCategory === 'negative' && "💙 Having a rough time? We see you and it's okay."}
        {activeCategory === 'bonus' && "🔥 For when regular moods just don't capture the chaos."}
      </div>
    </div>
  );
};