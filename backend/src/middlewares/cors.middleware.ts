import { NextFunction, Request, Response } from "express";

import { ALLOWED_ORIGINS } from "@/configs";
import { errorResponse } from "@/utils";

const ALLOWED_METHODS: string = "GET,POST,OPTIONS";
const ALLOWED_HEADERS: string = "Content-Type,Authorization,X-Request-Id";
const allowedOriginsSet: ReadonlySet<string> = new Set<string>(ALLOWED_ORIGINS);

export function corsMiddleware(req: Request, res: Response, next: NextFunction): void | Response {
  const requestOrigin: string | undefined = req.headers.origin;

  res.setHeader("Vary", "Origin");
  res.setHeader("Access-Control-Allow-Methods", ALLOWED_METHODS);
  res.setHeader("Access-Control-Allow-Headers", ALLOWED_HEADERS);
  res.setHeader("Access-Control-Max-Age", "600");

  if (!requestOrigin) {
    if (req.method === "OPTIONS") {
      res.status(204).send();
      return;
    }
    next();
    return;
  }

  if (!allowedOriginsSet.has(requestOrigin)) {
    return errorResponse(res, "Origin is not allowed.", 403);
  }

  res.setHeader("Access-Control-Allow-Origin", requestOrigin);

  if (req.method === "OPTIONS") {
    res.status(204).send();
    return;
  }

  next();
}
