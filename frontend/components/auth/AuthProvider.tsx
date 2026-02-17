'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

const publicRoutes = ['/auth', '/'];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const { isAuthenticated, user } = useAuthStore();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if user is authenticated
    const checkAuth = () => {
      const token = localStorage.getItem('authToken');
      
      // If no token and no user in store, redirect to login
      if (!token && !user) {
        setIsLoading(false);
        router.push('/auth');
        return;
      }

      setIsLoading(false);
    };

    checkAuth();
  }, [user, router]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
