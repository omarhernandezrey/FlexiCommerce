'use client';

import { useState, useCallback } from 'react';
import { authAPI, User, LoginRequest } from '@/lib/api.service';
import { useAuthStore } from '@/store/auth';

export const useAuthAPI = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { login: storeLogin, logout: storeLogout } = useAuthStore();

  const login = useCallback(
    async (credentials: LoginRequest) => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await authAPI.login(credentials);
        
        // Save token to localStorage
        localStorage.setItem('authToken', data.token);
        
        // Update store
        storeLogin(data.user);
        
        return data.user;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Login failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [storeLogin]
  );

  const register = useCallback(
    async (
      userData: Omit<User, 'id' | 'role'> & { password: string }
    ) => {
      try {
        setLoading(true);
        setError(null);
        const { data } = await authAPI.register(userData);
        
        // Save token to localStorage
        localStorage.setItem('authToken', data.token);
        
        // Update store
        storeLogin(data.user);
        
        return data.user;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Registration failed';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [storeLogin]
  );

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      await authAPI.logout();
      
      // Clear token
      localStorage.removeItem('authToken');
      
      // Update store
      storeLogout();
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [storeLogout]);

  const getCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await authAPI.getCurrentUser();
      storeLogin(data);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error fetching user';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [storeLogin]);

  return {
    loading,
    error,
    login,
    register,
    logout,
    getCurrentUser,
  };
};
