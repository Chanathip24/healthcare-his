export type MedicationRequestStatus = "active" | "completed" | "cancelled";

export type MedicationRequestIntent = "order";

export interface MedicationRequest {
  id: string;
  patientId: string;
  patientName: string;
  encounterId: string;
  status: MedicationRequestStatus;
  intent: MedicationRequestIntent;
  medicationCode: string;
  medicationDisplay: string;
  dose: string;
  frequency: string;
  authoredOn: string;
}

export interface MedicationRequestDetail extends MedicationRequest {
  fhirResource: Record<string, unknown>;
}

export interface CreateMedicationRequestInput {
  encounterId: string;
  code: string;
  dose: string;
  frequency: string;
  authoredOn?: string;
  status?: MedicationRequestStatus;
}
