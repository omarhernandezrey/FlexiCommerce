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
   * Formato: {orderId}-{timestamp_base36}
   * Permite extraer el orderId del webhook sin almacenamiento extra.
   */
  buildReference(orderId: string): string {
    return `${orderId}-${Date.now().toString(36)}`;
  }

  /**
   * Extrae el orderId de una referencia generada por buildReference().
   * El orderId es un UUID de 36 chars (8-4-4-4-12 + 4 guiones = 32 hex + 4 guiones).
   */
  extractOrderId(reference: string): string {
    // UUID tiene formato: xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx (36 chars, 5 partes)
    return reference.split('-').slice(0, 5).join('-');
  }
}
