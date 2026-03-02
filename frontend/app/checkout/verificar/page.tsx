'use client';

import { Suspense, useEffect, useState, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useCart } from '@/hooks/useCart';
import { MaterialIcon } from '@/components/ui/MaterialIcon';
import apiClient from '@/lib/api-client';

type PageStatus = 'loading' | 'approved' | 'declined' | 'error';

function VerificarPagoContent() {
  const router = useRouter();
  const params = useSearchParams();
  const transactionId = params.get('id');
  const { clearCart } = useCart();

  const [status, setStatus] = useState<PageStatus>('loading');
  const [message, setMessage] = useState('Verificando tu pago con Wompi...');
  const [orderId, setOrderId] = useState<string | null>(null);
  const attemptsRef = useRef(0);
  const MAX_ATTEMPTS = 20; // 20 × 3s = 60 segundos máximo (PSE puede tardar)

  useEffect(() => {
    if (!transactionId) {
      router.replace('/');
      return;
    }

    const verify = async () => {
      try {
        attemptsRef.current += 1;
        setMessage(
          attemptsRef.current > 1
            ? `Verificando... (intento ${attemptsRef.current}/${MAX_ATTEMPTS})`
            : 'Verificando tu pago con Wompi...',
        );

        const res = await apiClient.post(
          `/api/payments/wompi/verify/${transactionId}`,
        );
        const { status: txStatus, orderId: oId } = res.data.data;

        if (txStatus === 'APPROVED') {
          clearCart();
          setOrderId(oId);
          setStatus('approved');
          router.replace(`/checkout/confirmation?orderId=${oId}`);
          return;
        }

        if (txStatus === 'DECLINED' || txStatus === 'ERROR') {
          setStatus('declined');
          setMessage(
            txStatus === 'DECLINED'
              ? 'Tu pago fue rechazado. Verifica los datos e intenta de nuevo.'
              : 'Ocurrió un error al procesar el pago.',
          );
          return;
        }

        // PENDING — PSE y algunos métodos toman hasta 60s
        if (attemptsRef.current < MAX_ATTEMPTS) {
          setTimeout(verify, 3000);
        } else {
          setStatus('error');
          setMessage(
            'No pudimos confirmar tu pago. Si el dinero fue descontado, contáctanos.',
          );
        }
      } catch {
        setStatus('error');
        setMessage('Error de conexión. Por favor recarga la página.');
      }
    };

    verify();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transactionId]);

  // ─── Loading ────────────────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-white to-slate-50">
        <div className="size-20 border-4 border-primary border-t-transparent rounded-full animate-spin" />
        <div className="text-center">
          <h2 className="text-xl font-extrabold text-primary mb-2">
            Procesando pago
          </h2>
          <p className="text-primary/60 text-sm max-w-xs">{message}</p>
          <p className="text-primary/40 text-xs mt-2">
            Por favor no cierres ni recargues esta ventana
          </p>
        </div>
        {/* Logos de métodos de pago Wompi */}
        <div className="flex items-center gap-3 mt-4 opacity-50">
          <span className="text-xs text-primary/40">Procesado por</span>
          <span className="font-bold text-sm text-primary">Wompi</span>
          <span className="text-xs text-primary/40">by Bancolombia</span>
        </div>
      </div>
    );
  }

  // ─── Approved (redireccionando) ──────────────────────────────────
  if (status === 'approved') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6">
        <div className="size-20 bg-green-100 rounded-full flex items-center justify-center">
          <MaterialIcon name="check_circle" className="text-green-500 text-5xl" filled />
        </div>
        <h2 className="text-xl font-extrabold text-primary">
          ¡Pago aprobado!
        </h2>
        <p className="text-primary/60 text-sm">Redirigiendo a tu confirmación...</p>
      </div>
    );
  }

  // ─── Declined ───────────────────────────────────────────────────
  if (status === 'declined') {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-white to-slate-50 px-4">
        <div className="bg-white rounded-2xl border border-red-100 shadow-xl p-10 max-w-md w-full text-center">
          <div className="size-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <MaterialIcon name="cancel" className="text-red-500 text-5xl" filled />
          </div>
          <h2 className="text-2xl font-extrabold text-primary mb-3">
            Pago rechazado
          </h2>
          <p className="text-primary/60 text-sm mb-8">{message}</p>
          <div className="flex flex-col gap-3">
            <Link
              href="/checkout"
              className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
            >
              <MaterialIcon name="refresh" className="text-base" />
              Intentar de nuevo
            </Link>
            <Link
              href="/cart"
              className="w-full border border-primary/20 text-primary font-semibold py-3 rounded-xl hover:bg-primary/5 transition-colors text-center"
            >
              Volver al carrito
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // ─── Error ──────────────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-6 bg-gradient-to-b from-white to-slate-50 px-4">
      <div className="bg-white rounded-2xl border border-amber-100 shadow-xl p-10 max-w-md w-full text-center">
        <div className="size-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <MaterialIcon name="warning" className="text-amber-500 text-5xl" filled />
        </div>
        <h2 className="text-2xl font-extrabold text-primary mb-3">
          Estado del pago desconocido
        </h2>
        <p className="text-primary/60 text-sm mb-2">{message}</p>
        <p className="text-primary/40 text-xs mb-8">
          ID de transacción: <span className="font-mono">{transactionId}</span>
        </p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => window.location.reload()}
            className="w-full bg-primary text-white font-bold py-3 rounded-xl hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
          >
            <MaterialIcon name="refresh" className="text-base" />
            Verificar de nuevo
          </button>
          <Link
            href="/"
            className="w-full border border-primary/20 text-primary font-semibold py-3 rounded-xl hover:bg-primary/5 transition-colors text-center"
          >
            Ir al inicio
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function VerificarPagoPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="size-16 border-4 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    }>
      <VerificarPagoContent />
    </Suspense>
  );
}
