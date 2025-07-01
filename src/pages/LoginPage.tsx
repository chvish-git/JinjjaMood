import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, Sparkles, AlertCircle, CheckCircle, ArrowRight, Loader, Eye, EyeOff, Send, Clock } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const { signup, signupWithOtp, signInWithOtp, verifyOtp, login, loading, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  
  // Parse URL params for mode and verification
  const urlParams = new URLSearchParams(location.search);
  const urlMode = urlParams.get('mode');
  const isVerified = urlParams.get('verified') === 'true';
  const [isSignupMode, setIsSignupMode] = useState(urlMode === 'signup');
  const [authMethod, setAuthMethod] = useState<'password' | 'otp'>('otp'); // Default to OTP
  
  // Form inputs
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [otpInput, setOtpInput] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  
  // UI state
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [waitingForVerification, setWaitingForVerification] = useState(false);
  const [showOtpInput, setShowOtpInput] = useState(false);

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || '/mood';

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Handle email verification from magic link
  useEffect(() => {
    if (isVerified && !isAuthenticated) {
      setSuccessMessage('Email verified! Welcome to JinjjaMood! ✨');
      toast.success('Welcome to JinjjaMood! ✨', {
        duration: 4000,
        style: {
          background: '#10B981',
          color: '#fff',
          fontWeight: '600',
        },
      });
      
      // Clear URL params
      const newUrl = new URL(window.location.href);
      newUrl.searchParams.delete('verified');
      window.history.replaceState({}, '', newUrl.toString());
    }
  }, [isVerified, isAuthenticated]);

  // Redirect if already logged in - only after visibility is set
  useEffect(() => {
    if (isVisible && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from, isVisible]);

  // Update mode when URL changes
  useEffect(() => {
    if (urlMode === 'signup' || urlMode === 'signin') {
      setIsSignupMode(urlMode === 'signup');
    }
  }, [urlMode]);

  // Real-time validation
  const validateEmail = (email: string) => {
    if (!email.trim()) return 'Don\'t ghost the form. Fill it in, bestie.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'That email looks sus. Double-check it?';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password.trim()) return 'Don\'t ghost the form. Fill it in, bestie.';
    if (isSignupMode && password.length < 6) return 'Password needs at least 6 characters. Make it stronger!';
    return '';
  };

  const validateUsername = (username: string) => {
    if (!username.trim()) return 'Don\'t ghost the form. Fill it in, bestie.';
    if (username.length < 2) return 'Username needs at least 2 characters. Give it some substance!';
    if (username.length > 20) return 'Username\'s too long. Keep it snappy!';
    if (!/^[a-z0-9_]+$/.test(username.toLowerCase())) return 'Username can only have letters, numbers, and underscores. Keep it clean!';
    return '';
  };

  const handleModeChange = (newMode: 'signup' | 'signin') => {
    setIsSignupMode(newMode === 'signup');
    setErrorMessage('');
    setSuccessMessage('');
    setWaitingForVerification(false);
    setShowOtpInput(false);
    
    // Update URL without triggering navigation
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('mode', newMode);
    window.history.replaceState({}, '', newUrl.toString());
  };

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsProcessing(true);
    
    // Validate inputs
    const emailError = validateEmail(emailInput);
    const usernameError = isSignupMode ? validateUsername(usernameInput) : '';
    
    if (emailError || usernameError) {
      setErrorMessage(emailError || usernameError);
      setIsProcessing(false);
      return;
    }
    
    try {
      let result;
      
      if (isSignupMode) {
        result = await signupWithOtp(emailInput, usernameInput);
        
        if (result.success && result.needsVerification) {
          setSuccessMessage(`Magic link sent to ${emailInput}! Check your inbox and click the link to complete signup. ✨`);
          setWaitingForVerification(true);
          toast.success('Magic link sent! Check your email 📧', {
            duration: 5000,
            style: {
              background: '#8B5CF6',
              color: '#fff',
              fontWeight: '600',
            },
          });
        } else if (result.error) {
          setErrorMessage(result.error);
          toast.error(result.error);
        }
      } else {
        result = await signInWithOtp(emailInput);
        
        if (result.success && result.needsVerification) {
          setSuccessMessage(`Magic link sent to ${emailInput}! Check your inbox and click the link to sign in. ✨`);
          setWaitingForVerification(true);
          toast.success('Magic link sent! Check your email 📧', {
            duration: 5000,
            style: {
              background: '#8B5CF6',
              color: '#fff',
              fontWeight: '600',
            },
          });
        } else if (result.error) {
          setErrorMessage(result.error);
          toast.error(result.error);
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const errorMsg = err.message || 'Something went sideways. Try again?';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsProcessing(true);
    
    // Validate inputs
    const emailError = validateEmail(emailInput);
    const passwordError = validatePassword(passwordInput);
    const usernameError = isSignupMode ? validateUsername(usernameInput) : '';
    
    if (emailError || passwordError || usernameError) {
      setErrorMessage(emailError || passwordError || usernameError);
      setIsProcessing(false);
      return;
    }
    
    try {
      let result;
      
      if (isSignupMode) {
        result = await signup(emailInput, passwordInput, usernameInput, rememberMe);
        
        if (result.success) {
          setSuccessMessage(`Welcome to the vibe zone, ${usernameInput}! ✨`);
          toast.success(`Welcome, ${usernameInput}! ✨`, {
            duration: 4000,
            style: {
              background: '#10B981',
              color: '#fff',
              fontWeight: '600',
            },
          });
          // Navigation will be handled by the useEffect when isAuthenticated becomes true
        } else if (result.error) {
          setErrorMessage(result.error);
          
          if (result.error.includes('You\'ve been here before')) {
            toast.error('Already vibin\'? Try logging in 😌');
          } else if (result.error.includes('already vibin\' with someone else')) {
            toast.error('That name\'s taken. Try another! 💫');
          } else {
            toast.error(result.error);
          }
        }
      } else {
        result = await login(emailInput, passwordInput, rememberMe);
        
        if (result.success) {
          setSuccessMessage('Welcome back! 🎉');
          toast.success('Welcome back! 🎉', {
            duration: 3000,
            style: {
              background: '#8B5CF6',
              color: '#fff',
              fontWeight: '600',
            },
          });
          // Navigation will be handled by the useEffect when isAuthenticated becomes true
        } else if (result.error) {
          setErrorMessage(result.error);
          
          if (result.error.includes('That ain\'t the one')) {
            toast.error('Invalid login. Try again? 🤔');
          } else if (result.error.includes('No account with that email')) {
            toast.error('New here? Try signing up ✨');
          } else {
            toast.error(result.error);
          }
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const errorMsg = err.message || 'Something went sideways. Try again?';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const isOtpButtonDisabled = isProcessing || loading || 
    emailInput.length === 0 || 
    (isSignupMode && usernameInput.length < 2);

  const isPasswordButtonDisabled = isProcessing || loading || 
    emailInput.length === 0 || passwordInput.length === 0 || 
    (isSignupMode && usernameInput.length < 2);

  return (
    <div className={`min-h-screen ${
      isDark 
        ? 'bg-slate-900 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-white bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100'
    }`}>
      {/* Animated background elements - optimized for mobile */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl md:animate-pulse ${
          isDark ? 'bg-purple-500' : 'bg-pink-300'
        }`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl md:animate-pulse delay-1000 ${
          isDark ? 'bg-blue-500' : 'bg-blue-300'
        }`}></div>
      </div>

      {/* Main content */}
      <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12 relative z-10">
        <div className="w-full max-w-md mx-auto space-y-8">
          {/* Header */}
          <header className={`text-center transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h1 
              className="font-black bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent mb-6 leading-tight tracking-tight"
              style={{
                fontSize: 'clamp(2.5rem, 8vw, 4rem)',
                lineHeight: '1.1'
              }}
            >
              JinjjaMood
            </h1>
            
            <p className={`text-lg font-medium ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              {isSignupMode ? 'Join the vibe tribe ✨' : 'Welcome back, moodster 👋'}
            </p>
          </header>

          {/* Auth Card */}
          <div className={`glass-strong rounded-3xl p-6 shadow-2xl transform transition-all duration-1000 delay-400 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            {/* Mode Toggle */}
            <div className="flex justify-center mb-6">
              <div className={`rounded-2xl p-1 w-full max-w-2xl border-2 ${
                isDark 
                  ? 'bg-slate-800/90 border-slate-600' 
                  : 'bg-white/95 border-gray-300'
              }`} role="tablist" aria-label="Authentication mode">
                <button
                  type="button"
                  role="tab"
                  aria-selected={!isSignupMode}
                  aria-label="Switch to sign in mode"
                  onClick={() => handleModeChange('signin')}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    !isSignupMode
                      ? isDark
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-purple-500 text-white shadow-lg'
                      : isDark 
                        ? 'text-gray-300 hover:text-white hover:bg-slate-700' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  role="tab"
                  aria-selected={isSignupMode}
                  aria-label="Switch to sign up mode"
                  onClick={() => handleModeChange('signup')}
                  className={`px-6 py-2 rounded-xl text-sm font-bold transition-all duration-300 ${
                    isSignupMode
                      ? isDark
                        ? 'bg-purple-600 text-white shadow-lg'
                        : 'bg-purple-500 text-white shadow-lg'
                      : isDark 
                        ? 'text-gray-300 hover:text-white hover:bg-slate-700' 
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-100'
                  }`}
                >
                  Sign Up
                </button>
              </div>
            </div>

            {/* Auth Method Toggle */}
            <div className="flex justify-center mb-6">
              <div className={`flex rounded-xl p-1 border ${
                isDark 
                  ? 'bg-slate-700/50 border-slate-600' 
                  : 'bg-gray-100 border-gray-200'
              }`}>
                <button
                  type="button"
                  onClick={() => setAuthMethod('otp')}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                    authMethod === 'otp'
                      ? isDark
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : isDark 
                        ? 'text-gray-400 hover:text-white' 
                        : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  ✨ Magic Link
                </button>
                <button
                  type="button"
                  onClick={() => setAuthMethod('password')}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all duration-300 ${
                    authMethod === 'password'
                      ? isDark
                        ? 'bg-blue-600 text-white'
                        : 'bg-blue-500 text-white'
                      : isDark 
                        ? 'text-gray-400 hover:text-white' 
                        : 'text-gray-600 hover:text-gray-800'
                  }`}
                >
                  🔒 Password
                </button>
              </div>
            </div>

            {/* Success Message */}
            {successMessage && (
              <div className={`mb-4 p-4 rounded-xl border ${
                isDark ? 'bg-green-500/20 border-green-500/30 text-green-300' : 'bg-green-50 border-green-200 text-green-800'
              }`} role="alert">
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium">{successMessage}</p>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className={`mb-4 p-4 rounded-xl border ${
                isDark ? 'bg-red-500/20 border-red-500/30 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
              }`} role="alert">
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <p className="text-sm font-medium">{errorMessage}</p>
                </div>
              </div>
            )}

            {/* Waiting for Verification Message */}
            {waitingForVerification && (
              <div className={`mb-4 p-4 rounded-xl border ${
                isDark ? 'bg-blue-500/20 border-blue-500/30 text-blue-300' : 'bg-blue-50 border-blue-200 text-blue-800'
              }`}>
                <div className="flex items-start gap-2">
                  <Clock size={16} className="mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm font-medium">Check your email!</p>
                    <p className="text-xs mt-1">Click the magic link we sent to complete your {isSignupMode ? 'signup' : 'signin'}.</p>
                  </div>
                </div>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={authMethod === 'otp' ? handleOtpSubmit : handlePasswordSubmit} className="space-y-4">
              {/* Email Field */}
              <div>
                <label htmlFor="email" className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Email Address
                </label>
                <div className="relative">
                  <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                    isDark ? 'text-gray-400' : 'text-gray-400'
                  }`}>
                    <Mail className="h-5 w-5" />
                  </div>
                  <input
                    type="email"
                    id="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value.toLowerCase())}
                    placeholder="you@email.com"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                      isDark 
                        ? 'bg-white/10 text-white placeholder-gray-400 border-white/20 focus:border-white/40' 
                        : 'bg-white text-gray-800 placeholder-gray-500 border-gray-300'
                    }`}
                    required
                    disabled={isProcessing}
                    autoComplete="email"
                  />
                </div>
              </div>

              {/* Username Field (Signup only) */}
              {isSignupMode && (
                <div>
                  <label htmlFor="username" className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Username
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                      isDark ? 'text-gray-400' : 'text-gray-400'
                    }`}>
                      <User className="h-5 w-5" />
                    </div>
                    <input
                      type="text"
                      id="username"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                      placeholder="make it iconic"
                      className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                        isDark 
                          ? 'bg-white/10 text-white placeholder-gray-400 border-white/20 focus:border-white/40' 
                          : 'bg-white text-gray-800 placeholder-gray-500 border-gray-300'
                      }`}
                      maxLength={20}
                      required
                      disabled={isProcessing}
                      autoComplete="username"
                    />
                  </div>
                  <p className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    2-20 characters, letters, numbers, and underscores only
                  </p>
                </div>
              )}

              {/* Password Field (Password method only) */}
              {authMethod === 'password' && (
                <div>
                  <label htmlFor="password" className={`block text-sm font-medium mb-2 ${
                    isDark ? 'text-gray-300' : 'text-gray-700'
                  }`}>
                    Password
                  </label>
                  <div className="relative">
                    <div className={`absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none ${
                      isDark ? 'text-gray-400' : 'text-gray-400'
                    }`}>
                      <Lock className="h-5 w-5" />
                    </div>
                    <input
                      type={showPassword ? "text" : "password"}
                      id="password"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      placeholder={isSignupMode ? "make it strong" : "your secret"}
                      className={`block w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                        isDark 
                          ? 'bg-white/10 text-white placeholder-gray-400 border-white/20 focus:border-white/40' 
                          : 'bg-white text-gray-800 placeholder-gray-500 border-gray-300'
                      }`}
                      required
                      disabled={isProcessing}
                      autoComplete={isSignupMode ? "new-password" : "current-password"}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-3 flex items-center"
                      disabled={isProcessing}
                      aria-label={showPassword ? "Hide password" : "Show password"}
                    >
                      {showPassword ? (
                        <EyeOff className={`h-5 w-5 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`} />
                      ) : (
                        <Eye className={`h-5 w-5 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`} />
                      )}
                    </button>
                  </div>
                  {isSignupMode && (
                    <p className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                      Minimum 6 characters
                    </p>
                  )}
                </div>
              )}

              {/* Remember Me Checkbox (Password method only) */}
              {authMethod === 'password' && (
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className={`h-4 w-4 rounded border-2 transition-all duration-300 focus:ring-2 focus:ring-purple-500 focus:ring-offset-0 ${
                        isDark 
                          ? 'bg-white/10 border-white/20 text-purple-600 focus:border-purple-400' 
                          : 'bg-white border-gray-300 text-purple-600 focus:border-purple-500'
                      }`}
                      disabled={isProcessing}
                    />
                    <label htmlFor="remember-me" className={`ml-2 block text-sm font-medium ${
                      isDark ? 'text-gray-300' : 'text-gray-700'
                    }`}>
                      Remember me
                    </label>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={authMethod === 'otp' ? isOtpButtonDisabled : isPasswordButtonDisabled}
                aria-label={isSignupMode ? "Create account" : "Sign in to account"}
                className={`w-full py-4 px-6 text-lg font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group relative overflow-hidden ${
                  isDark 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-400 hover:to-purple-500' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
                }`}
              >
                <span className="relative flex items-center justify-center gap-3 text-white font-bold">
                  {isProcessing ? (
                    <>
                      <Loader className="animate-spin h-5 w-5 text-white" />
                      <span className="text-white">
                        {authMethod === 'otp' 
                          ? 'Sending magic link...' 
                          : isSignupMode ? 'Creating Account...' : 'Signing In...'
                        }
                      </span>
                    </>
                  ) : (
                    <>
                      {authMethod === 'otp' ? (
                        <>
                          <Send size={18} className="text-white" />
                          <span className="text-white">
                            {isSignupMode ? 'Send Magic Link' : 'Send Magic Link'}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-white">{isSignupMode ? 'Join the Vibe' : 'Enter the Zone'}</span>
                          <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300 text-white" />
                        </>
                      )}
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Method Description */}
            <div className={`mt-4 text-center text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              {authMethod === 'otp' ? (
                <p>
                  ✨ We'll send you a magic link - no password needed! Check your email and click to {isSignupMode ? 'complete signup' : 'sign in'}.
                </p>
              ) : (
                <p>
                  🔒 Traditional email and password authentication.
                </p>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};