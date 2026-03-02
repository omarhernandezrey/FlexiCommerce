'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/auth';

/**
 * Proveedor de autenticación.
 * Zustand persiste automáticamente el estado en localStorage.
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}

/**
 * Componente para proteger rutas en el cliente.
 * El middleware.ts protege en el servidor (usando cookies).
 * Este componente agrega protección en el cliente después de la hidratación de Zustand.
 */
export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);
  const { isAuthenticated, token } = useAuthStore();
  const router = useRouter();

  // Esperar a que React monte el componente (y Zustand hidrate desde localStorage)
  useEffect(() => {
    setMounted(true);
  }, []);

  // Después de montar, verificar autenticación
  useEffect(() => {
    if (mounted && !isAuthenticated && !token) {
      router.replace('/auth');
    }
  }, [mounted, isAuthenticated, token, router]);

  // Durante SSR/hidratación, no mostrar nada para evitar flash de contenido no autorizado
  if (!mounted) return null;

  // Si no está autenticado, no renderizar (la redirección está en camino)
  if (!isAuthenticated && !token) return null;

  return <>{children}</>;
}
