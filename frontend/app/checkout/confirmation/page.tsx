import { Suspense } from 'react';
import { ConfirmationContent } from './ConfirmationContent';

export const metadata = {
  title: 'Confirmación del Pedido | FlexiCommerce',
};

export default function OrderConfirmationPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    }>
      <ConfirmationContent />
    </Suspense>
  );
}
