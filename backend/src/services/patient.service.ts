import { findMedicationByCode } from "@/data/medication-catalog";
import {
  CreateEncounterInput,
  CreateMedicationRequestInput,
  CreatePatientInput,
  Encounter,
  MedicationRequestDetail,
  Patient,
  PatientDetail
} from "@/models/entities";
import { HttpError } from "@/models/errors";
import {
  buildPatientStructuredResponseResource,
  buildEncounterFhirResource,
  buildMedicationRequestFhirResource,
  buildPatientFhirResource,
  mapEncounterResourceToEncounter,
  mapMedicationRequestResourceToMedicationRequest,
  mapPatientResourceToPatient
} from "@/services/fhir-mapper.service";
import { countFhirResources, createFhirResource, readFhirResource, searchFhirResources } from "@/services/fhir.service";

type FhirResource = Record<string, unknown>;

function sortByNewestPatient(first: Patient, second: Patient): number {
  return second.createdAt.localeCompare(first.createdAt);
}

function sortByNewestEncounter(first: Encounter, second: Encounter): number {
  return second.date.localeCompare(first.date);
}

function sortByNewestMedicationRequest(
  first: { authoredOn: string },
  second: { authoredOn: string }
): number {
  return second.authoredOn.localeCompare(first.authoredOn);
}

async function findPatientResourceById(patientId: string): Promise<FhirResource> {
  try {
    return await readFhirResource("Patient", patientId.trim());
  } catch (error) {
    if (error instanceof HttpError && error.statusCode === 404) {
      throw new HttpError(404, "Patient not found.");
    }
    throw error;
  }
}

async function ensurePatientEncounter(encounterId: string, patient: Patient): Promise<Encounter> {
  let encounterResource: FhirResource;
  try {
    encounterResource = await readFhirResource("Encounter", encounterId.trim());
  } catch (error) {
    if (error instanceof HttpError && error.statusCode === 404) {
      throw new HttpError(404, "Encounter not found.");
    }
    throw error;
  }

  const encounter: Encounter = mapEncounterResourceToEncounter(encounterResource, patient.name);
  if (encounter.patientId !== patient.id) {
    throw new HttpError(400, "Encounter does not belong to this patient.");
  }

  return encounter;
}

export async function getPatients(searchQuery: string): Promise<Patient[]> {
  const patientResources: FhirResource[] = await searchFhirResources("Patient", { _count: "200" });
  const sortedPatients: Patient[] = patientResources.map(mapPatientResourceToPatient).sort(sortByNewestPatient);
  if (!searchQuery) return sortedPatients;

  return sortedPatients.filter((patient: Patient): boolean => {
    return (
      patient.id.toLowerCase().includes(searchQuery) ||
      patient.name.toLowerCase().includes(searchQuery) ||
      patient.gender.toLowerCase().includes(searchQuery)
    );
  });
}

export async function createPatient(input: CreatePatientInput): Promise<Patient> {
  const createdPatientResource: FhirResource = await createFhirResource("Patient", buildPatientFhirResource(input));
  return mapPatientResourceToPatient(createdPatientResource);
}

export async function getPatientById(patientId: string): Promise<PatientDetail> {
  const patientResource: FhirResource = await findPatientResourceById(patientId);
  const patient: Patient = mapPatientResourceToPatient(patientResource);

  const [encounterCount, medicationRequestCount] = await Promise.all([
    countFhirResources("Encounter", {
      subject: `Patient/${patient.id}`
    }),
    countFhirResources("MedicationRequest", {
      subject: `Patient/${patient.id}`
    })
  ]);

  return {
    ...patient,
    encounterCount,
    medicationRequestCount,
    fhirResource: buildPatientStructuredResponseResource(patientResource)
  };
}

export async function getPatientEncounters(patientId: string): Promise<Encounter[]> {
  const patient: Patient = mapPatientResourceToPatient(await findPatientResourceById(patientId));
  const encounterResources: FhirResource[] = await searchFhirResources("Encounter", {
    subject: `Patient/${patient.id}`,
    _count: "200"
  });

  return encounterResources
    .map((resource: FhirResource): Encounter => mapEncounterResourceToEncounter(resource, patient.name))
    .sort(sortByNewestEncounter);
}

export async function createEncounterForPatient(patientId: string, input: CreateEncounterInput): Promise<Encounter> {
  const patient: Patient = mapPatientResourceToPatient(await findPatientResourceById(patientId));
  const encounterResource: FhirResource = await createFhirResource(
    "Encounter",
    buildEncounterFhirResource({
      patientId: patient.id,
      patientName: patient.name,
      input
    })
  );

  return mapEncounterResourceToEncounter(encounterResource, patient.name);
}

export async function getPatientMedicationRequests(patientId: string): Promise<MedicationRequestDetail[]> {
  const patient: Patient = mapPatientResourceToPatient(await findPatientResourceById(patientId));
  const medicationRequestResources: FhirResource[] = await searchFhirResources("MedicationRequest", {
    subject: `Patient/${patient.id}`,
    _count: "200"
  });

  return medicationRequestResources
    .map((resource: FhirResource): MedicationRequestDetail => {
      const medicationRequest = mapMedicationRequestResourceToMedicationRequest(resource, {
        patientName: patient.name
      });
      return {
        ...medicationRequest,
        fhirResource: resource
      };
    })
    .sort(sortByNewestMedicationRequest);
}

export async function createMedicationRequestForPatient(
  patientId: string,
  input: CreateMedicationRequestInput
): Promise<MedicationRequestDetail> {
  const patient: Patient = mapPatientResourceToPatient(await findPatientResourceById(patientId));
  await ensurePatientEncounter(input.encounterId, patient);

  const medicationCatalogItem = findMedicationByCode(input.code);
  if (!medicationCatalogItem) {
    throw new HttpError(400, "Medication code is invalid.");
  }

  const medicationRequestResource: FhirResource = await createFhirResource(
    "MedicationRequest",
    buildMedicationRequestFhirResource({
      patientId: patient.id,
      patientName: patient.name,
      input,
      medicationDisplay: medicationCatalogItem.display,
      medicationSystem: medicationCatalogItem.system
    })
  );

  const medicationRequest = mapMedicationRequestResourceToMedicationRequest(medicationRequestResource, {
    patientName: patient.name
  });

  return {
    ...medicationRequest,
    fhirResource: medicationRequestResource
  };
}
