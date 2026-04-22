import { NextFunction, Request, Response } from "express";

import { medications } from "@/data/in-memory-store";
import { addMedicationToEncounter, getEncounterById, getEncounters } from "@/services";
import { normalizeSearchQuery, parseAddEncounterMedicationInput, successResponse } from "@/utils";

export function listEncounters(req: Request, res: Response, next: NextFunction): void {
  try {
    const query: string = normalizeSearchQuery(req.query.query);
    const payload = getEncounters(query);
    successResponse(res, payload, "Encounters fetched successfully.");
  } catch (error) {
    next(error);
  }
}

export function getEncounterDetail(req: Request, res: Response, next: NextFunction): void {
  try {
    const encounterParam: string | string[] | undefined = req.params.encounterId;
    const encounterId: string = Array.isArray(encounterParam) ? encounterParam[0] || "" : encounterParam || "";
    const payload = getEncounterById(encounterId);
    successResponse(res, payload, "Encounter details fetched successfully.");
  } catch (error) {
    next(error);
  }
}

export function addEncounterMedication(req: Request, res: Response, next: NextFunction): void {
  try {
    const encounterParam: string | string[] | undefined = req.params.encounterId;
    const encounterId: string = Array.isArray(encounterParam) ? encounterParam[0] || "" : encounterParam || "";
    const medicationPayload = parseAddEncounterMedicationInput(req.body, medications);
    const payload = addMedicationToEncounter(encounterId, medicationPayload);
    successResponse(res, payload, "Medication added to encounter successfully.", 201);
  } catch (error) {
    next(error);
  }
}
