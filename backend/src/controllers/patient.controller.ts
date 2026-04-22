import { NextFunction, Request, Response } from "express";
import { getMedicationCatalog } from "@/data/medication-catalog";

import {
  createEncounterForPatient,
  createMedicationRequestForPatient,
  createPatient,
  getPatientById,
  getPatientEncounters,
  getPatientMedicationRequests,
  getPatients
} from "@/services";
import {
  normalizeSearchQuery,
  parseCreateEncounterInput,
  parseCreateMedicationRequestInput,
  parseCreatePatientInput,
  successResponse
} from "@/utils";

function getPatientIdParam(req: Request): string {
  const patientParam: string | string[] | undefined = req.params.patientId;
  return Array.isArray(patientParam) ? patientParam[0] || "" : patientParam || "";
}

export async function listPatients(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const query: string = normalizeSearchQuery(req.query.query);
    const payload = await getPatients(query);
    successResponse(res, payload, "Patients fetched successfully.");
  } catch (error) {
    next(error);
  }
}

export async function createPatientRecord(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const input = parseCreatePatientInput(req.body);
    const payload = await createPatient(input);
    successResponse(res, payload, "Patient created successfully.", 201);
  } catch (error) {
    next(error);
  }
}

export async function getPatientDetail(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patientId: string = getPatientIdParam(req);
    const payload = await getPatientById(patientId);
    successResponse(res, payload, "Patient details fetched successfully.");
  } catch (error) {
    next(error);
  }
}

export async function listPatientEncounters(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patientId: string = getPatientIdParam(req);
    const payload = await getPatientEncounters(patientId);
    successResponse(res, payload, "Patient encounters fetched successfully.");
  } catch (error) {
    next(error);
  }
}

export async function createPatientEncounter(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patientId: string = getPatientIdParam(req);
    const input = parseCreateEncounterInput(req.body);
    const payload = await createEncounterForPatient(patientId, input);
    successResponse(res, payload, "Encounter created successfully.", 201);
  } catch (error) {
    next(error);
  }
}

export async function listPatientMedicationRequests(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patientId: string = getPatientIdParam(req);
    const payload = await getPatientMedicationRequests(patientId);
    successResponse(res, payload, "Patient medication requests fetched successfully.");
  } catch (error) {
    next(error);
  }
}

export async function createPatientMedicationRequest(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const patientId: string = getPatientIdParam(req);
    const input = parseCreateMedicationRequestInput(req.body, getMedicationCatalog());
    const payload = await createMedicationRequestForPatient(patientId, input);
    successResponse(res, payload, "Medication request created successfully.", 201);
  } catch (error) {
    next(error);
  }
}
