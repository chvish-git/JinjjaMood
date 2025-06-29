import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const ResultsSkeleton: React.FC = () => {
  const { isDark } = useTheme();

  return (
    <div className={`min-h-screen pt-16 ${
      isDark 
        ? 'bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900' 
        : 'bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100'
    }`}>
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 py-20">
        {/* Header Skeleton */}
        <div className="text-center mb-8">
          <div className={`h-12 w-96 mx-auto rounded-lg animate-pulse mb-4 ${
            isDark ? 'bg-white/10' : 'bg-gray-200'
          }`}></div>
          <div className={`h-4 w-48 mx-auto rounded-lg animate-pulse ${
            isDark ? 'bg-white/10' : 'bg-gray-200'
          }`}></div>
        </div>

        {/* Vibe Quote Skeleton */}
        <div className="mb-8 max-w-2xl mx-auto w-full">
          <div className={`p-8 rounded-3xl backdrop-blur-sm border shadow-2xl ${
            isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200'
          }`}>
            <div className="text-center">
              <div className={`h-6 w-32 mx-auto rounded-full animate-pulse mb-4 ${
                isDark ? 'bg-white/10' : 'bg-gray-200'
              }`}></div>
              <div className={`h-6 w-full rounded animate-pulse mb-2 ${
                isDark ? 'bg-white/10' : 'bg-gray-200'
              }`}></div>
              <div className={`h-6 w-3/4 mx-auto rounded animate-pulse mb-4 ${
                isDark ? 'bg-white/10' : 'bg-gray-200'
              }`}></div>
              <div className={`h-3 w-48 mx-auto rounded animate-pulse ${
                isDark ? 'bg-white/10' : 'bg-gray-200'
              }`}></div>
            </div>
          </div>
        </div>

        {/* Latest Mood Skeleton */}
        <div className="mb-8">
          <div className={`p-6 rounded-2xl shadow-xl max-w-md mx-auto ${
            isDark ? 'bg-purple-600' : 'bg-purple-500'
          }`}>
            <div className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full animate-pulse mb-3 ${
                isDark ? 'bg-white/20' : 'bg-white/30'
              }`}></div>
              <div className={`h-6 w-32 mx-auto rounded animate-pulse mb-2 ${
                isDark ? 'bg-white/20' : 'bg-white/30'
              }`}></div>
              <div className={`h-4 w-48 mx-auto rounded animate-pulse mb-3 ${
                isDark ? 'bg-white/20' : 'bg-white/30'
              }`}></div>
              <div className={`h-16 w-full rounded-xl animate-pulse ${
                isDark ? 'bg-white/20' : 'bg-white/30'
              }`}></div>
            </div>
          </div>
        </div>

        {/* Quick Stats Skeleton */}
        <div className="mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-3xl mx-auto">
            {[...Array(3)].map((_, i) => (
              <div key={i} className={`p-4 rounded-xl backdrop-blur-sm border ${
                isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200'
              }`}>
                <div className={`h-4 w-24 rounded animate-pulse mb-1 ${
                  isDark ? 'bg-white/10' : 'bg-gray-200'
                }`}></div>
                <div className={`h-6 w-8 rounded animate-pulse ${
                  isDark ? 'bg-white/10' : 'bg-gray-200'
                }`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Action Buttons Skeleton */}
        <div className="flex flex-col sm:flex-row gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className={`h-12 w-48 rounded-full animate-pulse ${
              i === 0 
                ? isDark ? 'bg-purple-600' : 'bg-purple-500'
                : isDark ? 'bg-white/10' : 'bg-gray-200'
            }`}></div>
          ))}
        </div>
      </div>
    </div>
  );
};