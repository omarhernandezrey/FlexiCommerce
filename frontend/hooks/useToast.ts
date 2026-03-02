'use client';

import { create } from 'zustand';

export type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastMessage {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastStore {
  toasts: ToastMessage[];
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  dismiss: (id: number) => void;
}

// Estado global compartido por todos los componentes
const useToastStore = create<ToastStore>((set) => ({
  toasts: [],
  addToast: (message, type = 'info', duration = 4000) => {
    const id = Date.now();
    set((state) => ({ toasts: [...state.toasts, { id, message, type }] }));
    setTimeout(() => {
      set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) }));
    }, duration);
  },
  dismiss: (id) =>
    set((state) => ({ toasts: state.toasts.filter((t) => t.id !== id) })),
}));

// Hook con la misma interfaz que antes — ahora usa estado global
export const useToast = () => {
  const { toasts, addToast, dismiss } = useToastStore();

  const toast = ({ message, type = 'info' }: { message: string; type?: ToastType; duration?: number }) => {
    addToast(message, type);
  };

  return { toasts, toast, dismiss };
};
