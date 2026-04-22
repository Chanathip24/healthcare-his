export type PatientGender = "male" | "female" | "other";

export interface PatientAddressInput {
  text: string;
  line: string;
  city: string;
  district: string;
  state: string;
  postalCode: string;
}

export interface Patient {
  id: string;
  name: string;
  gender: PatientGender;
  age: number;
  createdAt: string;
}

export interface CreatePatientInput {
  name: string;
  gender: PatientGender;
  age: number;
  birthDate: string;
  nationalId: string;
  hospitalNumber: string;
  namePrefix: string;
  givenName: string;
  familyName: string;
  homePhone: string;
  mobilePhone: string;
  address: PatientAddressInput;
}

export interface PatientDetail extends Patient {
  encounterCount: number;
  medicationRequestCount: number;
  fhirResource: Record<string, unknown>;
}
