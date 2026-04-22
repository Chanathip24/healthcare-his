import { encounterMedications, encounters, nextEncounterId, nextPatientId, patients } from "@/data/in-memory-store";
import { CreatePatientInput, Encounter, Patient } from "@/models/entities";

function sortByNewestPatient(first: Patient, second: Patient): number {
  return second.createdAt.localeCompare(first.createdAt);
}

export function getPatients(searchQuery: string): Patient[] {
  const sortedPatients: Patient[] = [...patients].sort(sortByNewestPatient);
  if (!searchQuery) return sortedPatients;

  return sortedPatients.filter((patient: Patient): boolean => {
    return (
      patient.id.toLowerCase().includes(searchQuery) ||
      patient.name.toLowerCase().includes(searchQuery) ||
      patient.gender.toLowerCase().includes(searchQuery)
    );
  });
}

export function createPatient(input: CreatePatientInput): Patient {
  const newPatient: Patient = {
    id: nextPatientId(),
    name: input.name,
    gender: input.gender,
    age: input.age,
    createdAt: new Date().toISOString()
  };

  patients.unshift(newPatient);

  const autoEncounter: Encounter = {
    id: nextEncounterId(),
    date: new Date().toISOString().slice(0, 10),
    patientId: newPatient.id,
    patientName: newPatient.name,
    classDisplay: "Ambulatory (AMB)",
    status: "active"
  };
  encounters.unshift(autoEncounter);
  encounterMedications[autoEncounter.id] = [];

  return newPatient;
}
