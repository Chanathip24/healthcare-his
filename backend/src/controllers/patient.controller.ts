import { NextFunction, Request, Response } from "express";

import { createPatient, getPatients } from "@/services";
import { normalizeSearchQuery, parseCreatePatientInput, successResponse } from "@/utils";

export function listPatients(req: Request, res: Response, next: NextFunction): void {
  try {
    const query: string = normalizeSearchQuery(req.query.query);
    const payload = getPatients(query);
    successResponse(res, payload, "Patients fetched successfully.");
  } catch (error) {
    next(error);
  }
}

export function createPatientRecord(req: Request, res: Response, next: NextFunction): void {
  try {
    const input = parseCreatePatientInput(req.body);
    const payload = createPatient(input);
    successResponse(res, payload, "Patient created successfully.", 201);
  } catch (error) {
    next(error);
  }
}
