import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Send, Sparkles, Clock, Calendar, AlertCircle } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { MoodSelector } from '../components/MoodSelector';
import { JournalInput } from '../components/JournalInput';
import { MoodType } from '../types/mood';
import { saveMoodLog, checkDailyMoodLimit } from '../utils/storage';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getMoodFeedback, createMoodAnimation, createMoodOverlay } from '../utils/moodFeedback';

const DAILY_MOOD_LIMIT = 5;

export const MoodCheckPage: React.FC = () => {
  const { userProfile } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [dailyCount, setDailyCount] = useState(0);
  const [hasReachedLimit, setHasReachedLimit] = useState(false);
  const [checkingLimit, setCheckingLimit] = useState(true);

  useEffect(() => {
    setIsVisible(true);
    
    const checkDailyLimit = async () => {
      if (userProfile?.uid) {
        try {
          const { hasReachedLimit: limitReached, count } = await checkDailyMoodLimit(userProfile.uid);
          setHasReachedLimit(limitReached);
          setDailyCount(count);
          
          if (limitReached) {
            setErrorMessage(`You've logged ${DAILY_MOOD_LIMIT} moods today! Rest your vibe sensors! 🧠✨`);
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

    if (hasReachedLimit) {
      setErrorMessage(`You've logged ${DAILY_MOOD_LIMIT} moods today! Rest your vibe sensors! 🧠✨`);
      toast.error('Daily mood limit reached! 🧠✨');
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

      // Get mood-specific feedback
      const feedback = getMoodFeedback(selectedMood);
      
      // Create mood-specific animation
      createMoodAnimation(feedback);
      createMoodOverlay(feedback.type);

      // Show mood-specific toast
      toast.success(feedback.message, {
        duration: feedback.duration,
        style: {
          background: `linear-gradient(135deg, ${feedback.color.replace('from-', '').replace('to-', ', ')})`,
          color: '#fff',
          fontWeight: '600',
        },
        icon: feedback.emoji,
      });

      // Only use confetti for positive moods
      if (feedback.type === 'positive' || feedback.type === 'bonus') {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
          colors: ['#FF6B9D', '#A855F7', '#06B6D4', '#10B981', '#F59E0B']
        });
      }

      // Navigate to results page
      setTimeout(() => {
        navigate('/results');
      }, 1500);
    } catch (error: any) {
      console.error('Error saving mood log:', error);
      const errorMsg = error.message || 'Failed to save mood log. Please try again.';
      setErrorMessage(errorMsg);
      
      if (errorMsg.includes('Rest your vibe sensors')) {
        setHasReachedLimit(true);
        setDailyCount(DAILY_MOOD_LIMIT);
        toast.error('Daily mood limit reached! 🧠✨', {
          duration: 4000,
        });
      } else {
        toast.error(errorMsg);
      }
      setIsSubmitting(false);
    }
  };

  if (checkingLimit) {
    return (
      <div className={`min-h-screen flex items-center justify-center pt-16 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100'
      }`}>
        <div className="text-center">
          <div className="animate-pulse-glow rounded-full h-16 w-16 bg-gradient-to-r from-purple-600 to-pink-600 mx-auto mb-6 flex items-center justify-center">
            <Sparkles className="text-white" size={24} />
          </div>
          <p className="text-heading text-primary">
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
      {/* Enhanced animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className={`absolute top-20 left-10 w-72 h-72 rounded-full opacity-20 blur-3xl animate-float ${
          isDark ? 'bg-purple-500' : 'bg-pink-300'
        }`}></div>
        <div className={`absolute bottom-20 right-10 w-96 h-96 rounded-full opacity-20 blur-3xl animate-float delay-1000 ${
          isDark ? 'bg-blue-500' : 'bg-blue-300'
        }`}></div>
        <div className={`absolute top-1/2 left-1/4 w-64 h-64 rounded-full opacity-10 blur-3xl animate-gentle-wave ${
          isDark ? 'bg-pink-500' : 'bg-purple-300'
        }`}></div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        {/* Enhanced Header */}
        <div className={`text-center mb-12 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h1 className={`text-display mb-6 text-gradient animate-fadeInUp`}>
            {hasReachedLimit ? 'Vibe sensors need a break!' : 'How are you feeling right now?'}
          </h1>
          
          <p className={`text-heading font-light ${
            isDark ? 'text-gray-300' : 'text-gray-600'
          }`}>
            {hasReachedLimit 
              ? 'You\'ve reached your daily mood limit. Come back tomorrow!' 
              : `Pick your vibe. ${DAILY_MOOD_LIMIT - dailyCount} left today.`
            }
          </p>

          {/* Enhanced daily counter */}
          {!hasReachedLimit && (
            <div className={`flex items-center justify-center gap-3 mt-6 glass rounded-full px-6 py-3 transition-all duration-300 hover:scale-105`}>
              <Clock size={18} className="text-purple-400" />
              <span className="text-body font-semibold text-secondary">
                Mood {dailyCount + 1} of {DAILY_MOOD_LIMIT} today
              </span>
              <div className="flex gap-1">
                {Array.from({ length: DAILY_MOOD_LIMIT }, (_, i) => (
                  <div key={i} className={`w-2 h-2 rounded-full transition-all duration-300 ${
                    i < dailyCount ? 'bg-purple-400' : 'bg-gray-300'
                  }`}></div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Enhanced Daily Limit Message */}
        {hasReachedLimit && (
          <div className={`mb-12 max-w-md mx-auto text-center transform transition-all duration-1000 delay-200 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className="card-enhanced mood-bonus">
              <div className="flex items-center justify-center gap-3 mb-4">
                <AlertCircle className="text-white" size={28} />
                <span className="text-heading font-bold text-white">Daily Vibe Limit Reached!</span>
              </div>
              <p className="text-body text-white/90 leading-relaxed mb-6">
                You've logged {DAILY_MOOD_LIMIT} moods today. Your vibe sensors need time to recharge! 
                Come back tomorrow to continue your jinjja journey.
              </p>
              <div className="flex justify-center gap-2 mb-6">
                {Array.from({ length: DAILY_MOOD_LIMIT }, (_, i) => (
                  <div key={i} className="w-4 h-4 rounded-full bg-white/80 animate-pulse" style={{ animationDelay: `${i * 0.2}s` }}></div>
                ))}
              </div>
              <button
                onClick={() => navigate('/history')}
                className="btn-primary bg-white/20 hover:bg-white/30 text-white border-2 border-white/30"
              >
                View Your History
              </button>
            </div>
          </div>
        )}

        {/* Enhanced Error Message */}
        {errorMessage && !hasReachedLimit && (
          <div className={`mb-8 max-w-md mx-auto transform transition-all duration-300 ${
            errorMessage ? 'scale-100 opacity-100' : 'scale-95 opacity-0'
          }`}>
            <div className="card-enhanced bg-red-500/20 border-red-400/30">
              <p className="text-body font-medium text-center text-red-400">
                {errorMessage}
              </p>
            </div>
          </div>
        )}

        {/* Enhanced Mood Selector */}
        {!hasReachedLimit && (
          <div className={`mb-12 w-full transform transition-all duration-1000 delay-300 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <MoodSelector 
              selectedMood={selectedMood}
              onMoodSelect={(mood) => {
                setSelectedMood(mood);
                setErrorMessage('');
              }}
            />
          </div>
        )}

        {/* Enhanced Journal Input */}
        {!hasReachedLimit && (
          <div className={`mb-12 w-full transform transition-all duration-1000 delay-500 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <JournalInput 
              value={journalEntry}
              onChange={setJournalEntry}
            />
          </div>
        )}

        {/* Enhanced Submit Button */}
        {!hasReachedLimit && (
          <div className={`transform transition-all duration-1000 delay-700 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || hasReachedLimit || !selectedMood}
              className={`group relative px-10 py-5 text-heading font-bold rounded-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                selectedMood && !hasReachedLimit
                  ? 'btn-primary animate-pulse-glow' 
                  : 'bg-gray-400 text-gray-600 cursor-not-allowed'
              }`}
            >
              <span className="flex items-center gap-3 relative z-10">
                {isSubmitting ? (
                  <>
                    <Sparkles size={24} className="animate-spin" />
                    <span>Saving your vibe...</span>
                  </>
                ) : (
                  <>
                    <span>Log Mood ({dailyCount + 1}/{DAILY_MOOD_LIMIT})</span>
                    <Send size={24} className="group-hover:translate-x-1 transition-transform duration-300" />
                  </>
                )}
              </span>
              
              {/* Enhanced glow effect */}
              {selectedMood && !hasReachedLimit && (
                <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-gradient-to-r from-purple-600/50 to-pink-600/50 blur-xl"></div>
              )}
            </button>
          </div>
        )}
      </div>

      {/* Enhanced floating particles effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className={`absolute w-3 h-3 rounded-full opacity-40 ${
              isDark ? 'bg-white' : 'bg-purple-400'
            }`}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animation: `float ${3 + Math.random() * 2}s ease-in-out infinite`,
              animationDelay: `${Math.random() * 3}s`
            }}
          ></div>
        ))}
      </div>
    </div>
  );
};