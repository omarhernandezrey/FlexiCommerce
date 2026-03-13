'use client';

import { useState, useCallback } from 'react';
import { ordersAPI } from '@/lib/api.service';
import apiClient from '@/lib/api-client';

export interface OrderProduct {
  id: string;
  name: string;
  image?: string;
  price: number;
}

export interface OrderItem {
  id?: string;
  productId: string;
  quantity: number;
  price: number;
  product?: OrderProduct;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress?: string | Record<string, string>;
  shippingMethod?: string;
  shippingCost?: number;
  paymentMethod?: string;
  payment?: { id: string; status: string; method: string; amount: number };
  user?: { email: string; firstName: string; lastName: string };
  createdAt?: string;
  updatedAt?: string;
}

/** Normaliza status del backend (UPPERCASE) a lowercase del frontend */
function normalizeOrder(raw: any): Order {
  return {
    ...raw,
    status: typeof raw.status === 'string' ? raw.status.toLowerCase() : raw.status,
    total: Number(raw.total) || 0,
    shippingCost: raw.shippingCost != null ? Number(raw.shippingCost) : 0,
    items: Array.isArray(raw.items)
      ? raw.items.map((item: any) => ({ ...item, price: Number(item.price) || 0 }))
      : [],
  };
}

interface OrdersState {
  orders: Order[];
  currentOrder: Order | null;
  loading: boolean;
  error: string | null;
}

const initialState: OrdersState = {
  orders: [],
  currentOrder: null,
  loading: false,
  error: null,
};

export function useOrdersAdmin() {
  const [state, setState] = useState<OrdersState>(initialState);

  const fetchAll = useCallback(async () => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await apiClient.get('/api/orders/admin/all');
      const data = (response.data as any)?.data ?? response.data;
      setState((prev) => ({
        ...prev,
        orders: Array.isArray(data) ? data.map(normalizeOrder) : [],
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al cargar órdenes',
        loading: false,
      }));
    }
  }, []);

  const fetchById = useCallback(async (id: string) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const response = await ordersAPI.getById(id);
      const data = (response.data as any)?.data ?? response.data;
      setState((prev) => ({
        ...prev,
        currentOrder: normalizeOrder(data),
        loading: false,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        error: error instanceof Error ? error.message : 'Error al cargar la orden',
        loading: false,
      }));
    }
  }, []);

  const updateStatus = useCallback(async (id: string, status: Order['status']) => {
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      // Backend espera UPPERCASE (enum Prisma)
      const response = await ordersAPI.updateStatus(id, status.toUpperCase() as any);
      setState((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        currentOrder: prev.currentOrder?.id === id ? { ...prev.currentOrder, status } : prev.currentOrder,
        loading: false,
      }));
      return (response.data as any)?.data ?? response.data;
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Error al actualizar orden';
      setState((prev) => ({
        ...prev,
        error: message,
        loading: false,
      }));
      throw error;
    }
  }, []);

  return {
    ...state,
    fetchAll,
    fetchById,
    updateStatus,
  };
}
