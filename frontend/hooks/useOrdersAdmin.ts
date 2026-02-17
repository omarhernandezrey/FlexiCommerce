'use client';

import { useState, useCallback } from 'react';
import { ordersAPI } from '@/lib/api.service';

export interface OrderItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  userId: string;
  items: OrderItem[];
  total: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered';
  shippingAddress?: string;
  paymentMethod?: string;
  createdAt?: string;
  updatedAt?: string;
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
      const response = await ordersAPI.getAll();
      setState((prev) => ({
        ...prev,
        orders: response.data,
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
      setState((prev) => ({
        ...prev,
        currentOrder: response.data,
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
      const response = await ordersAPI.updateStatus(id, status);
      setState((prev) => ({
        ...prev,
        orders: prev.orders.map((o) => (o.id === id ? { ...o, status } : o)),
        currentOrder: prev.currentOrder?.id === id ? { ...prev.currentOrder, status } : prev.currentOrder,
        loading: false,
      }));
      return response.data;
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
