import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const ProfileSkeleton: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen pt-16 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100'
    }`}>
      <div className="relative z-10 px-6 py-20">
        {/* Header Skeleton */}
        <div className="text-center mb-12">
          <div className={`h-12 w-64 mx-auto rounded-lg animate-pulse mb-4 ${
            isDark ? 'bg-white/10' : 'bg-gray-200'
          }`}></div>
          <div className={`h-6 w-48 mx-auto rounded-lg animate-pulse ${
            isDark ? 'bg-white/10' : 'bg-gray-200'
          }`}></div>
        </div>

        <div className="max-w-4xl mx-auto">
          {/* Profile Card Skeleton */}
          <div className="mb-8">
            <div className={`p-8 rounded-2xl backdrop-blur-sm border ${
              isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200'
            }`}>
              <div className="flex flex-col md:flex-row items-center gap-6">
                {/* Avatar Skeleton */}
                <div className={`w-24 h-24 rounded-full animate-pulse ${
                  isDark ? 'bg-white/20' : 'bg-gray-200'
                }`}></div>

                {/* Profile Info Skeleton */}
                <div className="flex-1 text-center md:text-left">
                  <div className={`h-8 w-48 rounded animate-pulse mb-2 ${
                    isDark ? 'bg-white/10' : 'bg-gray-200'
                  }`}></div>
                  <div className={`h-5 w-64 rounded animate-pulse ${
                    isDark ? 'bg-white/10' : 'bg-gray-200'
                  }`}></div>
                </div>

                {/* Action Buttons Skeleton */}
                <div className="flex flex-col gap-3">
                  <div className={`h-10 w-32 rounded-lg animate-pulse ${
                    isDark ? 'bg-white/10' : 'bg-gray-200'
                  }`}></div>
                  <div className={`h-10 w-24 rounded-lg animate-pulse ${
                    isDark ? 'bg-white/10' : 'bg-gray-200'
                  }`}></div>
                </div>
              </div>
            </div>
          </div>

          {/* Stats Grid Skeleton */}
          <div className="mb-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`p-6 rounded-2xl backdrop-blur-sm border text-center ${
                  isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200'
                }`}>
                  <div className={`h-6 w-8 mx-auto rounded animate-pulse mb-3 ${
                    isDark ? 'bg-white/10' : 'bg-gray-200'
                  }`}></div>
                  <div className={`h-8 w-12 mx-auto rounded animate-pulse mb-2 ${
                    isDark ? 'bg-white/10' : 'bg-gray-200'
                  }`}></div>
                  <div className={`h-4 w-20 mx-auto rounded animate-pulse ${
                    isDark ? 'bg-white/10' : 'bg-gray-200'
                  }`}></div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Activity Skeleton */}
          <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
            isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200'
          }`}>
            <div className={`h-6 w-48 rounded animate-pulse mb-6 ${
              isDark ? 'bg-white/10' : 'bg-gray-200'
            }`}></div>
            
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`flex items-center gap-4 p-3 rounded-lg ${
                  isDark ? 'bg-white/5' : 'bg-white/60'
                }`}>
                  <div className={`w-8 h-8 rounded animate-pulse ${
                    isDark ? 'bg-white/10' : 'bg-gray-200'
                  }`}></div>
                  <div className="flex-1">
                    <div className={`h-4 w-32 rounded animate-pulse mb-1 ${
                      isDark ? 'bg-white/10' : 'bg-gray-200'
                    }`}></div>
                    <div className={`h-3 w-full rounded animate-pulse ${
                      isDark ? 'bg-white/10' : 'bg-gray-200'
                    }`}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};