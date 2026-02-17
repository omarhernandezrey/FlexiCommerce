import { create } from 'zustand';
import { persist } from 'zustand/middleware';

type Theme = 'light' | 'dark' | 'system';

interface PreferencesStore {
  theme: Theme;
  currency: string;
  language: string;
  setTheme: (theme: Theme) => void;
  setCurrency: (currency: string) => void;
  setLanguage: (language: string) => void;
}

export const usePreferencesStore = create<PreferencesStore>()(
  persist(
    (set) => ({
      theme: 'light',
      currency: 'EUR',
      language: 'es',
      
      setTheme: (theme: Theme) => {
        set({ theme });
        // Aplicar tema al HTML
        if (typeof window !== 'undefined') {
          if (theme === 'dark') {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        }
      },
      
      setCurrency: (currency: string) => {
        set({ currency });
      },
      
      setLanguage: (language: string) => {
        set({ language });
      },
    }),
    {
      name: 'preferences-store',
    }
  )
);
