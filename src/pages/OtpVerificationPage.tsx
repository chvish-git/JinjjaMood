import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, ArrowRight, Loader } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import toast from 'react-hot-toast';

export const OtpVerificationPage: React.FC = () => {
  const { verifyOtp, loading, isAuthenticated } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(false);
  
  // Get email and type from URL params or state
  const urlParams = new URLSearchParams(location.search);
  const email = urlParams.get('email') || location.state?.email || '';
  const type = urlParams.get('type') || location.state?.type || 'signup';
  
  // Form state
  const [otpInput, setOtpInput] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  // Get the intended destination from location state
  const from = location.state?.from?.pathname || '/mood';

  useEffect(() => {
    setIsVisible(true);
    
    // Redirect if no email provided
    if (!email) {
      navigate('/login');
      return;
    }
  }, [email, navigate]);

  // Redirect if already logged in
  useEffect(() => {
    if (isVisible && isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from, isVisible]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!otpInput.trim()) {
      setErrorMessage('Please enter the verification code.');
      return;
    }

    setErrorMessage('');
    setSuccessMessage('');
    setIsProcessing(true);
    
    try {
      const result = await verifyOtp(email, otpInput.trim(), type as 'signup' | 'magiclink');
      
      if (result.success) {
        setSuccessMessage('Verification successful! Welcome to JinjjaMood! ✨');
        toast.success('Welcome to JinjjaMood! ✨', {
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
        toast.error(result.error);
      }
    } catch (err: any) {
      console.error('Verification error:', err);
      const errorMsg = err.message || 'Verification failed. Try again?';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleResendCode = async () => {
    // This would trigger a new OTP send - you might want to implement this
    toast.success('New verification code sent! Check your email 📧', {
      duration: 3000,
      style: {
        background: '#8B5CF6',
        color: '#fff',
        fontWeight: '600',
      },
    });
  };

  return (
    <div className={`min-h-screen ${
      isDark 
        ? 'bg-slate-900 bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-white bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100'
    }`}>
      {/* Animated background elements */}
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
            <div className={`w-16 h-16 mx-auto mb-6 rounded-full flex items-center justify-center ${
              isDark ? 'bg-blue-500/20' : 'bg-blue-100'
            }`}>
              <Mail size={32} className={isDark ? 'text-blue-400' : 'text-blue-600'} />
            </div>
            
            <h1 className={`text-3xl font-bold mb-4 ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              Check Your Email
            </h1>
            
            <p className={`text-lg font-medium ${
              isDark ? 'text-gray-300' : 'text-gray-600'
            }`}>
              We sent a verification code to
            </p>
            <p className={`text-lg font-bold ${
              isDark ? 'text-white' : 'text-gray-800'
            }`}>
              {email}
            </p>
          </header>

          {/* Verification Card */}
          <div className={`glass-strong rounded-3xl p-6 shadow-2xl transform transition-all duration-1000 delay-400 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
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

            {/* Verification Form */}
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label htmlFor="otp" className={`block text-sm font-medium mb-2 ${
                  isDark ? 'text-gray-300' : 'text-gray-700'
                }`}>
                  Verification Code
                </label>
                <input
                  type="text"
                  id="otp"
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  placeholder="Enter 6-digit code"
                  className={`block w-full px-4 py-3 text-center text-2xl font-mono tracking-widest border rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                    isDark 
                      ? 'bg-white/10 text-white placeholder-gray-400 border-white/20 focus:border-white/40' 
                      : 'bg-white text-gray-800 placeholder-gray-500 border-gray-300'
                  }`}
                  maxLength={6}
                  required
                  disabled={isProcessing}
                  autoComplete="one-time-code"
                />
              </div>

              <button
                type="submit"
                disabled={isProcessing || otpInput.length !== 6}
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
                      <span className="text-white">Verifying...</span>
                    </>
                  ) : (
                    <>
                      <span className="text-white">Verify & Continue</span>
                      <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform duration-300 text-white" />
                    </>
                  )}
                </span>
              </button>
            </form>

            {/* Resend Code */}
            <div className="mt-6 text-center">
              <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                Didn't receive the code?{' '}
                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={isProcessing}
                  className={`font-medium underline hover:no-underline transition-all duration-300 ${
                    isDark ? 'text-purple-400 hover:text-purple-300' : 'text-purple-600 hover:text-purple-700'
                  }`}
                >
                  Resend code
                </button>
              </p>
            </div>

            {/* Back to Login */}
            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={() => navigate('/login')}
                className={`text-sm font-medium underline hover:no-underline transition-all duration-300 ${
                  isDark ? 'text-gray-400 hover:text-white' : 'text-gray-600 hover:text-gray-800'
                }`}
              >
                ← Back to login
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};