import { AddEncounterMedicationInput, CreatePatientInput, Medication, PatientGender } from "@/models/entities";
import { HttpError } from "@/models/errors";

const MIN_NAME_LENGTH: number = 2;
const MAX_NAME_LENGTH: number = 120;
const MIN_AGE: number = 0;
const MAX_AGE: number = 130;
const MAX_QUERY_LENGTH: number = 100;
const MAX_DOSE_LENGTH: number = 30;
const MAX_FREQUENCY_LENGTH: number = 30;

const ALLOWED_GENDERS: ReadonlySet<PatientGender> = new Set<PatientGender>(["male", "female", "other"]);

export function normalizeSearchQuery(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase().slice(0, MAX_QUERY_LENGTH);
}

export function parseCreatePatientInput(body: unknown): CreatePatientInput {
  if (typeof body !== "object" || body === null) {
    throw new HttpError(400, "Request body must be a JSON object.");
  }

  const payload: Record<string, unknown> = body as Record<string, unknown>;
  const rawName: string = typeof payload.name === "string" ? payload.name.trim() : "";
  const normalizedName: string = rawName.replace(/\s+/g, " ");

  if (normalizedName.length < MIN_NAME_LENGTH || normalizedName.length > MAX_NAME_LENGTH) {
    throw new HttpError(400, `Patient name must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters.`);
  }

  if (!/^[a-zA-Z][a-zA-Z\s'.-]*$/.test(normalizedName)) {
    throw new HttpError(400, "Patient name contains unsupported characters.");
  }

  const rawGender: string = typeof payload.gender === "string" ? payload.gender.trim().toLowerCase() : "";
  if (!ALLOWED_GENDERS.has(rawGender as PatientGender)) {
    throw new HttpError(400, "Gender must be one of: male, female, other.");
  }

  const ageValue: number = typeof payload.age === "number" ? payload.age : Number(payload.age);
  if (!Number.isInteger(ageValue) || ageValue < MIN_AGE || ageValue > MAX_AGE) {
    throw new HttpError(400, `Age must be an integer between ${MIN_AGE} and ${MAX_AGE}.`);
  }

  return {
    name: normalizedName,
    gender: rawGender as PatientGender,
    age: ageValue
  };
}

export function parseAddEncounterMedicationInput(
  body: unknown,
  catalogMedications: Medication[]
): AddEncounterMedicationInput {
  if (typeof body !== "object" || body === null) {
    throw new HttpError(400, "Request body must be a JSON object.");
  }

  const payload: Record<string, unknown> = body as Record<string, unknown>;
  const code: string = typeof payload.code === "string" ? payload.code.trim() : "";
  const dose: string = typeof payload.dose === "string" ? payload.dose.trim() : "";
  const frequency: string = typeof payload.frequency === "string" ? payload.frequency.trim() : "";

  if (!code) {
    throw new HttpError(400, "Medication code is required.");
  }
  if (!catalogMedications.some((medication: Medication): boolean => medication.code === code)) {
    throw new HttpError(400, "Medication code is invalid.");
  }

  if (!dose || dose.length > MAX_DOSE_LENGTH) {
    throw new HttpError(400, `Dose must be between 1 and ${MAX_DOSE_LENGTH} characters.`);
  }
  if (!/^[a-zA-Z0-9/.()\s-]+$/.test(dose)) {
    throw new HttpError(400, "Dose contains unsupported characters.");
  }

  if (!frequency || frequency.length > MAX_FREQUENCY_LENGTH) {
    throw new HttpError(400, `Frequency must be between 1 and ${MAX_FREQUENCY_LENGTH} characters.`);
  }
  if (!/^[a-zA-Z0-9/.()\s-]+$/.test(frequency)) {
    throw new HttpError(400, "Frequency contains unsupported characters.");
  }

  return {
    code,
    dose,
    frequency
  };
}
