import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles, Clock, Calendar } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { MoodSelector } from '../components/MoodSelector';
import { JournalInput } from '../components/JournalInput';
import { MoodType } from '../types/mood';
import { saveMoodLog, checkDailyMoodLimit } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';

export const MoodCheckPage: React.FC = () => {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasLoggedToday, setHasLoggedToday] = useState(false);
  const [checkingLimit, setCheckingLimit] = useState(true);
  const [isDark] = useState(false); // You can implement theme context later

  useEffect(() => {
    setIsVisible(true);
    
    // Check if user has already logged mood today
    const checkDailyLimit = async () => {
      if (userProfile?.uid) {
        try {
          const hasLogged = await checkDailyMoodLimit(userProfile.uid);
          setHasLoggedToday(hasLogged);
          
          if (hasLogged) {
            setErrorMessage('You\'ve already logged your mood today! Come back tomorrow for another check-in. 🌅');
          }
        } catch (error) {
          console.error('Error checking daily limit:', error);
        }
      }
      setCheckingLimit(false);
    };

    checkDailyLimit();
  }, [userProfile?.uid]);

  const handleSubmit = async () => {
    // Validation
    if (!selectedMood) {
      setErrorMessage('Please select a mood.');
      toast.error('Please select a mood first! 💭');
      return;
    }

    if (!userProfile?.uid) {
      setErrorMessage('Authentication error. Please try logging in again.');
      toast.error('Authentication error. Please try again.');
      return;
    }

    // Check daily limit before submitting
    if (hasLoggedToday) {
      setErrorMessage('You\'ve already logged your mood today! Come back tomorrow. 🌅');
      toast.error('You\'ve already logged your mood today! 🌅');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      await saveMoodLog({
        mood: selectedMood,
        journalEntry: journalEntry.trim(),
        timestamp: new Date()
      }, userProfile.uid);

      // Show success toast
      toast.success(`${selectedMood} mood logged! ✨`, {
        duration: 2000,
        style: {
          background: '#10B981',
          color: '#fff',
        },
      });

      // Trigger confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#FF6B9D', '#A855F7', '#06B6D4', '#10B981', '#F59E0B']
      });

      // Navigate to results page
      setTimeout(() => {
        navigate('/results');
      }, 1000);
    } catch (error: any) {
      console.error('Error saving mood log:', error);
      const errorMsg = error.message || 'Failed to save mood log. Please try again.';
      setErrorMessage(errorMsg);
      
      // Special handling for daily limit error
      if (errorMsg.includes('already logged your mood today')) {
        setHasLoggedToday(true);
        toast.error('You\'ve already logged your mood today! 🌅', {
          duration: 4000,
        });
      } else {
        toast.error(errorMsg);
      }
      setIsSubmitting(false);
    }
  };

  // Show loading state while checking daily limit
  if (checkingLimit) {
    return (
      <div className={`min-h-screen flex items-center justify-center pt-16 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100'
      }`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className={`text-xl ${isDark ? 'text-white' : 'text-gray-800'}`}>
            Checking your mood history...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen pt-16 transition-all duration-1000 ${
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

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        {/* Header */}
        <div className={`text-center mb-8 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            {hasLoggedToday ? 'You\'re all set for today!' : 'What\'s your vibe today?'}
          </h1>
          
          <p className={`text-lg md:text-xl font-light ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            {hasLoggedToday ? 'Come back tomorrow for another check-in' : 'Pick your vibe. No pressure.'}
          </p>

          {/* Auto-timestamp indicator */}
          {!hasLoggedToday && (
            <div className={`flex items-center justify-center gap-2 mt-4 text-sm ${
              isDark ? 'text-gray-400' : 'text-gray-600'
            }`}>
              <Clock size={16} />
              <span>Timestamp: {new Date().toLocaleString()}</span>
            </div>
          )}
        </div>

        {/* Daily Limit Message */}
        {hasLoggedToday && (
          <div className={`mb-8 p-6 rounded-2xl backdrop-blur-sm border max-w-md mx-auto text-center transform transition-all duration-1000 delay-200 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          } ${
            isDark 
              ? 'bg-blue-500/20 border-blue-400/30 text-blue-300' 
              : 'bg-blue-50 border-blue-200 text-blue-800'
          }`}>
            <div className="flex items-center justify-center gap-2 mb-3">
              <Calendar className="text-blue-400" size={24} />
              <span className="text-lg font-semibold">Daily Check-in Complete!</span>
            </div>
            <p className="text-sm leading-relaxed">
              You've already logged your mood today. Consistency is key! 
              Come back tomorrow to continue your jinjja journey.
            </p>
            <div className="mt-4">
              <button
                onClick={() => navigate('/history')}
                className={`px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 ${
                  isDark 
                    ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                    : 'bg-black/10 text-gray-800 hover:bg-black/20 border border-gray-200'
                }`}
              >
                View Your History
              </button>
            </div>
          </div>
        )}

        {/* Error Message */}
        {errorMessage && !hasLoggedToday && (
          <div className={`mb-6 p-4 rounded-xl border max-w-md mx-auto ${
            isDark 
              ? 'bg-red-900/20 border-red-500/30 text-red-300' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <p className="text-sm font-medium text-center">{errorMessage}</p>
          </div>
        )}

        {/* Mood Selector - Only show if user hasn't logged today */}
        {!hasLoggedToday && (
          <div className={`mb-12 transform transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <MoodSelector 
              selectedMood={selectedMood}
              onMoodSelect={(mood) => {
                setSelectedMood(mood);
                setErrorMessage(''); // Clear error when mood is selected
              }}
              isDark={isDark}
            />
          </div>
        )}

        {/* Journal Input - Only show if user hasn't logged today */}
        {!hasLoggedToday && (
          <div className={`mb-12 w-full transform transition-all duration-1000 delay-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <JournalInput 
              value={journalEntry}
              onChange={setJournalEntry}
              isDark={isDark}
            />
          </div>
        )}

        {/* Submit Button - Only show if user hasn't logged today */}
        {!hasLoggedToday && (
          <div className={`transform transition-all duration-1000 delay-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || hasLoggedToday}
              className={`group relative px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed ${
                selectedMood && !hasLoggedToday
                  ? isDark 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-400 hover:to-purple-500' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
                  : isDark
                    ? 'bg-gray-600 text-gray-400'
                    : 'bg-gray-300 text-gray-500'
              }`}
            >
              <span className="flex items-center gap-2">
                {isSubmitting ? (
                  <>
                    <Sparkles size={20} className="animate-spin" />
                    Saving your vibe...
                  </>
                ) : (
                  <>
                    Submit Today's Mood
                    <Send size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </span>
              
              {/* Glow effect */}
              {selectedMood && !hasLoggedToday && (
                <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  isDark 
                    ? 'bg-gradient-to-r from-pink-500 to-purple-600 blur-xl' 
                    : 'bg-gradient-to-r from-purple-600 to-pink-600 blur-xl'
                }`}></div>
              )}
            </button>
          </div>
        )}
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