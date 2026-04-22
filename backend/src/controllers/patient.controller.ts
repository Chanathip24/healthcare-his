import { Request, Response } from "express";
import { AxiosError } from "axios";
import {
  createEncounter as createEncounterService,
  createMedicationRequest as createMedicationRequestService,
  createPatient as createPatientService,
  getEncounterById,
  getPatientById,
  listEncounters,
  listPatientEncounters,
  listPatientMedicationRequests,
  listPatients
} from "@/services";
import { EFhirPatientResourceType } from "@/enums";
import { ICreateEncounterPayload, ICreateMedicationRequestPayload, ICreatePatientPayload } from "@/types/services";
import { errorResponse, successResponse } from "@/utils";

function getAxiosMessage(error: unknown): string {
  if (error instanceof AxiosError) {
    const fallbackMessage: string = error.message || "FHIR request failed.";
    if (typeof error.response?.data === "object" && error.response.data !== null) {
      const data: Record<string, unknown> = error.response.data as Record<string, unknown>;
      if (typeof data.message === "string") return data.message;
    }
    return fallbackMessage;
  }
  if (error instanceof Error) return error.message;
  return "Unexpected error.";
}

export async function listPatientsHandler(_req: Request, res: Response): Promise<Response> {
  try {
    const payload = await listPatients();
    return successResponse(res, payload, "Patients fetched successfully.");
  } catch (error: unknown) {
    return errorResponse(res, getAxiosMessage(error), 500);
  }
}

export async function getPatientByIdHandler(req: Request, res: Response): Promise<Response> {
  try {
    const idParam: string | string[] | undefined = req.params.id;
    const patientId: string = Array.isArray(idParam) ? (idParam[0] || "") : (idParam || "");
    if (!patientId.trim()) return errorResponse(res, "Patient id is required.", 400);
    const payload = await getPatientById(patientId);
    return successResponse(res, payload, "Patient fetched successfully.");
  } catch (error: unknown) {
    const statusCode: number = error instanceof AxiosError ? (error.response?.status || 500) : 500;
    return errorResponse(res, getAxiosMessage(error), statusCode);
  }
}

export async function createPatientHandler(req: Request, res: Response): Promise<Response> {
  try {
    const body: unknown = req.body;
    if (typeof body !== "object" || body === null) {
      return errorResponse(res, "Request body must be a JSON object.", 400);
    }
    const payload: ICreatePatientPayload = body as ICreatePatientPayload;

    if (payload.resourceType !== EFhirPatientResourceType.Patient) {
      return errorResponse(res, "resourceType must be Patient.", 400);
    }
    if (!Array.isArray(payload.name) || payload.name.length === 0) {
      return errorResponse(res, "name is required.", 400);
    }
    if (typeof payload.birthDate !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(payload.birthDate)) {
      return errorResponse(res, "birthDate must be YYYY-MM-DD.", 400);
    }

    const createdPatient = await createPatientService(payload);
    return successResponse(res, createdPatient, "Patient created successfully.", 201);
  } catch (error: unknown) {
    const statusCode: number = error instanceof AxiosError ? (error.response?.status || 500) : 500;
    return errorResponse(res, getAxiosMessage(error), statusCode);
  }
}

function parsePatientId(req: Request): string {
  const idParam: string | string[] | undefined = req.params.id;
  return Array.isArray(idParam) ? (idParam[0] || "") : (idParam || "");
}

export async function createMedicationRequestHandler(req: Request, res: Response): Promise<Response> {
  try {
    const patientId: string = parsePatientId(req).trim();
    if (!patientId) return errorResponse(res, "Patient id is required.", 400);

    const body: unknown = req.body;
    if (typeof body !== "object" || body === null) {
      return errorResponse(res, "Request body must be a JSON object.", 400);
    }

    const payload: ICreateMedicationRequestPayload = body as ICreateMedicationRequestPayload;
    if (payload.resourceType !== "MedicationRequest") {
      return errorResponse(res, "resourceType must be MedicationRequest.", 400);
    }
    if (!payload.encounter?.reference?.trim()) {
      return errorResponse(res, "encounter.reference is required.", 400);
    }
    if (!payload.requester?.reference?.trim()) {
      return errorResponse(res, "requester.reference (user id) is required.", 400);
    }

    const normalizedPayload: ICreateMedicationRequestPayload = {
      ...payload,
      subject: { ...(payload.subject || { reference: "" }), reference: `Patient/${patientId}` }
    };

    const createdMedicationRequest = await createMedicationRequestService(normalizedPayload);
    return successResponse(res, createdMedicationRequest, "MedicationRequest created successfully.", 201);
  } catch (error: unknown) {
    const statusCode: number = error instanceof AxiosError ? (error.response?.status || 500) : 500;
    return errorResponse(res, getAxiosMessage(error), statusCode);
  }
}

export async function listPatientMedicationRequestsHandler(req: Request, res: Response): Promise<Response> {
  try {
    const patientId: string = parsePatientId(req).trim();
    if (!patientId) return errorResponse(res, "Patient id is required.", 400);
    const payload = await listPatientMedicationRequests(patientId);
    return successResponse(res, payload, "Patient MedicationRequests fetched successfully.");
  } catch (error: unknown) {
    const statusCode: number = error instanceof AxiosError ? (error.response?.status || 500) : 500;
    return errorResponse(res, getAxiosMessage(error), statusCode);
  }
}

export async function createEncounterHandler(req: Request, res: Response): Promise<Response> {
  try {
    const patientId: string = parsePatientId(req).trim();
    if (!patientId) return errorResponse(res, "Patient id is required.", 400);

    const body: unknown = req.body;
    if (typeof body !== "object" || body === null) {
      return errorResponse(res, "Request body must be a JSON object.", 400);
    }

    const payload: ICreateEncounterPayload = body as ICreateEncounterPayload;
    if (payload.resourceType !== "Encounter") {
      return errorResponse(res, "resourceType must be Encounter.", 400);
    }
    if (!payload.status?.trim()) {
      return errorResponse(res, "status is required.", 400);
    }
    if (!payload.class?.code?.trim()) {
      return errorResponse(res, "class.code is required.", 400);
    }

    const normalizedPayload: ICreateEncounterPayload = {
      ...payload,
      subject: { ...(payload.subject || { reference: "" }), reference: `Patient/${patientId}` }
    };

    const createdEncounter = await createEncounterService(normalizedPayload);
    return successResponse(res, createdEncounter, "Encounter created successfully.", 201);
  } catch (error: unknown) {
    const statusCode: number = error instanceof AxiosError ? (error.response?.status || 500) : 500;
    return errorResponse(res, getAxiosMessage(error), statusCode);
  }
}

export async function listPatientEncountersHandler(req: Request, res: Response): Promise<Response> {
  try {
    const patientId: string = parsePatientId(req).trim();
    if (!patientId) return errorResponse(res, "Patient id is required.", 400);
    const payload = await listPatientEncounters(patientId);
    return successResponse(res, payload, "Patient encounters fetched successfully.");
  } catch (error: unknown) {
    const statusCode: number = error instanceof AxiosError ? (error.response?.status || 500) : 500;
    return errorResponse(res, getAxiosMessage(error), statusCode);
  }
}

export async function listEncountersHandler(req: Request, res: Response): Promise<Response> {
  try {
    const encounterIdParam: unknown = req.query.encounterId;
    const encounterId: string = Array.isArray(encounterIdParam)
      ? (typeof encounterIdParam[0] === "string" ? encounterIdParam[0] : "")
      : (typeof encounterIdParam === "string" ? encounterIdParam : "");
    const payload = await listEncounters(encounterId);
    return successResponse(res, payload, "Encounters fetched successfully.");
  } catch (error: unknown) {
    const statusCode: number = error instanceof AxiosError ? (error.response?.status || 500) : 500;
    return errorResponse(res, getAxiosMessage(error), statusCode);
  }
}

export async function getEncounterByIdHandler(req: Request, res: Response): Promise<Response> {
  try {
    const idParam: string | string[] | undefined = req.params.id;
    const encounterId: string = Array.isArray(idParam) ? (idParam[0] || "") : (idParam || "");
    if (!encounterId.trim()) return errorResponse(res, "Encounter id is required.", 400);
    const payload = await getEncounterById(encounterId);
    return successResponse(res, payload, "Encounter fetched successfully.");
  } catch (error: unknown) {
    const statusCode: number = error instanceof AxiosError ? (error.response?.status || 500) : 500;
    return errorResponse(res, getAxiosMessage(error), statusCode);
  }
}