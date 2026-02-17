import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface FavoritesStore {
  favorites: string[];
  addFavorite: (productId: string) => void;
  removeFavorite: (productId: string) => void;
  isFavorite: (productId: string) => boolean;
  clearFavorites: () => void;
}

export const useFavoritesStore = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],
      
      addFavorite: (productId: string) => {
        set((state) => {
          if (state.favorites.includes(productId)) {
            return state;
          }
          return { favorites: [...state.favorites, productId] };
        });
      },
      
      removeFavorite: (productId: string) => {
        set((state) => ({
          favorites: state.favorites.filter(id => id !== productId),
        }));
      },
      
      isFavorite: (productId: string) => {
        return get().favorites.includes(productId);
      },
      
      clearFavorites: () => {
        set({ favorites: [] });
      },
    }),
    {
      name: 'favorites-store',
    }
  )
);
