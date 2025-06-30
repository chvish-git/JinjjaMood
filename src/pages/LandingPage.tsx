import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Moon, Sun, Sparkles, HelpCircle, X } from 'lucide-react';
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
  const [showInfo, setShowInfo] = useState(false);

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
    <div className={`min-h-screen transition-all duration-1000 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100'
    }`}>
      {/* Clean animated background - soft gradients only */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl animate-float ${
          isDark ? 'bg-purple-500' : 'bg-pink-300'
        }`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl animate-float delay-1000 ${
          isDark ? 'bg-blue-500' : 'bg-blue-300'
        }`}></div>
      </div>

      {/* Subtle floating sparkles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {['✨', '💫', '🌟', '⭐'].map((emoji, i) => (
          <div
            key={i}
            className="absolute text-2xl opacity-20 animate-float"
            style={{
              left: `${20 + Math.random() * 60}%`,
              top: `${20 + Math.random() * 60}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${6 + Math.random() * 2}s`
            }}
          >
            {emoji}
          </div>
        ))}
      </div>

      {/* Top right controls */}
      <div className="absolute top-6 right-6 z-10 flex gap-3">
        <button
          onClick={() => setShowInfo(true)}
          className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm ${
            isDark 
              ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
              : 'bg-white/30 text-gray-800 hover:bg-white/50 border border-white/40'
          }`}
          title="What is JinjjaMood?"
        >
          <HelpCircle size={20} />
        </button>
        
        <button
          onClick={toggleTheme}
          className={`p-3 rounded-xl transition-all duration-300 hover:scale-110 backdrop-blur-sm ${
            isDark 
              ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
              : 'bg-white/30 text-gray-800 hover:bg-white/50 border border-white/40'
          }`}
        >
          {isDark ? (
            <Sun size={20} className="hover:rotate-180 transition-transform duration-500" />
          ) : (
            <Moon size={20} className="hover:rotate-12 transition-transform duration-300" />
          )}
        </button>
      </div>

      {/* Info Modal */}
      {showInfo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/50 backdrop-blur-sm">
          <div className={`max-w-md w-full rounded-3xl p-8 shadow-2xl ${
            isDark ? 'bg-slate-800 border border-slate-600' : 'bg-white border border-gray-200'
          }`}>
            <div className="flex items-center justify-between mb-6">
              <h3 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                What is JinjjaMood? 🤔
              </h3>
              <button
                onClick={() => setShowInfo(false)}
                className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                  isDark ? 'hover:bg-white/20 text-gray-400' : 'hover:bg-black/20 text-gray-600'
                }`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="space-y-4">
              <div className={`p-4 rounded-xl ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`text-sm leading-relaxed ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                  <strong className="text-purple-500">jinjja</strong> (진짜) is Korean for "real" or "really" — and that's exactly what we're about.
                </p>
              </div>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <span className="text-lg">📊</span>
                  <div>
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Track Your Real Feelings
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      24 different mood options from "joyful" to "chaos gremlin"
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-lg">🎯</span>
                  <div>
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Healthy Boundaries
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Max 5 mood logs per day to prevent overthinking
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <span className="text-lg">📈</span>
                  <div>
                    <h4 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                      Beautiful Analytics
                    </h4>
                    <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      Charts, insights, and patterns about your emotional journey
                    </p>
                  </div>
                </div>
              </div>
              
              <div className={`p-4 rounded-xl border-l-4 border-pink-400 ${
                isDark ? 'bg-pink-500/10' : 'bg-pink-50'
              }`}>
                <p className={`text-sm font-medium ${isDark ? 'text-pink-300' : 'text-pink-800'}`}>
                  No toxic positivity. No judgment. Just real feelings, tracked honestly.
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Main hero content - centered and clean */}
      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10">
        <div className="text-center space-y-12 max-w-4xl mx-auto">
          
          {/* Main title */}
          <div className={`transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h1 
              className="font-black bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-6 leading-tight tracking-tight"
              style={{
                fontSize: 'clamp(3rem, 12vw, 8rem)',
                lineHeight: '0.9'
              }}
            >
              JinjjaMood
            </h1>
            
            <p className={`text-lg md:text-xl font-light tracking-wider ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              jinjja → real/really
            </p>
          </div>

          {/* Dynamic tagline */}
          <div className={`transform transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className={`backdrop-blur-sm rounded-2xl px-8 py-6 max-w-2xl mx-auto border ${
              isDark 
                ? 'bg-white/5 border-white/10' 
                : 'bg-white/30 border-white/40'
            }`}>
              <p className={`text-xl md:text-2xl font-medium transition-all duration-500 ${
                isDark ? 'text-white' : 'text-gray-800'
              }`}>
                {memeLines[currentMemeIndex]}
              </p>
            </div>
          </div>

          {/* Single vibrant CTA button */}
          <div className={`transform transition-all duration-1000 delay-600 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <button
              onClick={handleEnterVibeZone}
              className="group relative inline-flex items-center gap-3 px-12 py-6 text-xl md:text-2xl font-bold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500"
            >
              <Sparkles size={24} className="group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
              <span>Enter the vibe zone</span>
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
              
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-purple-600/50 to-pink-600/50 blur-xl -z-10"></div>
            </button>
          </div>

          {/* Footer */}
          <div className={`transform transition-all duration-1000 delay-800 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <p className={`text-base ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Made with too many feelings + Bolt.new ✨
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};