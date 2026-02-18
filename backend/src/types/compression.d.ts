declare module 'compression' {
  import { RequestHandler } from 'express';
  function compression(options?: compression.CompressionOptions): RequestHandler;
  namespace compression {
    interface CompressionOptions {
      filter?: (req: any, res: any) => boolean;
      level?: number;
      threshold?: number;
    }
  }
  export = compression;
}
