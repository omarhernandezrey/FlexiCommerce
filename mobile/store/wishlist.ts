import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface WishlistItem {
  id: string;
  productId: string;
  addedAt: string;
}

interface WishlistStore {
  items: WishlistItem[];
  addItem: (productId: string) => void;
  removeItem: (productId: string) => void;
  toggleItem: (productId: string) => void;
  isInWishlist: (productId: string) => boolean;
  clearWishlist: () => void;
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (productId: string) => {
        const { isInWishlist } = get();
        if (!isInWishlist(productId)) {
          set((state) => ({
            items: [
              ...state.items,
              {
                id: `${productId}-${Date.now()}`,
                productId,
                addedAt: new Date().toISOString(),
              },
            ],
          }));
        }
      },
      removeItem: (productId: string) => {
        set((state) => ({
          items: state.items.filter((item) => item.productId !== productId),
        }));
      },
      toggleItem: (productId: string) => {
        const { isInWishlist } = get();
        if (isInWishlist(productId)) {
          get().removeItem(productId);
        } else {
          get().addItem(productId);
        }
      },
      isInWishlist: (productId: string) => {
        return get().items.some((item) => item.productId === productId);
      },
      clearWishlist: () => {
        set({ items: [] });
      },
    }),
    {
      name: 'wishlist-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
