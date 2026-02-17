import { useCartStore } from '@/store/cart';

export const useCart = () => {
  return useCartStore();
};
