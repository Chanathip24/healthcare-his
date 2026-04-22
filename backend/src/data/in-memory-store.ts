import { Encounter, EncounterMedication, Medication, Patient } from "@/models/entities";

const RXNORM_SYSTEM_URL: string = "http://www.nlm.nih.gov/research/umls/rxnorm";

const initialPatients: Patient[] = [
  { id: "p1", name: "Somchai Jaidee", gender: "male", age: 30, createdAt: "2026-01-02T08:35:00.000Z" },
  { id: "p2", name: "Jane Doe", gender: "female", age: 25, createdAt: "2026-01-03T10:10:00.000Z" },
  { id: "p3", name: "Jim Doe", gender: "male", age: 20, createdAt: "2026-01-04T15:20:00.000Z" },
  { id: "p4", name: "Amy Clark", gender: "female", age: 41, createdAt: "2026-01-05T09:50:00.000Z" },
  { id: "p5", name: "Carlos Rivera", gender: "male", age: 53, createdAt: "2026-01-06T11:22:00.000Z" }
];

const initialEncounters: Encounter[] = [
  {
    id: "e1",
    date: "2026-04-20",
    patientId: "p1",
    patientName: "Somchai Jaidee",
    classDisplay: "Ambulatory (AMB)",
    status: "active"
  },
  {
    id: "e2",
    date: "2026-01-11",
    patientId: "p2",
    patientName: "Jane Doe",
    classDisplay: "Outpatient (OP)",
    status: "finished"
  },
  {
    id: "e3",
    date: "2026-01-12",
    patientId: "p3",
    patientName: "Jim Doe",
    classDisplay: "Emergency (EMER)",
    status: "active"
  },
  {
    id: "e4",
    date: "2026-01-13",
    patientId: "p4",
    patientName: "Amy Clark",
    classDisplay: "Inpatient (IMP)",
    status: "finished"
  },
  {
    id: "e5",
    date: "2026-01-14",
    patientId: "p5",
    patientName: "Carlos Rivera",
    classDisplay: "Ambulatory (AMB)",
    status: "cancelled"
  }
];

const initialMedications: Medication[] = [
  { code: "161", display: "Acetaminophen (Paracetamol)", strength: "500 mg", system: RXNORM_SYSTEM_URL },
  { code: "5640", display: "Ibuprofen", strength: "400 mg", system: RXNORM_SYSTEM_URL },
  { code: "723", display: "Amoxicillin", strength: "250 mg", system: RXNORM_SYSTEM_URL },
  { code: "18631", display: "Azithromycin", strength: "500 mg", system: RXNORM_SYSTEM_URL },
  { code: "7646", display: "Omeprazole", strength: "20 mg", system: RXNORM_SYSTEM_URL },
  { code: "6809", display: "Metformin", strength: "500 mg", system: RXNORM_SYSTEM_URL },
  { code: "83367", display: "Atorvastatin", strength: "10 mg", system: RXNORM_SYSTEM_URL }
];

const initialEncounterMedications: Record<string, EncounterMedication[]> = {
  e1: [{ code: "161", drug: "Acetaminophen (Paracetamol)", dose: "500 mg", frequency: "3/day" }],
  e2: [{ code: "5640", drug: "Ibuprofen", dose: "400 mg", frequency: "2/day" }],
  e3: [{ code: "723", drug: "Amoxicillin", dose: "250 mg", frequency: "3/day" }],
  e4: [{ code: "7646", drug: "Omeprazole", dose: "20 mg", frequency: "1/day" }],
  e5: [{ code: "83367", drug: "Atorvastatin", dose: "10 mg", frequency: "1/day" }]
};

export const patients: Patient[] = [...initialPatients];
export const encounters: Encounter[] = [...initialEncounters];
export const medications: Medication[] = [...initialMedications];
export const encounterMedications: Record<string, EncounterMedication[]> = { ...initialEncounterMedications };

let patientCounter: number = patients.length;
let encounterCounter: number = encounters.length;

export function nextPatientId(): string {
  patientCounter += 1;
  return `p${patientCounter}`;
}

export function nextEncounterId(): string {
  encounterCounter += 1;
  return `e${encounterCounter}`;
}
