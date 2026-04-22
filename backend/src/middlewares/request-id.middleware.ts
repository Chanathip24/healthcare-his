import { randomUUID } from "crypto";
import { NextFunction, Request, Response } from "express";

const SAFE_REQUEST_ID_PATTERN: RegExp = /^[a-zA-Z0-9_-]{1,80}$/;

function getSafeRequestId(rawRequestId: string | undefined): string {
  if (rawRequestId && SAFE_REQUEST_ID_PATTERN.test(rawRequestId)) {
    return rawRequestId;
  }
  return randomUUID();
}

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId: string = getSafeRequestId(req.header("x-request-id"));
  res.setHeader("X-Request-Id", requestId);
  next();
}
