import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CompareProduct {
  id: string;
  productId: string;
}

interface CompareStore {
  products: CompareProduct[];
  addProduct: (productId: string) => void;
  removeProduct: (productId: string) => void;
  toggleProduct: (productId: string) => void;
  isComparing: (productId: string) => boolean;
  clearCompare: () => void;
  maxProducts: number;
}

export const useCompareStore = create<CompareStore>()(
  persist(
    (set, get) => ({
      products: [],
      maxProducts: 4,
      addProduct: (productId: string) => {
        const { isComparing, maxProducts } = get();
        if (!isComparing(productId) && get().products.length < maxProducts) {
          set((state) => ({
            products: [
              ...state.products,
              {
                id: `${productId}-${Date.now()}`,
                productId,
              },
            ],
          }));
        }
      },
      removeProduct: (productId: string) => {
        set((state) => ({
          products: state.products.filter((p) => p.productId !== productId),
        }));
      },
      toggleProduct: (productId: string) => {
        const { isComparing } = get();
        if (isComparing(productId)) {
          get().removeProduct(productId);
        } else {
          get().addProduct(productId);
        }
      },
      isComparing: (productId: string) => {
        return get().products.some((p) => p.productId === productId);
      },
      clearCompare: () => {
        set({ products: [] });
      },
    }),
    {
      name: 'compare-store',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
