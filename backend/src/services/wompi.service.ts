import axios from 'axios';
import { createHash } from 'crypto';

const WOMPI_BASE =
  process.env.WOMPI_ENV === 'production'
    ? 'https://production.wompi.co/v1'
    : 'https://sandbox.wompi.co/v1';

export class WompiService {
  /**
   * Obtiene el acceptance_token requerido para crear cualquier transacción.
   * Debe solicitarse antes de cada transacción (tienen TTL corto).
   */
  async getAcceptanceToken(): Promise<string> {
    const pubKey = process.env.WOMPI_PUBLIC_KEY;
    if (!pubKey) throw new Error('WOMPI_PUBLIC_KEY no está configurada');

    const res = await axios.get(`${WOMPI_BASE}/merchants/${pubKey}`);
    const acceptance = res.data?.data?.presigned_acceptance;
    if (!acceptance?.acceptance_token) {
      throw new Error('No se pudo obtener el acceptance_token de Wompi');
    }
    return acceptance.acceptance_token;
  }

  /**
   * Calcula el hash de integridad SHA-256.
   * Fórmula oficial de Wompi: SHA256(reference + amount_in_cents + currency + integrity_secret)
   */
  generateIntegrityHash(
    reference: string,
    amountInCents: number,
    currency = 'COP',
  ): string {
    const secret = process.env.WOMPI_INTEGRITY_SECRET;
    if (!secret) throw new Error('WOMPI_INTEGRITY_SECRET no está configurada');

    const chain = `${reference}${amountInCents}${currency}${secret}`;
    return createHash('sha256').update(chain).digest('hex');
  }

  /**
   * Consulta el estado actual de una transacción en Wompi.
   * Requiere la llave privada.
   */
  async getTransaction(transactionId: string) {
    const privKey = process.env.WOMPI_PRIVATE_KEY;
    if (!privKey) throw new Error('WOMPI_PRIVATE_KEY no está configurada');

    const res = await axios.get(`${WOMPI_BASE}/transactions/${transactionId}`, {
      headers: { Authorization: `Bearer ${privKey}` },
    });
    return res.data?.data;
  }

  /**
   * Verifica la firma del webhook enviado por Wompi.
   * Wompi incluye el header 'x-wompi-signature'.
   * Fórmula: SHA256(rawBody + events_secret)
   */
  verifyWebhookSignature(rawBody: string, signature: string): boolean {
    const secret = process.env.WOMPI_EVENTS_SECRET;
    if (!secret) return false;

    const expected = createHash('sha256')
      .update(rawBody + secret)
      .digest('hex');
    return expected === signature;
  }

  /**
   * Genera una referencia única para una orden.
   * Formato nuevo:  {storeSlug}_{orderId}-{timestamp_base36}
   * Formato legado: {orderId}-{timestamp_base36}
   * El storeName se sanitiza a slug alfanumérico (máx 20 chars).
   */
  buildReference(orderId: string, storeName?: string): string {
    const timestamp = Date.now().toString(36);
    if (storeName) {
      const slug = storeName
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // quitar tildes
        .toLowerCase()
        .replace(/[^a-z0-9]/g, '')       // solo alfanumérico
        .slice(0, 20) || 'store';
      return `${slug}_${orderId}-${timestamp}`;
    }
    return `${orderId}-${timestamp}`;
  }

  /**
   * Extrae el orderId de una referencia generada por buildReference().
   * Soporta ambos formatos: con y sin prefijo de tienda.
   * UUID: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (5 segmentos separados por guión)
   */
  extractOrderId(reference: string): string {
    // Si tiene prefijo de tienda (contiene '_'), quitarlo
    const withoutPrefix = reference.includes('_')
      ? reference.substring(reference.indexOf('_') + 1)
      : reference;
    // El UUID ocupa los primeros 5 segmentos separados por '-'
    return withoutPrefix.split('-').slice(0, 5).join('-');
  }
}
