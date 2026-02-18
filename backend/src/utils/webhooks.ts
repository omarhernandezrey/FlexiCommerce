/**
 * Webhooks system for FlexiCommerce
 * Allows external services to subscribe to important events
 */

export enum WebhookEvent {
  ORDER_CREATED = 'order.created',
  ORDER_UPDATED = 'order.updated',
  ORDER_CONFIRMED = 'order.confirmed',
  ORDER_SHIPPED = 'order.shipped',
  ORDER_DELIVERED = 'order.delivered',
  PAYMENT_COMPLETED = 'payment.completed',
  PAYMENT_FAILED = 'payment.failed',
  PRODUCT_CREATED = 'product.created',
  PRODUCT_UPDATED = 'product.updated',
  PRODUCT_DELETED = 'product.deleted',
  USER_REGISTERED = 'user.registered',
  USER_UPDATED = 'user.updated',
}

export interface WebhookEndpoint {
  id: string;
  url: string;
  events: WebhookEvent[];
  active: boolean;
  secret: string;
  retries: number;
  createdAt: Date;
  lastTriggeredAt?: Date;
}

export interface WebhookPayload {
  event: WebhookEvent;
  timestamp: string;
  data: any;
  id: string;
}

import crypto from 'crypto';

export class WebhookManager {
  private endpoints: Map<string, WebhookEndpoint> = new Map();

  /**
   * Register webhook endpoint
   */
  registerEndpoint(
    url: string,
    events: WebhookEvent[],
    secret?: string
  ): WebhookEndpoint {
    const id = crypto.randomUUID();
    const endpoint: WebhookEndpoint = {
      id,
      url,
      events,
      active: true,
      secret: secret || crypto.randomBytes(32).toString('hex'),
      retries: 0,
      createdAt: new Date(),
    };

    this.endpoints.set(id, endpoint);
    return endpoint;
  }

  /**
   * Get all active endpoints for event
   */
  getEndpointsForEvent(event: WebhookEvent): WebhookEndpoint[] {
    return Array.from(this.endpoints.values()).filter(
      (ep) => ep.active && ep.events.includes(event)
    );
  }

  /**
   * Trigger webhook event
   */
  async triggerEvent(event: WebhookEvent, data: any): Promise<void> {
    const endpoints = this.getEndpointsForEvent(event);

    const payload: WebhookPayload = {
      event,
      timestamp: new Date().toISOString(),
      data,
      id: crypto.randomUUID(),
    };

    for (const endpoint of endpoints) {
      this.deliverWebhook(endpoint, payload);
    }
  }

  /**
   * Deliver webhook with retry logic
   */
  private async deliverWebhook(
    endpoint: WebhookEndpoint,
    payload: WebhookPayload,
    attempt = 1
  ): Promise<void> {
    const signature = this.generateSignature(JSON.stringify(payload), endpoint.secret);

    try {
      const response = await fetch(endpoint.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': payload.event,
          'X-Webhook-ID': payload.id,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      // Update last triggered time
      endpoint.lastTriggeredAt = new Date();
    } catch (error) {
      console.error(`Webhook delivery failed for ${endpoint.url}:`, error);

      // Retry with exponential backoff
      if (attempt < 3) {
        const delayMs = Math.pow(2, attempt) * 1000; // 2s, 4s, 8s
        setTimeout(() => {
          this.deliverWebhook(endpoint, payload, attempt + 1);
        }, delayMs);
      } else {
        endpoint.retries++;
        if (endpoint.retries > 5) {
          endpoint.active = false;
          console.warn(`Webhook ${endpoint.id} disabled after multiple failures`);
        }
      }
    }
  }

  /**
   * Generate HMAC signature for security
   */
  generateSignature(payload: string, secret: string): string {
    return crypto
      .createHmac('sha256', secret)
      .update(payload)
      .digest('hex');
  }

  /**
   * Verify webhook signature
   */
  verifySignature(payload: string, signature: string, secret: string): boolean {
    const expected = this.generateSignature(payload, secret);
    return crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expected)
    );
  }

  /**
   * Deregister endpoint
   */
  unregisterEndpoint(id: string): boolean {
    return this.endpoints.delete(id);
  }

  /**
   * Get endpoint details
   */
  getEndpoint(id: string): WebhookEndpoint | undefined {
    return this.endpoints.get(id);
  }

  /**
   * List all endpoints
   */
  listEndpoints(): WebhookEndpoint[] {
    return Array.from(this.endpoints.values());
  }

  /**
   * Update endpoint
   */
  updateEndpoint(
    id: string,
    updates: Partial<Omit<WebhookEndpoint, 'id' | 'createdAt' | 'secret'>>
  ): WebhookEndpoint | null {
    const endpoint = this.endpoints.get(id);
    if (!endpoint) return null;

    Object.assign(endpoint, updates);
    return endpoint;
  }
}

// Export singleton
export const webhookManager = new WebhookManager();
