import { findMedicationByCode } from "@/data/medication-catalog";
import { AddEncounterMedicationInput, Encounter, EncounterDetail, EncounterMedication, CreateMedicationRequestInput } from "@/models/entities";
import { HttpError } from "@/models/errors";
import {
  buildMedicationRequestFhirResource,
  mapEncounterResourceToEncounter,
  mapMedicationRequestResourceToMedicationRequest,
  mapMedicationRequestToEncounterMedication,
  mapPatientResourceToPatient
} from "@/services/fhir-mapper.service";
import { createFhirResource, readFhirResource, searchFhirResources } from "@/services/fhir.service";

type FhirResource = Record<string, unknown>;

function sortByNewestEncounter(first: Encounter, second: Encounter): number {
  return second.date.localeCompare(first.date);
}

function asString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function buildEncounterResource(
  encounter: Encounter,
  periodStart: string,
  encounterMedicationItems: EncounterMedication[]
): Record<string, unknown> {
  return {
    resourceType: "Encounter",
    id: encounter.id,
    status: encounter.status,
    class: {
      display: encounter.classDisplay
    },
    subject: {
      reference: `Patient/${encounter.patientId}`,
      display: encounter.patientName
    },
    period: {
      start: periodStart
    },
    medication: encounterMedicationItems.map((item: EncounterMedication) => ({
      resourceType: "MedicationRequest",
      status: "active",
      intent: "order",
      code: item.code,
      display: item.drug,
      dose: item.dose,
      frequency: item.frequency
    }))
  };
}

async function resolvePatientName(encounterResource: FhirResource, fallbackName?: string): Promise<string> {
  const subject = encounterResource.subject;
  if (!isRecord(subject)) return fallbackName || "Unknown";

  const displayName: string | undefined = asString(subject.display);
  if (displayName) return displayName;

  const reference: string | undefined = asString(subject.reference);
  if (!reference) return fallbackName || "Unknown";

  const patientId: string = reference.startsWith("Patient/") ? reference.slice("Patient/".length) : reference;
  if (!patientId) return fallbackName || "Unknown";

  try {
    const patientResource: FhirResource = await readFhirResource("Patient", patientId);
    const patient = mapPatientResourceToPatient(patientResource);
    return patient.name || fallbackName || "Unknown";
  } catch {
    return fallbackName || "Unknown";
  }
}

async function findEncounterResourceById(encounterId: string): Promise<FhirResource> {
  try {
    return await readFhirResource("Encounter", encounterId.trim());
  } catch (error) {
    if (error instanceof HttpError && error.statusCode === 404) {
      throw new HttpError(404, "Encounter not found.");
    }
    throw error;
  }
}

async function mapEncounterWithPatientName(encounterResource: FhirResource): Promise<Encounter> {
  const patientName: string = await resolvePatientName(encounterResource);
  return mapEncounterResourceToEncounter(encounterResource, patientName);
}

async function getEncounterMedications(encounterId: string, patientNameFallback?: string): Promise<EncounterMedication[]> {
  const medicationRequestResources: FhirResource[] = await searchFhirResources("MedicationRequest", {
    encounter: `Encounter/${encounterId}`,
    _count: "200"
  });

  return medicationRequestResources.map((resource: FhirResource): EncounterMedication => {
    const fallback = patientNameFallback ? { patientName: patientNameFallback } : undefined;
    const medicationRequest = mapMedicationRequestResourceToMedicationRequest(resource, fallback);
    return mapMedicationRequestToEncounterMedication(medicationRequest);
  });
}

export async function getEncounters(searchQuery: string): Promise<Encounter[]> {
  const encounterResources: FhirResource[] = await searchFhirResources("Encounter", { _count: "200" });
  const encounters: Encounter[] = await Promise.all(
    encounterResources.map((resource: FhirResource): Promise<Encounter> => mapEncounterWithPatientName(resource))
  );
  const sortedEncounters: Encounter[] = encounters.sort(sortByNewestEncounter);

  if (!searchQuery) return sortedEncounters;

  return sortedEncounters.filter((encounter: Encounter): boolean => {
    return (
      encounter.id.toLowerCase().includes(searchQuery) ||
      encounter.patientId.toLowerCase().includes(searchQuery) ||
      encounter.patientName.toLowerCase().includes(searchQuery) ||
      encounter.classDisplay.toLowerCase().includes(searchQuery) ||
      encounter.status.toLowerCase().includes(searchQuery) ||
      encounter.date.toLowerCase().includes(searchQuery)
    );
  });
}

export async function getEncounterById(encounterId: string): Promise<EncounterDetail> {
  const encounterResource: FhirResource = await findEncounterResourceById(encounterId);
  const encounter: Encounter = await mapEncounterWithPatientName(encounterResource);
  const period = isRecord(encounterResource.period) ? encounterResource.period : {};
  const periodStart: string = asString(period.start) || `${encounter.date}T00:00:00Z`;
  const medications: EncounterMedication[] = await getEncounterMedications(encounter.id, encounter.patientName);

  return {
    ...encounter,
    periodStart,
    medications,
    fhirResource: buildEncounterResource(encounter, periodStart, medications)
  };
}

export async function addMedicationToEncounter(
  encounterId: string,
  payload: AddEncounterMedicationInput
): Promise<EncounterDetail> {
  const encounterResource: FhirResource = await findEncounterResourceById(encounterId);
  const encounter: Encounter = await mapEncounterWithPatientName(encounterResource);
  const medicationCatalogItem = findMedicationByCode(payload.code);
  if (!medicationCatalogItem) {
    throw new HttpError(400, "Medication code is invalid.");
  }

  const medicationRequestInput: CreateMedicationRequestInput = {
    encounterId: encounter.id,
    code: medicationCatalogItem.code,
    dose: payload.dose,
    frequency: payload.frequency,
    authoredOn: encounter.date,
    status: "active"
  };

  await createFhirResource(
    "MedicationRequest",
    buildMedicationRequestFhirResource({
      patientId: encounter.patientId,
      patientName: encounter.patientName,
      input: medicationRequestInput,
      medicationDisplay: medicationCatalogItem.display,
      medicationSystem: medicationCatalogItem.system
    })
  );

  return getEncounterById(encounter.id);
}
