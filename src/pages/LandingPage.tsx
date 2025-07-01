import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Moon, Sun, Sparkles } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';

export const LandingPage: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Redirect authenticated users only after mount and visibility
  useEffect(() => {
    if (isVisible && isAuthenticated) {
      navigate('/mood');
    }
  }, [isAuthenticated, navigate, isVisible]);

  return (
    <div className={`min-h-screen transition-all duration-1000 ${
      isDark 
        ? 'bg-slate-900 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-white bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100'
    }`}>
      {/* Clean animated background - minimal with mobile optimization */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-1/4 left-1/4 w-96 h-96 rounded-full opacity-10 blur-3xl md:animate-float ${
          isDark ? 'bg-purple-500' : 'bg-pink-300'
        }`}></div>
        <div className={`absolute bottom-1/4 right-1/4 w-80 h-80 rounded-full opacity-15 blur-3xl md:animate-float delay-1000 ${
          isDark ? 'bg-blue-500' : 'bg-blue-300'
        }`}></div>
      </div>

      {/* Theme toggle - top right */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
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

      {/* Main content - centered and clean */}
      <main className="min-h-screen flex flex-col items-center justify-center px-6 relative z-10">
        <div className="text-center space-y-12 max-w-4xl mx-auto">
          
          {/* Logo + tagline - clean and bold */}
          <header className={`transform transition-all duration-1000 ${
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
            
            <p className={`text-xl md:text-2xl font-medium ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              Track your real feels. No filter.
            </p>
          </header>

          {/* Clean action buttons - no clutter */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center transform transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <button
              onClick={() => navigate('/login?mode=signup')}
              aria-label="Sign up for JinjjaMood"
              className="group relative inline-flex items-center gap-3 px-8 py-4 text-xl font-bold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500"
            >
              <Sparkles size={24} className="group-hover:rotate-12 group-hover:scale-110 transition-all duration-300" />
              <span>Get Started</span>
              <ArrowRight size={24} className="group-hover:translate-x-2 transition-transform duration-300" />
              
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-purple-600/50 to-pink-600/50 blur-xl -z-10"></div>
            </button>
            
            <button
              onClick={() => navigate('/login?mode=signin')}
              aria-label="Sign in to JinjjaMood"
              className={`px-8 py-4 text-xl font-bold rounded-full transition-all duration-300 transform hover:scale-105 ${
                isDark 
                  ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                  : 'bg-white/30 text-gray-800 hover:bg-white/50 border border-white/40'
              }`}
            >
              Sign In
            </button>
          </div>

          {/* Minimal footer */}
          <footer className={`transform transition-all duration-1000 delay-600 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              Real vibes only ✨
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
};