import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Edit3, Trash2, Check, X, Calendar, Award, TrendingUp, Target } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { getMoodLogs } from '../utils/storage';
import { calculateMoodStats } from '../utils/moodAnalysis';
import { MoodLog } from '../types/mood';
import { ProfileSkeleton } from '../components/skeletons/ProfileSkeleton';
import toast from 'react-hot-toast';

export const ProfilePage: React.FC = () => {
  const { userProfile, updateUsername, deleteAccount, logout } = useAuth();
  const { isDark } = useTheme();
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [moodLogs, setMoodLogs] = useState<MoodLog[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    
    const loadProfileData = async () => {
      if (!userProfile?.uid) {
        setLoading(false);
        return;
      }

      try {
        const logs = await getMoodLogs(userProfile.uid);
        setMoodLogs(logs);
        
        const moodStats = calculateMoodStats(logs);
        setStats(moodStats);
      } catch (error) {
        console.error('Error loading profile data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadProfileData();
  }, [userProfile?.uid]);

  const handleEditClick = () => {
    setNewUsername(userProfile?.username || '');
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewUsername('');
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim() || newUsername.trim() === userProfile?.username) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateUsername(newUsername.trim());
      
      if (result.success) {
        toast.success('New name, who dis?', {
          duration: 3000,
          style: {
            background: '#10B981',
            color: '#fff',
            fontWeight: '600',
          },
        });
        setIsEditing(false);
      } else {
        toast.error(result.error || 'Username update failed. The servers are being moody.', {
          style: { fontWeight: '600' }
        });
      }
    } catch (error: any) {
      toast.error(error.message || 'Username update failed. The servers are being moody.', {
        style: { fontWeight: '600' }
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteAccount = async () => {
    setIsDeleting(true);
    try {
      const result = await deleteAccount();
      
      if (result.success) {
        toast.success('All cleared. You were never here 👻', {
          duration: 4000,
          style: {
            background: '#EF4444',
            color: '#fff',
            fontWeight: '600',
          },
        });
        // Navigate to home after deletion
        navigate('/');
      } else {
        toast.error(result.error || 'Account deletion failed. The servers are being stubborn.', {
          style: { fontWeight: '600' }
        });
        setShowDeleteConfirm(false);
      }
    } catch (error: any) {
      toast.error(error.message || 'Account deletion failed. The servers are being stubborn.', {
        style: { fontWeight: '600' }
      });
      setShowDeleteConfirm(false);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const getMoodEmoji = (mood: string) => {
    const emojiMap: { [key: string]: string } = {
      'Sad': '😢',
      'Neutral': '😐',
      'Good': '😊',
      'Stressed': '😰',
      'Hyped': '🤩'
    };
    return emojiMap[mood] || '😐';
  };

  if (loading) {
    return <ProfileSkeleton />;
  }

  if (!userProfile) {
    return (
      <div className={`min-h-screen flex items-center justify-center pt-16 ${
        isDark 
          ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
          : 'bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100'
      }`}>
        <div className="text-center">
          <p className={`text-xl mb-4 ${isDark ? 'text-white' : 'text-gray-800'}`}>
            You're not logged in. That's a problem.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-full hover:scale-105 transition-transform duration-300"
          >
            Go to Login
          </button>
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
      <div className="relative z-10 px-6 py-20">
        {/* Header */}
        <div className={`text-center mb-12 transform transition-all duration-1000 ${
          isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
        }`}>
          <h1 className={`text-4xl md:text-6xl font-bold mb-4 ${
            isDark ? 'text-white' : 'text-gray-800'
          }`}>
            Your Profile
          </h1>
          
          <p className={`text-lg md:text-xl font-light ${
            isDark ? 'text-gray-400' : 'text-gray-600'
          }`}>
            Manage your vibe account
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Profile Card */}
          <div className={`mb-8 transform transition-all duration-1000 delay-200 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <div className={`p-8 rounded-2xl backdrop-blur-sm border ${
              isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200'
            }`}>
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar */}
                <div className={`w-24 h-24 rounded-full flex items-center justify-center ${
                  isDark ? 'bg-white/20' : 'bg-gray-200'
                }`}>
                  <User size={48} className={isDark ? 'text-white' : 'text-gray-600'} />
                </div>

                {/* Profile Info */}
                <div className="flex-1 text-center md:text-left">
                  {isEditing ? (
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <input
                        type="text"
                        value={newUsername}
                        onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                        className={`text-2xl font-bold bg-transparent border-b-2 border-current outline-none ${
                          isDark ? 'text-white' : 'text-gray-800'
                        }`}
                        maxLength={20}
                        disabled={isUpdating}
                      />
                      <button
                        onClick={handleUpdateUsername}
                        disabled={isUpdating}
                        className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                          isDark 
                            ? 'hover:bg-white/20 text-green-400 hover:text-green-300' 
                            : 'hover:bg-black/20 text-green-600 hover:text-green-700'
                        }`}
                        title="Save"
                      >
                        <Check size={20} />
                      </button>
                      <button
                        onClick={handleCancelEdit}
                        disabled={isUpdating}
                        className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                          isDark 
                            ? 'hover:bg-white/20 text-red-400 hover:text-red-300' 
                            : 'hover:bg-black/20 text-red-600 hover:text-red-700'
                        }`}
                        title="Cancel"
                      >
                        <X size={20} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-3 justify-center md:justify-start">
                      <h2 className={`text-3xl font-bold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                        @{userProfile.username}
                      </h2>
                      <button
                        onClick={handleEditClick}
                        className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                          isDark 
                            ? 'hover:bg-white/20 text-gray-400 hover:text-white' 
                            : 'hover:bg-black/20 text-gray-600 hover:text-gray-800'
                        }`}
                        title="Edit username"
                      >
                        <Edit3 size={18} />
                      </button>
                    </div>
                  )}
                  
                  <p className={`text-lg mt-2 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Member since {userProfile.createdAt.toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col gap-3">
                  {/* Delete Account Button */}
                  {showDeleteConfirm ? (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleDeleteAccount}
                        disabled={isDeleting}
                        className={`px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                          isDark 
                            ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
                            : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                        }`}
                      >
                        {isDeleting ? 'Deleting...' : 'Confirm Delete'}
                      </button>
                      <button
                        onClick={() => setShowDeleteConfirm(false)}
                        disabled={isDeleting}
                        className={`px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                          isDark 
                            ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                            : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200'
                        }`}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowDeleteConfirm(true)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                        isDark 
                          ? 'bg-red-500/20 text-red-400 hover:bg-red-500/30 border border-red-500/30' 
                          : 'bg-red-50 text-red-600 hover:bg-red-100 border border-red-200'
                      }`}
                    >
                      <Trash2 size={16} />
                      <span className="text-sm font-medium">Delete Account</span>
                    </button>
                  )}

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    className={`px-4 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                      isDark 
                        ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                        : 'bg-gray-100 text-gray-800 hover:bg-gray-200 border border-gray-200'
                    }`}
                  >
                    <span className="text-sm font-medium">Logout</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid */}
          {stats && (
            <div className={`mb-8 transform transition-all duration-1000 delay-400 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className={`p-6 rounded-2xl backdrop-blur-sm border text-center ${
                  isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-white/80 border-gray-200 text-gray-800'
                }`}>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Calendar className="text-purple-400" size={24} />
                  </div>
                  <p className="text-2xl font-bold">{stats.totalEntries}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Total Check-ins
                  </p>
                </div>

                <div className={`p-6 rounded-2xl backdrop-blur-sm border text-center ${
                  isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-white/80 border-gray-200 text-gray-800'
                }`}>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Award className="text-yellow-400" size={24} />
                  </div>
                  <p className="text-2xl font-bold">{stats.currentStreak}</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Current Streak
                  </p>
                </div>

                <div className={`p-6 rounded-2xl backdrop-blur-sm border text-center ${
                  isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-white/80 border-gray-200 text-gray-800'
                }`}>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <TrendingUp className="text-green-400" size={24} />
                  </div>
                  <p className="text-2xl font-bold">{stats.averageMood}/5</p>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Average Mood
                  </p>
                </div>

                <div className={`p-6 rounded-2xl backdrop-blur-sm border text-center ${
                  isDark ? 'bg-white/10 border-white/20 text-white' : 'bg-white/80 border-gray-200 text-gray-800'
                }`}>
                  <div className="flex items-center justify-center gap-2 mb-3">
                    <Target className="text-blue-400" size={24} />
                  </div>
                  <div className="flex items-center justify-center gap-1">
                    <span className="text-lg">{getMoodEmoji(stats.mostCommonMood)}</span>
                    <span className="text-sm font-bold">{stats.mostCommonMood}</span>
                  </div>
                  <p className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Most Common
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          {moodLogs.length > 0 && (
            <div className={`transform transition-all duration-1000 delay-600 ${
              isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
            }`}>
              <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
                isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200'
              }`}>
                <h3 className={`text-xl font-bold mb-6 ${isDark ? 'text-white' : 'text-gray-800'}`}>
                  Recent Activity
                </h3>
                
                <div className="space-y-3">
                  {moodLogs.slice(0, 5).map((log) => (
                    <div
                      key={log.id}
                      className={`flex items-center gap-4 p-3 rounded-lg ${
                        isDark 
                          ? 'bg-white/5 hover:bg-white/10' 
                          : 'bg-white/60 hover:bg-white/80'
                      } transition-all duration-300`}
                    >
                      <div className="text-2xl">{getMoodEmoji(log.mood)}</div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${isDark ? 'text-white' : 'text-gray-800'}`}>
                            {log.mood}
                          </span>
                          <span className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                            {log.timestamp.toLocaleDateString()}
                          </span>
                        </div>
                        {log.journalEntry && (
                          <p className={`text-sm mt-1 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
                            "{log.journalEntry.substring(0, 100)}{log.journalEntry.length > 100 ? '...' : ''}"
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-6 text-center">
                  <button
                    onClick={() => navigate('/history')}
                    className={`px-6 py-3 rounded-full transition-all duration-300 hover:scale-105 ${
                      isDark 
                        ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                        : 'bg-black/10 text-gray-800 hover:bg-black/20 border border-gray-200'
                    }`}
                  >
                    View Full History
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Quick Actions */}
          <div className={`flex flex-col sm:flex-row gap-4 justify-center mt-12 transform transition-all duration-1000 delay-800 ${
            isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'
          }`}>
            <button
              onClick={() => navigate('/mood')}
              className={`px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 hover:shadow-2xl ${
                isDark 
                  ? 'bg-gradient-to-r from-pink-500 to-purple-600 text-white hover:from-pink-400 hover:to-purple-500' 
                  : 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-500 hover:to-pink-500'
              }`}
            >
              Check Your Mood
            </button>
            
            <button
              onClick={() => navigate('/history')}
              className={`px-8 py-4 text-lg font-semibold rounded-full transition-all duration-300 transform hover:scale-105 ${
                isDark 
                  ? 'bg-white/10 text-white hover:bg-white/20 border border-white/20' 
                  : 'bg-black/10 text-gray-800 hover:bg-black/20 border border-gray-200'
              }`}
            >
              View History
            </button>
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