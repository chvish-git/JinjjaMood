import React, { useState, useEffect } from 'react';
import { ArrowLeft, Send, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';
import toast from 'react-hot-toast';
import { MoodSelector } from '../components/MoodSelector';
import { JournalInput } from '../components/JournalInput';
import { UserProfile } from '../components/UserProfile';
import { MoodType } from '../types/mood';
import { saveMoodLog } from '../utils/storage';
import { useAuth } from '../hooks/useAuth';

interface MoodCheckProps {
  isDark: boolean;
  onBack: () => void;
  onSubmit: () => void;
  username: string;
}

export const MoodCheck: React.FC<MoodCheckProps> = ({ isDark, onBack, onSubmit, username }) => {
  const { userProfile } = useAuth();
  const [selectedMood, setSelectedMood] = useState<MoodType | null>(null);
  const [journalEntry, setJournalEntry] = useState('');
  const [isVisible, setIsVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleSubmit = async () => {
    // TC-MOOD-002: Missing mood value validation
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

    setIsSubmitting(true);
    setErrorMessage('');

    try {
      // TC-MOOD-001: Log mood with journal (TC-MOOD-004: Journal is optional)
      // TC-MOOD-005: Logs are tied to correct userId
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

      // Small delay for confetti effect
      setTimeout(() => {
        onSubmit();
      }, 1000);
    } catch (error: any) {
      console.error('Error saving mood log:', error);
      const errorMsg = error.message || 'Failed to save mood log. Please try again.';
      setErrorMessage(errorMsg);
      toast.error(errorMsg);
      setIsSubmitting(false);
    }
  };

  return (
    <div className={`min-h-screen transition-all duration-1000 ${
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

      {/* User Profile */}
      <UserProfile isDark={isDark} />

      {/* Back button */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={onBack}
          className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all duration-300 hover:scale-105 ${
            isDark 
              ? 'bg-white/10 text-white hover:bg-white/20' 
              : 'bg-black/10 text-gray-800 hover:bg-black/20'
          }`}
        >
          <ArrowLeft size={18} />
          <span className="text-sm font-medium">Back</span>
        </button>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        {/* Header */}
        <div className={`text-center mb-12 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            How are you feeling right now?
          </h1>
          
          <p className={`text-lg md:text-xl font-light ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Pick your vibe. No pressure.
          </p>
        </div>

        {/* Error Message */}
        {errorMessage && (
          <div className={`mb-6 p-4 rounded-xl border max-w-md mx-auto ${
            isDark 
              ? 'bg-red-900/20 border-red-500/30 text-red-300' 
              : 'bg-red-50 border-red-200 text-red-800'
          }`}>
            <p className="text-sm font-medium text-center">{errorMessage}</p>
          </div>
        )}

        {/* Mood Selector */}
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

        {/* Journal Input */}
        <div className={`mb-12 w-full transform transition-all duration-1000 delay-500 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <JournalInput 
            value={journalEntry}
            onChange={setJournalEntry}
            isDark={isDark}
          />
        </div>

        {/* Submit Button */}
        <div className={`transform transition-all duration-1000 delay-700 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={`group relative px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl disabled:opacity-50 disabled:cursor-not-allowed ${
              selectedMood
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
                  Submit
                  <Send size={20} className="group-hover:translate-x-1 transition-transform duration-300" />
                </>
              )}
            </span>
            
            {/* Glow effect */}
            {selectedMood && (
              <div className={`absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                isDark 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 blur-xl' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 blur-xl'
              }`}></div>
            )}
          </button>
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