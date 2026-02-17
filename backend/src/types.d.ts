/// <reference types="node" />
/// <reference types="express" />

declare namespace Express {
  interface Request {
    user?: any;
  }
}
