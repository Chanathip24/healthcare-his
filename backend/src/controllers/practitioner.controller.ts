import { AxiosError } from "axios";
import { Request, Response } from "express";
import { EFhirPractitionerResourceType } from "@/enums";
import { createPractitioner, getPractitionerById, listPractitioners } from "@/services";
import { ICreatePractitionerPayload } from "@/types/services";
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

function parseIdParam(req: Request): string {
  const idParam: string | string[] | undefined = req.params.id;
  return Array.isArray(idParam) ? (idParam[0] || "") : (idParam || "");
}

export async function listPractitionersHandler(_req: Request, res: Response): Promise<Response> {
  try {
    const payload = await listPractitioners();
    return successResponse(res, payload, "Practitioners fetched successfully.");
  } catch (error: unknown) {
    return errorResponse(res, getAxiosMessage(error), 500);
  }
}

export async function getPractitionerByIdHandler(req: Request, res: Response): Promise<Response> {
  try {
    const practitionerId: string = parseIdParam(req).trim();
    if (!practitionerId) return errorResponse(res, "Practitioner id is required.", 400);
    const payload = await getPractitionerById(practitionerId);
    return successResponse(res, payload, "Practitioner fetched successfully.");
  } catch (error: unknown) {
    const statusCode: number = error instanceof AxiosError ? (error.response?.status || 500) : 500;
    return errorResponse(res, getAxiosMessage(error), statusCode);
  }
}

export async function createPractitionerHandler(req: Request, res: Response): Promise<Response> {
  try {
    const body: unknown = req.body;
    if (typeof body !== "object" || body === null) {
      return errorResponse(res, "Request body must be a JSON object.", 400);
    }

    const payload: ICreatePractitionerPayload = body as ICreatePractitionerPayload;
    if (payload.resourceType !== EFhirPractitionerResourceType.Practitioner) {
      return errorResponse(res, "resourceType must be Practitioner.", 400);
    }
    if (!Array.isArray(payload.name) || payload.name.length === 0) {
      return errorResponse(res, "name is required.", 400);
    }

    const createdPractitioner = await createPractitioner(payload);
    return successResponse(res, createdPractitioner, "Practitioner created successfully.", 201);
  } catch (error: unknown) {
    const statusCode: number = error instanceof AxiosError ? (error.response?.status || 500) : 500;
    return errorResponse(res, getAxiosMessage(error), statusCode);
  }
}
