interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}

interface OrderEmailData {
  orderId: string;
  customerName: string;
  customerEmail: string;
  total: number;
  items: Array<{
    name: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress: string;
  paymentMethod: string;
}

export const emailService = {
  async sendEmail(options: EmailOptions): Promise<void> {
    // In production, integrate with a real email provider (SendGrid, SES, etc.)
    console.log(`[EMAIL] Sending to ${options.to}: ${options.subject}`);
  },

  async sendOrderConfirmation(data: OrderEmailData): Promise<void> {
    await this.sendEmail({
      to: data.customerEmail,
      subject: `Orden Confirmada - FlexiCommerce #${data.orderId.slice(0, 8).toUpperCase()}`,
      html: `<h1>Orden Confirmada</h1><p>Hola ${data.customerName}, tu orden #${data.orderId.slice(0, 8).toUpperCase()} ha sido confirmada. Total: $${data.total.toFixed(2)}</p>`,
    });
  },

  async sendOrderShipped(orderId: string, customerEmail: string, _trackingNumber?: string): Promise<void> {
    await this.sendEmail({
      to: customerEmail,
      subject: `Tu Orden Ha Sido Enviada - FlexiCommerce #${orderId.slice(0, 8).toUpperCase()}`,
      html: `<h1>Orden Enviada</h1><p>Tu orden #${orderId.slice(0, 8).toUpperCase()} ha sido enviada.</p>`,
    });
  },

  async sendOrderDelivered(orderId: string, customerEmail: string): Promise<void> {
    await this.sendEmail({
      to: customerEmail,
      subject: `Tu Orden Ha Llegado - FlexiCommerce #${orderId.slice(0, 8).toUpperCase()}`,
      html: `<h1>Orden Entregada</h1><p>Tu orden #${orderId.slice(0, 8).toUpperCase()} ha sido entregada.</p>`,
    });
  },
};
