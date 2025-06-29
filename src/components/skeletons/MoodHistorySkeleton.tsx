import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export const MoodHistorySkeleton: React.FC = () => {
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
          <div className={`h-12 w-96 mx-auto rounded-lg animate-pulse mb-4 ${
            isDark ? 'bg-white/10' : 'bg-gray-200'
          }`}></div>
          <div className={`h-6 w-64 mx-auto rounded-lg animate-pulse ${
            isDark ? 'bg-white/10' : 'bg-gray-200'
          }`}></div>
        </div>

        {/* Insights Skeleton */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
            isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200'
          }`}>
            <div className={`h-6 w-48 rounded-lg animate-pulse mb-6 ${
              isDark ? 'bg-white/10' : 'bg-gray-200'
            }`}></div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className={`p-4 rounded-xl border-l-4 border-purple-400 ${
                  isDark ? 'bg-white/5' : 'bg-gray-50'
                }`}>
                  <div className={`h-4 w-32 rounded animate-pulse mb-2 ${
                    isDark ? 'bg-white/10' : 'bg-gray-200'
                  }`}></div>
                  <div className={`h-3 w-full rounded animate-pulse ${
                    isDark ? 'bg-white/10' : 'bg-gray-200'
                  }`}></div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Stats Skeleton */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className={`p-4 rounded-2xl backdrop-blur-sm border ${
                isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200'
              }`}>
                <div className={`h-8 w-16 rounded animate-pulse mb-2 ${
                  isDark ? 'bg-white/10' : 'bg-gray-200'
                }`}></div>
                <div className={`h-4 w-20 rounded animate-pulse ${
                  isDark ? 'bg-white/10' : 'bg-gray-200'
                }`}></div>
              </div>
            ))}
          </div>
        </div>

        {/* Chart Skeleton */}
        <div className="max-w-6xl mx-auto mb-8">
          <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
            isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200'
          }`}>
            <div className={`h-6 w-48 rounded animate-pulse mb-6 ${
              isDark ? 'bg-white/10' : 'bg-gray-200'
            }`}></div>
            <div className={`h-64 w-full rounded-xl animate-pulse ${
              isDark ? 'bg-white/5' : 'bg-gray-100'
            }`}></div>
          </div>
        </div>

        {/* Journal Entries Skeleton */}
        <div className="max-w-4xl mx-auto">
          <div className={`p-6 rounded-2xl backdrop-blur-sm border ${
            isDark ? 'bg-white/10 border-white/20' : 'bg-white/80 border-gray-200'
          }`}>
            <div className={`h-6 w-48 rounded animate-pulse mb-6 ${
              isDark ? 'bg-white/10' : 'bg-gray-200'
            }`}></div>
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className={`p-4 rounded-xl border ${
                  isDark ? 'bg-white/5 border-white/10' : 'bg-white/60 border-gray-100'
                }`}>
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full animate-pulse ${
                      isDark ? 'bg-white/10' : 'bg-gray-200'
                    }`}></div>
                    <div className="flex-1">
                      <div className={`h-4 w-32 rounded animate-pulse mb-2 ${
                        isDark ? 'bg-white/10' : 'bg-gray-200'
                      }`}></div>
                      <div className={`h-3 w-full rounded animate-pulse ${
                        isDark ? 'bg-white/10' : 'bg-gray-200'
                      }`}></div>
                    </div>
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