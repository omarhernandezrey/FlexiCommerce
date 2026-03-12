// Common utilities
export { formatCOP as formatPrice } from './format';

export const truncateString = (str: string, length: number): string => {
  return str.length > length ? str.substring(0, length) + '...' : str;
};
