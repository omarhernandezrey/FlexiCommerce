/**
 * Formatea un número como precio en Pesos Colombianos (COP).
 * Ejemplo: formatCOP(3500000) → "$ 3.500.000"
 */
export function formatCOP(price: number | string | undefined | null): string {
  const num = Number(price) || 0;
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}
