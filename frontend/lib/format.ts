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

/**
 * Formatea un número solo con puntos de miles (sin símbolo $).
 * Ejemplo: formatCOPRaw(3500000) → "3.500.000"
 */
export function formatCOPRaw(value: string | number): string {
  const num = typeof value === 'number' ? value : parseCOP(value);
  if (isNaN(num) || (num === 0 && value === '')) return '';
  return num.toLocaleString('es-CO');
}

/**
 * Parsea string COP a número: "3.582.950" → 3582950
 */
export function parseCOP(value: string): number {
  return Number(value.replace(/\./g, '').replace(/,/g, '')) || 0;
}
