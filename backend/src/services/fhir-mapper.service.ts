import {
  CreateEncounterInput,
  CreateMedicationRequestInput,
  CreatePatientInput,
  Encounter,
  EncounterMedication,
  EncounterStatus,
  MedicationRequest,
  MedicationRequestStatus,
  Patient,
  PatientGender
} from "@/models/entities";

export const PATIENT_AGE_EXTENSION_URL: string =
  "http://hospital.smart.local/StructureDefinition/patient-age";
export const MEDICATION_REQUEST_DOSE_EXTENSION_URL: string =
  "http://hospital.smart.local/StructureDefinition/medicationrequest-dose";
export const MEDICATION_REQUEST_FREQUENCY_EXTENSION_URL: string =
  "http://hospital.smart.local/StructureDefinition/medicationrequest-frequency";
export const ENCOUNTER_CLASS_SYSTEM_URL: string = "http://terminology.hl7.org/CodeSystem/v3-ActCode";
const NATIONAL_ID_SYSTEM_URL: string = "http://www.dopa.go.th/nid";
const HOSPITAL_NUMBER_SYSTEM_URL: string = "http://www.myhospital.com/hn";
const THAI_MONTHS: string[] = [
  "มกราคม",
  "กุมภาพันธ์",
  "มีนาคม",
  "เมษายน",
  "พฤษภาคม",
  "มิถุนายน",
  "กรกฎาคม",
  "สิงหาคม",
  "กันยายน",
  "ตุลาคม",
  "พฤศจิกายน",
  "ธันวาคม"
];

type FhirResource = Record<string, unknown>;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function asNumber(value: unknown): number | undefined {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined;
}

function asArray(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function escapeXhtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function toThaiGenderLabel(gender: PatientGender): string {
  if (gender === "male") return "ชาย";
  if (gender === "female") return "หญิง";
  return "อื่นๆ";
}

function toThaiBirthDateLabel(birthDate: string): string {
  const [yearString, monthString, dayString] = birthDate.split("-");
  const year: number = Number(yearString);
  const month: number = Number(monthString);
  const day: number = Number(dayString);

  if (!year || !month || !day || month < 1 || month > 12) {
    return birthDate;
  }

  const buddhistYear: number = year + 543;
  const monthName: string = THAI_MONTHS[month - 1] || "";
  return `${day} ${monthName} ${buddhistYear}`;
}

function calculateAgeFromBirthDate(birthDate: string): number {
  const [yearString, monthString, dayString] = birthDate.split("-");
  const year: number = Number(yearString);
  const month: number = Number(monthString);
  const day: number = Number(dayString);

  if (!year || !month || !day) return 0;

  const now: Date = new Date();
  let age: number = now.getUTCFullYear() - year;
  const currentMonth: number = now.getUTCMonth() + 1;
  const currentDay: number = now.getUTCDate();

  if (currentMonth < month || (currentMonth === month && currentDay < day)) {
    age -= 1;
  }

  return Math.max(age, 0);
}


function extractIdentifierValue(resource: FhirResource, systemUrl: string): string | undefined {
  for (const identifierItem of asArray(resource.identifier)) {
    if (!isRecord(identifierItem)) continue;
    if (asString(identifierItem.system) !== systemUrl) continue;

    const value: string | undefined = asString(identifierItem.value);
    if (value) return value;
  }

  return undefined;
}

function extractTelecomValue(resource: FhirResource, use: "home" | "mobile"): string | undefined {
  for (const telecomItem of asArray(resource.telecom)) {
    if (!isRecord(telecomItem)) continue;
    if (asString(telecomItem.system) !== "phone") continue;
    if (asString(telecomItem.use) !== use) continue;

    const value: string | undefined = asString(telecomItem.value);
    if (value) return value;
  }

  return undefined;
}

function extractBirthDate(resource: FhirResource): string {
  const birthDate: string | undefined = asString(resource.birthDate);
  if (birthDate) return birthDate;

  const age: number = extractPatientAge(resource);
  const year: number = new Date().getUTCFullYear() - age;
  return `${year.toString().padStart(4, "0")}-01-01`;
}

function extractAddress(resource: FhirResource): {
  text?: string;
  line?: string;
  city?: string;
  district?: string;
  state?: string;
  postalCode?: string;
} {
  const firstAddress = asArray(resource.address)[0];
  if (!isRecord(firstAddress)) {
    return {};
  }

  const line = asArray(firstAddress.line)
    .map((value: unknown): string | undefined => asString(value))
    .find((value: string | undefined): value is string => Boolean(value));

  const output: {
    text?: string;
    line?: string;
    city?: string;
    district?: string;
    state?: string;
    postalCode?: string;
  } = {};

  const text: string | undefined = asString(firstAddress.text);
  const city: string | undefined = asString(firstAddress.city);
  const district: string | undefined = asString(firstAddress.district);
  const state: string | undefined = asString(firstAddress.state);
  const postalCode: string | undefined = asString(firstAddress.postalCode);

  if (text) output.text = text;
  if (line) output.line = line;
  if (city) output.city = city;
  if (district) output.district = district;
  if (state) output.state = state;
  if (postalCode) output.postalCode = postalCode;

  return output;
}

function buildPatientNarrative(params: {
  hospitalNumber: string;
  fullName: string;
  birthDate: string;
  gender: PatientGender;
}): string {
  const escapedName: string = escapeXhtml(params.fullName);
  const thaiBirthDate: string = escapeXhtml(toThaiBirthDateLabel(params.birthDate));
  const thaiGenderLabel: string = escapeXhtml(toThaiGenderLabel(params.gender));
  const escapedHospitalNumber: string = escapeXhtml(params.hospitalNumber);

  return `<div xmlns="http://www.w3.org/1999/xhtml/"><p>HN: ${escapedHospitalNumber} ${escapedName}</p> <p>(เกิด: ${thaiBirthDate}, ${thaiGenderLabel})</p></div>`;
}

function toPatientGender(value: string | undefined): PatientGender {
  if (value === "male" || value === "female" || value === "other") {
    return value;
  }

  return "other";
}

function toFhirEncounterStatus(status: EncounterStatus): string {
  if (status === "active") return "in-progress";
  return status;
}

function fromFhirEncounterStatus(value: string | undefined): EncounterStatus {
  if (value === "in-progress" || value === "planned" || value === "arrived" || value === "triaged") {
    return "active";
  }
  if (value === "finished") return "finished";
  if (value === "cancelled") return "cancelled";
  return "active";
}

function toMedicationRequestStatus(value: string | undefined): MedicationRequestStatus {
  if (value === "active" || value === "completed" || value === "cancelled") {
    return value;
  }

  return "active";
}

function todayIsoDate(): string {
  return new Date().toISOString().slice(0, 10);
}

function buildNameText(nameItem: Record<string, unknown>): string {
  const text: string | undefined = asString(nameItem.text);
  if (text) return text;

  const givenParts: string[] = asArray(nameItem.given)
    .map((value: unknown): string | undefined => asString(value))
    .filter((value: string | undefined): value is string => Boolean(value));
  const family: string | undefined = asString(nameItem.family);
  const assembled: string = [...givenParts, family || ""].join(" ").trim();

  return assembled || "";
}

function extractPatientName(resource: FhirResource): string {
  const name = asArray(resource.name);
  for (const nameItem of name) {
    if (!isRecord(nameItem)) continue;
    const resolvedName: string = buildNameText(nameItem);
    if (resolvedName) return resolvedName;
  }

  return "";
}

function extractPatientAge(resource: FhirResource): number {
  const birthDate: string | undefined = asString(resource.birthDate);
  if (birthDate) {
    return calculateAgeFromBirthDate(birthDate);
  }

  const extension = asArray(resource.extension);
  for (const extensionItem of extension) {
    if (!isRecord(extensionItem)) continue;
    if (asString(extensionItem.url) !== PATIENT_AGE_EXTENSION_URL) continue;

    const valueInteger: number | undefined = asNumber(extensionItem.valueInteger);
    if (valueInteger !== undefined) return valueInteger;
  }

  return 0;
}

function parseMedicationText(text: string | undefined): { dose: string; frequency: string } {
  if (!text) {
    return {
      dose: "",
      frequency: ""
    };
  }

  const parts: string[] = text.split(",").map((part: string): string => part.trim());
  return {
    dose: parts[0] || "",
    frequency: parts[1] || ""
  };
}

function parseClassCode(classDisplay: string): string {
  const match: RegExpMatchArray | null = classDisplay.match(/\(([A-Z]+)\)/);
  return match?.[1] || "AMB";
}

export function extractReferenceId(reference: string | undefined, resourceType: string): string {
  if (!reference) return "";
  const trimmedReference: string = reference.trim();
  const prefix: string = `${resourceType}/`;
  if (trimmedReference.startsWith(prefix)) {
    return trimmedReference.slice(prefix.length);
  }

  return trimmedReference;
}

export function buildPatientFhirResource(input: CreatePatientInput): FhirResource {
  return {
    resourceType: "Patient",
    text: {
      status: "generated",
      div: buildPatientNarrative({
        hospitalNumber: input.hospitalNumber,
        fullName: input.name,
        birthDate: input.birthDate,
        gender: input.gender
      })
    },
    identifier: [
      {
        system: NATIONAL_ID_SYSTEM_URL,
        value: input.nationalId
      },
      {
        system: HOSPITAL_NUMBER_SYSTEM_URL,
        value: input.hospitalNumber
      }
    ],
    active: true,
    name: [
      {
        use: "official",
        text: input.name,
        family: input.familyName,
        given: [input.givenName],
        prefix: [input.namePrefix]
      }
    ],
    gender: input.gender,
    birthDate: input.birthDate,
    telecom: [
      {
        system: "phone",
        value: input.homePhone,
        use: "home"
      },
      {
        system: "phone",
        value: input.mobilePhone,
        use: "mobile"
      }
    ],
    address: [
      {
        use: "home",
        type: "both",
        text: input.address.text,
        line: [input.address.line],
        city: input.address.city,
        district: input.address.district,
        state: input.address.state,
        postalCode: input.address.postalCode
      }
    ]
  };
}

export function buildPatientStructuredResponseResource(resource: FhirResource): FhirResource {
  const nameText: string = extractPatientName(resource);

  const firstNameItem = asArray(resource.name).find((item: unknown): item is Record<string, unknown> => isRecord(item));
  const prefixFromResource = firstNameItem
    ? asArray(firstNameItem.prefix)
        .map((value: unknown): string | undefined => asString(value))
        .find((value: string | undefined): value is string => Boolean(value))
    : undefined;
  const givenFromResource = firstNameItem
    ? asArray(firstNameItem.given)
        .map((value: unknown): string | undefined => asString(value))
        .find((value: string | undefined): value is string => Boolean(value))
    : undefined;
  const familyFromResource = firstNameItem ? asString(firstNameItem.family) : undefined;

  const prefix: string = prefixFromResource || "";
  const givenName: string = givenFromResource || "";
  const familyName: string = familyFromResource || "";

  const hospitalNumber: string = extractIdentifierValue(resource, HOSPITAL_NUMBER_SYSTEM_URL) || "";
  const nationalId: string = extractIdentifierValue(resource, NATIONAL_ID_SYSTEM_URL) || "";

  const homePhone: string = extractTelecomValue(resource, "home") || "";
  const mobilePhone: string = extractTelecomValue(resource, "mobile") || "";

  const birthDate: string = asString(resource.birthDate) || "";
  const address = extractAddress(resource);
  const textObject: Record<string, unknown> = isRecord(resource.text) ? resource.text : {};
  const textDiv: string =
    asString(textObject.div) || '<div xmlns="http://www.w3.org/1999/xhtml/"></div>';
  const active: boolean = typeof resource.active === "boolean" ? resource.active : false;
  const nameTextValue: string = nameText || [prefix, givenName, familyName].join(" ").replace(/\s+/g, " ").trim();

  return {
    resourceType: "Patient",
    text: {
      status: "generated",
      div: textDiv
    },
    identifier: [
      {
        system: NATIONAL_ID_SYSTEM_URL,
        value: nationalId
      },
      {
        system: HOSPITAL_NUMBER_SYSTEM_URL,
        value: hospitalNumber
      }
    ],
    active,
    name: [
      {
        use: "official",
        text: nameTextValue,
        family: familyName,
        given: givenName ? [givenName] : [],
        prefix: prefix ? [prefix] : []
      }
    ],
    telecom: [
      {
        system: "phone",
        value: homePhone,
        use: "home"
      },
      {
        system: "phone",
        value: mobilePhone,
        use: "mobile"
      }
    ],
    gender: toPatientGender(asString(resource.gender)),
    birthDate,
    address: [
      {
        use: "home",
        type: "both",
        text: address.text || "",
        line: address.line ? [address.line] : [],
        city: address.city || "",
        district: address.district || "",
        state: address.state || "",
        postalCode: address.postalCode || ""
      }
    ]
  };
}

export function mapPatientResourceToPatient(resource: FhirResource): Patient {
  const id: string | undefined = asString(resource.id);
  if (!id) {
    throw new Error("Patient resource missing id.");
  }

  const meta: Record<string, unknown> = isRecord(resource.meta) ? resource.meta : {};
  const createdAt: string = asString(meta.lastUpdated) || new Date().toISOString();

  return {
    id,
    name: extractPatientName(resource),
    gender: toPatientGender(asString(resource.gender)),
    age: extractPatientAge(resource),
    createdAt
  };
}

export function buildEncounterFhirResource(params: {
  patientId: string;
  patientName: string;
  input: CreateEncounterInput;
}): FhirResource {
  const classCode: string = parseClassCode(params.input.classDisplay);
  return {
    resourceType: "Encounter",
    status: toFhirEncounterStatus(params.input.status),
    class: {
      system: ENCOUNTER_CLASS_SYSTEM_URL,
      code: classCode,
      display: params.input.classDisplay
    },
    subject: {
      reference: `Patient/${params.patientId}`,
      display: params.patientName
    },
    period: {
      start: `${params.input.date}T00:00:00Z`
    }
  };
}

export function mapEncounterResourceToEncounter(resource: FhirResource, patientNameFallback?: string): Encounter {
  const id: string | undefined = asString(resource.id);
  if (!id) {
    throw new Error("Encounter resource missing id.");
  }

  const subject: Record<string, unknown> = isRecord(resource.subject) ? resource.subject : {};
  const patientId: string = extractReferenceId(asString(subject.reference), "Patient");
  const patientName: string = asString(subject.display) || patientNameFallback || patientId || "Unknown";

  const encounterClass: Record<string, unknown> = isRecord(resource.class) ? resource.class : {};
  const classDisplay: string = asString(encounterClass.display) || asString(encounterClass.code) || "Ambulatory (AMB)";

  const period: Record<string, unknown> = isRecord(resource.period) ? resource.period : {};
  const periodStart: string | undefined = asString(period.start);
  const periodEnd: string | undefined = asString(period.end);
  const date: string = (periodStart || periodEnd || "").slice(0, 10) || todayIsoDate();

  return {
    id,
    date,
    patientId,
    patientName,
    classDisplay,
    status: fromFhirEncounterStatus(asString(resource.status))
  };
}

export function buildMedicationRequestFhirResource(params: {
  patientId: string;
  patientName: string;
  input: CreateMedicationRequestInput;
  medicationDisplay: string;
  medicationSystem: string;
}): FhirResource {
  const authoredOn: string = params.input.authoredOn || todayIsoDate();

  return {
    resourceType: "MedicationRequest",
    status: params.input.status || "active",
    intent: "order",
    authoredOn,
    subject: {
      reference: `Patient/${params.patientId}`,
      display: params.patientName
    },
    encounter: {
      reference: `Encounter/${params.input.encounterId}`
    },
    medicationCodeableConcept: {
      coding: [
        {
          system: params.medicationSystem,
          code: params.input.code,
          display: params.medicationDisplay
        }
      ],
      text: params.medicationDisplay
    },
    extension: [
      {
        url: MEDICATION_REQUEST_DOSE_EXTENSION_URL,
        valueString: params.input.dose
      },
      {
        url: MEDICATION_REQUEST_FREQUENCY_EXTENSION_URL,
        valueString: params.input.frequency
      }
    ],
    dosageInstruction: [
      {
        text: `${params.input.dose}, ${params.input.frequency}`
      }
    ]
  };
}

export function mapMedicationRequestResourceToMedicationRequest(
  resource: FhirResource,
  fallback?: { patientName?: string }
): MedicationRequest {
  const id: string | undefined = asString(resource.id);
  if (!id) {
    throw new Error("MedicationRequest resource missing id.");
  }

  const subject: Record<string, unknown> = isRecord(resource.subject) ? resource.subject : {};
  const encounter: Record<string, unknown> = isRecord(resource.encounter) ? resource.encounter : {};
  const medicationCodeableConcept: Record<string, unknown> = isRecord(resource.medicationCodeableConcept)
    ? resource.medicationCodeableConcept
    : {};

  const codingArray: unknown[] = asArray(medicationCodeableConcept.coding);
  const firstCoding: Record<string, unknown> = isRecord(codingArray[0]) ? codingArray[0] : {};

  let dose: string = "";
  let frequency: string = "";
  for (const extensionItem of asArray(resource.extension)) {
    if (!isRecord(extensionItem)) continue;
    const url: string | undefined = asString(extensionItem.url);
    const valueString: string = asString(extensionItem.valueString) || "";
    if (url === MEDICATION_REQUEST_DOSE_EXTENSION_URL) {
      dose = valueString;
    }
    if (url === MEDICATION_REQUEST_FREQUENCY_EXTENSION_URL) {
      frequency = valueString;
    }
  }

  if (!dose || !frequency) {
    const dosageInstruction = asArray(resource.dosageInstruction);
    const firstInstruction: Record<string, unknown> = isRecord(dosageInstruction[0]) ? dosageInstruction[0] : {};
    const parsedText = parseMedicationText(asString(firstInstruction.text));
    if (!dose) dose = parsedText.dose;
    if (!frequency) frequency = parsedText.frequency;
  }

  const medicationDisplay: string =
    asString(firstCoding.display) || asString(medicationCodeableConcept.text) || "Unknown medication";

  return {
    id,
    patientId: extractReferenceId(asString(subject.reference), "Patient"),
    patientName: asString(subject.display) || fallback?.patientName || "Unknown",
    encounterId: extractReferenceId(asString(encounter.reference), "Encounter"),
    status: toMedicationRequestStatus(asString(resource.status)),
    intent: "order",
    medicationCode: asString(firstCoding.code) || "",
    medicationDisplay,
    dose,
    frequency,
    authoredOn: (asString(resource.authoredOn) || "").slice(0, 10) || todayIsoDate()
  };
}

export function mapMedicationRequestToEncounterMedication(item: MedicationRequest): EncounterMedication {
  return {
    code: item.medicationCode,
    drug: item.medicationDisplay,
    dose: item.dose,
    frequency: item.frequency
  };
}
