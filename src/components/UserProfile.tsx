import React, { useState } from 'react';
import { LogOut, User, Edit3, Trash2, Check, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

interface UserProfileProps {
  isDark: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ isDark }) => {
  const { userProfile, logout, updateUsername, deleteAccount } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [newUsername, setNewUsername] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  if (!userProfile) return null;

  const handleLogout = () => {
    console.log('🔴 DEBUG: UserProfile handleLogout clicked');
    console.log('🔴 DEBUG: Current userProfile before logout:', userProfile);
    
    // Clear all user data and redirect to login
    logout();
    
    console.log('🔴 DEBUG: logout() function called');
    // The AuthGuard will automatically redirect to LoginPage when isAuthenticated becomes false
  };

  const handleEditClick = () => {
    setNewUsername(userProfile.username);
    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setNewUsername('');
  };

  const handleUpdateUsername = async () => {
    if (!newUsername.trim() || newUsername.trim() === userProfile.username) {
      setIsEditing(false);
      return;
    }

    setIsUpdating(true);
    try {
      const result = await updateUsername(newUsername.trim());
      
      if (result.success) {
        toast.success('Fresh new name. We love a rebrand.', {
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
        toast.success('Mood erased. ✨ Who even were you?', {
          duration: 4000,
          style: {
            background: '#EF4444',
            color: '#fff',
            fontWeight: '600',
          },
        });
        // The AuthGuard will automatically redirect to LoginPage
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

  return (
    <div className="absolute top-6 left-6 z-10">
      <div className={`flex items-center gap-3 px-4 py-2 rounded-full transition-all duration-300 ${
        isDark 
          ? 'bg-white/10 text-white border border-white/20' 
          : 'bg-black/10 text-gray-800 border border-gray-200'
      }`}>
        <div className="flex items-center gap-2">
          <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
            isDark ? 'bg-white/20' : 'bg-gray-200'
          }`}>
            <User size={16} />
          </div>
          <div className="hidden sm:block">
            {isEditing ? (
              <div className="flex items-center gap-2">
                <input
                  type="text"
                  value={newUsername}
                  onChange={(e) => setNewUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ''))}
                  className={`text-sm font-medium bg-transparent border-b border-current outline-none w-24 ${
                    isDark ? 'text-white' : 'text-gray-800'
                  }`}
                  maxLength={20}
                  disabled={isUpdating}
                />
                <button
                  onClick={handleUpdateUsername}
                  disabled={isUpdating}
                  className={`p-1 rounded transition-all duration-300 hover:scale-110 ${
                    isDark 
                      ? 'hover:bg-white/20 text-green-400 hover:text-green-300' 
                      : 'hover:bg-black/20 text-green-600 hover:text-green-700'
                  }`}
                  title="Save"
                >
                  <Check size={14} />
                </button>
                <button
                  onClick={handleCancelEdit}
                  disabled={isUpdating}
                  className={`p-1 rounded transition-all duration-300 hover:scale-110 ${
                    isDark 
                      ? 'hover:bg-white/20 text-red-400 hover:text-red-300' 
                      : 'hover:bg-black/20 text-red-600 hover:text-red-700'
                  }`}
                  title="Cancel"
                >
                  <X size={14} />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-sm font-medium">@{userProfile.username}</p>
                  <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                    Member since {userProfile.created_at.toLocaleDateString()}
                  </p>
                </div>
                <button
                  onClick={handleEditClick}
                  className={`p-1 rounded transition-all duration-300 hover:scale-110 ${
                    isDark 
                      ? 'hover:bg-white/20 text-gray-400 hover:text-white' 
                      : 'hover:bg-black/20 text-gray-600 hover:text-gray-800'
                  }`}
                  title="Edit username"
                >
                  <Edit3 size={12} />
                </button>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex items-center gap-1">
          {/* Delete Account Button */}
          {showDeleteConfirm ? (
            <div className="flex items-center gap-1">
              <button
                onClick={handleDeleteAccount}
                disabled={isDeleting}
                className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                  isDark 
                    ? 'hover:bg-red-500/20 text-red-400 hover:text-red-300' 
                    : 'hover:bg-red-500/20 text-red-600 hover:text-red-700'
                }`}
                title="Confirm delete"
              >
                <Check size={14} />
              </button>
              <button
                onClick={() => setShowDeleteConfirm(false)}
                disabled={isDeleting}
                className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
                  isDark 
                    ? 'hover:bg-white/20 text-gray-400 hover:text-white' 
                    : 'hover:bg-black/20 text-gray-600 hover:text-gray-800'
                }`}
                title="Cancel delete"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className={`p-2 rounded-full transition-all duration-300 hover:scale-110 group ${
                isDark 
                  ? 'hover:bg-red-500/20 text-gray-400 hover:text-red-400' 
                  : 'hover:bg-red-500/20 text-gray-600 hover:text-red-600'
              }`}
              title="Delete account"
            >
              <Trash2 size={14} className="group-hover:rotate-12 transition-transform duration-300" />
            </button>
          )}
          
          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className={`p-2 rounded-full transition-all duration-300 hover:scale-110 group ${
              isDark 
                ? 'hover:bg-white/20 text-gray-300 hover:text-white' 
                : 'hover:bg-black/20 text-gray-600 hover:text-gray-800'
            }`}
            title="Sign out"
          >
            <LogOut size={16} className="group-hover:rotate-12 transition-transform duration-300" />
          </button>
        </div>
      </div>
    </div>
  );
};