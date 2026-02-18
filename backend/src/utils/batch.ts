/**
 * Batch operations utility
 * For efficient bulk processing of requests
 */

interface BatchOptions {
  maxBatchSize?: number;
  timeoutMs?: number;
}

/**
 * Generic batch processor that groups items and processes them
 */
export class BatchProcessor<T, R> {
  private queue: T[] = [];
  private processing = false;
  private timer: NodeJS.Timeout | null = null;

  constructor(
    private processor: (batch: T[]) => Promise<R>,
    private options: BatchOptions = {}
  ) {
    this.options = {
      maxBatchSize: options.maxBatchSize || 100,
      timeoutMs: options.timeoutMs || 1000,
    };
  }

  async add(item: T): Promise<R> {
    return new Promise((resolve, reject) => {
      this.queue.push(item);

      if (this.queue.length >= this.options.maxBatchSize!) {
        this.flush().then(() => resolve({} as R)).catch(reject);
      } else if (!this.timer) {
        this.timer = setTimeout(() => {
          this.flush().catch(reject);
        }, this.options.timeoutMs);
      }
    });
  }

  async addBatch(items: T[]): Promise<R[]> {
    return Promise.all(items.map((item) => this.add(item)));
  }

  private async flush(): Promise<void> {
    if (this.processing || this.queue.length === 0) return;

    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    this.processing = true;
    const batch = this.queue.splice(0, this.options.maxBatchSize!);

    try {
      await this.processor(batch);
    } catch (error) {
      console.error('Batch processing error:', error);
      throw error;
    } finally {
      this.processing = false;

      if (this.queue.length > 0) {
        this.timer = setTimeout(() => this.flush(), this.options.timeoutMs);
      }
    }
  }

  async waitForCompletion(): Promise<void> {
    if (this.timer) {
      clearTimeout(this.timer);
      this.timer = null;
    }

    while (this.queue.length > 0 || this.processing) {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }
}

/**
 * Batch get items with caching
 */
export async function batchGet<T extends { id: string }>(
  ids: string[],
  fetcher: (ids: string[]) => Promise<T[]>,
  cache: Map<string, T> = new Map()
): Promise<T[]> {
  // Get cached items
  const cached = ids.filter((id) => cache.has(id)).map((id) => cache.get(id)!);
  
  // Get uncached IDs
  const uncachedIds = ids.filter((id) => !cache.has(id));

  if (uncachedIds.length === 0) {
    return cached;
  }

  // Fetch uncached items
  const fetched = await fetcher(uncachedIds);

  // Update cache
  fetched.forEach((item) => cache.set(item.id, item));

  // Return in original order
  return ids
    .map((id) => cache.get(id))
    .filter((item): item is T => item !== undefined);
}

/**
 * Chunk array into smaller batches
 */
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

/**
 * Process items in parallel batches with concurrency control
 */
export async function parallelBatch<T, R>(
  items: T[],
  processor: (item: T) => Promise<R>,
  concurrency: number = 5
): Promise<R[]> {
  const results: R[] = [];
  const executing: Promise<void>[] = [];

  for (const item of items) {
    const promise = processor(item)
      .then((result) => {
        results.push(result);
      })
      .then(() => {
        executing.splice(executing.indexOf(promise), 1);
      });

    executing.push(promise);

    if (executing.length >= concurrency) {
      await Promise.race(executing);
    }
  }

  await Promise.all(executing);
  return results;
}
