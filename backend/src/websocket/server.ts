/**
 * WebSocket server for real-time order updates and notifications
 * Integrates with Express server for live features
 */

import { Server as HTTPServer } from 'http';
import { Server as SocketIOServer, Socket } from 'socket.io';
import { verifyToken } from '../middlewares/auth.js';
import prisma from '../database/prisma.js';

export interface SocketUser {
  id: string;
  userId: string;
  socket: Socket;
}

export class WebSocketServer {
  private io: SocketIOServer;
  private connectedUsers = new Map<string, SocketUser>();
  private userConnections = new Map<string, string[]>(); // userId -> [socketIds]

  constructor(httpServer: HTTPServer) {
    this.io = new SocketIOServer(httpServer, {
      cors: {
        origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
        methods: ['GET', 'POST'],
        credentials: true,
      },
      transports: ['websocket', 'polling'],
    });

    this.setupMiddleware();
    this.setupConnectionHandlers();
  }

  private setupMiddleware() {
    // Authentication middleware
    this.io.use((socket, next) => {
      const token = socket.handshake.auth.token;

      if (!token) {
        return next(new Error('Authentication token required'));
      }

      try {
        const decoded = verifyToken(token) as any;
        socket.data.userId = decoded.id;
        socket.data.user = decoded;
        next();
      } catch (error) {
        next(new Error('Invalid authentication token'));
      }
    });
  }

  private setupConnectionHandlers() {
    this.io.on('connection', (socket: Socket) => {
      const userId = socket.data.userId;

      // Register user connection
      this.connectedUsers.set(socket.id, {
        id: socket.id,
        userId,
        socket,
      });

      if (!this.userConnections.has(userId)) {
        this.userConnections.set(userId, []);
      }
      this.userConnections.get(userId)!.push(socket.id);

      console.log(`User ${userId} connected via socket ${socket.id}`);

      // Join user room for targeted messages
      socket.join(`user:${userId}`);

      socket.on('disconnect', () => this.handleDisconnect(socket.id, userId));

      // Order events
      socket.on('order:subscribe', (orderId) => this.handleOrderSubscribe(socket, userId, orderId));
      socket.on('order:unsubscribe', (orderId) => this.handleOrderUnsubscribe(socket, orderId));

      // Notification events
      socket.on('notification:read', (notificationId) =>
        this.handleNotificationRead(userId, notificationId)
      );

      // Keep-alive
      socket.on('ping', () => socket.emit('pong'));
    });
  }

  private handleDisconnect(socketId: string, userId: string) {
    this.connectedUsers.delete(socketId);

    const connections = this.userConnections.get(userId) || [];
    const index = connections.indexOf(socketId);
    if (index > -1) {
      connections.splice(index, 1);
    }

    if (connections.length === 0) {
      this.userConnections.delete(userId);
      console.log(`User ${userId} disconnected completely`);
    }

    const socket = this.io.sockets.sockets.get(socketId);
    if (socket) {
      socket.leave(`user:${userId}`);
    }
  }

  private handleOrderSubscribe(socket: Socket, userId: string, orderId: string) {
    // Verify user owns this order
    prisma.order
      .findUnique({ where: { id: orderId } })
      .then((order) => {
        if (order && order.userId === userId) {
          socket.join(`order:${orderId}`);
          socket.emit('order:subscribed', { orderId, message: 'Subscribed to order updates' });
        } else {
          socket.emit('order:error', { message: 'Unauthorized access to order' });
        }
      })
      .catch((error) => {
        console.error('Order subscription error:', error);
        socket.emit('order:error', { message: 'Error connecting to order' });
      });
  }

  private handleOrderUnsubscribe(socket: Socket, orderId: string) {
    socket.leave(`order:${orderId}`);
  }

  private async handleNotificationRead(userId: string, notificationId: string) {
    try {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { read: true },
      });

      // Notify user
      this.io.to(`user:${userId}`).emit('notification:read', { notificationId });
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  }

  /**
   * Broadcast order status update to user
   */
  public broadcastOrderUpdate(
    orderId: string,
    userId: string,
    status: string,
    data?: any
  ) {
    this.io.to(`order:${orderId}`).emit('order:updated', {
      orderId,
      status,
      timestamp: new Date(),
      data,
    });

    // Also notify user about status change
    this.io.to(`user:${userId}`).emit('order:status-changed', {
      orderId,
      status,
      timestamp: new Date(),
    });
  }

  /**
   * Send notification to user
   */
  public sendNotification(
    userId: string,
    notification: {
      type: string;
      title: string;
      message: string;
      data?: any;
    }
  ) {
    this.io.to(`user:${userId}`).emit('notification', {
      ...notification,
      timestamp: new Date(),
    });
  }

  /**
   * Broadcast real-time product data (price, stock changes)
   */
  public broadcastProductUpdate(productId: string, changes: any) {
    this.io.emit('product:updated', {
      productId,
      changes,
      timestamp: new Date(),
    });
  }

  /**
   * Notify admin/staff about events
   */
  public broadcastAdminEvent(event: string, data: any) {
    // In a real app, you'd check if socket.data.role === 'admin'
    this.io.emit('admin:event', {
      event,
      data,
      timestamp: new Date(),
    });
  }

  /**
   * Get active user count
   */
  public getActiveUserCount(): number {
    return this.userConnections.size;
  }

  /**
   * Get user socket connections
   */
  public getUserSockets(userId: string): string[] {
    return this.userConnections.get(userId) || [];
  }

  /**
   * Check if user is online
   */
  public isUserOnline(userId: string): boolean {
    const connections = this.userConnections.get(userId);
    return !!(connections && connections.length > 0);
  }

  /**
   * Get socket.io instance for advanced usage
   */
  public getIO(): SocketIOServer {
    return this.io;
  }

  /**
   * Graceful shutdown
   */
  public async shutdown() {
    console.log('WebSocket server shutting down...');
    this.connectedUsers.clear();
    this.userConnections.clear();
    this.io.close();
  }
}

// Export singleton instance getter
let wsServer: WebSocketServer | null = null;

export function initializeWebSocket(httpServer: HTTPServer): WebSocketServer {
  wsServer = new WebSocketServer(httpServer);
  return wsServer;
}

export function getWebSocketServer(): WebSocketServer {
  if (!wsServer) {
    throw new Error('WebSocket server not initialized. Call initializeWebSocket first.');
  }
  return wsServer;
}
