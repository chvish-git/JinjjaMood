import React from 'react';
import { useAuth } from '../hooks/useAuth';
import { LoginPage } from '../pages/LoginPage';

interface AuthGuardProps {
  children: React.ReactNode;
}

export const AuthGuard: React.FC<AuthGuardProps> = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();

  console.log('🟢 DEBUG: AuthGuard render - loading:', loading, 'isAuthenticated:', isAuthenticated);

  if (loading) {
    console.log('🟢 DEBUG: AuthGuard showing loading screen');
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-100 via-purple-50 to-blue-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    console.log('🟢 DEBUG: AuthGuard showing LoginPage (user not authenticated)');
    return <LoginPage />;
  }

  console.log('🟢 DEBUG: AuthGuard showing authenticated content');
  return <>{children}</>;
};