import { Response } from "express";
import { ApiResponse } from "@/models/dtos/api-response.dto";

export function successResponse<T>(
  res: Response,
  data: T,
  message = "Success",
  statusCode = 200
): Response {
  return res.status(statusCode).json(ApiResponse.successMessage(message, data));
}

export function errorResponse<T>(
  res: Response,
  message = "Error",
  statusCode = 400
): Response {
  return res.status(statusCode).json(ApiResponse.error<T>(message));
}
