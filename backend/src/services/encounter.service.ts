import { encounterMedications, encounters, medications } from "@/data/in-memory-store";
import { AddEncounterMedicationInput, Encounter, EncounterDetail, EncounterMedication, Medication } from "@/models/entities";
import { HttpError } from "@/models/errors";

function sortByNewestEncounter(first: Encounter, second: Encounter): number {
  return second.date.localeCompare(first.date);
}

export function getEncounters(searchQuery: string): Encounter[] {
  const sortedEncounters: Encounter[] = [...encounters].sort(sortByNewestEncounter);
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
    medication: encounterMedicationItems.map((medication: EncounterMedication) => ({
      code: medication.code,
      display: medication.drug,
      dose: medication.dose,
      frequency: medication.frequency
    }))
  };
}

function findEncounterById(encounterId: string): Encounter {
  const normalizedEncounterId: string = encounterId.trim().toLowerCase();
  const encounter: Encounter | undefined = encounters.find(
    (currentEncounter: Encounter): boolean => currentEncounter.id.toLowerCase() === normalizedEncounterId
  );

  if (!encounter) {
    throw new HttpError(404, "Encounter not found.");
  }

  return encounter;
}

function buildEncounterDetail(encounter: Encounter): EncounterDetail {
  const periodStart: string = `${encounter.date}T16:00:00`;
  const encounterMedicationItems: EncounterMedication[] = encounterMedications[encounter.id] || [];

  return {
    ...encounter,
    periodStart,
    medications: encounterMedicationItems,
    fhirResource: buildEncounterResource(encounter, periodStart, encounterMedicationItems)
  };
}

export function getEncounterById(encounterId: string): EncounterDetail {
  const encounter: Encounter = findEncounterById(encounterId);
  return buildEncounterDetail(encounter);
}

export function addMedicationToEncounter(encounterId: string, payload: AddEncounterMedicationInput): EncounterDetail {
  const encounter: Encounter = findEncounterById(encounterId);
  const medicationCatalogItem: Medication | undefined = medications.find(
    (medication: Medication): boolean => medication.code === payload.code
  );

  if (!medicationCatalogItem) {
    throw new HttpError(400, "Medication code is invalid.");
  }

  const existingEncounterMedicationItems: EncounterMedication[] = encounterMedications[encounter.id] || [];
  const newEncounterMedication: EncounterMedication = {
    code: medicationCatalogItem.code,
    drug: medicationCatalogItem.display,
    dose: payload.dose,
    frequency: payload.frequency
  };

  encounterMedications[encounter.id] = [...existingEncounterMedicationItems, newEncounterMedication];
  return buildEncounterDetail(encounter);
}
