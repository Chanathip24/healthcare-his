import { FHIR_SERVER_URL } from "@/configs";
import { FhirPractitionerClient } from "@/client";
import {
  ICreatePractitionerPayload,
  ICreatePractitionerResponse,
  IGetPractitionerByIdResponse,
  IListPractitionersResponse
} from "@/types/services";

const fhirPractitionerClient = new FhirPractitionerClient(FHIR_SERVER_URL);

export async function listPractitioners(): Promise<IListPractitionersResponse> {
  return fhirPractitionerClient.listPractitioners();
}

export async function getPractitionerById(practitionerId: string): Promise<IGetPractitionerByIdResponse> {
  return fhirPractitionerClient.getPractitionerById(practitionerId);
}

export async function createPractitioner(payload: ICreatePractitionerPayload): Promise<ICreatePractitionerResponse> {
  return fhirPractitionerClient.createPractitioner(payload);
}
