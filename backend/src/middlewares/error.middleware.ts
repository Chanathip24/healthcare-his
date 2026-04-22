import { ErrorRequestHandler, Request, Response } from "express";

import { HttpError } from "@/models/errors";
import { errorResponse } from "@/utils";

export function notFoundHandler(_req: Request, res: Response): Response {
  return errorResponse(res, "Route not found.", 404);
}

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (res.headersSent) {
    return;
  }

  if (error instanceof HttpError) {
    errorResponse(res, error.message, error.statusCode);
    return;
  }

  console.error("Unhandled server error:", error);
  errorResponse(res, "Internal server error.", 500);
};
