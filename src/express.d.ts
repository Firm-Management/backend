import * as express from "express";

declare global {
  namespace Express {
    interface Request {
      userId?: string; // Extend the Request interface with userId
    }
  }
}
