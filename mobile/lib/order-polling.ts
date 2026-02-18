import { orderService } from './services';
import { sendLocalNotification } from '../lib/notifications';

export interface OrderNotification {
  orderId: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  message: string;
  timestamp: string;
}

/**
 * Poll for order updates (in production, use WebSockets)
 */
export const startOrderPolling = async (
  orderId: string,
  onUpdate?: (order: any) => void,
  interval: number = 30000 // 30 seconds
) => {
  let isPolling = true;
  let lastStatus: string | null = null;

  const poll = async () => {
    try {
      const response = await orderService.getOrder(orderId);
      const order = response.data;

      // Notify if status changed
      if (order.status !== lastStatus) {
        lastStatus = order.status;

        const statusMessages: { [key: string]: string } = {
          pending: 'Tu pedido está siendo procesado',
          confirmed: 'Tu pedido ha sido confirmado',
          shipped: 'Tu pedido ha sido enviado',
          delivered: 'Tu pedido ha llegado',
          cancelled: 'Tu pedido ha sido cancelado',
        };

        const title = 'Actualización de Pedido';
        const message = statusMessages[order.status] || 'Tu pedido ha sido actualizado';

        // Send local notification
        await sendLocalNotification(title, message, {
          orderId,
          status: order.status,
        });

        if (onUpdate) {
          onUpdate(order);
        }
      }

      // Continue polling if still active
      if (isPolling) {
        setTimeout(poll, interval);
      }
    } catch (err) {
      console.error('Error polling order updates:', err);
      if (isPolling) {
        setTimeout(poll, interval);
      }
    }
  };

  // Start polling
  poll();

  // Return cleanup function
  return () => {
    isPolling = false;
  };
};

/**
 * Get all active order polls
 */
export const getActiveOrderPolls = (): string[] => {
  // In production: retrieve from persistent store
  return [];
};

/**
 * Start polling for multiple orders
 */
export const watchOrders = async (
  orderIds: string[],
  onUpdate?: (order: any) => void
): Promise<() => void> => {
  const cleanupFunctions = await Promise.all(
    orderIds.map((id) => startOrderPolling(id, onUpdate))
  );

  // Return combined cleanup function
  return () => {
    cleanupFunctions.forEach((cleanup) => cleanup());
  };
};
