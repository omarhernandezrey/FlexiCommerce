export const logger = {
  info(message: string, data?: unknown) {
    console.log(`[INFO] ${message}`, data ? JSON.stringify(data) : '');
  },
  warn(message: string, data?: unknown) {
    console.warn(`[WARN] ${message}`, data ? JSON.stringify(data) : '');
  },
  error(message: string, data?: unknown) {
    console.error(`[ERROR] ${message}`, data ? JSON.stringify(data) : '');
  },
};
