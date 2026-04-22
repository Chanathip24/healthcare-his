import {
  AddEncounterMedicationInput,
  CreateEncounterInput,
  CreateMedicationRequestInput,
  CreatePatientInput,
  EncounterStatus,
  Medication,
  MedicationRequestStatus,
  PatientAddressInput,
  PatientGender
} from "@/models/entities";
import { HttpError } from "@/models/errors";

const MIN_NAME_LENGTH: number = 2;
const MAX_NAME_LENGTH: number = 120;
const MIN_AGE: number = 0;
const MAX_AGE: number = 130;
const MAX_QUERY_LENGTH: number = 100;
const MAX_DOSE_LENGTH: number = 30;
const MAX_FREQUENCY_LENGTH: number = 30;
const MAX_CLASS_DISPLAY_LENGTH: number = 60;
const MAX_PHONE_LENGTH: number = 30;
const MAX_NATIONAL_ID_LENGTH: number = 13;
const MAX_HOSPITAL_NUMBER_LENGTH: number = 20;
const MAX_NAME_PART_LENGTH: number = 120;
const MAX_ADDRESS_TEXT_LENGTH: number = 200;
const MAX_ADDRESS_LINE_LENGTH: number = 120;
const MAX_ADDRESS_FIELD_LENGTH: number = 80;
const MAX_POSTAL_CODE_LENGTH: number = 10;

const ALLOWED_GENDERS: ReadonlySet<PatientGender> = new Set<PatientGender>(["male", "female", "other"]);
const ALLOWED_ENCOUNTER_STATUSES: ReadonlySet<EncounterStatus> = new Set<EncounterStatus>([
  "active",
  "finished",
  "cancelled"
]);
const ALLOWED_MEDICATION_REQUEST_STATUSES: ReadonlySet<MedicationRequestStatus> = new Set<MedicationRequestStatus>([
  "active",
  "completed",
  "cancelled"
]);

function calculateAgeFromBirthDate(birthDate: string): number {
  const [yearString, monthString, dayString]: string[] = birthDate.split("-");
  const year: number = Number(yearString);
  const month: number = Number(monthString);
  const day: number = Number(dayString);

  const now: Date = new Date();
  let age: number = now.getUTCFullYear() - year;
  const currentMonth: number = now.getUTCMonth() + 1;
  const currentDay: number = now.getUTCDate();

  if (currentMonth < month || (currentMonth === month && currentDay < day)) {
    age -= 1;
  }

  return Math.max(age, 0);
}

function parseOptionalString(
  payload: Record<string, unknown>,
  key: string,
  maxLength: number,
  fieldName: string
): string | undefined {
  if (!(key in payload) || payload[key] === undefined || payload[key] === null) {
    return undefined;
  }

  const value: unknown = payload[key];
  if (typeof value !== "string") {
    throw new HttpError(400, `${fieldName} must be a string.`);
  }

  const normalized: string = value.trim();
  if (!normalized) return undefined;
  if (normalized.length > maxLength) {
    throw new HttpError(400, `${fieldName} must be at most ${maxLength} characters.`);
  }

  return normalized;
}

function parseRequiredString(
  payload: Record<string, unknown>,
  key: string,
  maxLength: number,
  fieldName: string
): string {
  const value: string | undefined = parseOptionalString(payload, key, maxLength, fieldName);
  if (!value) {
    throw new HttpError(400, `${fieldName} is required.`);
  }

  return value;
}

export function normalizeSearchQuery(value: unknown): string {
  if (typeof value !== "string") return "";
  return value.trim().toLowerCase().slice(0, MAX_QUERY_LENGTH);
}

export function parseCreatePatientInput(body: unknown): CreatePatientInput {
  if (typeof body !== "object" || body === null) {
    throw new HttpError(400, "Request body must be a JSON object.");
  }

  const payload: Record<string, unknown> = body as Record<string, unknown>;
  const rawName: string = parseRequiredString(payload, "name", MAX_NAME_LENGTH, "name");
  const namePrefix: string = parseRequiredString(payload, "namePrefix", MAX_NAME_PART_LENGTH, "namePrefix");
  const givenName: string = parseRequiredString(payload, "givenName", MAX_NAME_PART_LENGTH, "givenName");
  const familyName: string = parseRequiredString(payload, "familyName", MAX_NAME_PART_LENGTH, "familyName");
  const normalizedName: string = rawName.replace(/\s+/g, " ");

  if (normalizedName.length < MIN_NAME_LENGTH || normalizedName.length > MAX_NAME_LENGTH) {
    throw new HttpError(400, `Patient name must be between ${MIN_NAME_LENGTH} and ${MAX_NAME_LENGTH} characters.`);
  }

  if (!/^\p{L}[\p{L}\p{M}\s'.-]*$/u.test(normalizedName)) {
    throw new HttpError(400, "Patient name contains unsupported characters.");
  }

  const rawGender: string = typeof payload.gender === "string" ? payload.gender.trim().toLowerCase() : "";
  if (!ALLOWED_GENDERS.has(rawGender as PatientGender)) {
    throw new HttpError(400, "Gender must be one of: male, female, other.");
  }

  const rawBirthDate: string = parseRequiredString(payload, "birthDate", 10, "birthDate");
  const birthDate: string = ensureIsoDate(rawBirthDate, "birthDate");
  const resolvedAge: number = calculateAgeFromBirthDate(birthDate);
  if (resolvedAge < MIN_AGE || resolvedAge > MAX_AGE) {
    throw new HttpError(400, `Age must be an integer between ${MIN_AGE} and ${MAX_AGE}.`);
  }

  const nationalId: string = parseRequiredString(payload, "nationalId", MAX_NATIONAL_ID_LENGTH, "nationalId");
  if (!/^\d{13}$/.test(nationalId)) {
    throw new HttpError(400, "nationalId must be exactly 13 digits.");
  }

  const hospitalNumber: string = parseRequiredString(
    payload,
    "hospitalNumber",
    MAX_HOSPITAL_NUMBER_LENGTH,
    "hospitalNumber"
  );
  if (!/^[a-zA-Z0-9-]+$/.test(hospitalNumber)) {
    throw new HttpError(400, "hospitalNumber contains unsupported characters.");
  }

  for (const [fieldName, fieldValue] of [
    ["namePrefix", namePrefix],
    ["givenName", givenName],
    ["familyName", familyName]
  ] as Array<[string, string]>) {
    if (!/^[\p{L}\p{M}\s'.-]+$/u.test(fieldValue)) {
      throw new HttpError(400, `${fieldName} contains unsupported characters.`);
    }
  }

  const homePhone: string = parseRequiredString(payload, "homePhone", MAX_PHONE_LENGTH, "homePhone");
  const mobilePhone: string = parseRequiredString(payload, "mobilePhone", MAX_PHONE_LENGTH, "mobilePhone");

  for (const [fieldName, phoneValue] of [
    ["homePhone", homePhone],
    ["mobilePhone", mobilePhone]
  ] as Array<[string, string]>) {
    if (!/^[0-9+\-()\s]{6,30}$/.test(phoneValue)) {
      throw new HttpError(400, `${fieldName} contains unsupported characters.`);
    }
  }

  if (payload.address === undefined || payload.address === null) {
    throw new HttpError(400, "address is required.");
  }
  if (typeof payload.address !== "object" || Array.isArray(payload.address)) {
    throw new HttpError(400, "address must be an object.");
  }

  const rawAddress: Record<string, unknown> = payload.address as Record<string, unknown>;
  const text: string = parseRequiredString(rawAddress, "text", MAX_ADDRESS_TEXT_LENGTH, "address.text");
  const line: string = parseRequiredString(rawAddress, "line", MAX_ADDRESS_LINE_LENGTH, "address.line");
  const city: string = parseRequiredString(rawAddress, "city", MAX_ADDRESS_FIELD_LENGTH, "address.city");
  const district: string = parseRequiredString(rawAddress, "district", MAX_ADDRESS_FIELD_LENGTH, "address.district");
  const state: string = parseRequiredString(rawAddress, "state", MAX_ADDRESS_FIELD_LENGTH, "address.state");
  const postalCode: string = parseRequiredString(rawAddress, "postalCode", MAX_POSTAL_CODE_LENGTH, "address.postalCode");

  if (!/^[0-9-]+$/.test(postalCode)) {
    throw new HttpError(400, "address.postalCode contains unsupported characters.");
  }

  const address: PatientAddressInput = {
    text,
    line,
    city,
    district,
    state,
    postalCode
  };

  const input: CreatePatientInput = {
    name: normalizedName,
    gender: rawGender as PatientGender,
    age: resolvedAge,
    birthDate,
    nationalId,
    hospitalNumber,
    namePrefix,
    givenName,
    familyName,
    homePhone,
    mobilePhone,
    address
  };

  return input;
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

function ensureIsoDate(rawDate: string, fieldName: string): string {
  const normalizedDate: string = rawDate.trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(normalizedDate)) {
    throw new HttpError(400, `${fieldName} must be in YYYY-MM-DD format.`);
  }

  const timestamp: number = Date.parse(`${normalizedDate}T00:00:00Z`);
  if (Number.isNaN(timestamp)) {
    throw new HttpError(400, `${fieldName} is invalid.`);
  }

  return normalizedDate;
}

export function parseCreateEncounterInput(body: unknown): CreateEncounterInput {
  if (typeof body !== "object" || body === null) {
    throw new HttpError(400, "Request body must be a JSON object.");
  }

  const payload: Record<string, unknown> = body as Record<string, unknown>;
  const rawDate: string = typeof payload.date === "string" ? payload.date : "";
  const date: string = ensureIsoDate(rawDate, "Encounter date");

  const classDisplay: string = typeof payload.classDisplay === "string" ? payload.classDisplay.trim() : "";
  if (!classDisplay || classDisplay.length > MAX_CLASS_DISPLAY_LENGTH) {
    throw new HttpError(400, `classDisplay must be between 1 and ${MAX_CLASS_DISPLAY_LENGTH} characters.`);
  }
  if (!/^[a-zA-Z0-9(),\s-]+$/.test(classDisplay)) {
    throw new HttpError(400, "classDisplay contains unsupported characters.");
  }

  const rawStatus: string = typeof payload.status === "string" ? payload.status.trim().toLowerCase() : "";
  if (!ALLOWED_ENCOUNTER_STATUSES.has(rawStatus as EncounterStatus)) {
    throw new HttpError(400, "status must be one of: active, finished, cancelled.");
  }

  return {
    date,
    classDisplay,
    status: rawStatus as EncounterStatus
  };
}

export function parseCreateMedicationRequestInput(
  body: unknown,
  catalogMedications: Medication[]
): CreateMedicationRequestInput {
  if (typeof body !== "object" || body === null) {
    throw new HttpError(400, "Request body must be a JSON object.");
  }

  const payload: Record<string, unknown> = body as Record<string, unknown>;
  const encounterId: string = typeof payload.encounterId === "string" ? payload.encounterId.trim() : "";
  if (!encounterId) {
    throw new HttpError(400, "encounterId is required.");
  }

  const code: string = typeof payload.code === "string" ? payload.code.trim() : "";
  if (!code) {
    throw new HttpError(400, "Medication code is required.");
  }
  if (!catalogMedications.some((medication: Medication): boolean => medication.code === code)) {
    throw new HttpError(400, "Medication code is invalid.");
  }

  const dose: string = typeof payload.dose === "string" ? payload.dose.trim() : "";
  if (!dose || dose.length > MAX_DOSE_LENGTH) {
    throw new HttpError(400, `Dose must be between 1 and ${MAX_DOSE_LENGTH} characters.`);
  }
  if (!/^[a-zA-Z0-9/.()\s-]+$/.test(dose)) {
    throw new HttpError(400, "Dose contains unsupported characters.");
  }

  const frequency: string = typeof payload.frequency === "string" ? payload.frequency.trim() : "";
  if (!frequency || frequency.length > MAX_FREQUENCY_LENGTH) {
    throw new HttpError(400, `Frequency must be between 1 and ${MAX_FREQUENCY_LENGTH} characters.`);
  }
  if (!/^[a-zA-Z0-9/.()\s-]+$/.test(frequency)) {
    throw new HttpError(400, "Frequency contains unsupported characters.");
  }

  const rawAuthoredOn: string = typeof payload.authoredOn === "string" ? payload.authoredOn : "";
  const authoredOn: string | undefined = rawAuthoredOn ? ensureIsoDate(rawAuthoredOn, "authoredOn") : undefined;

  const rawStatus: string = typeof payload.status === "string" ? payload.status.trim().toLowerCase() : "";
  const status: MedicationRequestStatus | undefined = rawStatus
    ? (ALLOWED_MEDICATION_REQUEST_STATUSES.has(rawStatus as MedicationRequestStatus)
        ? (rawStatus as MedicationRequestStatus)
        : undefined)
    : undefined;

  if (rawStatus && !status) {
    throw new HttpError(400, "status must be one of: active, completed, cancelled.");
  }

  const parsedInput: CreateMedicationRequestInput = {
    encounterId,
    code,
    dose,
    frequency
  };

  if (authoredOn) {
    parsedInput.authoredOn = authoredOn;
  }
  if (status) {
    parsedInput.status = status;
  }

  return parsedInput;
}
