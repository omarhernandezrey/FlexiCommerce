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
        const response = await authAPI.login(credentials);
        // El backend envuelve la respuesta: { success: true, data: { token, user } }
        // Compatibilidad con ambos formatos
        const payload = (response.data as any)?.data ?? response.data;

        if (payload.token) {
          document.cookie = `auth-token=${payload.token}; path=/; max-age=604800; samesite=lax`;
        }

        storeLogin(payload.user, payload.token);

        return payload.user;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al iniciar sesión';
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
      userData: Omit<User, 'id' | 'role' | 'createdAt'> & { password: string }
    ) => {
      try {
        setLoading(true);
        setError(null);
        const response = await authAPI.register(userData);
        const payload = (response.data as any)?.data ?? response.data;

        if (payload.token) {
          document.cookie = `auth-token=${payload.token}; path=/; max-age=604800; samesite=lax`;
        }

        storeLogin(payload.user, payload.token);

        return payload.user;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error al registrarse';
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
      
      // Hacer logout en el backend
      try {
        await authAPI.logout();
      } catch (err) {
        // Si el backend falla, igual limpiamos localmente
        console.warn('Backend logout falló, limpiando localmente:', err);
      }
      
      // Limpiar todo localmente
      storeLogout();
      
      // Limpiar cookies
      document.cookie = 'auth-token=; path=/; max-age=0; samesite=lax';
      
      // Limpiar localStorage completamente
      localStorage.removeItem('auth-store');
      
      return true;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Logout failed';
      setError(message);
      
      // Aún así limpiar aunque falle
      storeLogout();
      localStorage.removeItem('auth-store');
      document.cookie = 'auth-token=; path=/; max-age=0; samesite=lax';
      
      throw err;
    } finally {
      setLoading(false);
    }
  }, [storeLogout]);

  const getCurrentUser = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.getCurrentUser();
      const payload = (response.data as any)?.data ?? response.data;
      // Preservar el token existente — solo actualizar los datos del usuario
      const currentToken = useAuthStore.getState().token;
      storeLogin(payload, currentToken ?? undefined);
      return payload;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al obtener usuario';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, [storeLogin]);

  const refreshToken = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await authAPI.refreshToken();
      const payload = (response.data as any)?.data ?? response.data;

      if (payload.token) {
        storeLogin(payload.user, payload.token);
        document.cookie = `auth-token=${payload.token}; path=/; max-age=604800; samesite=lax`;
      }

      return payload.token;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error al renovar sesión';
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
    refreshToken,
  };
};
