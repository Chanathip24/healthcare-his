import { Request, Response } from "express";
import { getHealthStatus } from "@/services";
import { successResponse } from "@/utils";

export function getHealth(_req: Request, res: Response): Response {
  const payload = getHealthStatus();
  return successResponse(res, payload, "Backend is running");
}
