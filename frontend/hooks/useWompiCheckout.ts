'use client';

import { useEffect, useCallback } from 'react';
import apiClient from '@/lib/api-client';

// Declaración de tipos del Widget de Wompi
declare global {
  interface Window {
    WidgetCheckout: new (config: WompiWidgetConfig) => WompiWidget;
  }
}

interface WompiWidgetConfig {
  currency: string;
  amountInCents: number;
  reference: string;
  publicKey: string;
  redirectUrl: string;
  signature?: {
    integrity: string;
  };
  customerData?: {
    email?: string;
    fullName?: string;
    phoneNumber?: string;
    phoneNumberPrefix?: string;
    legalId?: string;
    legalIdType?: string;
  };
}

interface WompiWidget {
  open: (callback: (result: { transaction: { id: string; status: string } }) => void) => void;
}

export const useWompiCheckout = () => {
  // Cargar el script del widget de Wompi al montar el hook
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (document.querySelector('script[src*="checkout.wompi.co"]')) return;

    const script = document.createElement('script');
    script.src = 'https://checkout.wompi.co/widget.js';
    script.async = true;
    document.head.appendChild(script);
  }, []);

  /**
   * Abre el widget de pago de Wompi para una orden existente.
   * @param orderId - ID de la orden creada en la BD
   * @param customerEmail - Email del comprador
   * @param customerName - Nombre completo del comprador
   */
  const openCheckout = useCallback(
    async ({
      orderId,
      customerEmail,
      customerName,
    }: {
      orderId: string;
      customerEmail: string;
      customerName: string;
    }) => {
      // 1. Solicitar sesión al backend (obtiene public_key, reference, hash de integridad)
      const res = await apiClient.post('/api/payments/wompi/session', { orderId });
      const { public_key, reference, amount_in_cents, integrity_hash } =
        res.data.data;

      // 2. Verificar que el widget esté disponible (tiene un timeout de espera)
      if (!window.WidgetCheckout) {
        // Esperar hasta 5 segundos a que el script cargue
        await new Promise<void>((resolve, reject) => {
          let elapsed = 0;
          const interval = setInterval(() => {
            if (window.WidgetCheckout) { clearInterval(interval); resolve(); return; }
            elapsed += 250;
            if (elapsed >= 5000) { clearInterval(interval); reject(new Error('El widget de Wompi no cargó. Recarga la página.')); }
          }, 250);
        });
      }

      // 3. Abrir el widget con signature (integrity_hash) — requerido por Wompi para evitar 403
      // checkout.open() es síncrono: abre el modal y retorna inmediatamente.
      // La cuenta de Wompi debe estar activa para que el modal cargue correctamente.
      const checkout = new window.WidgetCheckout({
        currency: 'COP',
        amountInCents: amount_in_cents,
        reference,
        publicKey: public_key,
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/checkout/verificar`,
        signature: {
          integrity: integrity_hash,
        },
        customerData: {
          email: customerEmail,
          fullName: customerName,
        },
      });

      checkout.open((result) => {
        window.location.href = `/checkout/verificar?id=${result.transaction.id}`;
      });
    },
    [],
  );

  return { openCheckout };
};
