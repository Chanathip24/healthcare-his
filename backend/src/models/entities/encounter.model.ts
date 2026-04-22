export type EncounterStatus = "active" | "finished" | "cancelled";

export interface Encounter {
  id: string;
  date: string;
  patientId: string;
  patientName: string;
  classDisplay: string;
  status: EncounterStatus;
}

export interface EncounterMedication {
  code: string;
  drug: string;
  dose: string;
  frequency: string;
}

export interface AddEncounterMedicationInput {
  code: string;
  dose: string;
  frequency: string;
}

export interface EncounterDetail extends Encounter {
  periodStart: string;
  medications: EncounterMedication[];
  fhirResource: Record<string, unknown>;
}
