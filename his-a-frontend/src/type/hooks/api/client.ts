export type IPatientGender = 'male' | 'female' | 'other'

export type IPatient = {
  id: string
  name: string
  gender: IPatientGender
  age: number
  createdAt: string
}

export type ICreatePatientPayload = {
  name: string
  gender: IPatientGender
  age: number
}

export type IEncounterStatus = 'active' | 'finished' | 'cancelled'

export type IEncounter = {
  id: string
  date: string
  patientId: string
  patientName: string
  classDisplay: string
  status: IEncounterStatus
}

export type IEncounterMedication = {
  code: string
  drug: string
  dose: string
  frequency: string
}

export type IAddEncounterMedicationPayload = {
  code: string
  dose: string
  frequency: string
}

export type IEncounterDetail = IEncounter & {
  periodStart: string
  medications: Array<IEncounterMedication>
  fhirResource: Record<string, unknown>
}

export type IMedication = {
  code: string
  display: string
  strength: string
  system: string
}
