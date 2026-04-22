import { NextFunction, Request, Response } from "express";

import { getMedications } from "@/services";
import { normalizeSearchQuery, successResponse } from "@/utils";

export function listMedications(req: Request, res: Response, next: NextFunction): void {
  try {
    const query: string = normalizeSearchQuery(req.query.query);
    const payload = getMedications(query);
    successResponse(res, payload, "Medications fetched successfully.");
  } catch (error) {
    next(error);
  }
}
