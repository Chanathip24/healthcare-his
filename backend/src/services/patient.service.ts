import { FHIR_SERVER_URL } from "@/configs";
import { FhirPatientClient } from "@/client";
import {
  ICreateEncounterPayload,
  ICreateEncounterResponse,
  ICreateMedicationRequestPayload,
  ICreateMedicationRequestResponse,
  ICreatePatientPayload,
  ICreatePatientResponse,
  IGetEncounterByIdResponse,
  IGetPatientByIdResponse,
  IListEncountersResponse,
  IListPatientEncountersResponse,
  IListPatientMedicationRequestsResponse,
  IListPatientsResponse
} from "@/types/services";

const fhirPatientClient = new FhirPatientClient(FHIR_SERVER_URL);

export async function listPatients(): Promise<IListPatientsResponse> {
  return fhirPatientClient.listPatients();
}

export async function getPatientById(patientId: string): Promise<IGetPatientByIdResponse> {
  return fhirPatientClient.getPatientById(patientId);
}

export async function createPatient(payload: ICreatePatientPayload): Promise<ICreatePatientResponse> {
  return fhirPatientClient.createPatient(payload);
}

export async function createMedicationRequest(
  payload: ICreateMedicationRequestPayload
): Promise<ICreateMedicationRequestResponse> {
  return fhirPatientClient.createMedicationRequest(payload);
}

export async function listPatientMedicationRequests(patientId: string): Promise<IListPatientMedicationRequestsResponse> {
  return fhirPatientClient.listPatientMedicationRequests(patientId);
}

export async function createEncounter(payload: ICreateEncounterPayload): Promise<ICreateEncounterResponse> {
  return fhirPatientClient.createEncounter(payload);
}

export async function listPatientEncounters(patientId: string): Promise<IListPatientEncountersResponse> {
  return fhirPatientClient.listPatientEncounters(patientId);
}

export async function listEncounters(encounterId?: string): Promise<IListEncountersResponse> {
  return fhirPatientClient.listEncounters(encounterId);
}

export async function getEncounterById(encounterId: string): Promise<IGetEncounterByIdResponse> {
  return fhirPatientClient.getEncounterById(encounterId);
}