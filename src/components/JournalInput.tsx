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
          isDark ? 'text-gray-400' : 'text-gray-500'
        }`}>
          <Edit3 size={20} />
        </div>
        
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Want to add a note? (optional)"
          maxLength={500}
          className={`
            input-enhanced w-full h-32 pl-12 pr-16 py-4 rounded-2xl resize-none
            text-body placeholder:text-caption
            focus:ring-4 focus:ring-purple-400/20
            ${isDark 
              ? 'placeholder-gray-400' 
              : 'placeholder-gray-500'
            }
          `}
        />

        {/* Character count with enhanced styling */}
        <div className={`absolute bottom-3 right-3 flex items-center gap-2 text-caption transition-all duration-300 ${
          value.length > 450 ? 'text-orange-500' : isDark ? 'text-gray-500' : 'text-gray-400'
        }`}>
          {value.length > 0 && (
            <Sparkles size={12} className="animate-sparkle" />
          )}
          <span className="font-medium">
            {value.length}/500
          </span>
        </div>

        {/* Enhanced focus ring */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none transition-all duration-300 group-focus-within:ring-4 group-focus-within:ring-purple-400/20"></div>
      </div>

      {/* Writing tips */}
      {value.length === 0 && (
        <div className={`mt-3 text-center transition-all duration-300 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
          <p className="text-caption">
            💭 Share what's on your mind, or just vibe in silence
          </p>
        </div>
      )}
    </div>
  );
};