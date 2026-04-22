export type PatientGender = "male" | "female" | "other";

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
}
