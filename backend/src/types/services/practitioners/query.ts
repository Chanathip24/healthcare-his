import { EFhirAdministrativeGender, EFhirPractitionerResourceType } from "@/enums";

export type IFhirPractitionerIdentifier = {
  system: string;
  value: string;
};

export type IFhirPractitionerName = {
  use?: string;
  family?: string;
  given?: string[];
  text?: string;
};

export type IFhirPractitionerTelecom = {
  system: string;
  value: string;
  use?: string;
};

export type IFhirPractitioner = {
  resourceType: EFhirPractitionerResourceType;
  id: string;
  identifier?: IFhirPractitionerIdentifier[];
  active?: boolean;
  name?: IFhirPractitionerName[];
  telecom?: IFhirPractitionerTelecom[];
  gender?: EFhirAdministrativeGender;
  birthDate?: string;
};

export type IFhirPractitionerBundleEntry = {
  fullUrl: string;
  resource: IFhirPractitioner;
  search?: {
    mode: "match" | "include" | "outcome";
  };
};

export type IFhirPractitionerSearchBundle = {
  resourceType: "Bundle";
  id: string;
  type: "searchset";
  total?: number;
  entry?: IFhirPractitionerBundleEntry[];
};
