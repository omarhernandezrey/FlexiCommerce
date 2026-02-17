import nodemailer from 'nodemailer';

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

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'localhost',
  port: parseInt(process.env.SMTP_PORT || '1025'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: process.env.SMTP_USER
    ? {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      }
    : undefined,
});

export const emailService = {
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await transporter.sendMail({
        from: process.env.SMTP_FROM_EMAIL || 'noreply@flexicommerce.com',
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });
    } catch (error) {
      console.error('Error sending email:', error);
      throw error;
    }
  },

  async sendOrderConfirmation(data: OrderEmailData): Promise<void> {
    const itemsHtml = data.items
      .map(
        (item) =>
          `<tr>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">${item.name}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: center;">${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">$${item.price.toFixed(2)}</td>
        <td style="padding: 8px; border-bottom: 1px solid #e0e0e0; text-align: right;">$${(item.quantity * item.price).toFixed(2)}</td>
      </tr>`
      )
      .join('');

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3b82f6; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .order-id { font-size: 24px; font-weight: bold; margin: 10px 0; }
          .section { margin: 20px 0; }
          .section-title { font-size: 16px; font-weight: bold; color: #1f2937; margin-bottom: 10px; }
          table { width: 100%; border-collapse: collapse; }
          th { background-color: #f3f4f6; padding: 10px; text-align: left; font-weight: bold; border-bottom: 2px solid #e5e7eb; }
          td { padding: 10px; }
          .total-row { font-weight: bold; background-color: #f3f4f6; font-size: 16px; }
          .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
          .button { display: inline-block; background-color: #3b82f6; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Orden Confirmada!</h1>
            <p>Gracias por tu compra en FlexiCommerce</p>
          </div>
          
          <div class="content">
            <p>Hola ${data.customerName},</p>
            
            <p>Tu orden ha sido confirmada exitosamente. A continuación encontrarás los detalles de tu pedido:</p>
            
            <div class="section">
              <div class="section-title">Número de Orden</div>
              <div class="order-id">#${data.orderId.slice(0, 8).toUpperCase()}</div>
            </div>
            
            <div class="section">
              <div class="section-title">Productos Ordenados</div>
              <table>
                <tr style="background-color: #f3f4f6;">
                  <th>Producto</th>
                  <th style="text-align: center;">Cantidad</th>
                  <th style="text-align: right;">Precio Unitario</th>
                  <th style="text-align: right;">Subtotal</th>
                </tr>
                ${itemsHtml}
                <tr class="total-row">
                  <td colspan="3" style="text-align: right;">Total:</td>
                  <td style="text-align: right;">$${data.total.toFixed(2)}</td>
                </tr>
              </table>
            </div>
            
            <div class="section">
              <div class="section-title">Dirección de Envío</div>
              <p>${data.shippingAddress}</p>
            </div>
            
            <div class="section">
              <div class="section-title">Método de Pago</div>
              <p>${data.paymentMethod}</p>
            </div>
            
            <p>Recibirás un email con numero de seguimiento cuando tu orden sea enviada. Mientras tanto, puedes ver el estado de tu orden en tu cuenta.</p>
            
            <a href="${process.env.FRONTEND_URL || 'https://flexicommerce.com'}/orders/${data.orderId}" class="button">Ver Mi Orden</a>
            
            <p style="margin-top: 30px; color: #6b7280;">Si tienes alguna pregunta, no dudes en contactarnos.</p>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 FlexiCommerce. Todos los derechos reservados.</p>
            <p>Este es un email automático, por favor no respondas directamente.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: data.customerEmail,
      subject: `Orden Confirmada - FlexiCommerce #${data.orderId.slice(0, 8).toUpperCase()}`,
      html,
    });
  },

  async sendOrderShipped(orderId: string, customerEmail: string, trackingNumber?: string): Promise<void> {
    const trackingHtml = trackingNumber
      ? `<p>Número de Seguimiento: <strong>${trackingNumber}</strong></p>`
      : '';

    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #10b981; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; background-color: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Tu Orden Ha Sido Enviada!</h1>
          </div>
          
          <div class="content">
            <p>¡Buenas noticias! Tu orden #${orderId.slice(0, 8).toUpperCase()} ha sido enviada.</p>
            
            ${trackingHtml}
            
            <p>Puedes rastrear tu envío en cualquier momento visitando tu cuenta.</p>
            
            <a href="${process.env.FRONTEND_URL || 'https://flexicommerce.com'}/orders/${orderId}" class="button">Rastrear Orden</a>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 FlexiCommerce. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: customerEmail,
      subject: `Tu Orden Ha Sido Enviada - FlexiCommerce #${orderId.slice(0, 8).toUpperCase()}`,
      html,
    });
  },

  async sendOrderDelivered(orderId: string, customerEmail: string): Promise<void> {
    const html = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="UTF-8">
        <style>
          body { font-family: Arial, sans-serif; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #059669; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
          .content { background-color: #f9fafb; padding: 20px; border: 1px solid #e5e7eb; }
          .button { display: inline-block; background-color: #059669; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 15px; }
          .footer { background-color: #f3f4f6; padding: 15px; text-align: center; font-size: 12px; color: #6b7280; border-radius: 0 0 8px 8px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>¡Tu Orden Ha Llegado!</h1>
          </div>
          
          <div class="content">
            <p>¡Excelentes noticias! Tu orden #${orderId.slice(0, 8).toUpperCase()} ha sido entregada.</p>
            
            <p>Esperamos que estés satisfecho con tu compra. Si tienes alguna pregunta o necesitas ayuda, no dudes en contactarnos.</p>
            
            <a href="${process.env.FRONTEND_URL || 'https://flexicommerce.com'}/orders/${orderId}" class="button">Ver Detalles de la Orden</a>
          </div>
          
          <div class="footer">
            <p>&copy; 2026 FlexiCommerce. Todos los derechos reservados.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await this.sendEmail({
      to: customerEmail,
      subject: `Tu Orden Ha Llegado - FlexiCommerce #${orderId.slice(0, 8).toUpperCase()}`,
      html,
    });
  },
};
