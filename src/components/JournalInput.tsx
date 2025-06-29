import React from 'react';
import { Edit3 } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface JournalInputProps {
  value: string;
  onChange: (value: string) => void;
}

export const JournalInput: React.FC<JournalInputProps> = ({ value, onChange }) => {
  const { isDark } = useTheme();

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="relative">
        <div className={`absolute top-4 left-4 transition-colors duration-300 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
          <Edit3 size={20} />
        </div>
        
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Want to say more? (optional)"
          className={`
            w-full h-32 pl-12 pr-4 py-4 rounded-2xl resize-none transition-all duration-300 focus:scale-[1.02]
            ${isDark 
              ? 'bg-white/10 text-white placeholder-gray-400 border-white/20 focus:border-white/40 focus:shadow-lg focus:shadow-purple-500/20' 
              : 'bg-white/80 text-gray-800 placeholder-gray-500 border-gray-200 focus:border-purple-300 focus:shadow-lg focus:shadow-purple-500/20'
            }
            backdrop-blur-sm border focus:outline-none focus:ring-2 focus:ring-purple-400/50
            text-sm md:text-base leading-relaxed
          `}
        />

        {/* Character count */}
        <div className={`absolute bottom-2 right-2 text-xs ${
          isDark ? 'text-gray-500' : 'text-gray-400'
        }`}>
          {value.length}/500
        </div>
      </div>
    </div>
  );
};