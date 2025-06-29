import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Moon, Sun, Sparkles, Heart, Star } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

const memeLines = [
  "Your vibe is valid. Even if it's unhinged.",
  "Let your mood cook. We'll track it.",
  "Jinjja feelings? Let's log that chaos.",
  "Built for sad girls, sleepy boys, and everyone in between.",
  "Real vibes only. No toxic positivity here."
];

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [currentMemeIndex, setCurrentMemeIndex] = useState(0);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const interval = setInterval(() => {
      setCurrentMemeIndex((prev) => (prev + 1) % memeLines.length);
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  // Redirect authenticated users to mood check
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/mood');
    }
  }, [isAuthenticated, navigate]);

  const handleEnterVibeZone = () => {
    if (isAuthenticated) {
      navigate('/mood');
    } else {
      navigate('/login');
    }
  };

  return (
    <div className={`layout-stable transition-all duration-1000 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100'
    }`}>
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl animate-float ${
          isDark ? 'bg-purple-500' : 'bg-pink-300'
        }`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl animate-float delay-1000 ${
          isDark ? 'bg-blue-500' : 'bg-blue-300'
        }`}></div>
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-10 blur-3xl animate-gentle-wave delay-2000 ${
          isDark ? 'bg-pink-500' : 'bg-purple-300'
        }`}></div>
      </div>

      {/* Enhanced floating emojis */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['😊', '🌸', '✨', '💫', '🌙', '☁️', '🦋', '🌈', '💖', '🌟', '🔮', '🎭'].map((emoji, i) => (
          <div
            key={i}
            className="absolute text-3xl opacity-30 animate-float"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${4 + Math.random() * 2}s`
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Enhanced theme toggle */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={toggleTheme}
          className={`p-4 rounded-2xl transition-all duration-300 hover:scale-110 glass-strong group ${
            isDark 
              ? 'text-white hover:bg-white/20' 
              : 'text-gray-800 hover:bg-black/20'
          }`}
        >
          {isDark ? (
            <Sun size={24} className="group-hover:rotate-180 transition-transform duration-500" />
          ) : (
            <Moon size={24} className="group-hover:rotate-12 transition-transform duration-300" />
          )}
        </button>
      </div>

      {/* Main content with proper centering */}
      <div className="content-container">
        <div className="text-center space-y-12">
          {/* PERFECT Enhanced Header with proper spacing */}
          <div className={`transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="relative mb-8">
              {/* PERFECT JinjjaMood title - just right size with proper line height */}
              <h1 className="text-display text-gradient animate-fadeInUp text-render-optimized prevent-shift">
                JinjjaMood
              </h1>
              
              {/* Enhanced decorative elements with proper positioning */}
              <div className="absolute -top-4 -right-4 md:-top-6 md:-right-6">
                <Star className="text-yellow-400 animate-sparkle" size={32} />
              </div>
              <div className="absolute -bottom-2 -left-4 md:-bottom-3 md:-left-6">
                <Heart className="text-pink-400 animate-gentle-wave" size={24} />
              </div>
              <div className="absolute top-1/2 -right-2 md:-right-4">
                <Sparkles className="text-purple-400 animate-pulse" size={20} />
              </div>
            </div>
            
            {/* Subtitle with better spacing */}
            <p className={`text-lg md:text-xl font-light tracking-wider mb-4 ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              jinjja → real/really
            </p>
          </div>

          {/* Enhanced dynamic meme line with proper spacing */}
          <div className={`transform transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="glass-strong rounded-2xl px-8 py-6 max-w-3xl mx-auto">
              <p className="text-xl md:text-2xl font-medium transition-all duration-500 text-primary">
                {memeLines[currentMemeIndex]}
              </p>
            </div>
          </div>

          {/* Enhanced CTA Button with proper spacing */}
          <div className={`transform transition-all duration-1000 delay-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <button
              onClick={handleEnterVibeZone}
              className="group relative btn-primary text-xl md:text-2xl px-12 py-6 animate-pulse-glow rounded-3xl"
            >
              <span className="flex items-center gap-4 relative z-10">
                <Sparkles size={24} className="group-hover:rotate-12 transition-transform duration-300" />
                <span className="font-bold">Enter your vibe zone</span>
                <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              
              {/* Enhanced glow effect */}
              <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-purple-600/50 to-pink-600/50 blur-xl"></div>
            </button>
          </div>

          {/* Enhanced Footer with proper positioning */}
          <div className={`transform transition-all duration-1000 delay-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Made with too many feelings + Bolt.new ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};