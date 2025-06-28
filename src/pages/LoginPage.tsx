import React, { useState, useEffect } from 'react';
import { User, Sparkles, AlertCircle, CheckCircle, ArrowRight, Loader } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

export const LoginPage: React.FC = () => {
  const { checkUsernameAndCreateOrLogin, loading } = useAuth();
  const [isVisible, setIsVisible] = useState(false);
  const [usernameInput, setUsernameInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleButtonClick = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsProcessing(true);
    
    try {
      const result = await checkUsernameAndCreateOrLogin(usernameInput);
      
      if (!result.success && result.error) {
        setErrorMessage(result.error);
      }
      // If success, the useAuth hook will automatically update and redirect
    } catch (err: any) {
      console.error('Login error:', err);
      setErrorMessage(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsernameInput(value);
    setErrorMessage(''); // Clear error when user starts typing
  };

  const isButtonDisabled = isProcessing || loading || usernameInput.length < 2;

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
        <div className={`text-center mb-8 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h1 className="text-6xl md:text-8xl font-bold mb-4 bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent animate-pulse">
            JinjjaMood
          </h1>
          
          <p className="text-sm md:text-base font-light tracking-wider text-gray-600 mb-2">
            jinjja → real/really
          </p>
          
          <p className="text-lg md:text-xl font-medium text-gray-800 max-w-2xl mx-auto">
            Check in with your real vibes
          </p>
        </div>

        {/* Cute mood-related image placeholder */}
        <div className={`mb-8 transform transition-all duration-1000 delay-200 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="w-32 h-32 mx-auto bg-gradient-to-br from-pink-200 to-purple-200 rounded-full flex items-center justify-center shadow-lg">
            <span className="text-4xl">🌸✨</span>
          </div>
        </div>

        {/* Login Card */}
        <div className={`bg-white/80 backdrop-blur-sm border border-gray-200 rounded-3xl p-8 shadow-2xl max-w-md w-full transform transition-all duration-1000 delay-400 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Welcome to JinjjaMood</h2>
            <p className="text-gray-600 text-sm">
              No signup needed — just use a unique name
            </p>
          </div>

          {/* Error Message */}
          {errorMessage && (
            <div className="mb-4 p-4 rounded-xl border bg-red-50 border-red-200 text-red-800">
              <div className="flex items-start gap-2">
                <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                <div className="text-sm">
                  <p className="font-medium mb-1">Error</p>
                  <p>{errorMessage}</p>
                </div>
              </div>
            </div>
          )}

          {/* Username Form */}
          <form onSubmit={handleButtonClick} className="space-y-4">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                Username
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  id="username"
                  value={usernameInput}
                  onChange={handleUsernameChange}
                  placeholder="your_username"
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  maxLength={20}
                  required
                  disabled={isProcessing}
                />
              </div>
              <p className="mt-2 text-xs text-gray-500">
                2-20 characters, letters, numbers, and underscores only
              </p>
            </div>

            <button
              type="submit"
              disabled={isButtonDisabled}
              className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white py-4 px-6 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group relative overflow-hidden"
            >
              {/* Button glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-purple-600 to-pink-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl"></div>
              
              <span className="relative flex items-center justify-center gap-3">
                {isProcessing ? (
                  <>
                    <Loader className="animate-spin h-5 w-5" />
                    Checking username...
                  </>
                ) : (
                  <>
                    Login / Create Account
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </span>
            </button>
          </form>

          {/* Features */}
          <div className="mt-6 space-y-3">
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center">
                <Sparkles size={12} className="text-purple-600" />
              </div>
              <span>Personalized mood tracking & insights</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center">
                <Sparkles size={12} className="text-pink-600" />
              </div>
              <span>Daily vibe quotes matched to your mood</span>
            </div>
            <div className="flex items-center gap-3 text-sm text-gray-600">
              <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center">
                <User size={12} className="text-blue-600" />
              </div>
              <span>Instant access with unique username</span>
            </div>
          </div>
        </div>

        {/* Security Notice */}
        <div className={`mt-6 text-center max-w-md transform transition-all duration-1000 delay-600 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <div className="flex items-center justify-center gap-2 mb-2">
            <CheckCircle size={16} className="text-green-600" />
            <span className="text-sm font-medium text-gray-700">Simple & Private</span>
          </div>
          <p className="text-xs text-gray-500 leading-relaxed">
            Your mood data is stored securely. Choose any unique username - 
            if it's available, we'll create your account instantly.
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
        {[...Array(8)].map((_, i) => (
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