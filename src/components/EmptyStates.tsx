import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Heart, BarChart3, TrendingUp, Sparkles, ArrowRight } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface EmptyStateProps {
  type: 'mood-history' | 'analytics' | 'results';
  title: string;
  description: string;
  actionText: string;
  actionPath: string;
  icon?: React.ReactNode;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type,
  title,
  description,
  actionText,
  actionPath,
  icon
}) => {
  const navigate = useNavigate();
  const { isDark } = useTheme();

  const getDefaultIcon = () => {
    switch (type) {
      case 'mood-history':
        return <BarChart3 size={64} className="text-purple-400" />;
      case 'analytics':
        return <TrendingUp size={64} className="text-blue-400" />;
      case 'results':
        return <Heart size={64} className="text-pink-400" />;
      default:
        return <Sparkles size={64} className="text-purple-400" />;
    }
  };

  const getIllustration = () => {
    switch (type) {
      case 'mood-history':
        return (
          <div className="relative">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 ${
              isDark ? 'bg-purple-500/20' : 'bg-purple-100'
            }`}>
              <BarChart3 size={48} className="text-purple-500" />
            </div>
            <div className="absolute -top-2 -right-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                isDark ? 'bg-pink-500/20' : 'bg-pink-100'
              }`}>
                <Sparkles size={16} className="text-pink-500" />
              </div>
            </div>
          </div>
        );
      case 'analytics':
        return (
          <div className="relative">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 ${
              isDark ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <TrendingUp size={48} className="text-blue-500" />
            </div>
            <div className="absolute -bottom-2 -left-2">
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                isDark ? 'bg-green-500/20' : 'bg-green-100'
              }`}>
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              </div>
            </div>
          </div>
        );
      case 'results':
        return (
          <div className="relative">
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center mb-6 ${
              isDark ? 'bg-pink-500/20' : 'bg-pink-100'
            }`}>
              <Heart size={48} className="text-pink-500" />
            </div>
            <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
              <div className="flex gap-1">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full animate-bounce ${
                    isDark ? 'bg-yellow-400' : 'bg-yellow-500'
                  }`} style={{ animationDelay: `${i * 0.1}s` }}></div>
                ))}
              </div>
            </div>
          </div>
        );
      default:
        return icon || getDefaultIcon();
    }
  };

  return (
    <div className={`min-h-screen flex items-center justify-center pt-16 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100'
    }`}>
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl animate-pulse ${
          isDark ? 'bg-purple-500' : 'bg-pink-300'
        }`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl animate-pulse delay-1000 ${
          isDark ? 'bg-blue-500' : 'bg-blue-300'
        }`}></div>
      </div>

      <div className="relative z-10 text-center max-w-md mx-auto px-6">
        {/* Illustration */}
        <div className="mb-8">
          {getIllustration()}
        </div>

        {/* Content */}
        <h2 className={`text-3xl font-bold mb-4 ${
          isDark ? 'text-white' : 'text-gray-800'
        }`}>
          {title}
        </h2>
        
        <p className={`text-lg mb-8 leading-relaxed ${
          isDark ? 'text-gray-400' : 'text-gray-600'
        }`}>
          {description}
        </p>

        {/* Action Button */}
        <button
          onClick={() => navigate(actionPath)}
          className={`group inline-flex items-center gap-3 px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
            isDark 
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-400 hover:to-purple-500' 
              : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
          }`}
        >
          <span>{actionText}</span>
          <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
          
          {/* Glow effect */}
          <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
            isDark 
              ? 'bg-gradient-to-r from-pink-500 to-purple-600 blur-xl' 
              : 'bg-gradient-to-r from-purple-600 to-pink-600 blur-xl'
          }`}></div>
        </button>

        {/* Floating particles effect */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          {[...Array(6)].map((_, i) => (
            <div
              key={i}
              className={`absolute w-2 h-2 rounded-full opacity-30 animate-bounce ${
                isDark ? 'bg-white' : 'bg-purple-400'
              }`}
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 3}s`,
                animationDuration: `${3 + Math.random() * 2}s`
              }}
            ></div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Specific empty state components
export const MoodHistoryEmptyState: React.FC = () => (
  <EmptyState
    type="mood-history"
    title="Your mood journey awaits"
    description="Start tracking your vibes to see beautiful insights and patterns emerge over time."
    actionText="Log Your First Mood"
    actionPath="/mood"
  />
);

export const AnalyticsEmptyState: React.FC = () => (
  <EmptyState
    type="analytics"
    title="Analytics coming soon"
    description="Keep logging your moods to unlock powerful insights about your emotional patterns and trends."
    actionText="Start Tracking"
    actionPath="/mood"
  />
);

export const ResultsEmptyState: React.FC = () => (
  <EmptyState
    type="results"
    title="No recent vibes found"
    description="It looks like you haven't logged any moods yet. Let's capture your current vibe!"
    actionText="Check In Now"
    actionPath="/mood"
  />
);