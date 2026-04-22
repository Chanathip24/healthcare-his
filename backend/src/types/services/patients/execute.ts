import { EFhirPatientResourceType } from "@/enums";
import {
  IFhirEncounter,
  IFhirEncounterSearchBundle,
  IFhirMedicationRequest,
  IFhirMedicationRequestSearchBundle,
  IFhirPatient,
  IFhirPatientSearchBundle
} from "./query";

export type IListPatientsResponse = IFhirPatientSearchBundle;

export type IGetPatientByIdResponse = IFhirPatient;

export type ICreatePatientPayload = Omit<IFhirPatient, "id" | "meta"> & {
  resourceType: EFhirPatientResourceType.Patient;
};

export type ICreatePatientResponse = IFhirPatient;

export type ICreateMedicationRequestPayload = Omit<IFhirMedicationRequest, "id">;

export type ICreateMedicationRequestResponse = IFhirMedicationRequest;

export type IListPatientMedicationRequestsResponse = IFhirMedicationRequestSearchBundle;

export type ICreateEncounterPayload = Omit<IFhirEncounter, "id" | "subject"> & {
  id?: string;
  subject?: IFhirEncounter["subject"];
};

export type ICreateEncounterResponse = IFhirEncounter;

export type IListPatientEncountersResponse = IFhirEncounterSearchBundle;

export type IListEncountersResponse = IFhirEncounterSearchBundle;

export type IGetEncounterByIdResponse = IFhirEncounter;

