'use client';

import { useCallback, useState } from 'react';
import apiClient from '@/lib/api-client';

interface PaymentIntentResponse {
  clientSecret: string;
  publishableKey: string;
  amount: number;
  currency: string;
}

interface PaymentResult {
  success: boolean;
  paymentIntentId?: string;
  error?: string;
}

interface StripeState {
  loading: boolean;
  error: string | null;
  success: boolean;
}

const initialState: StripeState = {
  loading: false,
  error: null,
  success: false,
};

export function useStripePayment() {
  const [state, setState] = useState<StripeState>(initialState);

  const createPaymentIntent = useCallback(async (amount: number, currency: string = 'usd') => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.post<PaymentIntentResponse>('/api/payments/create-intent', {
        amount,
        currency,
      });
      setState((prev) => ({
        ...prev,
        loading: false,
      }));
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error creating payment intent';
      setState((prev) => ({
        ...prev,
        error: message,
        loading: false,
      }));
      throw error;
    }
  }, []);

  const confirmPayment = useCallback(async (paymentIntentId: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.post<PaymentResult>('/api/payments/confirm', {
        paymentIntentId,
      });
      
      if (response.data.success) {
        setState((prev) => ({
          ...prev,
          success: true,
          loading: false,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: response.data.error || 'Payment confirmation failed',
          loading: false,
        }));
      }
      
      return response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error confirming payment';
      setState((prev) => ({
        ...prev,
        error: message,
        loading: false,
      }));
      throw error;
    }
  }, []);

  const processPayment = useCallback(
    async (amount: number, paymentMethodId: string, currency: string = 'usd') => {
      setState((prev) => ({ ...prev, loading: true, error: null }));
      try {
        const response = await apiClient.post<PaymentResult>('/api/payments/process', {
          amount,
          paymentMethodId,
          currency,
        });

        if (response.data.success) {
          setState((prev) => ({
            ...prev,
            success: true,
            loading: false,
          }));
        } else {
          setState((prev) => ({
            ...prev,
            error: response.data.error || 'Payment failed',
            loading: false,
          }));
        }

        return response.data;
      } catch (error) {
        const message = error instanceof Error ? error.message : 'Error processing payment';
        setState((prev) => ({
          ...prev,
          error: message,
          loading: false,
        }));
        throw error;
      }
    },
    []
  );

  const resetState = useCallback(() => {
    setState(initialState);
  }, []);

  return {
    ...state,
    createPaymentIntent,
    confirmPayment,
    processPayment,
    resetState,
  };
}
