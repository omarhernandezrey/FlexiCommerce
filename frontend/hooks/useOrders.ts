'use client';

import { useState, useCallback } from 'react';
import { ordersAPI, Order } from '@/lib/api.service';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [currentOrder, setCurrentOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(
    async (params?: Parameters<typeof ordersAPI.getAll>[0]) => {
      try {
        setLoading(true);
        setError(null);
        const response = await ordersAPI.getAll(params);
        const data = response.data;
        setOrders(data);
        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error fetching orders';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const fetchById = useCallback(async (id: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersAPI.getById(id);
      const data = response.data;
      setCurrentOrder(data);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error fetching order';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const create = useCallback(async (orderData: Partial<Order>) => {
    try {
      setLoading(true);
      setError(null);
      const response = await ordersAPI.create(orderData);
      const data = response.data;
      setCurrentOrder(data);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Error creating order';
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateStatus = useCallback(
    async (id: string, status: Order['status']) => {
      try {
        setLoading(true);
        setError(null);
        const response = await ordersAPI.updateStatus(id, status);
        const data = response.data;
        if (currentOrder?.id === id) {
          setCurrentOrder(data);
        }
        return data;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : 'Error updating order';
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [currentOrder]
  );

  return {
    orders,
    currentOrder,
    loading,
    error,
    fetchAll,
    fetchById,
    create,
    updateStatus,
  };
};
