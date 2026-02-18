/**
 * Retry utility with exponential backoff
 * Used for resilient API calls and database operations
 */

interface RetryOptions {
  maxAttempts?: number;
  initialDelayMs?: number;
  maxDelayMs?: number;
  backoffMultiplier?: number;
  shouldRetry?: (error: Error) => boolean;
}

export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const {
    maxAttempts = 3,
    initialDelayMs = 100,
    maxDelayMs = 5000,
    backoffMultiplier = 2,
    shouldRetry = (error) => {
      // Retry on network errors and 5xx server errors
      const isNetworkError = error.message.includes('ECONNREFUSED') || 
                           error.message.includes('ETIMEDOUT');
      return isNetworkError;
    },
  } = options;

  let lastError: Error | null = null;
  let delay = initialDelayMs;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));

      if (attempt === maxAttempts || !shouldRetry(lastError)) {
        throw lastError;
      }

      // Calculate wait time with exponential backoff
      const waitTime = Math.min(delay, maxDelayMs);
      await new Promise((resolve) => setTimeout(resolve, waitTime));
      delay *= backoffMultiplier;
    }
  }

  throw lastError;
}

/**
 * Retry wrapper for async functions
 */
export function withRetry<T extends any[], R>(
  fn: (...args: T) => Promise<R>,
  options: RetryOptions = {}
) {
  return async (...args: T): Promise<R> => {
    return retryWithBackoff(() => fn(...args), options);
  };
}

/**
 * Circuit breaker pattern for preventing cascading failures
 */
export class CircuitBreaker<T> {
  private failureCount = 0;
  private successCount = 0;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private nextAttemptTime = 0;

  constructor(
    private fn: () => Promise<T>,
    private failureThreshold = 5,
    private successThreshold = 2,
    private resetTimeoutMs = 60000
  ) {}

  async execute(): Promise<T> {
    if (this.state === 'OPEN') {
      if (Date.now() < this.nextAttemptTime) {
        throw new Error('Circuit breaker is OPEN - service unavailable');
      }
      this.state = 'HALF_OPEN';
    }

    try {
      const result = await this.fn();
      this.onSuccess();
      return result;
    } catch (error) {
      this.onFailure();
      throw error;
    }
  }

  private onSuccess() {
    this.failureCount = 0;

    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= this.successThreshold) {
        this.state = 'CLOSED';
        this.successCount = 0;
      }
    }
  }

  private onFailure() {
    this.failureCount++;

    if (this.failureCount >= this.failureThreshold) {
      this.state = 'OPEN';
      this.nextAttemptTime = Date.now() + this.resetTimeoutMs;
    }
  }

  getState() {
    return this.state;
  }

  reset() {
    this.state = 'CLOSED';
    this.failureCount = 0;
    this.successCount = 0;
  }
}
