'use client';

import { AuthProvider } from '@/components/auth/AuthProvider';
import { ToastContainer } from '@/components/ui/ToastContainer';

/**
 * Wrapper del layout raíz que proporciona contexto de autenticación.
 * Zustand persiste automáticamente el estado en localStorage,
 * por lo que no necesita lógica adicional aquí.
 */
export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      {children}
      <ToastContainer />
    </AuthProvider>
  );
}
