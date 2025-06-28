import React, { useState } from 'react';
import { Mail, Shield, Sparkles } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const { signInWithGoogle, loading, error } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  React.useEffect(() => {
    setIsVisible(true);
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-72 h-72 bg-pink-300 rounded-full opacity-20 blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-300 rounded-full opacity-20 blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-purple-300 rounded-full opacity-10 blur-3xl animate-pulse delay-2000"></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6">
        {/* Header */}
        <div className={`text-center mb-12 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
            JinjjaMood
          </h1>
          
          <p className="text-sm md:text-base font-light tracking-wider text-gray-600 mb-4">
            jinjja → real/really
          </p>
          
          <p className="text-lg md:text-xl font-medium text-gray-800 max-w-2xl mx-auto">
            Track your real feelings. No toxic positivity here.
          </p>
        </div>

        {/* Login Card */}
        <div className={`bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 shadow-2xl max-w-md w-full transform transition-all duration-1000 delay-300 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="text-center mb-6">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Shield className="text-purple-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-800">Secure Login</h2>
            </div>
            
            <p className="text-gray-600 text-sm">
              Sign in with your Gmail account to start tracking your jinjja vibes
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-4 p-3 bg-red-100 border border-red-300 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {/* Gmail-only notice */}
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="text-blue-600" size={16} />
              <span className="text-blue-800 font-medium text-sm">Gmail Only</span>
            </div>
            <p className="text-blue-700 text-xs">
              For security and simplicity, we only support Gmail accounts (@gmail.com)
            </p>
          </div>

          {/* Sign In Button */}
          <button
            onClick={signInWithGoogle}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-3 px-6 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
          >
            <span className="flex items-center justify-center gap-3">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Signing in...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Continue with Gmail
                </>
              )}
            </span>
          </button>

          {/* Features */}
          <div className="mt-6 space-y-2">
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Sparkles size={14} className="text-purple-500" />
              <span>Personalized mood tracking</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Sparkles size={14} className="text-purple-500" />
              <span>Daily vibe quotes matched to your mood</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-gray-600">
              <Sparkles size={14} className="text-purple-500" />
              <span>Private journal entries & mood history</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className={`mt-8 text-center transform transition-all duration-1000 delay-500 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <p className="text-sm text-gray-500">
            Your data is private and secure. We never share your personal information.
          </p>
        </div>
      </div>

      {/* Bolt.new Badge */}
      <a
        href="https://bolt.new"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-3 right-3 z-50 transition-all duration-300 hover:scale-105 opacity-80 hover:opacity-100"
      >
        <img
          src="/Copy of logotext_poweredby_360w.png"
          alt="Built with Bolt"
          className="w-24 h-auto cursor-pointer"
        />
      </a>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="absolute w-2 h-2 bg-purple-400 rounded-full opacity-30 animate-bounce"
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
  );
};