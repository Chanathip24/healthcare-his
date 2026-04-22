import { Medication } from "@/models/entities";

export const RXNORM_SYSTEM_URL: string = "http://www.nlm.nih.gov/research/umls/rxnorm";

const MEDICATION_CATALOG: Medication[] = [
  { code: "161", display: "Acetaminophen (Paracetamol)", strength: "500 mg", system: RXNORM_SYSTEM_URL },
  { code: "5640", display: "Ibuprofen", strength: "400 mg", system: RXNORM_SYSTEM_URL },
  { code: "723", display: "Amoxicillin", strength: "250 mg", system: RXNORM_SYSTEM_URL },
  { code: "18631", display: "Azithromycin", strength: "500 mg", system: RXNORM_SYSTEM_URL },
  { code: "7646", display: "Omeprazole", strength: "20 mg", system: RXNORM_SYSTEM_URL },
  { code: "6809", display: "Metformin", strength: "500 mg", system: RXNORM_SYSTEM_URL },
  { code: "83367", display: "Atorvastatin", strength: "10 mg", system: RXNORM_SYSTEM_URL }
];

export function getMedicationCatalog(): Medication[] {
  return [...MEDICATION_CATALOG];
}

export function findMedicationByCode(code: string): Medication | undefined {
  return MEDICATION_CATALOG.find((medication: Medication): boolean => medication.code === code);
}
