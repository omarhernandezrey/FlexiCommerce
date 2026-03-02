import axios from 'axios';
import { useAuthStore } from '@/store/auth';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor - Add token from Zustand store to every request
apiClient.interceptors.request.use(
  (config) => {
    const state = useAuthStore.getState();
    const token = state.token;
    
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor - Handle 401 errors
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 && typeof window !== 'undefined') {
      const store = useAuthStore.getState();
      // Solo limpiar sesión si el usuario estaba autenticado previamente
      if (store.isAuthenticated || store.token) {
        store.logout();
        // Limpiar cookie también
        document.cookie = 'auth-token=; path=/; max-age=0; samesite=lax';
        localStorage.removeItem('auth-store');
        window.location.href = '/auth';
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
