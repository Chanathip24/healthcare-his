import { NextFunction, Request, Response } from "express";

import { RATE_LIMIT_MAX_REQUESTS, RATE_LIMIT_WINDOW_MS } from "@/configs";
import { errorResponse } from "@/utils";

interface RateBucket {
  count: number;
  resetAt: number;
}

const requestBuckets: Map<string, RateBucket> = new Map<string, RateBucket>();
let requestCounterSinceCleanup: number = 0;

function resolveClientIp(req: Request): string {
  return req.ip || req.socket.remoteAddress || "unknown-client";
}

function cleanupExpiredBuckets(now: number): void {
  for (const [key, bucket] of requestBuckets.entries()) {
    if (bucket.resetAt <= now) {
      requestBuckets.delete(key);
    }
  }
}

export function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void | Response {
  const now: number = Date.now();
  const clientIp: string = resolveClientIp(req);

  const currentBucket: RateBucket = requestBuckets.get(clientIp) || {
    count: 0,
    resetAt: now + RATE_LIMIT_WINDOW_MS
  };

  if (now >= currentBucket.resetAt) {
    currentBucket.count = 0;
    currentBucket.resetAt = now + RATE_LIMIT_WINDOW_MS;
  }

  if (currentBucket.count >= RATE_LIMIT_MAX_REQUESTS) {
    const retryAfterSeconds: number = Math.max(1, Math.ceil((currentBucket.resetAt - now) / 1000));
    res.setHeader("Retry-After", `${retryAfterSeconds}`);
    return errorResponse(res, "Too many requests. Please retry later.", 429);
  }

  currentBucket.count += 1;
  requestBuckets.set(clientIp, currentBucket);

  requestCounterSinceCleanup += 1;
  if (requestCounterSinceCleanup >= 500) {
    cleanupExpiredBuckets(now);
    requestCounterSinceCleanup = 0;
  }

  next();
}
