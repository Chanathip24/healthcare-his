import { EFhirAdministrativeGender, EFhirPatientResourceType } from "@/enums";

//get by id
export type IFhirPatient = {
  resourceType: EFhirPatientResourceType;
  id: string;
  meta: IFhirMeta;
  text?: IFhirNarrative;
  identifier?: IFhirIdentifier[];
  active: boolean;
  name: IFhirPatientName[];
  telecom?: IFhirTelecom[];
  gender: EFhirAdministrativeGender;
  birthDate: string;
  address?: IFhirAddress[];
};

export type IFhirMeta = {
  versionId: string;
  lastUpdated: string;
};

export type IFhirNarrative = {
  status: string;
  div: string;
};

export type IFhirIdentifier = {
  system: string;
  value: string;
};

export type IFhirPatientName = {
  use?: string;
  text: string;
  family?: string;
  given?: string[];
  prefix?: string[];
};

export type IFhirTelecom = {
  system: string;
  value: string;
  use: string;
};

export type IFhirAddress = {
  use: string;
  type: string;
  text: string;
  line: string[];
  city: string;
  district: string;
  state: string;
  postalCode: string;
};

export type IFhirBundleMeta = {
  lastUpdated: string;
};

export type IFhirBundleLink = {
  relation: string;
  url: string;
};

export type IFhirBundleSearch = {
  mode: "match" | "include" | "outcome";
};

export type IFhirPatientBundleEntry = {
  fullUrl: string;
  resource: IFhirPatient;
  search: IFhirBundleSearch;
};

//get all
export type IFhirPatientSearchBundle = {
  resourceType: "Bundle";
  id: string;
  meta: IFhirBundleMeta;
  type: "searchset";
  total: number;
  link: IFhirBundleLink[];
  entry: IFhirPatientBundleEntry[];
};

export type IFhirCoding = {
  system: string;
  code: string;
  display?: string;
};

export type IFhirCodeableConcept = {
  coding?: IFhirCoding[];
  text?: string;
};

export type IFhirReference = {
  reference: string;
  display?: string;
};

export type IFhirDosageInstruction = {
  text?: string;
  timing?: {
    repeat?: {
      frequency?: number;
      period?: number;
      periodUnit?: string;
    };
  };
  route?: {
    coding?: IFhirCoding[];
  };
  doseAndRate?: Array<{
    doseQuantity?: {
      value?: number;
      unit?: string;
    };
  }>;
};

export type IFhirDispenseRequest = {
  quantity?: {
    value?: number;
    unit?: string;
  };
  expectedSupplyDuration?: {
    value?: number;
    unit?: string;
  };
};

export type IFhirMedicationRequest = {
  resourceType: "MedicationRequest";
  id: string;
  status: string;
  intent: string;
  medicationCodeableConcept: IFhirCodeableConcept;
  subject: IFhirReference;
  encounter: IFhirReference;
  authoredOn?: string;
  requester?: IFhirReference;
  dosageInstruction?: IFhirDosageInstruction[];
  dispenseRequest?: IFhirDispenseRequest;
};

export type IFhirMedicationRequestBundleEntry = {
  fullUrl: string;
  resource: IFhirMedicationRequest;
  search?: IFhirBundleSearch;
};

export type IFhirMedicationRequestSearchBundle = {
  resourceType: "Bundle";
  id: string;
  meta?: IFhirBundleMeta;
  type: "searchset";
  total?: number;
  link?: IFhirBundleLink[];
  entry?: IFhirMedicationRequestBundleEntry[];
};

export type IFhirEncounterClass = {
  system: string;
  code: string;
  display?: string;
};

export type IFhirEncounterParticipant = {
  individual?: IFhirReference;
};

export type IFhirEncounterLocation = {
  location: IFhirReference;
};

export type IFhirEncounterPeriod = {
  start: string;
  end?: string;
};

export type IFhirEncounter = {
  resourceType: "Encounter";
  id: string;
  status: string;
  class: IFhirEncounterClass;
  subject: IFhirReference;
  participant?: IFhirEncounterParticipant[];
  period?: IFhirEncounterPeriod;
  reasonCode?: Array<{ text?: string }>;
  serviceProvider?: IFhirReference;
  location?: IFhirEncounterLocation[];
};

export type IFhirEncounterBundleEntry = {
  fullUrl: string;
  resource: IFhirEncounter;
  search?: IFhirBundleSearch;
};

export type IFhirEncounterSearchBundle = {
  resourceType: "Bundle";
  id: string;
  meta?: IFhirBundleMeta;
  type: "searchset";
  total?: number;
  link?: IFhirBundleLink[];
  entry?: IFhirEncounterBundleEntry[];
};
