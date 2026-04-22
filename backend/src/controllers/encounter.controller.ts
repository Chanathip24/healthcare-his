import { NextFunction, Request, Response } from "express";

import { getMedicationCatalog } from "@/data/medication-catalog";
import { addMedicationToEncounter, getEncounterById, getEncounters } from "@/services";
import { normalizeSearchQuery, parseAddEncounterMedicationInput, successResponse } from "@/utils";

export async function listEncounters(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query: string = normalizeSearchQuery(req.query.query);
    const payload = await getEncounters(query);
    successResponse(res, payload, "Encounters fetched successfully.");
  } catch (error) {
    next(error);
  }
}

export async function getEncounterDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const encounterParam: string | string[] | undefined = req.params.encounterId;
    const encounterId: string = Array.isArray(encounterParam) ? encounterParam[0] || "" : encounterParam || "";
    const payload = await getEncounterById(encounterId);
    successResponse(res, payload, "Encounter details fetched successfully.");
  } catch (error) {
    next(error);
  }
}

export async function addEncounterMedication(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const encounterParam: string | string[] | undefined = req.params.encounterId;
    const encounterId: string = Array.isArray(encounterParam) ? encounterParam[0] || "" : encounterParam || "";
    const medicationPayload = parseAddEncounterMedicationInput(req.body, getMedicationCatalog());
    const payload = await addMedicationToEncounter(encounterId, medicationPayload);
    successResponse(res, payload, "Medication added to encounter successfully.", 201);
  } catch (error) {
    next(error);
  }
}
