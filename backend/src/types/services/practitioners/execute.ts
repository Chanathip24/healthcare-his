import { EFhirPractitionerResourceType } from "@/enums";
import { IFhirPractitioner, IFhirPractitionerSearchBundle } from "./query";

export type IListPractitionersResponse = IFhirPractitionerSearchBundle;

export type IGetPractitionerByIdResponse = IFhirPractitioner;

export type ICreatePractitionerPayload = Omit<IFhirPractitioner, "id"> & {
  resourceType: EFhirPractitionerResourceType.Practitioner;
};

export type ICreatePractitionerResponse = IFhirPractitioner;
