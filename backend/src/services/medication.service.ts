import { getMedicationCatalog } from "@/data/medication-catalog";
import { Medication } from "@/models/entities";

export function getMedications(searchQuery: string): Medication[] {
  const medications: Medication[] = getMedicationCatalog();
  if (!searchQuery) return [...medications];

  return medications.filter((medication: Medication): boolean => {
    return (
      medication.code.toLowerCase().includes(searchQuery) ||
      medication.display.toLowerCase().includes(searchQuery) ||
      medication.strength.toLowerCase().includes(searchQuery)
    );
  });
}
