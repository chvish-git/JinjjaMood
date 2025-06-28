import React from 'react';
import { MoodType } from '../types/mood';

interface MoodSelectorProps {
  selectedMood: MoodType | null;
  onMoodSelect: (mood: MoodType) => void;
  isDark: boolean;
}

const moodOptions: { mood: MoodType; emoji: string; color: string; darkColor: string }[] = [
  { mood: 'Sad', emoji: '😢', color: 'from-blue-400 to-blue-600', darkColor: 'from-blue-500 to-blue-700' },
  { mood: 'Neutral', emoji: '😐', color: 'from-gray-400 to-gray-600', darkColor: 'from-gray-500 to-gray-700' },
  { mood: 'Good', emoji: '😊', color: 'from-green-400 to-green-600', darkColor: 'from-green-500 to-green-700' },
  { mood: 'Stressed', emoji: '😰', color: 'from-orange-400 to-red-500', darkColor: 'from-orange-500 to-red-600' },
  { mood: 'Hyped', emoji: '🤩', color: 'from-purple-400 to-pink-500', darkColor: 'from-purple-500 to-pink-600' }
];

export const MoodSelector: React.FC<MoodSelectorProps> = ({ selectedMood, onMoodSelect, isDark }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
      {moodOptions.map(({ mood, emoji, color, darkColor }) => (
        <button
          key={mood}
          onClick={() => onMoodSelect(mood)}
          className={`
            relative p-6 rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-xl
            ${selectedMood === mood 
              ? `bg-gradient-to-br ${isDark ? darkColor : color} text-white shadow-2xl scale-105` 
              : isDark 
                ? 'bg-white/10 text-white hover:bg-white/20' 
                : 'bg-white/80 text-gray-800 hover:bg-white/90'
            }
            backdrop-blur-sm border border-white/20
          `}
        >
          <div className="text-center">
            <div className="text-3xl mb-2">{emoji}</div>
            <div className="font-medium text-sm md:text-base">{mood}</div>
          </div>
          
          {selectedMood === mood && (
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-white/20 to-transparent pointer-events-none"></div>
          )}
        </button>
      ))}
    </div>
  );
};