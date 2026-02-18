import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface SearchHistory {
  id: string;
  query: string;
  timestamp: string;
}

interface SearchHistoryStore {
  history: SearchHistory[];
  addSearch: (query: string) => void;
  removeSearch: (id: string) => void;
  clearHistory: () => void;
  getRecent: (limit?: number) => SearchHistory[];
  maxHistory: number;
}

export const useSearchHistoryStore = create<SearchHistoryStore>()(
  persist(
    (set, get) => ({
      history: [],
      maxHistory: 20,
      addSearch: (query: string) => {
        const trimmedQuery = query.trim();
        if (trimmedQuery.length === 0) return;

        set((state) => {
          // Remove if already exists (to put it at the top)
          const filtered = state.history.filter((item) => item.query !== trimmedQuery);
          // Add new search
          return {
            history: [
              {
                id: `${trimmedQuery}-${Date.now()}`,
                query: trimmedQuery,
                timestamp: new Date().toISOString(),
              },
              ...filtered,
            ].slice(0, state.maxHistory),
          };
        });
      },
      removeSearch: (id: string) => {
        set((state) => ({
          history: state.history.filter((item) => item.id !== id),
        }));
      },
      clearHistory: () => {
        set({ history: [] });
      },
      getRecent: (limit = 10) => {
        return get().history.slice(0, limit);
      },
    }),
    {
      name: 'search-history-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
