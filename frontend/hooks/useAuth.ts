'use client';

import { useAuthStore } from '@/store/auth';

export const useAuth = () => {
  return useAuthStore();
};
