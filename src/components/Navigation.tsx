import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Home, Heart, BarChart3, User, LogOut, Menu, X, Moon, Sun } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

export const Navigation: React.FC = () => {
  const { isAuthenticated, logout, userProfile } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDark, setIsDark] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/');
    setIsMenuOpen(false);
  };

  const toggleTheme = () => {
    setIsDark(!isDark);
  };

  const isActive = (path: string) => location.pathname === path;

  // Don't show navigation on landing and login pages
  if (location.pathname === '/' || location.pathname === '/login') {
    return null;
  }

  if (!isAuthenticated) {
    return null;
  }

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
      isDark 
        ? 'bg-slate-900/90 border-slate-700' 
        : 'bg-white/90 border-gray-200'
    } backdrop-blur-sm border-b`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link 
            to="/mood" 
            className={`text-xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-blue-600 bg-clip-text text-transparent hover:scale-105 transition-transform duration-300`}
          >
            JinjjaMood
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              to="/mood"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                isActive('/mood')
                  ? isDark 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-purple-100 text-purple-700'
                  : isDark 
                    ? 'text-gray-300 hover:text-white hover:bg-white/10' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <Heart size={18} />
              <span className="font-medium">Mood</span>
            </Link>

            <Link
              to="/history"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                isActive('/history')
                  ? isDark 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-purple-100 text-purple-700'
                  : isDark 
                    ? 'text-gray-300 hover:text-white hover:bg-white/10' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <BarChart3 size={18} />
              <span className="font-medium">History</span>
            </Link>

            <Link
              to="/profile"
              className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                isActive('/profile')
                  ? isDark 
                    ? 'bg-purple-600 text-white' 
                    : 'bg-purple-100 text-purple-700'
                  : isDark 
                    ? 'text-gray-300 hover:text-white hover:bg-white/10' 
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              <User size={18} />
              <span className="font-medium">Profile</span>
            </Link>

            {/* Theme Toggle */}
            <button
              onClick={toggleTheme}
              className={`p-2 rounded-lg transition-all duration-300 hover:scale-110 ${
                isDark 
                  ? 'text-gray-300 hover:text-white hover:bg-white/10' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {/* User Info & Logout */}
            <div className="flex items-center gap-3 pl-3 border-l border-gray-300">
              <div className={`text-sm ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
                @{userProfile?.username}
              </div>
              <button
                onClick={handleLogout}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg transition-all duration-300 hover:scale-105 ${
                  isDark 
                    ? 'text-gray-300 hover:text-red-400 hover:bg-red-500/10' 
                    : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                }`}
              >
                <LogOut size={16} />
                <span className="font-medium">Logout</span>
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-2 rounded-lg transition-all duration-300 ${
                isDark 
                  ? 'text-gray-300 hover:text-white hover:bg-white/10' 
                  : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
              }`}
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={`md:hidden py-4 border-t ${
            isDark ? 'border-slate-700' : 'border-gray-200'
          }`}>
            <div className="space-y-2">
              <Link
                to="/mood"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 ${
                  isActive('/mood')
                    ? isDark 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-purple-100 text-purple-700'
                    : isDark 
                      ? 'text-gray-300 hover:text-white hover:bg-white/10' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <Heart size={20} />
                <span className="font-medium">Check Your Mood</span>
              </Link>

              <Link
                to="/history"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 ${
                  isActive('/history')
                    ? isDark 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-purple-100 text-purple-700'
                    : isDark 
                      ? 'text-gray-300 hover:text-white hover:bg-white/10' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <BarChart3 size={20} />
                <span className="font-medium">Mood History</span>
              </Link>

              <Link
                to="/profile"
                onClick={() => setIsMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 ${
                  isActive('/profile')
                    ? isDark 
                      ? 'bg-purple-600 text-white' 
                      : 'bg-purple-100 text-purple-700'
                    : isDark 
                      ? 'text-gray-300 hover:text-white hover:bg-white/10' 
                      : 'text-gray-600 hover:text-gray-900 hover:bg-gray-100'
                }`}
              >
                <User size={20} />
                <span className="font-medium">Profile</span>
              </Link>

              <div className={`border-t pt-3 mt-3 ${
                isDark ? 'border-slate-700' : 'border-gray-200'
              }`}>
                <div className={`px-3 py-2 text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                  Logged in as @{userProfile?.username}
                </div>
                <button
                  onClick={handleLogout}
                  className={`flex items-center gap-3 px-3 py-3 rounded-lg transition-all duration-300 w-full ${
                    isDark 
                      ? 'text-gray-300 hover:text-red-400 hover:bg-red-500/10' 
                      : 'text-gray-600 hover:text-red-600 hover:bg-red-50'
                  }`}
                >
                  <LogOut size={20} />
                  <span className="font-medium">Logout</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};