export type HisPatientClientKeys = 'getAllPatients' | 'getPatientById'
export type HisMedicationQueryClientKeys = 'getPatientMedications'
export type HisPractitionerQueryClientKeys = 'getAllPractitioners' | 'getPractitionerById'
export type HisEncounterQueryClientKeys = 'getAllEncounters' | 'getPatientEncounters' | 'getEncounterById'

export type HisPatientExecuteClientKeys = 'createPatient'
export type HisMedicationExecuteClientKeys = 'createPatientMedication'
export type HisPractitionerExecuteClientKeys = 'createPractitioner'
export type HisEncounterExecuteClientKeys = 'createPatientEncounter'
