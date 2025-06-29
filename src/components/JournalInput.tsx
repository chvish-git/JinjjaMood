import React from 'react';
import { Edit3, Sparkles } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface JournalInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const JournalInput: React.FC<JournalInputProps> = ({ value, onChange }) => {
  const { isDark } = useTheme();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative group">
        <div className={`absolute top-4 left-4 transition-all duration-300 group-focus-within:scale-110 group-focus-within:text-purple-400 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <Edit3 size={20} />
        </div>
        
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Want to add a note? (optional)"
          maxLength={500}
          className={`
            w-full h-32 pl-12 pr-16 py-4 rounded-2xl resize-none transition-all duration-300 focus:scale-[1.02] border-2
            text-base font-medium leading-relaxed
            focus:ring-4 focus:ring-purple-400/20 focus:outline-none
            ${isDark 
              ? 'bg-slate-800/90 text-gray-100 placeholder-gray-400 border-slate-600 focus:border-purple-400 backdrop-blur-sm' 
              : 'bg-white/95 text-gray-800 placeholder-gray-500 border-gray-300 focus:border-purple-500 backdrop-blur-sm shadow-lg'
            }
          `}
        />

        {/* Enhanced character count with better contrast */}
        <div className={`absolute bottom-3 right-3 flex items-center gap-2 text-sm font-bold transition-all duration-300 ${
          value.length > 450 
            ? 'text-orange-500' 
            : isDark 
              ? 'text-gray-300' 
              : 'text-gray-600'
        }`}>
          {value.length > 0 && (
            <Sparkles size={12} className="animate-sparkle" />
          )}
          <span>
            {value.length}/500
          </span>
        </div>

        {/* Enhanced focus ring */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-300 group-focus-within:ring-4 group-focus-within:ring-purple-400/20"></div>
      </div>

      {/* Enhanced writing tips with better contrast */}
      {value.length === 0 && (
        <div className={`mt-3 text-center transition-all duration-300 ${
          isDark ? 'text-gray-300' : 'text-gray-600'
        }`}>
          <p className="text-sm font-medium">
            💭 Share what's on your mind, or just vibe in silence
          </p>
        </div>
      )}
    </div>
  );
};