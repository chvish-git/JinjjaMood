import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { User, Mail, Lock, Sparkles, AlertCircle, CheckCircle, ArrowRight, Loader, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const { signup, login, loading, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  const [isSignupMode, setIsSignupMode] = useState(false);
  
  // Form inputs
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [usernameInput, setUsernameInput] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  // UI state
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    email?: string;
    password?: string;
    username?: string;
  }>({});

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || '/mood';

  useEffect(() => {
    setIsVisible(true);
    
    // Redirect if already logged in
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Real-time validation with witty messages
  const validateEmail = (email: string) => {
    if (!email.trim()) return 'Don\'t ghost the email field. Fill it in, bestie.';
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) return 'That email looks sus. Double-check it?';
    return '';
  };

  const validatePassword = (password: string) => {
    if (!password.trim()) return 'Don\'t ghost the password field. Fill it in, bestie.';
    if (password.length < 6) return 'Password needs at least 6 characters. Make it stronger!';
    return '';
  };

  const validateUsername = (username: string) => {
    if (!username.trim()) return 'Don\'t ghost the username field. Fill it in, bestie.';
    if (username.length < 2) return 'Username needs at least 2 characters. Give it some substance!';
    if (username.length > 20) return 'Username\'s too long. Keep it snappy!';
    if (!/^[a-z0-9_]+$/.test(username.toLowerCase())) return 'Username can only have letters, numbers, and underscores. Keep it clean!';
    return '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setSuccessMessage('');
    setIsProcessing(true);
    
    // Validate inputs
    const emailError = validateEmail(emailInput);
    const passwordError = validatePassword(passwordInput);
    const usernameError = isSignupMode ? validateUsername(usernameInput) : '';
    
    if (emailError || passwordError || usernameError) {
      setValidationErrors({
        email: emailError,
        password: passwordError,
        username: usernameError
      });
      setIsProcessing(false);
      return;
    }
    
    try {
      let result;
      
      if (isSignupMode) {
        console.log('🔵 DEBUG: Attempting signup...');
        result = await signup(emailInput, passwordInput, usernameInput);
        
        if (result.success) {
          setSuccessMessage(`Mood locked in. Welcome, ${usernameInput}!`);
          toast.success(`Mood locked in. Welcome, ${usernameInput}!`, {
            duration: 4000,
            style: {
              background: '#10B981',
              color: '#fff',
              fontWeight: '600',
            },
          });
          
          // Navigate to intended destination
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 1500);
        } else if (result.error) {
          setErrorMessage(result.error);
          
          // Show specific toasts for different errors
          if (result.error.includes('already in the system')) {
            toast.error('This email\'s already in the system. You know what to do.', {
              style: { fontWeight: '600' }
            });
          } else if (result.error.includes('already vibing with that name')) {
            toast.error('Someone\'s already vibing with that name. Pick a new one?', {
              style: { fontWeight: '600' }
            });
          } else {
            toast.error(result.error, {
              style: { fontWeight: '600' }
            });
          }
        }
      } else {
        console.log('🔵 DEBUG: Attempting login...');
        result = await login(emailInput, passwordInput);
        
        if (result.success) {
          setSuccessMessage('Back in the vibe zone.');
          toast.success('Back in the vibe zone.', {
            duration: 3000,
            style: {
              background: '#8B5CF6',
              color: '#fff',
              fontWeight: '600',
            },
          });
          
          // Navigate to intended destination
          setTimeout(() => {
            navigate(from, { replace: true });
          }, 1000);
        } else if (result.error) {
          setErrorMessage(result.error);
          
          // Show specific toasts for different errors
          if (result.error.includes('tryna vibe without a ticket')) {
            toast.error('Hmm. No account? Looks like you\'re tryna vibe without a ticket.', {
              style: { fontWeight: '600' }
            });
          } else if (result.error.includes('not the password')) {
            toast.error('That\'s not the password, legend. Try again?', {
              style: { fontWeight: '600' }
            });
          } else {
            toast.error(result.error, {
              style: { fontWeight: '600' }
            });
          }
        }
      }
    } catch (err: any) {
      console.error('Auth error:', err);
      const errorMsg = err.message || 'Something went sideways. Try again?';
      setErrorMessage(errorMsg);
      toast.error(errorMsg, {
        style: { fontWeight: '600' }
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmailInput(e.target.value.toLowerCase());
    setErrorMessage('');
    setSuccessMessage('');
    
    // Real-time validation
    const error = validateEmail(e.target.value);
    setValidationErrors(prev => ({ ...prev, email: error }));
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordInput(e.target.value);
    setErrorMessage('');
    setSuccessMessage('');
    
    // Real-time validation
    const error = validatePassword(e.target.value);
    setValidationErrors(prev => ({ ...prev, password: error }));
  };

  const handleUsernameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '');
    setUsernameInput(value);
    setErrorMessage('');
    setSuccessMessage('');
    
    // Real-time validation
    const error = validateUsername(value);
    setValidationErrors(prev => ({ ...prev, username: error }));
  };

  const isButtonDisabled = isProcessing || loading || 
    emailInput.length === 0 || passwordInput.length === 0 || 
    (isSignupMode && usernameInput.length < 2) ||
    !!validationErrors.email || !!validationErrors.password || 
    (isSignupMode && !!validationErrors.username);

  // If user is already authenticated, show a different message
  if (isAuthenticated) {
    return (
      <div className={`layout-stable ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100'
      }`}>
        <div className="text-center">
          <div className="text-6xl mb-4">✨</div>
          <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            You're already in the vibe zone!
          </h2>
          <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
            Taking you to your mood dashboard...
          </p>
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className={`layout-stable ${
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
        <div className={`absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 rounded-full opacity-10 blur-3xl animate-pulse delay-2000 ${
          isDark ? 'bg-pink-500' : 'bg-purple-300'
        }`}></div>
      </div>

      {/* Main content with proper centering */}
      <div className="content-container">
        <div className="max-w-md mx-auto space-y-8">
          {/* Perfect Header with proper spacing */}
          <div className={`text-center transform transition-all duration-1000 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <h1 className="text-display text-gradient animate-pulse text-render-optimized prevent-shift mb-6">
              JinjjaMood
            </h1>
            
            <p className={`text-lg md:text-xl font-light tracking-wider mb-2 ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              jinjja → real/really
            </p>
            
            <p className={`text-xl md:text-2xl font-medium max-w-2xl mx-auto ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              {isSignupMode ? 'Join the vibe tribe' : 'Welcome back to your vibes'}
            </p>
          </div>

          {/* Cute mood-related image placeholder */}
          <div className={`text-center transform transition-all duration-1000 delay-200 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className={`w-32 h-32 mx-auto rounded-full flex items-center justify-center shadow-lg ${
              isDark ? 'bg-gradient-to-br from-purple-500/20 to-pink-500/20' : 'bg-gradient-to-br from-pink-200 to-purple-200'
            }`}>
              <span className="text-4xl">{isSignupMode ? '🌟✨' : '🌸✨'}</span>
            </div>
          </div>

          {/* Auth Card with proper spacing */}
          <div className={`glass-strong rounded-3xl p-8 shadow-2xl transform transition-all duration-1000 delay-400 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="text-center mb-6">
              <h2 className={`text-2xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                {isSignupMode ? 'Create Your Account' : 'Welcome Back'}
              </h2>
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                {isSignupMode 
                  ? 'Join JinjjaMood and start tracking your real feelings'
                  : 'Sign in to continue your mood journey'
                }
              </p>
            </div>

            {/* Mode Toggle */}
            <div className="flex justify-center mb-6">
              <div className={`flex rounded-2xl p-1 border-2 ${
                isDark 
                  ? 'bg-slate-800/90 border-slate-600' 
                  : 'bg-white/95 border-gray-300'
              }`}>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignupMode(false);
                    setErrorMessage('');
                    setSuccessMessage('');
                    setValidationErrors({});
                  }}
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
                  Login
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsSignupMode(true);
                    setErrorMessage('');
                    setSuccessMessage('');
                    setValidationErrors({});
                  }}
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

            {/* Success Message */}
            {successMessage && (
              <div className={`mb-4 p-4 rounded-xl border ${
                isDark ? 'bg-green-500/20 border-green-500/30 text-green-300' : 'bg-green-50 border-green-200 text-green-800'
              }`}>
                <div className="flex items-start gap-2">
                  <CheckCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Success!</p>
                    <p>{successMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className={`mb-4 p-4 rounded-xl border ${
                isDark ? 'bg-red-500/20 border-red-500/30 text-red-300' : 'bg-red-50 border-red-200 text-red-800'
              }`}>
                <div className="flex items-start gap-2">
                  <AlertCircle size={16} className="mt-0.5 flex-shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium mb-1">Oops!</p>
                    <p>{errorMessage}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Auth Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
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
                    onChange={handleEmailChange}
                    placeholder="your@email.com"
                    className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                      validationErrors.email 
                        ? 'border-red-500 focus:ring-red-500' 
                        : isDark 
                          ? 'bg-white/10 text-white placeholder-gray-400 border-white/20 focus:border-white/40' 
                          : 'bg-white text-gray-800 placeholder-gray-500 border-gray-300'
                    }`}
                    required
                    disabled={isProcessing}
                  />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.email}</p>
                )}
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
                      onChange={handleUsernameChange}
                      placeholder="your_username"
                      className={`block w-full pl-10 pr-3 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                        validationErrors.username 
                          ? 'border-red-500 focus:ring-red-500' 
                          : isDark 
                            ? 'bg-white/10 text-white placeholder-gray-400 border-white/20 focus:border-white/40' 
                            : 'bg-white text-gray-800 placeholder-gray-500 border-gray-300'
                      }`}
                      maxLength={20}
                      required
                      disabled={isProcessing}
                    />
                  </div>
                  {validationErrors.username && (
                    <p className="mt-1 text-xs text-red-500">{validationErrors.username}</p>
                  )}
                  <p className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    2-20 characters, letters, numbers, and underscores only
                  </p>
                </div>
              )}

              {/* Password Field */}
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
                    onChange={handlePasswordChange}
                    placeholder="Enter your password"
                    className={`block w-full pl-10 pr-10 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                      validationErrors.password 
                        ? 'border-red-500 focus:ring-red-500' 
                        : isDark 
                          ? 'bg-white/10 text-white placeholder-gray-400 border-white/20 focus:border-white/40' 
                          : 'bg-white text-gray-800 placeholder-gray-500 border-gray-300'
                    }`}
                    required
                    disabled={isProcessing}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3 flex items-center"
                    disabled={isProcessing}
                  >
                    {showPassword ? (
                      <EyeOff className={`h-5 w-5 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`} />
                    ) : (
                      <Eye className={`h-5 w-5 ${isDark ? 'text-gray-400 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600'}`} />
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-xs text-red-500">{validationErrors.password}</p>
                )}
                {isSignupMode && (
                  <p className={`mt-2 text-xs ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
                    Minimum 6 characters
                  </p>
                )}
              </div>

              <button
                type="submit"
                disabled={isButtonDisabled}
                className={`w-full py-4 px-6 text-lg font-semibold rounded-2xl transition-all duration-300 transform hover:scale-[1.02] hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none group relative overflow-hidden ${
                  isDark 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-400 hover:to-purple-500' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
                }`}
              >
                {/* Button glow effect */}
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-xl ${
                  isDark 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600'
                }`}></div>
                
                <span className="relative flex items-center justify-center gap-3">
                  {isProcessing ? (
                    <>
                      <Loader className="animate-spin h-5 w-5" />
                      {isSignupMode ? 'Creating Account...' : 'Signing In...'}
                    </>
                  ) : (
                    <>
                      {isSignupMode ? 'Create Account' : 'Sign In'}
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Features */}
            <div className="mt-6 space-y-3">
              <div className={`flex items-center gap-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-purple-500/20' : 'bg-purple-100'
                }`}>
                  <Sparkles size={12} className="text-purple-600" />
                </div>
                <span>Secure email & password authentication</span>
              </div>
              <div className={`flex items-center gap-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-pink-500/20' : 'bg-pink-100'
                }`}>
                  <Sparkles size={12} className="text-pink-600" />
                </div>
                <span>Daily vibe quotes matched to your mood</span>
              </div>
              <div className={`flex items-center gap-3 text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-blue-500/20' : 'bg-blue-100'
                }`}>
                  <User size={12} className="text-blue-600" />
                </div>
                <span>Cross-device sync with your unique username</span>
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className={`text-center max-w-md mx-auto transform transition-all duration-1000 delay-600 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle size={16} className="text-green-600" />
              <span className={`text-sm font-medium ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                Secure & Private
              </span>
            </div>
            <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
              Your data is protected with Firebase Authentication and encrypted storage. 
              We respect your privacy and never share your personal information.
            </p>
          </div>
        </div>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
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
  );
};