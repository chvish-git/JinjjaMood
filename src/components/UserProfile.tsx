import React from 'react';
import { LogOut, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';

interface UserProfileProps {
  isDark: boolean;
}

export const UserProfile: React.FC<UserProfileProps> = ({ isDark }) => {
  const { userProfile, logout } = useAuth();

  if (!userProfile) return null;

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
            <p className="text-sm font-medium">@{userProfile.username}</p>
            <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Member since {userProfile.createdAt.toLocaleDateString()}
            </p>
          </div>
        </div>
        
        <button
          onClick={logout}
          className={`p-2 rounded-full transition-all duration-300 hover:scale-110 ${
            isDark 
              ? 'hover:bg-white/20 text-gray-300 hover:text-white' 
              : 'hover:bg-black/20 text-gray-600 hover:text-gray-800'
          }`}
          title="Sign out"
        >
          <LogOut size={16} />
        </button>
      </div>
    </div>
  );
};