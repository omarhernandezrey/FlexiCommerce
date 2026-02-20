import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: 'customer' | 'admin';
  createdAt?: string;
}

interface AuthStore {
  user: User | null;
  isAuthenticated: boolean;
  token: string | null;
  login: (user: User, token?: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
  setToken: (token: string) => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      
      login: (user: User, token?: string) => {
        set({ user, isAuthenticated: true, token: token || null });
      },
      
      logout: () => {
        set({ user: null, isAuthenticated: false, token: null });
      },
      
      updateUser: (updates: Partial<User>) => {
        set((state) => ({
          user: state.user ? { ...state.user, ...updates } : null,
        }));
      },

      setToken: (token: string) => {
        set({ token });
      },
    }),
    {
      name: 'auth-store',
    }
  )
);
